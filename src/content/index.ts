/**
 * Content script entry point
 */

import type { ContentMessage, SyncPayload } from '../shared/messages';
import type { BlockMatch, PageModel } from '../shared/models';
import { SyncEngine } from './syncEngine';
import { DebugOverlay } from './debugOverlay';
import { matchBlocks } from './blockMatcher';

// Global state
let syncEngine: SyncEngine | null = null;
let debugOverlay: DebugOverlay | null = null;
let remotePageModel: PageModel | null = null;

/**
 * Initialize content script
 */
function init(): void {
  console.log('[Content] Initializing Responsive Demo Sync content script');

  // Create sync engine
  syncEngine = new SyncEngine();

  // Create debug overlay (hidden by default)
  debugOverlay = new DebugOverlay();

  // Notify background that content is ready
  chrome.runtime.sendMessage({
    type: 'CONTENT_READY',
  });
}

/**
 * Handle messages from background
 */
chrome.runtime.onMessage.addListener((message: ContentMessage, sender, sendResponse) => {
  console.log('[Content] Message received:', message);

  switch (message.type) {
    case 'INIT_CONTENT_SCRIPT':
      init();
      sendResponse({ success: true });
      break;

    case 'BUILD_PAGE_MODEL':
      if (syncEngine) {
        syncEngine.buildPageModel();
      }
      sendResponse({ success: true });
      break;

    case 'APPLY_SYNC':
      handleApplySync(message.payload, message.masterPageModel);
      sendResponse({ success: true });
      break;

    case 'ENABLE_DEBUG_OVERLAY':
      enableDebugMode();
      sendResponse({ success: true });
      break;

    case 'DISABLE_DEBUG_OVERLAY':
      disableDebugMode();
      sendResponse({ success: true });
      break;

    case 'GET_DIAGNOSTICS':
      const diagnostics = getDiagnostics();
      sendResponse({ type: 'DIAGNOSTICS', info: diagnostics });
      break;

    default:
      sendResponse({ success: false, error: 'Unknown message type' });
  }

  return true;
});

/**
 * Handle sync application from remote tab
 */
function handleApplySync(payload: SyncPayload, masterPageModel: PageModel): void {
  if (!syncEngine) return;

  // Get local page model
  const localModel = syncEngine.getPageModel();
  if (!localModel) {
    console.warn('[Content] No local page model available');
    return;
  }

  // Create matches between master and local blocks
  const matches = matchBlocks(masterPageModel.blocks, localModel.blocks);

  console.log('[Content] Applying sync with', matches.size, 'matched blocks');

  // Apply sync
  syncEngine.applySync(payload, matches);
}

/**
 * Enable debug mode
 */
function enableDebugMode(): void {
  if (!syncEngine || !debugOverlay) return;

  const model = syncEngine.getPageModel();
  if (!model) return;

  // Create block elements map
  const blockElements = new Map<string, Element>();
  model.blocks.forEach((block) => {
    // Re-query elements (simplified for debug)
    const elements = document.querySelectorAll('section, article, main > div');
    if (elements[block.orderIndex]) {
      blockElements.set(block.id, elements[block.orderIndex]);
    }
  });

  debugOverlay.showBlocks(model.blocks, blockElements);
}

/**
 * Disable debug mode
 */
function disableDebugMode(): void {
  if (debugOverlay) {
    debugOverlay.hide();
  }
}

/**
 * Get diagnostics info
 */
function getDiagnostics() {
  const model = syncEngine?.getPageModel();

  return {
    blocksDetected: model?.blocks.length || 0,
    activeBlockId: null,
    matchConfidence: 0,
    fallbackMode: 'unknown',
    lastSyncTimestamp: 0,
  };
}

// Initialize on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
