/**
 * Type definitions specific to content script
 */

export interface ScrollEventData {
  scrollTop: number;
  scrollHeight: number;
  clientHeight: number;
  timestamp: number;
}

export interface BlockInfo {
  id: string;
  element: Element;
  isVisible: boolean;
  visibilityRatio: number;
}
