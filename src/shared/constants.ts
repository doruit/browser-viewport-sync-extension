/**
 * Configuration constants for the sync engine
 */

export const SYNC_CONFIG = {
  // Scroll event throttling (ms)
  SCROLL_THROTTLE: 100,

  // Minimum block height to consider (px)
  MIN_BLOCK_HEIGHT: 50,

  // Minimum text length for a block to be meaningful
  MIN_TEXT_LENGTH: 20,

  // Maximum blocks to extract (performance limit)
  MAX_BLOCKS: 100,

  // Confidence threshold for semantic matching
  HIGH_CONFIDENCE_THRESHOLD: 0.7,
  MEDIUM_CONFIDENCE_THRESHOLD: 0.4,

  // Viewport intersection thresholds for active block detection
  MIN_VISIBILITY_RATIO: 0.1,

  // Debounce time for model rebuild after DOM mutations (ms)
  MODEL_REBUILD_DEBOUNCE: 500,

  // Scroll application settling time (ms)
  SCROLL_SETTLE_TIME: 100,

  // Loop suppression cooldown (ms)
  LOOP_SUPPRESSION_COOLDOWN: 200,
};

export const MATCHING_WEIGHTS = {
  // Weight for document order similarity (0-1)
  ORDER_WEIGHT: 0.25,

  // Weight for heading text similarity (0-1)
  HEADING_WEIGHT: 0.3,

  // Weight for body text similarity (0-1)
  TEXT_WEIGHT: 0.2,

  // Weight for structural similarity (children, media, links)
  STRUCTURE_WEIGHT: 0.15,

  // Weight for relative position similarity
  POSITION_WEIGHT: 0.1,
};

export const BLOCK_SELECTORS = [
  'section',
  'article',
  'main > div',
  '[class*="section"]',
  '[class*="block"]',
  '[class*="container"] > div',
  '[id*="section"]',
  'div[role="region"]',
  'div[role="article"]',
];

export const DEBUG_CONFIG = {
  ENABLED: false,
  HIGHLIGHT_COLOR: '#00ff0088',
  ACTIVE_BLOCK_COLOR: '#ff000088',
  MATCH_LINE_COLOR: '#0000ff88',
};
