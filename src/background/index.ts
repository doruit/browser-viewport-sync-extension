/**
 * Background service worker entry point
 */

import { SessionStore } from './sessionStore';
import { MessageRouter } from './messageRouter';

// Initialize stores and routers
const sessionStore = new SessionStore();
const messageRouter = new MessageRouter(sessionStore);

// Helper: Check if tab exists and is valid
async function isTabValid(tabId: number): Promise<boolean> {
  try {
    const tab = await chrome.tabs.get(tabId);
    return tab !== undefined;
  } catch {
    return false;
  }
}

// Initialize session store (restore from storage)
sessionStore.init().then(async () => {
  const session = sessionStore.getSession();
  console.log('[Background] Session store initialized');
  console.log('[Background] Service worker started at:', new Date().toISOString());

  if (session.enabled && session.desktopTabId && session.mobileTabId) {
    // Validate tabs still exist
    const [desktopValid, mobileValid] = await Promise.all([
      isTabValid(session.desktopTabId),
      isTabValid(session.mobileTabId),
    ]);

    if (!desktopValid || !mobileValid) {
      console.warn('[Background] Saved tabs no longer exist - resetting session');
      sessionStore.reset();
      return;
    }

    console.warn('[Background] Service worker restarted while sync was active - rebuilding page models now');
    // Proactively rebuild page models after service worker restart
    setTimeout(() => {
      chrome.tabs.sendMessage(session.desktopTabId!, { type: 'BUILD_PAGE_MODEL' }).catch(() => {});
      chrome.tabs.sendMessage(session.mobileTabId!, { type: 'BUILD_PAGE_MODEL' }).catch(() => {});
    }, 500);
  }
});

// Handle extension installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('[Background] Responsive Demo Sync extension installed');
});

// Handle messages from popup and content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('[Background] Message received:', message, 'from', sender);

  // Determine message source and route accordingly
  if (sender.tab) {
    // Message from content script
    messageRouter.handleContentMessage(message, sender).then(() => {
      sendResponse({ success: true });
    });
  } else {
    // Message from popup
    messageRouter.handlePopupMessage(message, sender).then((response) => {
      sendResponse(response);
    });
  }

  // Return true to indicate async response
  return true;
});

// Handle tab removal
chrome.tabs.onRemoved.addListener((tabId) => {
  const session = sessionStore.getSession();

  if (tabId === session.desktopTabId || tabId === session.mobileTabId) {
    console.log('[Background] Paired tab', tabId, 'closed - resetting session');
    sessionStore.reset();
  }
});

// Handle tab updates (navigation)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  const session = sessionStore.getSession();

  // Navigation sync: when master navigates, sync follower to same URL
  if (changeInfo.url && sessionStore.isEnabled() && sessionStore.isMaster(tabId)) {
    const followerTabId = sessionStore.getFollowerTab(tabId);
    if (followerTabId && tab.url) {
      console.log('[Background] Master navigated to:', tab.url);
      console.log('[Background] Syncing follower tab to same URL');
      chrome.tabs.update(followerTabId, { url: tab.url });
    }
  }

  // Rebuild page model when navigation completes
  if (changeInfo.status === 'complete' && (tabId === session.desktopTabId || tabId === session.mobileTabId)) {
    console.log('[Background] Tab loaded, rebuilding page model');
    // Small delay to ensure page is fully loaded
    setTimeout(() => {
      chrome.tabs.sendMessage(tabId, { type: 'BUILD_PAGE_MODEL' }).catch(() => {
        // Ignore errors if content script not ready yet
      });
    }, 500);
  }
});

console.log('[Background] Service worker initialized');
