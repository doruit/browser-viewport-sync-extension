/**
 * Match blocks between desktop and mobile views
 */

import type { BlockFingerprint, BlockMatch } from '../shared/models';
import { MATCHING_WEIGHTS } from '../shared/constants';
import { calculateTextSimilarity, normalizedDistance, clamp } from '../shared/utils';

/**
 * Match blocks from source to target using weighted scoring
 */
export function matchBlocks(
  sourceBlocks: BlockFingerprint[],
  targetBlocks: BlockFingerprint[]
): Map<string, BlockMatch> {
  const matches = new Map<string, BlockMatch>();

  for (const sourceBlock of sourceBlocks) {
    let bestMatch: BlockMatch | null = null;
    let bestScore = 0;

    for (const targetBlock of targetBlocks) {
      const score = calculateMatchScore(sourceBlock, targetBlock, sourceBlocks, targetBlocks);

      if (score > bestScore) {
        bestScore = score;
        bestMatch = {
          sourceBlockId: sourceBlock.id,
          targetBlockId: targetBlock.id,
          confidence: score,
          matchReasons: getMatchReasons(sourceBlock, targetBlock),
        };
      }
    }

    if (bestMatch && bestScore > 0.2) {
      // Minimum threshold
      matches.set(sourceBlock.id, bestMatch);
    }
  }

  console.log('[BlockMatcher] Matched', matches.size, 'of', sourceBlocks.length, 'blocks');

  return matches;
}

/**
 * Calculate match score between two blocks
 */
function calculateMatchScore(
  source: BlockFingerprint,
  target: BlockFingerprint,
  sourceBlocks: BlockFingerprint[],
  targetBlocks: BlockFingerprint[]
): number {
  let score = 0;

  // 1. Order similarity (blocks at similar positions in document)
  const orderSimilarity = calculateOrderSimilarity(source, target, sourceBlocks, targetBlocks);
  score += orderSimilarity * MATCHING_WEIGHTS.ORDER_WEIGHT;

  // 2. Heading text similarity
  const headingSimilarity = calculateTextSimilarity(source.headingText, target.headingText);
  score += headingSimilarity * MATCHING_WEIGHTS.HEADING_WEIGHT;

  // 3. Body text similarity
  const textSimilarity = calculateTextSimilarity(source.textContent, target.textContent);
  score += textSimilarity * MATCHING_WEIGHTS.TEXT_WEIGHT;

  // 4. Structural similarity
  const structureSimilarity = calculateStructureSimilarity(source, target);
  score += structureSimilarity * MATCHING_WEIGHTS.STRUCTURE_WEIGHT;

  // 5. Position similarity (normalized vertical position)
  const positionSimilarity = 1 - normalizedDistance(source.normalizedTop, target.normalizedTop);
  score += positionSimilarity * MATCHING_WEIGHTS.POSITION_WEIGHT;

  return clamp(score, 0, 1);
}

/**
 * Calculate order similarity based on relative position in block lists
 */
function calculateOrderSimilarity(
  source: BlockFingerprint,
  target: BlockFingerprint,
  sourceBlocks: BlockFingerprint[],
  targetBlocks: BlockFingerprint[]
): number {
  const sourcePosition = source.orderIndex / Math.max(sourceBlocks.length - 1, 1);
  const targetPosition = target.orderIndex / Math.max(targetBlocks.length - 1, 1);

  return 1 - Math.abs(sourcePosition - targetPosition);
}

/**
 * Calculate structural similarity
 */
function calculateStructureSimilarity(source: BlockFingerprint, target: BlockFingerprint): number {
  let similarity = 0;
  let factors = 0;

  // Tag name match
  if (source.tagName === target.tagName) {
    similarity += 1;
  }
  factors += 1;

  // Has heading match
  if (source.hasHeading === target.hasHeading) {
    similarity += 1;
  }
  factors += 1;

  // Image count similarity
  if (source.imageCount > 0 && target.imageCount > 0) {
    const imageRatio = Math.min(source.imageCount, target.imageCount) / Math.max(source.imageCount, target.imageCount);
    similarity += imageRatio;
    factors += 1;
  } else if (source.imageCount === 0 && target.imageCount === 0) {
    similarity += 1;
    factors += 1;
  } else {
    factors += 1;
  }

  // Link/button count similarity
  const sourceInteractive = source.linkCount + source.buttonCount;
  const targetInteractive = target.linkCount + target.buttonCount;

  if (sourceInteractive > 0 && targetInteractive > 0) {
    const interactiveRatio = Math.min(sourceInteractive, targetInteractive) / Math.max(sourceInteractive, targetInteractive);
    similarity += interactiveRatio;
    factors += 1;
  } else if (sourceInteractive === 0 && targetInteractive === 0) {
    similarity += 1;
    factors += 1;
  } else {
    factors += 1;
  }

  // Text length similarity
  if (source.textLength > 0 && target.textLength > 0) {
    const textRatio = Math.min(source.textLength, target.textLength) / Math.max(source.textLength, target.textLength);
    similarity += textRatio;
    factors += 1;
  } else if (source.textLength === 0 && target.textLength === 0) {
    similarity += 1;
    factors += 1;
  } else {
    factors += 1;
  }

  return similarity / factors;
}

/**
 * Get human-readable match reasons
 */
function getMatchReasons(source: BlockFingerprint, target: BlockFingerprint): string[] {
  const reasons: string[] = [];

  if (source.headingText && target.headingText) {
    const headingSim = calculateTextSimilarity(source.headingText, target.headingText);
    if (headingSim > 0.7) {
      reasons.push('Similar heading');
    }
  }

  if (source.tagName === target.tagName) {
    reasons.push('Same tag');
  }

  const textSim = calculateTextSimilarity(source.textContent, target.textContent);
  if (textSim > 0.5) {
    reasons.push('Similar content');
  }

  if (source.imageCount > 0 && target.imageCount > 0) {
    reasons.push('Both have images');
  }

  if (Math.abs(source.orderIndex - target.orderIndex) <= 2) {
    reasons.push('Close in order');
  }

  return reasons;
}

/**
 * Find best match for a specific block ID
 */
export function findMatchForBlock(
  blockId: string,
  matches: Map<string, BlockMatch>
): BlockMatch | null {
  return matches.get(blockId) || null;
}
