/**
 * Shared type definitions for the Responsive Demo Sync extension
 */

export interface SyncSession {
  desktopTabId: number | null;
  mobileTabId: number | null;
  masterTabId: number | null;
  enabled: boolean;
  lastSyncTimestamp: number;
  lastSyncSummary: string;
}

export interface BlockFingerprint {
  id: string;
  tagName: string;
  domPath: string;
  orderIndex: number;
  normalizedTop: number;
  normalizedHeight: number;
  textContent: string;
  headingText: string;
  textLength: number;
  childCount: number;
  imageCount: number;
  linkCount: number;
  buttonCount: number;
  hasHeading: boolean;
  semanticScore: number;
  boundingRect: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
}

export interface BlockMatch {
  sourceBlockId: string;
  targetBlockId: string;
  confidence: number;
  matchReasons: string[];
}

export interface ActiveBlockState {
  blockId: string;
  blockFingerprint: BlockFingerprint;
  relativeProgress: number;
  visibilityRatio: number;
  globalProgress: number;
}

export interface SyncPayload {
  type: 'scroll_sync';
  sourceTabId: number;
  timestamp: number;
  activeBlock: ActiveBlockState;
  fallbackMode: 'semantic' | 'order' | 'global';
  confidence: number;
}

export interface PageModel {
  blocks: BlockFingerprint[];
  scrollHeight: number;
  viewportHeight: number;
  url: string;
  timestamp: number;
}

export interface DiagnosticInfo {
  blocksDetected: number;
  activeBlockId: string | null;
  matchConfidence: number;
  fallbackMode: string;
  lastSyncTimestamp: number;
}
