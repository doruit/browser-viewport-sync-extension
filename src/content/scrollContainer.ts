/**
 * Detect the primary scroll container for the page
 */

/**
 * Find the scrollable container for the page
 */
export function detectScrollContainer(): Element {
  // Check common scroll containers in order
  const candidates = [
    document.scrollingElement,
    document.documentElement,
    document.body,
  ];

  // Also check for main app containers with overflow
  const appContainers = document.querySelectorAll('[id*="app"], [id*="root"], [class*="app"], main');
  appContainers.forEach((el) => {
    const style = window.getComputedStyle(el);
    if (style.overflowY === 'auto' || style.overflowY === 'scroll') {
      candidates.unshift(el);
    }
  });

  // Find the container with the largest scrollable area
  let maxScrollHeight = 0;
  let bestContainer: Element = document.documentElement;

  for (const container of candidates) {
    if (!container) continue;

    const scrollHeight = container.scrollHeight;
    const clientHeight = container.clientHeight;

    if (scrollHeight > clientHeight && scrollHeight > maxScrollHeight) {
      maxScrollHeight = scrollHeight;
      bestContainer = container;
    }
  }

  console.log('[ScrollContainer] Detected scroll container:', bestContainer.tagName, {
    scrollHeight: bestContainer.scrollHeight,
    clientHeight: bestContainer.clientHeight,
  });

  return bestContainer;
}

/**
 * Get current scroll position
 */
export function getScrollPosition(container: Element): number {
  if (container === document.documentElement || container === document.body) {
    return window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
  }

  return container.scrollTop;
}

/**
 * Set scroll position
 */
export function setScrollPosition(container: Element, position: number): void {
  if (container === document.documentElement || container === document.body) {
    window.scrollTo({ top: position, behavior: 'auto' });
  } else {
    container.scrollTop = position;
  }
}

/**
 * Get scroll dimensions
 */
export function getScrollDimensions(container: Element) {
  if (container === document.documentElement || container === document.body) {
    return {
      scrollHeight: document.documentElement.scrollHeight,
      clientHeight: window.innerHeight,
    };
  }

  return {
    scrollHeight: container.scrollHeight,
    clientHeight: container.clientHeight,
  };
}

/**
 * Calculate global scroll progress (0-1)
 */
export function getGlobalScrollProgress(container: Element): number {
  const position = getScrollPosition(container);
  const { scrollHeight, clientHeight } = getScrollDimensions(container);
  const maxScroll = scrollHeight - clientHeight;

  if (maxScroll <= 0) return 0;

  return position / maxScroll;
}
