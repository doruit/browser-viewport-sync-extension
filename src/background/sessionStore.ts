/**
 * Session state management for the background service worker
 */

import type { SyncSession, PageModel } from '../shared/models';

export class SessionStore {
  private session: SyncSession = {
    desktopTabId: null,
    mobileTabId: null,
    masterTabId: null,
    enabled: false,
    lastSyncTimestamp: 0,
    lastSyncSummary: '',
  };

  private pageModels = new Map<number, PageModel>();
  private initialized = false;

  async init(): Promise<void> {
    if (this.initialized) return;

    // Restore session from storage
    const stored = await chrome.storage.local.get('session');
    if (stored.session) {
      this.session = stored.session;
      console.log('[SessionStore] Restored session from storage:', this.session);
    }

    this.initialized = true;
  }

  private async saveSession(): Promise<void> {
    await chrome.storage.local.set({ session: this.session });
  }

  getSession(): SyncSession {
    return { ...this.session };
  }

  setDesktopTab(tabId: number): void {
    this.session.desktopTabId = tabId;
    // Default: desktop is master
    if (this.session.masterTabId === null) {
      this.session.masterTabId = tabId;
    }
    this.saveSession();
  }

  setMobileTab(tabId: number): void {
    this.session.mobileTabId = tabId;
    this.saveSession();
  }

  setMaster(tabId: number): void {
    if (tabId === this.session.desktopTabId || tabId === this.session.mobileTabId) {
      this.session.masterTabId = tabId;
      this.saveSession();
    }
  }

  enableSync(): void {
    this.session.enabled = true;
    this.saveSession();
  }

  disableSync(): void {
    this.session.enabled = false;
    this.saveSession();
  }

  isEnabled(): boolean {
    return this.session.enabled;
  }

  isMaster(tabId: number): boolean {
    return this.session.masterTabId === tabId;
  }

  getFollowerTab(masterTabId: number): number | null {
    if (!this.session.enabled) return null;

    if (masterTabId === this.session.desktopTabId) {
      return this.session.mobileTabId;
    } else if (masterTabId === this.session.mobileTabId) {
      return this.session.desktopTabId;
    }

    return null;
  }

  isPaired(): boolean {
    return this.session.desktopTabId !== null && this.session.mobileTabId !== null;
  }

  updateSyncSummary(summary: string): void {
    this.session.lastSyncTimestamp = Date.now();
    this.session.lastSyncSummary = summary;
    // Don't save on every sync event (too frequent)
  }

  reset(): void {
    this.session = {
      desktopTabId: null,
      mobileTabId: null,
      masterTabId: null,
      enabled: false,
      lastSyncTimestamp: 0,
      lastSyncSummary: '',
    };
    this.pageModels.clear();
    this.saveSession();
  }

  setPageModel(tabId: number, model: PageModel): void {
    this.pageModels.set(tabId, model);
  }

  getPageModel(tabId: number): PageModel | null {
    return this.pageModels.get(tabId) || null;
  }

  getMasterPageModel(): PageModel | null {
    if (this.session.masterTabId === null) return null;
    return this.getPageModel(this.session.masterTabId);
  }

  getFollowerPageModel(): PageModel | null {
    if (this.session.masterTabId === null) return null;
    const followerTabId = this.getFollowerTab(this.session.masterTabId);
    if (followerTabId === null) return null;
    return this.getPageModel(followerTabId);
  }
}
