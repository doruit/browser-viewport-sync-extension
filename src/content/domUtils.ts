/**
 * DOM utility functions for content script
 */

/**
 * Check if element is visible
 */
export function isVisible(element: Element): boolean {
  const rect = element.getBoundingClientRect();
  const style = window.getComputedStyle(element);

  return (
    rect.width > 0 &&
    rect.height > 0 &&
    style.display !== 'none' &&
    style.visibility !== 'hidden' &&
    style.opacity !== '0'
  );
}

/**
 * Get all text content from element (excluding scripts and styles)
 */
export function getTextContent(element: Element): string {
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, {
    acceptNode: (node) => {
      const parent = node.parentElement;
      if (!parent) return NodeFilter.FILTER_REJECT;

      const tagName = parent.tagName.toLowerCase();
      if (tagName === 'script' || tagName === 'style' || tagName === 'noscript') {
        return NodeFilter.FILTER_REJECT;
      }

      return NodeFilter.FILTER_ACCEPT;
    },
  });

  const texts: string[] = [];
  let node: Node | null;

  while ((node = walker.nextNode())) {
    const text = node.textContent?.trim();
    if (text) {
      texts.push(text);
    }
  }

  return texts.join(' ');
}

/**
 * Extract heading text from element
 */
export function getHeadingText(element: Element): string {
  const headings = element.querySelectorAll('h1, h2, h3, h4, h5, h6');
  const texts: string[] = [];

  headings.forEach((h) => {
    const text = h.textContent?.trim();
    if (text) {
      texts.push(text);
    }
  });

  return texts.join(' ');
}

/**
 * Count elements matching selector
 */
export function countElements(element: Element, selector: string): number {
  return element.querySelectorAll(selector).length;
}

/**
 * Check if element is likely a semantic content block
 */
export function isSemanticBlock(element: Element): boolean {
  const tagName = element.tagName.toLowerCase();

  // Semantic HTML5 elements
  if (['section', 'article', 'main', 'aside', 'header', 'footer', 'nav'].includes(tagName)) {
    return true;
  }

  // Elements with semantic roles
  const role = element.getAttribute('role');
  if (role && ['region', 'article', 'complementary', 'main'].includes(role)) {
    return true;
  }

  // Elements with semantic class names
  const className = element.className;
  if (typeof className === 'string') {
    const lower = className.toLowerCase();
    if (
      lower.includes('section') ||
      lower.includes('block') ||
      lower.includes('container') ||
      lower.includes('content')
    ) {
      return true;
    }
  }

  return false;
}

/**
 * Calculate semantic score for an element
 */
export function calculateSemanticScore(element: Element): number {
  let score = 0;

  // Semantic tag names
  const tagName = element.tagName.toLowerCase();
  if (tagName === 'section' || tagName === 'article') score += 3;
  else if (tagName === 'main') score += 2;
  else if (tagName === 'div') score += 0;

  // Has heading
  const headings = element.querySelectorAll('h1, h2, h3, h4, h5, h6');
  if (headings.length > 0) score += 2;

  // Has substantial text content
  const text = getTextContent(element);
  if (text.length > 100) score += 2;
  if (text.length > 300) score += 1;

  // Has media content
  const images = element.querySelectorAll('img, picture, video');
  if (images.length > 0) score += 1;

  // Has interactive elements
  const interactive = element.querySelectorAll('button, a, input');
  if (interactive.length > 0) score += 1;

  // Has semantic class or id
  if (isSemanticBlock(element)) score += 1;

  return score;
}

/**
 * Get viewport dimensions
 */
export function getViewportDimensions() {
  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
}

/**
 * Calculate visibility ratio of element in viewport
 */
export function getVisibilityRatio(element: Element): number {
  const rect = element.getBoundingClientRect();
  const viewport = getViewportDimensions();

  const visibleTop = Math.max(0, rect.top);
  const visibleBottom = Math.min(viewport.height, rect.bottom);
  const visibleHeight = Math.max(0, visibleBottom - visibleTop);

  if (rect.height === 0) return 0;

  return visibleHeight / rect.height;
}
