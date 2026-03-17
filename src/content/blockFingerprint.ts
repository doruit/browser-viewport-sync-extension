/**
 * Generate fingerprints for content blocks
 */

import type { BlockFingerprint } from '../shared/models';
import { getDomPath, simpleHash } from '../shared/utils';
import { getTextContent, getHeadingText, countElements } from './domUtils';
import { getScrollDimensions } from './scrollContainer';

/**
 * Create a fingerprint for a block element
 */
export function createBlockFingerprint(
  element: Element,
  orderIndex: number,
  scrollContainer: Element
): BlockFingerprint {
  const rect = element.getBoundingClientRect();
  const { scrollHeight } = getScrollDimensions(scrollContainer);

  // Get text content
  const textContent = getTextContent(element);
  const headingText = getHeadingText(element);

  // Calculate normalized position (0-1)
  const scrollTop = scrollContainer === document.documentElement
    ? window.scrollY
    : scrollContainer.scrollTop;

  const absoluteTop = rect.top + scrollTop;
  const normalizedTop = scrollHeight > 0 ? absoluteTop / scrollHeight : 0;
  const normalizedHeight = scrollHeight > 0 ? rect.height / scrollHeight : 0;

  // Count various elements
  const imageCount = countElements(element, 'img, picture, video');
  const linkCount = countElements(element, 'a');
  const buttonCount = countElements(element, 'button, [role="button"]');
  const childCount = element.children.length;

  // Calculate semantic score
  let semanticScore = 0;
  if (headingText.length > 0) semanticScore += 2;
  if (textContent.length > 100) semanticScore += 2;
  if (imageCount > 0) semanticScore += 1;
  if (buttonCount > 0 || linkCount > 0) semanticScore += 1;

  // Generate unique ID
  const domPath = getDomPath(element);
  const id = simpleHash(`${domPath}-${orderIndex}-${headingText.slice(0, 50)}`);

  return {
    id,
    tagName: element.tagName.toLowerCase(),
    domPath,
    orderIndex,
    normalizedTop,
    normalizedHeight,
    textContent: textContent.slice(0, 500), // Truncate for performance
    headingText: headingText.slice(0, 200),
    textLength: textContent.length,
    childCount,
    imageCount,
    linkCount,
    buttonCount,
    hasHeading: headingText.length > 0,
    semanticScore,
    boundingRect: {
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
    },
  };
}

/**
 * Create fingerprints for all blocks
 */
export function createBlockFingerprints(
  elements: Element[],
  scrollContainer: Element
): BlockFingerprint[] {
  return elements.map((element, index) => createBlockFingerprint(element, index, scrollContainer));
}
