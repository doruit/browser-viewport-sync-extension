# Responsive Demo Sync

A Chrome/Edge Manifest V3 extension that enables smart cross-viewport synchronization for responsive web demos. Show your app on two displays simultaneously—desktop and mobile viewports—with intelligent scroll and navigation synchronization based on semantic content alignment.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-brightgreen.svg)](https://chrome.google.com/webstore)

## Overview

When giving live demos of responsive web applications, you often want to show both desktop and mobile views side-by-side on different screens. This extension solves the challenge of keeping both views synchronized as you scroll and navigate, using **smart semantic matching** instead of naive pixel-based mirroring.

### Key Features

- ✅ **Semantic Content Alignment**: Matches content blocks between viewports based on structure, text, and position
- ✅ **Automatic Navigation Sync**: When you click a link in the master tab, the follower navigates too
- ✅ **Automatic Scroll Sync**: Scroll in the master tab, follower scrolls to equivalent content
- ✅ **Intelligent Fallback Strategy**: Gracefully degrades from semantic → document order → global progress
- ✅ **Zero App Modifications**: Works with any web app without code changes
- ✅ **Responsive-Aware**: Handles different layouts, heights, and content reflow
- ✅ **Loop Prevention**: Stable synchronization without feedback loops or jitter
- ✅ **Master/Follower Mode**: Control which viewport drives the sync
- ✅ **Service Worker Resilient**: Handles Chrome service worker restarts automatically
- ✅ **Session Persistence**: Settings persist across page refreshes

## Demo

<video src="media/browser-viewport-sync-plugin.mp4" width="100%" controls>
  Your browser does not support the video tag.
</video>

![Responsive Demo Sync in action](media/browser-viewport-sync-demo.gif)

Perfect for:
- 🎪 Live product demos
- 📱 Responsive design presentations
- 🎓 Teaching responsive web development
- 🎬 Recording demo videos
- 🖥️ Multi-display presentations

## How It Works

### Architecture

The extension consists of three main components:

1. **Background Service Worker**
   - Maintains sync session state (tab pairs, master/follower)
   - Routes messages between tabs
   - Handles tab lifecycle events

2. **Content Script**
   - Analyzes DOM to extract semantic content blocks
   - Creates fingerprints for each block (text, structure, position)
   - Detects currently active block in viewport
   - Matches blocks between desktop and mobile views
   - Applies scroll synchronization

3. **Popup UI**
   - Simple interface for pairing tabs
   - Master/follower selection
   - Enable/disable sync
   - Status monitoring

### Smart Sync Algorithm

The extension uses a multi-stage matching process:

#### 1. Block Extraction
Scans the DOM for semantic content blocks using heuristics:
- HTML5 semantic tags (`section`, `article`, `main`)
- Elements with semantic class names (`section`, `block`, `container`)
- Visual structure (headings, images, buttons)
- Minimum size and text content thresholds

#### 2. Block Fingerprinting
Creates a rich fingerprint for each block:
- Text content and headings
- DOM structure and path
- Element counts (images, links, buttons)
- Normalized position in document
- Semantic score

#### 3. Block Matching
Maps blocks between desktop and mobile using weighted scoring:
- **Heading Similarity** (30%): Text overlap in headings
- **Order Similarity** (25%): Relative position in document
- **Text Similarity** (20%): Body content overlap
- **Structure Similarity** (15%): Element composition
- **Position Similarity** (10%): Normalized vertical position

#### 4. Active Block Detection
Determines which block is "in focus" based on:
- Viewport visibility ratio
- Distance from viewport center
- Weighted score combining both factors

#### 5. Sync Application
When the master scrolls:
1. Detect active block and calculate relative progress (0-1)
2. Find matching block in follower tab
3. Calculate equivalent scroll position
4. Apply scroll with loop suppression

### Fallback Strategy

The system gracefully handles uncertain matches:

1. **Semantic Match** (confidence ≥ 0.4): Use matched block
2. **Order Fallback**: Use document position as proxy
3. **Global Progress**: Use overall page scroll percentage

## Installation

### Quick Install (Recommended)

1. **Download the latest release**
   - Go to [Releases](https://github.com/doruit/browser-viewport-sync-extension/releases)
   - Download the latest ZIP file
   - Extract the ZIP file

2. **Load in Chrome/Edge**
   - Open `chrome://extensions/` (or `edge://extensions/`)
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the extracted `dist` folder
   - Extension icon should appear in your toolbar

### Development Setup

If you want to modify the extension or contribute:

1. **Clone the repository**
   ```bash
   git clone https://github.com/doruit/browser-viewport-sync-extension.git
   cd browser-viewport-sync-extension
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the extension**
   ```bash
   npm run build
   ```

   For development with auto-rebuild:
   ```bash
   npm run watch
   ```

4. **Load in Chrome/Edge**
   - Open `chrome://extensions/` (or `edge://extensions/`)
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist` folder
   - Reload extension when you make changes

## Usage

### Quick Start

1. **Open two tabs** with the same website
   - Tab 1: Desktop view (normal browser width)
   - Tab 2: Mobile view (use DevTools device mode)

2. **Set up mobile viewport** (on Tab 2):
   - Press `F12` to open DevTools
   - Click "Toggle device toolbar" icon or press `Cmd+Shift+M` / `Ctrl+Shift+M`
   - Select a device from the dropdown (e.g., iPhone 14 Pro, Pixel 7)
   - You can hide DevTools afterwards

3. **Configure the extension** (click the extension icon):
   - On Tab 1: Click "Set Desktop"
   - On Tab 2: Click "Set Mobile"
   - Click "Enable Sync"

4. **Start your demo**:
   - Scroll in the desktop tab → mobile tab follows automatically
   - Click a link in desktop → mobile navigates to the same URL
   - Everything stays in sync automatically!

### Detailed Setup

1. **Prepare two browser tabs**
   - Tab 1: Desktop viewport (normal width)
   - Tab 2: Mobile viewport (DevTools device mode recommended)

2. **Open the same URL in both tabs**

3. **Open the extension popup** (click the extension icon)

4. **Assign tabs**
   - In desktop tab: Click "Set Desktop"
   - In mobile tab: Click "Set Mobile"

5. **Choose master** (optional)
   - Default: Desktop is master
   - Or click "Mobile is Master" to scroll from mobile

6. **Enable sync**
   - Click "Enable Sync"
   - Both tabs will automatically align to the same URL and scroll position

7. **Give your demo**
   - Scroll in the master tab
   - Navigate by clicking links
   - The follower tab automatically follows

### Controls

- **Set as Desktop/Mobile**: Assign current tab to a viewport role
- **Desktop/Mobile is Master**: Choose which viewport drives the sync
- **Enable/Disable Sync**: Turn synchronization on/off
- **Refresh Page Models**: Rebuild block analysis (use after navigation or major DOM changes)

### Tips for Best Results

- **Use semantic HTML**: The algorithm works best with `<section>`, `<article>`, etc.
- **Include headings**: Headings are strong signals for block matching
- **Distinct content blocks**: Clear visual separation helps block detection
- **Refresh on route changes**: Click "Refresh Page Models" after navigation
- **Test before demo**: Try scrolling through the content once to verify sync quality

## Edge Cases Handled

The extension is designed to handle:

- ✅ Different viewport heights
- ✅ Responsive reordering (grid → stacked list)
- ✅ Blocks that appear/disappear on mobile
- ✅ Lazy-loaded images changing height
- ✅ Sticky headers
- ✅ Single-page app route changes (manual refresh needed)
- ✅ Different scroll containers
- ✅ Rapid scrolling
- ✅ Low-confidence matching scenarios

## Known Limitations

### Current MVP Limitations

1. **Single pair only**: Only one desktop/mobile pair can be synced at a time
2. **Manual model refresh**: Doesn't auto-detect route changes (click "Refresh Models" after navigation)
3. **Heuristic-based**: Matching quality depends on page structure
4. **Same URL required**: Both tabs must be on the same application
5. **No bidirectional sync**: Only master → follower (not both directions)

### Future Enhancements

- [ ] Auto-detect route changes via History API
- [ ] Multiple sync pairs
- [ ] Bidirectional sync option
- [ ] Machine learning for block matching
- [ ] Custom block selectors per domain
- [ ] Sync state persistence across sessions
- [ ] Performance profiling dashboard
- [ ] Confidence threshold tuning UI

## Development

### Project Structure

```
present-on-multiple-displays/
├── src/                 # Extension source code
│   ├── background/      # Service worker
│   ├── content/         # Content scripts
│   ├── popup/           # Extension popup
│   └── shared/          # Shared utilities
├── public/              # Static assets (manifest, icons)
├── docs/                # Detailed documentation
├── scripts/             # Build and utility scripts
├── examples/            # Example pages for testing
├── dist/                # Build output (generated)
├── package.json
├── tsconfig.json
└── README.md
```

### Building

```bash
# Clean build
npm run clean
npm run build

# Development mode with watch
npm run watch
```

### Debugging

The extension includes comprehensive logging:

- **Background**: Check the service worker console
- **Content Script**: Check the page console
- **Popup**: Right-click popup → Inspect

All logs are prefixed with their source (`[Background]`, `[Content]`, `[SyncEngine]`, etc.)

### Tuning Matching Parameters

Edit `src/shared/constants.ts` to adjust:

- Block detection thresholds
- Matching weights
- Confidence thresholds
- Scroll throttling
- Loop suppression timings

## Technical Details

### Message Flow

```
Popup → Background: SET_DESKTOP_TAB, ENABLE_SYNC, etc.
Background → Content: BUILD_PAGE_MODEL, APPLY_SYNC
Content → Background: SCROLL_EVENT, PAGE_MODEL_BUILT
Background → Content (follower): APPLY_SYNC
```

### Scroll Sync Sequence

1. User scrolls in master tab
2. Content script detects scroll event (throttled)
3. Calculates active block and relative progress
4. Sends `SCROLL_EVENT` to background
5. Background verifies master/follower roles
6. Background forwards `APPLY_SYNC` to follower tab
7. Follower content script:
   - Matches source block to local block
   - Calculates target scroll position
   - Applies scroll with loop suppression

### Performance Considerations

- Block extraction runs once per page load (and on manual refresh)
- Scroll events are throttled to 100ms
- Block matching uses cached fingerprints
- Maximum 100 blocks per page
- Loop suppression prevents feedback cycles

## Troubleshooting

### Sync not working

1. Check both tabs are assigned (desktop and mobile)
2. Verify sync is enabled (green status badge)
3. Check master is set correctly
4. Try clicking "Refresh Page Models"

### Poor sync quality

1. Inspect page structure (does it have semantic blocks?)
2. Check for headings in content blocks
3. Try adjusting confidence thresholds in constants.ts
4. Consider adding more specific block selectors

### Jittery scrolling

1. Check scroll throttle value (increase if needed)
2. Verify loop suppression is working
3. Check for nested scroll containers

## Contributing

This is an MVP implementation. Areas for improvement:

- Better block detection heuristics
- Machine learning for matching
- Performance optimizations
- UI enhancements
- Test coverage

## License

MIT

## Credits

Built with TypeScript, esbuild, and Chrome Extension Manifest V3.
