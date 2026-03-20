/**
 * Input synchronization - syncs input field values between tabs
 */

import type { InputSyncPayload } from '../shared/models';

export class InputSync {
  private isApplyingSync = false;

  constructor(private onInput: (payload: InputSyncPayload) => void) {
    this.init();
  }

  private init(): void {
    // Listen for input events on the whole document
    // Using capture phase to ensure we see them even if stopPropagation is called
    document.addEventListener('input', (event) => {
      this.handleInput(event);
    }, true);
    
    // Checkboxes and radios often fire change events more reliably than input events
    document.addEventListener('change', (event) => {
      this.handleInput(event);
    }, true);

    console.log('[InputSync] Initialized');
  }

  /**
   * Handle local input event
   */
  private handleInput(event: Event): void {
    // If we're currently applying a sync from another tab, don't broadcast back
    if (this.isApplyingSync) return;

    let target = event.target as HTMLElement;
    if (!target) return;

    // For contenteditable, find the root element with contenteditable="true"
    // This handles generative chatbots (ChatGPT, Claude) that nest multiple elements inside the editor
    if (target.isContentEditable) {
      let current: HTMLElement | null = target;
      let rootEditable = target;
      while (current && current !== document.body && current !== document.documentElement) {
        const ce = current.getAttribute('contenteditable');
        if (ce === 'true' || ce === '') {
          rootEditable = current;
        }
        current = current.parentElement;
      }
      target = rootEditable;
    }

    // Identify if it's a syncable input
    const isInput = target instanceof HTMLInputElement && 
      (['text', 'search', 'url', 'tel', 'email'].includes(target.type) || !target.type);
    const isCheckboxOrRadio = target instanceof HTMLInputElement && 
      ['checkbox', 'radio'].includes(target.type);
    const isTextarea = target instanceof HTMLTextAreaElement;
    const isContentEditable = target.isContentEditable;
    // Support custom web components like Google's rich-textarea used in Gemini
    const isCustomEditor = ['RICH-TEXTAREA'].includes(target.tagName.toUpperCase());

    if (!isInput && !isCheckboxOrRadio && !isTextarea && !isContentEditable && !isCustomEditor) return;

    // Get a unique selector for the element
    const selector = this.getUniqueSelector(target);
    const value = (isContentEditable || isCustomEditor) ? target.innerHTML : (target as HTMLInputElement | HTMLTextAreaElement).value;

    const payload: InputSyncPayload = {
      type: 'input_sync',
      sourceTabId: 0, // To be filled by background script
      timestamp: Date.now(),
      selector,
      value,
    };

    if (isCheckboxOrRadio) {
      payload.checked = (target as HTMLInputElement).checked;
    }

    console.log('[InputSync] Broadcasting input:', selector, value.substring(0, 20) + (value.length > 20 ? '...' : ''));
    this.onInput(payload);
  }

  /**
   * Apply sync from another tab
   */
  applySync(payload: InputSyncPayload): void {
    if (payload.type !== 'input_sync') return;

    this.isApplyingSync = true;
    
    try {
      const element = document.querySelector(payload.selector) as HTMLElement;
      if (!element) {
        console.warn('[InputSync] Target element not found:', payload.selector);
        return;
      }

      console.log('[InputSync] Applying sync to:', payload.selector);

      const isCustomEditor = ['RICH-TEXTAREA'].includes(element.tagName.toUpperCase());

      if (element.isContentEditable || isCustomEditor) {
        if (element.innerHTML !== payload.value) {
          // Use execCommand for rich text editors to properly trigger internal state changes
          element.focus();
          const selection = window.getSelection();
          if (selection) {
            const range = document.createRange();
            range.selectNodeContents(element);
            selection.removeAllRanges();
            selection.addRange(range);
          }
          
          try {
            if (!payload.value) {
              document.execCommand('delete', false);
            } else {
              document.execCommand('insertHTML', false, payload.value);
            }
          } catch (e) {
            element.innerHTML = payload.value;
          }
          
          this.triggerInputEvents(element);
        }
      } else {
        const input = element as HTMLInputElement | HTMLTextAreaElement;
        const isCheckboxOrRadio = input instanceof HTMLInputElement && ['checkbox', 'radio'].includes(input.type);
        
        let changed = false;

        if (isCheckboxOrRadio && payload.checked !== undefined) {
          if ((input as HTMLInputElement).checked !== payload.checked) {
            // Bypass React's overridden setter for 'checked'
            const proto = window.HTMLInputElement.prototype;
            const descriptor = Object.getOwnPropertyDescriptor(proto, 'checked');
            if (descriptor && descriptor.set) {
              descriptor.set.call(input, payload.checked);
            } else {
              (input as HTMLInputElement).checked = payload.checked;
            }
            changed = true;
          }
        } else if (input.value !== payload.value) {
          // Bypass React's overridden setter for 'value' to force synthetic events to pick up the change
          const proto = input instanceof HTMLInputElement ? window.HTMLInputElement.prototype : window.HTMLTextAreaElement.prototype;
          const descriptor = Object.getOwnPropertyDescriptor(proto, 'value');
          if (descriptor && descriptor.set) {
            descriptor.set.call(input, payload.value);
          } else {
            input.value = payload.value;
          }
          changed = true;
        }

        if (changed) {
          this.triggerInputEvents(input);
        }
      }
    } catch (error) {
      console.error('[InputSync] Error applying sync:', error);
    } finally {
      // Re-enable input tracking after a short delay to allow events to settle
      setTimeout(() => {
        this.isApplyingSync = false;
      }, 100);
    }
  }

  /**
   * Trigger events so the page notices the change (crucial for React/Vue)
   */
  private triggerInputEvents(element: HTMLElement): void {
    // Trigger input event
    const inputEvent = new Event('input', { bubbles: true, cancelable: true });
    element.dispatchEvent(inputEvent);
    
    // Trigger change event
    const changeEvent = new Event('change', { bubbles: true, cancelable: true });
    element.dispatchEvent(changeEvent);

    // Some sites might also listen for keyup/keydown
    const keyupEvent = new KeyboardEvent('keyup', { bubbles: true, cancelable: true });
    element.dispatchEvent(keyupEvent);
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
