/**
 * Click synchronization - syncs click events between tabs
 */

import type { ClickSyncPayload } from '../shared/models';

export class ClickSync {
  private isApplyingSync = false;

  constructor(private onClick: (payload: ClickSyncPayload) => void) {
    this.init();
  }

  private init(): void {
    // Listen for click events on the whole document
    // Using capture phase to ensure we see them even if stopPropagation is called
    document.addEventListener('click', (event) => {
      this.handleClick(event);
    }, true);

    console.log('[ClickSync] Initialized');
  }

  /**
   * Handle local click event
   */
  private handleClick(event: MouseEvent): void {
    // If we're currently applying a sync from another tab, don't broadcast back
    if (this.isApplyingSync) return;

    // Ignore synthetic events to avoid infinite loops
    if (!event.isTrusted) return;

    const target = event.target as HTMLElement;
    if (!target) return;

    // Check if it's a clickable element or inside one
    const clickable = target.closest('button, a, input[type="submit"], input[type="button"], [role="button"], .button, .btn, [onclick]') || target;

    // Get a unique selector for the element
    const selector = this.getUniqueSelector(clickable as HTMLElement);

    const payload: ClickSyncPayload = {
      type: 'click_sync',
      sourceTabId: 0, // To be filled by background script
      timestamp: Date.now(),
      selector,
    };

    console.log('[ClickSync] Broadcasting click:', selector);
    this.onClick(payload);
  }

  /**
   * Apply sync from another tab
   */
  applySync(payload: ClickSyncPayload): void {
    if (payload.type !== 'click_sync') return;

    this.isApplyingSync = true;
    
    try {
      const element = document.querySelector(payload.selector) as HTMLElement;
      if (!element) {
        console.warn('[ClickSync] Target element not found:', payload.selector);
        // Fallback: try to find button with similar text
        // This is a naive fallback but sometimes helps when elements change slightly
        return;
      }

      console.log('[ClickSync] Applying click sync to:', payload.selector);
      
      // We do a programmatic click, which creates an untrusted click event
      // This is good because our listener will ignore it, preventing a loop
      element.click();

    } catch (error) {
      console.error('[ClickSync] Error applying sync:', error);
    } finally {
      // Re-enable click tracking after a short delay to allow events to settle
      setTimeout(() => {
        this.isApplyingSync = false;
      }, 100);
    }
  }

  /**
   * Generate a reasonably unique CSS selector for an element
   */
  private getUniqueSelector(el: HTMLElement): string {
    // If it has an ID, that's the best selector
    if (el.id) {
      return `#${CSS.escape(el.id)}`;
    }
    
    // Check for unique attributes like name or placeholder which are common in inputs
    if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
      if (el.name) {
        const nameSelector = `${el.tagName.toLowerCase()}[name="${CSS.escape(el.name)}"]`;
        if (document.querySelectorAll(nameSelector).length === 1) {
          return nameSelector;
        }
      }
      
      const placeholder = el.getAttribute('placeholder');
      if (placeholder) {
        const placeholderSelector = `${el.tagName.toLowerCase()}[placeholder="${CSS.escape(placeholder)}"]`;
        if (document.querySelectorAll(placeholderSelector).length === 1) {
          return placeholderSelector;
        }
      }
    }

    // Fallback to hierarchical selector
    const parts: string[] = [];
    let current: HTMLElement | null = el;
    
    while (current && current !== document.body && current !== document.documentElement) {
      let selector = current.tagName.toLowerCase();
      
      if (current.id) {
        selector += `#${CSS.escape(current.id)}`;
        parts.unshift(selector);
        break; // ID is global, so we can stop here
      }
      
      // Get the index among siblings of the same tag
      let index = 1;
      let sibling = current.previousElementSibling;
      while (sibling) {
        if (sibling.tagName === current.tagName) {
          index++;
        }
        sibling = sibling.previousElementSibling;
      }
      
      selector += `:nth-of-type(${index})`;
      parts.unshift(selector);
      current = current.parentElement;
    }
    
    return parts.join(' > ');
  }
}
