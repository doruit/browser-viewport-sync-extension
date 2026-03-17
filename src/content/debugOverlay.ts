/**
 * Debug overlay for visualizing blocks and sync state
 */

import type { BlockFingerprint } from '../shared/models';
import { DEBUG_CONFIG } from '../shared/constants';

export class DebugOverlay {
  private overlays = new Map<string, HTMLElement>();
  private activeBlockId: string | null = null;
  private infoPanel: HTMLElement | null = null;

  /**
   * Show debug overlays for blocks
   */
  showBlocks(blocks: BlockFingerprint[], blockElements: Map<string, Element>): void {
    this.clearOverlays();

    blocks.forEach((block) => {
      const element = blockElements.get(block.id);
      if (!element) return;

      const overlay = this.createBlockOverlay(element, block);
      this.overlays.set(block.id, overlay);
      document.body.appendChild(overlay);
    });

    this.updateInfoPanel();
  }

  /**
   * Highlight active block
   */
  highlightActiveBlock(blockId: string): void {
    // Remove previous highlight
    if (this.activeBlockId) {
      const prevOverlay = this.overlays.get(this.activeBlockId);
      if (prevOverlay) {
        prevOverlay.style.backgroundColor = DEBUG_CONFIG.HIGHLIGHT_COLOR;
        prevOverlay.style.borderColor = '#00ff00';
      }
    }

    // Add new highlight
    const overlay = this.overlays.get(blockId);
    if (overlay) {
      overlay.style.backgroundColor = DEBUG_CONFIG.ACTIVE_BLOCK_COLOR;
      overlay.style.borderColor = '#ff0000';
      overlay.style.borderWidth = '3px';
    }

    this.activeBlockId = blockId;
    this.updateInfoPanel();
  }

  /**
   * Clear all overlays
   */
  clearOverlays(): void {
    this.overlays.forEach((overlay) => {
      overlay.remove();
    });
    this.overlays.clear();
  }

  /**
   * Create overlay element for a block
   */
  private createBlockOverlay(element: Element, block: BlockFingerprint): HTMLElement {
    const rect = element.getBoundingClientRect();

    const overlay = document.createElement('div');
    overlay.style.position = 'absolute';
    overlay.style.top = `${rect.top + window.scrollY}px`;
    overlay.style.left = `${rect.left + window.scrollX}px`;
    overlay.style.width = `${rect.width}px`;
    overlay.style.height = `${rect.height}px`;
    overlay.style.backgroundColor = DEBUG_CONFIG.HIGHLIGHT_COLOR;
    overlay.style.border = '2px solid #00ff00';
    overlay.style.pointerEvents = 'none';
    overlay.style.zIndex = '999999';
    overlay.style.boxSizing = 'border-box';

    // Add label
    const label = document.createElement('div');
    label.style.position = 'absolute';
    label.style.top = '0';
    label.style.left = '0';
    label.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    label.style.color = '#fff';
    label.style.padding = '2px 6px';
    label.style.fontSize = '11px';
    label.style.fontFamily = 'monospace';
    label.textContent = `Block ${block.orderIndex} (${block.tagName})`;

    overlay.appendChild(label);

    return overlay;
  }

  /**
   * Create or update info panel
   */
  private updateInfoPanel(): void {
    if (!this.infoPanel) {
      this.infoPanel = document.createElement('div');
      this.infoPanel.style.position = 'fixed';
      this.infoPanel.style.top = '10px';
      this.infoPanel.style.right = '10px';
      this.infoPanel.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
      this.infoPanel.style.color = '#fff';
      this.infoPanel.style.padding = '10px';
      this.infoPanel.style.fontSize = '12px';
      this.infoPanel.style.fontFamily = 'monospace';
      this.infoPanel.style.zIndex = '9999999';
      this.infoPanel.style.borderRadius = '4px';
      this.infoPanel.style.maxWidth = '300px';
      document.body.appendChild(this.infoPanel);
    }

    const info = [
      `Blocks: ${this.overlays.size}`,
      `Active: ${this.activeBlockId || 'none'}`,
      `Debug Mode: ON`,
    ];

    this.infoPanel.innerHTML = info.join('<br>');
  }

  /**
   * Hide debug overlay
   */
  hide(): void {
    this.clearOverlays();
    if (this.infoPanel) {
      this.infoPanel.remove();
      this.infoPanel = null;
    }
  }
}
