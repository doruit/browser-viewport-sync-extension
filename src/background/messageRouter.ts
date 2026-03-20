/**
 * Message routing between popup and content scripts
 */

import type { PopupMessage, ContentMessage, BackgroundMessage, SyncPayload } from '../shared/messages';
import type { SessionStore } from './sessionStore';

export class MessageRouter {
  constructor(private sessionStore: SessionStore) {}

  /**
   * Handle messages from popup
   */
  async handlePopupMessage(
    message: PopupMessage,
    sender: chrome.runtime.MessageSender
  ): Promise<any> {
    console.log('[Background] Popup message:', message);

    switch (message.type) {
      case 'SET_DESKTOP_TAB':
        this.sessionStore.setDesktopTab(message.tabId);
        await this.sendToTab(message.tabId, { type: 'BUILD_PAGE_MODEL' });
        return { type: 'SUCCESS' };

      case 'SET_MOBILE_TAB':
        this.sessionStore.setMobileTab(message.tabId);
        await this.sendToTab(message.tabId, { type: 'BUILD_PAGE_MODEL' });
        return { type: 'SUCCESS' };

      case 'SET_MASTER':
        this.sessionStore.setMaster(message.tabId);
        return { type: 'SUCCESS' };

      case 'ENABLE_SYNC':
        if (!this.sessionStore.isPaired()) {
          return { type: 'ERROR', message: 'Please set both desktop and mobile tabs first' };
        }
        this.sessionStore.enableSync();
        // Automatically force sync when enabling to ensure both tabs are aligned
        await this.forceSync();
        return { type: 'SUCCESS' };

      case 'DISABLE_SYNC':
        this.sessionStore.disableSync();
        return { type: 'SUCCESS' };

      case 'GET_SESSION_STATE':
        return { type: 'SESSION_STATE', session: this.sessionStore.getSession() };

      case 'REFRESH_MODELS':
        await this.refreshPageModels();
        return { type: 'SUCCESS' };

      case 'FORCE_SYNC':
        await this.forceSync();
        return { type: 'SUCCESS' };

      default:
        return { type: 'ERROR', message: 'Unknown message type' };
    }
  }

  /**
   * Handle messages from content scripts
   */
  async handleContentMessage(
    message: BackgroundMessage,
    sender: chrome.runtime.MessageSender
  ): Promise<void> {
    const tabId = sender.tab?.id;
    if (!tabId) return;

    console.log('[Background] Content message:', message.type, 'from tab', tabId);

    switch (message.type) {
      case 'SCROLL_EVENT':
        await this.handleScrollEvent(message.payload, tabId);
        break;
      
      case 'INPUT_EVENT':
      case 'CLICK_EVENT':
        await this.handleInteractionEvent(message.payload, tabId);
        break;

      case 'PAGE_MODEL_BUILT':
        console.log('[Background] Page model built for tab', tabId, ':', message.model.blocks.length, 'blocks');
        this.sessionStore.setPageModel(tabId, message.model);
        break;

      case 'DIAGNOSTICS':
        console.log('[Background] Diagnostics from tab', tabId, ':', message.info);
        break;

      case 'CONTENT_READY':
        console.log('[Background] Content script ready in tab', tabId);
        break;

      case 'ERROR':
        console.error('[Background] Error from tab', tabId, ':', message.message);
        break;
    }
  }

  /**
   * Handle scroll event from master tab and forward to follower
   */
  private async handleScrollEvent(payload: SyncPayload, sourceTabId: number): Promise<void> {
    if (!this.sessionStore.isEnabled()) return;
    if (!this.sessionStore.isMaster(sourceTabId)) return;

    const followerTabId = this.sessionStore.getFollowerTab(sourceTabId);
    if (!followerTabId) return;

    // Get master page model
    let masterPageModel = this.sessionStore.getPageModel(sourceTabId);
    if (!masterPageModel) {
      console.warn('[Background] Master page model not found - rebuilding (service worker may have restarted)');
      // Rebuild page models - service worker likely restarted and lost in-memory state
      await this.refreshPageModels();
      // Wait a bit for models to be built
      await new Promise(resolve => setTimeout(resolve, 1000));
      masterPageModel = this.sessionStore.getPageModel(sourceTabId);

      if (!masterPageModel) {
        console.error('[Background] Failed to rebuild master page model');
        return;
      }
    }

    // Forward sync payload to follower tab with master page model
    await this.sendToTab(followerTabId, {
      type: 'APPLY_SYNC',
      payload,
      masterPageModel,
    });

    // Update session summary
    if (payload.type === 'scroll_sync') {
      const summary = `${payload.fallbackMode} sync (conf: ${payload.confidence.toFixed(2)})`;
      this.sessionStore.updateSyncSummary(summary);
    }
  }

  /**
   * Handle interaction event (input/click) from master tab and forward to follower
   */
  private async handleInteractionEvent(payload: SyncPayload, sourceTabId: number): Promise<void> {
    if (!this.sessionStore.isEnabled()) return;
    if (!this.sessionStore.isMaster(sourceTabId)) return;

    const followerTabId = this.sessionStore.getFollowerTab(sourceTabId);
    if (!followerTabId) return;

    // Get master page model (even if not strictly needed for selector, good for context)
    const masterPageModel = this.sessionStore.getPageModel(sourceTabId);
    if (!masterPageModel) return;

    // Forward sync payload to follower tab
    await this.sendToTab(followerTabId, {
      type: 'APPLY_SYNC',
      payload,
      masterPageModel,
    });

    if (payload.type === 'input_sync') {
      this.sessionStore.updateSyncSummary(`input sync: ${payload.selector}`);
    } else if (payload.type === 'click_sync') {
      this.sessionStore.updateSyncSummary(`click sync: ${payload.selector}`);
    }
  }

  /**
   * Send message to a specific tab
   */
  private async sendToTab(tabId: number, message: ContentMessage): Promise<void> {
    try {
      // First check if tab exists
      await chrome.tabs.get(tabId);
      // Then send message
      await chrome.tabs.sendMessage(tabId, message);
    } catch (error: any) {
      // Only log real errors, not "tab closed" or "receiving end does not exist"
      if (error?.message?.includes('Receiving end does not exist')) {
        console.warn('[Background] Content script not ready in tab', tabId);
      } else if (error?.message?.includes('No tab with id')) {
        console.warn('[Background] Tab', tabId, 'no longer exists');
      } else {
        console.error('[Background] Failed to send message to tab', tabId, error);
      }
    }
  }

  /**
   * Refresh page models in both tabs
   */
  private async refreshPageModels(): Promise<void> {
    const session = this.sessionStore.getSession();

    if (session.desktopTabId) {
      await this.sendToTab(session.desktopTabId, { type: 'BUILD_PAGE_MODEL' });
    }

    if (session.mobileTabId) {
      await this.sendToTab(session.mobileTabId, { type: 'BUILD_PAGE_MODEL' });
    }
  }

  /**
   * Force sync: ensure follower is on same URL and scroll position as master
   */
  private async forceSync(): Promise<void> {
    const session = this.sessionStore.getSession();

    if (!session.masterTabId) {
      console.warn('[Background] No master tab set');
      return;
    }

    const followerTabId = this.sessionStore.getFollowerTab(session.masterTabId);
    if (!followerTabId) {
      console.warn('[Background] No follower tab found');
      return;
    }

    try {
      // Get master tab info
      const masterTab = await chrome.tabs.get(session.masterTabId);
      if (!masterTab.url) {
        console.warn('[Background] Master tab has no URL');
        return;
      }

      // Get follower tab info
      const followerTab = await chrome.tabs.get(followerTabId);

      console.log('[Background] Force sync: Master URL:', masterTab.url);
      console.log('[Background] Force sync: Follower URL:', followerTab.url);

      // If URLs differ, navigate follower to master URL
      if (followerTab.url !== masterTab.url) {
        console.log('[Background] URLs differ, navigating follower to:', masterTab.url);
        await chrome.tabs.update(followerTabId, { url: masterTab.url });

        // Wait for navigation to complete
        await new Promise<void>((resolve) => {
          const listener = (tabId: number, changeInfo: chrome.tabs.TabChangeInfo) => {
            if (tabId === followerTabId && changeInfo.status === 'complete') {
              chrome.tabs.onUpdated.removeListener(listener);
              resolve();
            }
          };
          chrome.tabs.onUpdated.addListener(listener);

          // Timeout after 10 seconds
          setTimeout(() => {
            chrome.tabs.onUpdated.removeListener(listener);
            resolve();
          }, 10000);
        });

        console.log('[Background] Follower navigation complete');
      }

      // Refresh page models
      await this.refreshPageModels();

      console.log('[Background] Force sync complete');
    } catch (error) {
      console.error('[Background] Error during force sync:', error);
    }
  }
}
