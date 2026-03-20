/**
 * Sync engine - coordinates scroll synchronization
 */

import type { PageModel, SyncPayload, BlockMatch, BlockFingerprint } from '../shared/models';
import { SYNC_CONFIG } from '../shared/constants';
import { throttle } from '../shared/utils';
import { detectScrollContainer, getScrollPosition, setScrollPosition, getScrollDimensions, getGlobalScrollProgress } from './scrollContainer';
import { extractBlocks } from './blockExtractor';
import { createBlockFingerprints } from './blockFingerprint';
import { matchBlocks } from './blockMatcher';
import { detectActiveBlock, calculateTargetScroll } from './activeBlock';

export class SyncEngine {
  private scrollContainer: Element;
  private pageModel: PageModel | null = null;
  private blockElements = new Map<string, Element>();
  private blockMatches = new Map<string, BlockMatch>();
  private isApplyingSync = false;
  private lastSyncTimestamp = 0;

  constructor() {
    this.scrollContainer = detectScrollContainer();
    this.init();
  }

  private init(): void {
    // Build initial page model
    this.buildPageModel();

    // Listen for scroll events
    const throttledScrollHandler = throttle(() => {
      this.handleScroll();
    }, SYNC_CONFIG.SCROLL_THROTTLE);

    this.scrollContainer.addEventListener('scroll', throttledScrollHandler);
    window.addEventListener('scroll', throttledScrollHandler);

    // Rebuild model on resize
    window.addEventListener('resize', () => {
      setTimeout(() => this.buildPageModel(), SYNC_CONFIG.MODEL_REBUILD_DEBOUNCE);
    });

    console.log('[SyncEngine] Initialized');
  }

  /**
   * Build page model by extracting and fingerprinting blocks
   */
  buildPageModel(): void {
    console.log('[SyncEngine] Building page model...');

    // Extract blocks
    const blockCandidates = extractBlocks();
    const elements = blockCandidates.map((c) => c.element);

    // Create fingerprints
    const fingerprints = createBlockFingerprints(elements, this.scrollContainer);

    // Store element references
    this.blockElements.clear();
    fingerprints.forEach((fp, index) => {
      this.blockElements.set(fp.id, elements[index]);
    });

    // Get scroll dimensions
    const { scrollHeight, clientHeight } = getScrollDimensions(this.scrollContainer);

    // Create page model
    this.pageModel = {
      blocks: fingerprints,
      scrollHeight,
      viewportHeight: clientHeight,
      url: window.location.href,
      timestamp: Date.now(),
    };

    console.log('[SyncEngine] Page model built:', fingerprints.length, 'blocks');

    // Notify background
    chrome.runtime.sendMessage({
      type: 'PAGE_MODEL_BUILT',
      model: this.pageModel,
    });
  }

  /**
   * Handle scroll event from master tab
   */
  private handleScroll(): void {
    // Skip if applying sync from another tab
    if (this.isApplyingSync) return;

    // Skip if in cooldown period
    const now = Date.now();
    if (now - this.lastSyncTimestamp < SYNC_CONFIG.LOOP_SUPPRESSION_COOLDOWN) {
      return;
    }

    // Detect active block
    const activeBlockState = this.detectActiveBlock();
    if (!activeBlockState) return;

    // Determine fallback mode based on confidence
    let fallbackMode: 'semantic' | 'order' | 'global' = 'semantic';
    let confidence = 1.0;

    // Create sync payload
    const payload: SyncPayload = {
      type: 'scroll_sync',
      sourceTabId: chrome.runtime.id ? 0 : 0, // Will be set by background
      timestamp: now,
      activeBlock: activeBlockState,
      fallbackMode,
      confidence,
    };

    // Send to background
    chrome.runtime.sendMessage({
      type: 'SCROLL_EVENT',
      payload,
    });

    this.lastSyncTimestamp = now;
  }

  /**
   * Detect currently active block
   */
  private detectActiveBlock() {
    if (!this.pageModel) return null;

    return detectActiveBlock(
      this.pageModel.blocks,
      this.blockElements,
      this.scrollContainer
    );
  }

  /**
   * Apply sync from another tab
   */
  applySync(payload: SyncPayload, matches: Map<string, BlockMatch>): void {
    if (payload.type !== 'scroll_sync') return;
    
    console.log('[SyncEngine] Applying sync:', payload);

    this.isApplyingSync = true;

    try {
      // Store matches for future use
      this.blockMatches = matches;

      const sourceBlockId = payload.activeBlock.blockId;
      const sourceProgress = payload.activeBlock.relativeProgress;

      // Try to find matched target block
      const match = matches.get(sourceBlockId);

      if (match && match.confidence >= SYNC_CONFIG.MEDIUM_CONFIDENCE_THRESHOLD) {
        // High/medium confidence semantic match
        this.applySemanticSync(match.targetBlockId, sourceProgress);
      } else if (match) {
        // Low confidence - use order fallback
        this.applyOrderFallback(sourceBlockId, sourceProgress);
      } else {
        // No match - use global progress fallback
        this.applyGlobalFallback(payload.activeBlock.globalProgress);
      }

      this.lastSyncTimestamp = Date.now();

      // Reset flag after scroll settles
      setTimeout(() => {
        this.isApplyingSync = false;
      }, SYNC_CONFIG.SCROLL_SETTLE_TIME);
    } catch (error) {
      console.error('[SyncEngine] Error applying sync:', error);
      this.isApplyingSync = false;
    }
  }

  /**
   * Apply semantic sync using matched block
   */
  private applySemanticSync(targetBlockId: string, sourceProgress: number): void {
    const targetElement = this.blockElements.get(targetBlockId);
    if (!targetElement) {
      console.warn('[SyncEngine] Target block element not found:', targetBlockId);
      return;
    }

    const targetBlock = this.pageModel?.blocks.find((b) => b.id === targetBlockId);
    if (!targetBlock) {
      console.warn('[SyncEngine] Target block fingerprint not found:', targetBlockId);
      return;
    }

    // Calculate target scroll position
    const targetScroll = calculateTargetScroll(
      targetBlock,
      targetElement,
      sourceProgress,
      this.scrollContainer
    );

    console.log('[SyncEngine] Semantic sync to block:', targetBlockId, 'scroll:', targetScroll);

    // Apply scroll
    setScrollPosition(this.scrollContainer, targetScroll);
  }

  /**
   * Fallback: use document order to estimate position
   */
  private applyOrderFallback(sourceBlockId: string, sourceProgress: number): void {
    console.log('[SyncEngine] Using order fallback');

    if (!this.pageModel || this.pageModel.blocks.length === 0) {
      this.applyGlobalFallback(sourceProgress);
      return;
    }

    // Find source block order index from payload
    // For fallback, use middle block
    const middleIndex = Math.floor(this.pageModel.blocks.length / 2);
    const targetBlock = this.pageModel.blocks[middleIndex];
    const targetElement = this.blockElements.get(targetBlock.id);

    if (targetElement) {
      this.applySemanticSync(targetBlock.id, sourceProgress);
    } else {
      this.applyGlobalFallback(sourceProgress);
    }
  }

  /**
   * Fallback: use global page progress
   */
  private applyGlobalFallback(globalProgress: number): void {
    console.log('[SyncEngine] Using global progress fallback:', globalProgress);

    const { scrollHeight, clientHeight } = getScrollDimensions(this.scrollContainer);
    const maxScroll = scrollHeight - clientHeight;
    const targetScroll = maxScroll * globalProgress;

    setScrollPosition(this.scrollContainer, targetScroll);
  }

  /**
   * Get page model for matching
   */
  getPageModel(): PageModel | null {
    return this.pageModel;
  }

  /**
   * Refresh page model
   */
  refresh(): void {
    this.buildPageModel();
  }
}
