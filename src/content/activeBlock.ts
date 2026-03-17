/**
 * Detect the active (most visible) block in the viewport
 */

import type { BlockFingerprint, ActiveBlockState } from '../shared/models';
import { SYNC_CONFIG } from '../shared/constants';
import { getVisibilityRatio } from './domUtils';
import { getGlobalScrollProgress } from './scrollContainer';

/**
 * Detect the active block based on viewport visibility
 */
export function detectActiveBlock(
  blocks: BlockFingerprint[],
  blockElements: Map<string, Element>,
  scrollContainer: Element
): ActiveBlockState | null {
  if (blocks.length === 0) return null;

  let bestBlock: BlockFingerprint | null = null;
  let bestScore = 0;

  for (const block of blocks) {
    const element = blockElements.get(block.id);
    if (!element) continue;

    const score = calculateVisibilityScore(element, block);

    if (score > bestScore) {
      bestScore = score;
      bestBlock = block;
    }
  }

  if (!bestBlock) {
    // Fallback to first block
    bestBlock = blocks[0];
  }

  const element = blockElements.get(bestBlock.id);
  if (!element) return null;

  // Calculate relative progress within the block
  const relativeProgress = calculateBlockProgress(element, scrollContainer);

  // Get global scroll progress
  const globalProgress = getGlobalScrollProgress(scrollContainer);

  // Get visibility ratio
  const visibilityRatio = getVisibilityRatio(element);

  return {
    blockId: bestBlock.id,
    blockFingerprint: bestBlock,
    relativeProgress,
    visibilityRatio,
    globalProgress,
  };
}

/**
 * Calculate visibility score for an element
 * Considers both visibility ratio and position relative to viewport center
 */
function calculateVisibilityScore(element: Element, block: BlockFingerprint): number {
  const visibilityRatio = getVisibilityRatio(element);

  // Skip blocks with insufficient visibility
  if (visibilityRatio < SYNC_CONFIG.MIN_VISIBILITY_RATIO) {
    return 0;
  }

  const rect = element.getBoundingClientRect();
  const viewportHeight = window.innerHeight;

  // Calculate distance from viewport center
  const blockCenter = rect.top + rect.height / 2;
  const viewportCenter = viewportHeight / 2;
  const centerDistance = Math.abs(blockCenter - viewportCenter);
  const normalizedCenterDistance = centerDistance / (viewportHeight / 2);

  // Closer to center = higher score
  const centerScore = 1 - Math.min(normalizedCenterDistance, 1);

  // Combine visibility and center proximity
  // Visibility is more important, but center proximity breaks ties
  return visibilityRatio * 0.7 + centerScore * 0.3;
}

/**
 * Calculate relative progress within a block (0-1)
 */
function calculateBlockProgress(element: Element, scrollContainer: Element): number {
  const rect = element.getBoundingClientRect();
  const viewportHeight = window.innerHeight;

  // If block is taller than viewport, calculate how far we've scrolled through it
  if (rect.height > viewportHeight) {
    // Block extends above viewport
    if (rect.top < 0) {
      const scrolledIntoBlock = Math.abs(rect.top);
      const scrollableHeight = rect.height - viewportHeight;
      return Math.min(scrolledIntoBlock / scrollableHeight, 1);
    }
    // Block starts in or below viewport
    return 0;
  } else {
    // Block is smaller than viewport
    // Use the position of block relative to viewport
    if (rect.top <= 0) {
      // Block top is above viewport, we're somewhere past the start
      const scrolledPast = Math.abs(rect.top);
      return Math.min(scrolledPast / rect.height, 1);
    } else {
      // Block is fully visible or starts below viewport
      // Consider it at the start
      return 0;
    }
  }
}

/**
 * Calculate where to scroll in target block based on source progress
 */
export function calculateTargetScroll(
  targetBlock: BlockFingerprint,
  targetElement: Element,
  sourceProgress: number,
  scrollContainer: Element
): number {
  const rect = targetElement.getBoundingClientRect();
  const viewportHeight = window.innerHeight;

  // Get current scroll position
  const currentScroll = scrollContainer === document.documentElement
    ? window.scrollY
    : scrollContainer.scrollTop;

  // Calculate absolute top of target block
  const absoluteTop = rect.top + currentScroll;

  // Calculate target scroll position
  let targetScroll: number;

  if (rect.height > viewportHeight) {
    // Block is taller than viewport
    // Scroll to show the same relative progress through the block
    const scrollableHeight = rect.height - viewportHeight;
    targetScroll = absoluteTop + scrollableHeight * sourceProgress;
  } else {
    // Block is smaller than viewport
    // Position block at top if progress > 0, otherwise show it naturally
    if (sourceProgress > 0.5) {
      targetScroll = absoluteTop;
    } else {
      // Show block with some padding from top
      targetScroll = absoluteTop - viewportHeight * 0.2;
    }
  }

  return Math.max(0, targetScroll);
}
