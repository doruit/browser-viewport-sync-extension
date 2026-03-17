/**
 * Popup UI logic
 */

import type { PopupMessage, PopupResponse } from '../shared/messages';
import type { SyncSession } from '../shared/models';

// DOM elements
const currentTabIdEl = document.getElementById('currentTabId') as HTMLElement;
const desktopTabIdEl = document.getElementById('desktopTabId') as HTMLElement;
const mobileTabIdEl = document.getElementById('mobileTabId') as HTMLElement;
const masterTabIdEl = document.getElementById('masterTabId') as HTMLElement;
const syncStatusEl = document.getElementById('syncStatus') as HTMLElement;
const lastSyncSummaryEl = document.getElementById('lastSyncSummary') as HTMLElement;
const lastSyncTimeEl = document.getElementById('lastSyncTime') as HTMLElement;

const setDesktopBtn = document.getElementById('setDesktopBtn') as HTMLButtonElement;
const setMobileBtn = document.getElementById('setMobileBtn') as HTMLButtonElement;
const setDesktopMasterBtn = document.getElementById('setDesktopMasterBtn') as HTMLButtonElement;
const setMobileMasterBtn = document.getElementById('setMobileMasterBtn') as HTMLButtonElement;
const enableSyncBtn = document.getElementById('enableSyncBtn') as HTMLButtonElement;
const disableSyncBtn = document.getElementById('disableSyncBtn') as HTMLButtonElement;
const refreshModelsBtn = document.getElementById('refreshModelsBtn') as HTMLButtonElement;

let currentTabId: number | null = null;

/**
 * Initialize popup
 */
async function init(): Promise<void> {
  // Get current tab
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tabs[0]?.id) {
    currentTabId = tabs[0].id;
    currentTabIdEl.textContent = currentTabId.toString();
  }

  // Load session state
  await loadSessionState();

  // Set up event listeners
  setupEventListeners();

  // Refresh state periodically
  setInterval(loadSessionState, 1000);
}

/**
 * Set up event listeners
 */
function setupEventListeners(): void {
  setDesktopBtn.addEventListener('click', () => {
    if (currentTabId !== null) {
      sendMessage({ type: 'SET_DESKTOP_TAB', tabId: currentTabId });
    }
  });

  setMobileBtn.addEventListener('click', () => {
    if (currentTabId !== null) {
      sendMessage({ type: 'SET_MOBILE_TAB', tabId: currentTabId });
    }
  });

  setDesktopMasterBtn.addEventListener('click', async () => {
    const session = await getSessionState();
    if (session?.desktopTabId !== null) {
      sendMessage({ type: 'SET_MASTER', tabId: session.desktopTabId! });
    }
  });

  setMobileMasterBtn.addEventListener('click', async () => {
    const session = await getSessionState();
    if (session?.mobileTabId !== null) {
      sendMessage({ type: 'SET_MASTER', tabId: session.mobileTabId! });
    }
  });

  enableSyncBtn.addEventListener('click', () => {
    sendMessage({ type: 'ENABLE_SYNC' });
  });

  disableSyncBtn.addEventListener('click', () => {
    sendMessage({ type: 'DISABLE_SYNC' });
  });

  refreshModelsBtn.addEventListener('click', () => {
    sendMessage({ type: 'REFRESH_MODELS' });
  });
}

/**
 * Load and display session state
 */
async function loadSessionState(): Promise<void> {
  const session = await getSessionState();
  if (!session) return;

  updateUI(session);
}

/**
 * Update UI with session state
 */
function updateUI(session: SyncSession): void {
  // Tab IDs
  desktopTabIdEl.textContent = session.desktopTabId?.toString() || '-';
  mobileTabIdEl.textContent = session.mobileTabId?.toString() || '-';
  masterTabIdEl.textContent = session.masterTabId?.toString() || '-';

  // Sync status
  if (session.enabled) {
    syncStatusEl.textContent = 'Enabled';
    syncStatusEl.className = 'value status-badge enabled';
  } else {
    syncStatusEl.textContent = 'Disabled';
    syncStatusEl.className = 'value status-badge disabled';
  }

  // Last sync info
  if (session.lastSyncSummary) {
    lastSyncSummaryEl.textContent = session.lastSyncSummary;
    if (session.lastSyncTimestamp > 0) {
      const date = new Date(session.lastSyncTimestamp);
      lastSyncTimeEl.textContent = date.toLocaleTimeString();
    }
  } else {
    lastSyncSummaryEl.textContent = 'No sync events yet';
    lastSyncTimeEl.textContent = '-';
  }

  // Button states
  const isPaired = session.desktopTabId !== null && session.mobileTabId !== null;
  enableSyncBtn.disabled = !isPaired || session.enabled;
  disableSyncBtn.disabled = !session.enabled;
  setDesktopMasterBtn.disabled = session.desktopTabId === null;
  setMobileMasterBtn.disabled = session.mobileTabId === null;
}

/**
 * Get session state from background
 */
async function getSessionState(): Promise<SyncSession | null> {
  try {
    const response = await sendMessage({ type: 'GET_SESSION_STATE' });
    if (response.type === 'SESSION_STATE') {
      return response.session;
    }
  } catch (error) {
    console.error('[Popup] Error getting session state:', error);
  }
  return null;
}

/**
 * Send message to background
 */
async function sendMessage(message: PopupMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(message, (response: PopupResponse) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else if (response.type === 'ERROR') {
        console.error('[Popup] Error:', response.message);
        alert(`Error: ${response.message}`);
        reject(new Error(response.message));
      } else {
        resolve(response);
        // Refresh state after action
        setTimeout(loadSessionState, 100);
      }
    });
  });
}

// Initialize on load
init();
