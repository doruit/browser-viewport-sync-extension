/**
 * Message type definitions for extension communication
 */

import type { SyncPayload, PageModel, DiagnosticInfo, SyncSession } from './models';

// Popup -> Background messages
export type PopupMessage =
  | { type: 'SET_DESKTOP_TAB'; tabId: number }
  | { type: 'SET_MOBILE_TAB'; tabId: number }
  | { type: 'SET_MASTER'; tabId: number }
  | { type: 'ENABLE_SYNC' }
  | { type: 'DISABLE_SYNC' }
  | { type: 'GET_SESSION_STATE' }
  | { type: 'REFRESH_MODELS' }
  | { type: 'FORCE_SYNC' };

// Background -> Popup responses
export type PopupResponse =
  | { type: 'SESSION_STATE'; session: SyncSession }
  | { type: 'SUCCESS' }
  | { type: 'ERROR'; message: string };

// Background -> Content messages
export type ContentMessage =
  | { type: 'INIT_CONTENT_SCRIPT' }
  | { type: 'BUILD_PAGE_MODEL' }
  | { type: 'APPLY_SYNC'; payload: SyncPayload; masterPageModel: PageModel }
  | { type: 'NAVIGATE_TO_URL'; url: string }
  | { type: 'ENABLE_DEBUG_OVERLAY' }
  | { type: 'DISABLE_DEBUG_OVERLAY' }
  | { type: 'GET_DIAGNOSTICS' };

// Content -> Background messages
export type BackgroundMessage =
  | { type: 'PAGE_MODEL_BUILT'; model: PageModel }
  | { type: 'SCROLL_EVENT'; payload: SyncPayload }
  | { type: 'DIAGNOSTICS'; info: DiagnosticInfo }
  | { type: 'CONTENT_READY' }
  | { type: 'ERROR'; message: string };

export interface Message<T = any> {
  type: string;
  payload?: T;
}
