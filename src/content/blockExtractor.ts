/**
 * Extract semantic content blocks from the page
 */

import { BLOCK_SELECTORS, SYNC_CONFIG } from '../shared/constants';
import { isVisible, isSemanticBlock, calculateSemanticScore } from './domUtils';

export interface BlockCandidate {
  element: Element;
  semanticScore: number;
}

/**
 * Extract candidate blocks from the page
 */
export function extractBlocks(): BlockCandidate[] {
  const candidates: BlockCandidate[] = [];
  const seen = new Set<Element>();

  // Try each selector
  for (const selector of BLOCK_SELECTORS) {
    try {
      const elements = document.querySelectorAll(selector);

      elements.forEach((element) => {
        if (seen.has(element)) return;

        // Skip if not visible
        if (!isVisible(element)) return;

        // Skip if too small
        const rect = element.getBoundingClientRect();
        if (rect.height < SYNC_CONFIG.MIN_BLOCK_HEIGHT) return;

        // Calculate semantic score
        const semanticScore = calculateSemanticScore(element);

        // Skip if score too low
        if (semanticScore < 2) return;

        seen.add(element);
        candidates.push({ element, semanticScore });
      });
    } catch (error) {
      console.warn('[BlockExtractor] Error with selector:', selector, error);
    }
  }

  // Sort by semantic score (descending)
  candidates.sort((a, b) => b.semanticScore - a.semanticScore);

  // Remove nested blocks (keep only top-level containers)
  const filtered = filterNestedBlocks(candidates);

  // Limit to max blocks
  const limited = filtered.slice(0, SYNC_CONFIG.MAX_BLOCKS);

  console.log('[BlockExtractor] Extracted', limited.length, 'blocks from', candidates.length, 'candidates');

  return limited;
}

/**
 * Filter out blocks that are nested inside other blocks
 */
function filterNestedBlocks(candidates: BlockCandidate[]): BlockCandidate[] {
  const filtered: BlockCandidate[] = [];

  for (const candidate of candidates) {
    let isNested = false;

    // Check if this element is nested inside any already-selected block
    for (const selected of filtered) {
      if (selected.element.contains(candidate.element)) {
        isNested = true;
        break;
      }
    }

    if (!isNested) {
      filtered.push(candidate);
    }
  }

  return filtered;
}

/**
 * Find blocks that are siblings or close in document order
 */
export function findSiblingBlocks(blocks: BlockCandidate[]): BlockCandidate[][] {
  const groups: BlockCandidate[][] = [];
  let currentGroup: BlockCandidate[] = [];

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];

    if (currentGroup.length === 0) {
      currentGroup.push(block);
    } else {
      const lastBlock = currentGroup[currentGroup.length - 1];

      // Check if blocks are siblings or close relatives
      if (areSiblings(lastBlock.element, block.element)) {
        currentGroup.push(block);
      } else {
        groups.push(currentGroup);
        currentGroup = [block];
      }
    }
  }

  if (currentGroup.length > 0) {
    groups.push(currentGroup);
  }

  return groups;
}

/**
 * Check if two elements are siblings or close relatives
 */
function areSiblings(el1: Element, el2: Element): boolean {
  if (el1.parentElement === el2.parentElement) {
    return true;
  }

  // Check if they share a close common ancestor
  const ancestor1 = el1.parentElement?.parentElement;
  const ancestor2 = el2.parentElement?.parentElement;

  return ancestor1 === ancestor2 && ancestor1 !== null;
}
