# Architecture Overview

## System Design

The Responsive Demo Sync extension uses a distributed architecture with three main components communicating via Chrome's message passing API.

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Interface                          │
│                                                                 │
│  ┌──────────────┐                          ┌──────────────┐    │
│  │   Desktop    │                          │    Mobile    │    │
│  │   Browser    │                          │   Browser    │    │
│  │   Window     │                          │   Window     │    │
│  └──────┬───────┘                          └──────┬───────┘    │
│         │                                         │            │
└─────────┼─────────────────────────────────────────┼────────────┘
          │                                         │
          ▼                                         ▼
  ┌───────────────┐                         ┌───────────────┐
  │   Content     │                         │   Content     │
  │   Script      │                         │   Script      │
  │  (Desktop)    │                         │   (Mobile)    │
  └───────┬───────┘                         └───────┬───────┘
          │                                         │
          │ scroll event                            │ apply sync
          │                                         │
          └────────────────┐     ┌─────────────────┘
                           │     │
                           ▼     ▼
                    ┌──────────────────┐
                    │   Background     │
                    │  Service Worker  │
                    │                  │
                    │ - Session Store  │
                    │ - Message Router │
                    └────────┬─────────┘
                             │
                             ▼
                      ┌──────────────┐
                      │    Popup     │
                      │      UI      │
                      └──────────────┘
```

## Component Details

### 1. Background Service Worker

**Location**: `src/background/`

**Responsibilities**:
- Maintain global sync session state
- Route messages between tabs
- Track which tabs are desktop/mobile
- Enforce master/follower roles
- Handle tab lifecycle (close, navigate)

**Key Files**:
- `index.ts` - Main entry point, event listeners
- `sessionStore.ts` - State management
- `messageRouter.ts` - Message routing logic

**State Model**:
```typescript
{
  desktopTabId: number | null;
  mobileTabId: number | null;
  masterTabId: number | null;
  enabled: boolean;
  lastSyncTimestamp: number;
  lastSyncSummary: string;
}
```

### 2. Content Script

**Location**: `src/content/`

**Responsibilities**:
- Analyze page DOM structure
- Extract semantic content blocks
- Create block fingerprints
- Detect active visible block
- Match blocks between viewports
- Apply scroll synchronization
- Prevent feedback loops

**Key Files**:
- `index.ts` - Entry point, message handling
- `syncEngine.ts` - Main coordinator
- `blockExtractor.ts` - DOM analysis
- `blockFingerprint.ts` - Fingerprint creation
- `blockMatcher.ts` - Matching algorithm
- `activeBlock.ts` - Visibility detection
- `scrollContainer.ts` - Scroll handling
- `domUtils.ts` - DOM utilities
- `debugOverlay.ts` - Visual debugging

**Data Flow**:
```
Page Load
  ↓
Extract Blocks (sections, articles, etc.)
  ↓
Create Fingerprints (text, structure, position)
  ↓
Store Page Model
  ↓
Listen for Scroll Events (throttled)
  ↓
Detect Active Block (visibility-based)
  ↓
Calculate Relative Progress (0-1)
  ↓
Send to Background
```

### 3. Popup UI

**Location**: `src/popup/`

**Responsibilities**:
- Display current session state
- Allow tab assignment
- Control master/follower selection
- Enable/disable sync
- Trigger model refresh
- Show diagnostic info

**Files**:
- `popup.html` - UI structure
- `popup.css` - Styling
- `popup.ts` - Logic and state management

## Message Flow

### Tab Assignment Flow

```
User clicks "Set as Desktop"
  ↓
Popup → Background: SET_DESKTOP_TAB
  ↓
Background updates session state
  ↓
Background → Content (desktop): BUILD_PAGE_MODEL
  ↓
Content analyzes page
  ↓
Content → Background: PAGE_MODEL_BUILT
```

### Scroll Sync Flow

```
User scrolls in Desktop (master)
  ↓
Content (desktop) detects scroll (throttled)
  ↓
Content calculates active block + progress
  ↓
Content → Background: SCROLL_EVENT
  ↓
Background verifies master role
  ↓
Background finds follower tab (mobile)
  ↓
Background → Content (mobile): APPLY_SYNC
  ↓
Content (mobile) matches blocks
  ↓
Content (mobile) calculates target scroll
  ↓
Content (mobile) applies scroll
  ↓
Loop suppression prevents feedback
```

## Smart Matching Algorithm

### Block Extraction Heuristics

**Selection Criteria**:
1. Semantic HTML tags (section, article, main)
2. Elements with semantic classes (section, block, container)
3. Minimum height threshold (50px)
4. Visibility check
5. Semantic score (headings, text, images, interactivity)

**Filtering**:
- Remove nested blocks (keep top-level containers)
- Limit to max 100 blocks (performance)
- Sort by semantic score

### Block Fingerprinting

Each block gets a fingerprint with:
```typescript
{
  id: string;                  // Unique hash
  tagName: string;             // HTML tag
  domPath: string;             // Simplified DOM path
  orderIndex: number;          // Position in document
  normalizedTop: number;       // Relative position (0-1)
  normalizedHeight: number;    // Relative height (0-1)
  textContent: string;         // Body text (truncated)
  headingText: string;         // Heading text
  textLength: number;          // Character count
  childCount: number;          // Number of children
  imageCount: number;          // Images/videos
  linkCount: number;           // Links
  buttonCount: number;         // Buttons
  hasHeading: boolean;         // Has h1-h6
  semanticScore: number;       // Quality score
  boundingRect: {...};         // Position/size
}
```

### Matching Engine

**Weighted Scoring Model**:
```
totalScore =
  (orderSimilarity × 0.25) +     // Document position
  (headingSimilarity × 0.30) +   // Heading text overlap
  (textSimilarity × 0.20) +      // Body text overlap
  (structureSimilarity × 0.15) + // Element composition
  (positionSimilarity × 0.10)    // Normalized vertical position
```

**Similarity Calculations**:
- **Text**: Token-based Jaccard similarity
- **Order**: Relative position in block list
- **Structure**: Element counts (images, links, buttons)
- **Position**: Normalized vertical position (0-1)

**Matching Strategy**:
1. For each source block, find best target match
2. Use confidence threshold (0.2 minimum)
3. Return Map<sourceBlockId, BlockMatch>

### Active Block Detection

**Visibility Scoring**:
```
visibilityScore =
  (visibilityRatio × 0.7) +      // % of block visible
  (centerProximity × 0.3)        // Distance from viewport center
```

**Selection**:
- Calculate score for all blocks
- Choose highest scoring block
- Fall back to first block if none visible

**Relative Progress**:
```
For blocks taller than viewport:
  progress = scrolledIntoBlock / scrollableHeight

For blocks smaller than viewport:
  progress = scrolledPast / blockHeight
```

### Sync Application

**Strategy Selection**:
1. **Semantic** (confidence ≥ 0.4): Use matched block
2. **Order Fallback**: Use approximate document position
3. **Global Fallback**: Use overall page scroll percentage

**Target Scroll Calculation**:
```
For tall blocks (> viewport height):
  targetScroll = blockTop + (scrollableHeight × sourceProgress)

For short blocks (< viewport height):
  targetScroll = blockTop - (viewportHeight × 0.2)  // 20% padding
```

**Loop Prevention**:
- Set `isApplyingSync` flag before applying
- Suppress outgoing scroll events while applying
- Add cooldown period (200ms)
- Clear flag after scroll settles (100ms)

## Performance Optimizations

### Throttling
- Scroll events: 100ms throttle
- Prevents excessive calculations
- Balances responsiveness vs CPU usage

### Caching
- Page model built once per load
- Block fingerprints cached
- Matches reused until model rebuild

### Limits
- Max 100 blocks per page
- Text content truncated (500 chars)
- Heading text truncated (200 chars)

### Rebuild Triggers
- Manual refresh button
- Window resize (debounced 500ms)
- Tab navigation (requires manual refresh in MVP)

## Extension Lifecycle

### Installation
```
Extension installed
  ↓
Background service worker starts
  ↓
Content scripts injected into tabs
  ↓
Ready for use
```

### Tab Pairing
```
User assigns desktop tab
  ↓
Session stores desktop tab ID
  ↓
Content script builds page model
  ↓
User assigns mobile tab
  ↓
Session stores mobile tab ID
  ↓
Content script builds page model
  ↓
Both tabs ready for sync
```

### Sync Session
```
User enables sync
  ↓
Session marked as enabled
  ↓
Master tab sends scroll events
  ↓
Follower tab receives and applies
  ↓
Continues until disabled or tab closed
```

### Cleanup
```
User closes a paired tab
  ↓
Background detects tab removal
  ↓
Session reset
  ↓
Sync disabled
```

## Security & Permissions

### Required Permissions
- `tabs` - Access tab IDs and URLs
- `storage` - (Reserved for future session persistence)
- `activeTab` - Access current tab
- `scripting` - Inject content scripts

### Host Permissions
- `<all_urls>` - Work on any website (extension-only solution)

### Sandboxing
- Content scripts run in isolated world
- Cannot access page JavaScript directly
- Safe from page manipulation
- No eval or unsafe code execution

## Future Architecture Improvements

### Planned Enhancements
1. **Auto-detect navigation**: History API monitoring
2. **Multiple pairs**: Support N desktop/mobile pairs
3. **Bidirectional sync**: Two-way synchronization
4. **ML matching**: Train model on user corrections
5. **Session persistence**: Save/restore pairs across restarts
6. **Custom selectors**: Per-domain block detection rules
7. **Performance profiling**: Built-in diagnostics dashboard

### Scalability Considerations
- Current: Single pair, manual refresh
- Next: Multiple pairs, auto-refresh
- Future: Distributed sync across multiple machines
- Long-term: Cloud-based sync service

## Development Guidelines

### Adding New Features

1. **Shared types**: Add to `src/shared/models.ts`
2. **Messages**: Define in `src/shared/messages.ts`
3. **Constants**: Configure in `src/shared/constants.ts`
4. **Background logic**: Extend `src/background/`
5. **Content logic**: Extend `src/content/`
6. **UI**: Update `src/popup/`

### Testing Strategy

1. **Unit tests**: Test matching algorithms
2. **Integration tests**: Test message flow
3. **Manual tests**: Test on real websites
4. **Performance tests**: Measure block extraction time
5. **Compatibility tests**: Test on various site structures

### Debugging Tools

1. **Console logs**: All prefixed by component
2. **Debug overlay**: Visual block highlighting (in progress)
3. **Diagnostic info**: Available in popup
4. **Background console**: Service worker inspector
5. **Content console**: Page inspector

### Code Organization

- **Modular**: Each file has single responsibility
- **Typed**: Full TypeScript coverage
- **Documented**: Comments explain "why", not "what"
- **Testable**: Pure functions where possible
- **Extensible**: Easy to add new block selectors, matching weights, etc.
