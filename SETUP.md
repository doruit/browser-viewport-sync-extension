# Quick Setup Guide

## Prerequisites

- Node.js 16+ and npm
- Chrome or Edge browser

## Installation Steps

### 1. Install Dependencies

```bash
npm install
```

This will install:
- TypeScript
- esbuild (for bundling)
- Chrome types

### 2. Build the Extension

```bash
npm run build
```

This will:
- Compile TypeScript to JavaScript
- Bundle all modules
- Copy static assets to `dist/`
- Copy extension icons

Output will be in the `dist/` directory.

### 3. Load in Browser

#### Chrome
1. Open `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `dist` folder from this project
5. The extension should now appear in your toolbar

#### Edge
1. Open `edge://extensions/`
2. Enable "Developer mode" (toggle in left sidebar)
3. Click "Load unpacked"
4. Select the `dist` folder from this project
5. The extension should now appear in your toolbar

## Development Mode

For active development with auto-rebuild on file changes:

```bash
npm run watch
```

Then reload the extension in Chrome/Edge after changes:
- Go to `chrome://extensions/`
- Click the refresh icon on the extension card

## Usage

### Basic Demo Setup

1. **Open two browser windows or tabs**
   - Window 1: Desktop viewport (full width)
   - Window 2: Mobile viewport (narrow width, ~375px)

2. **Navigate both to the same URL**
   - Example: `https://example.com`

3. **Click the extension icon** to open the popup

4. **In Window 1 (desktop):**
   - Click "Set as Desktop"

5. **In Window 2 (mobile):**
   - Click "Set as Mobile"

6. **Back in either popup:**
   - Click "Desktop is Master" (desktop controls scrolling)
   - Click "Enable Sync"

7. **Scroll in the desktop window**
   - The mobile window should follow automatically!

### Tips

- **Resize for mobile**: Press `Cmd+Opt+I` (Mac) or `Ctrl+Shift+I` (Windows) and use device emulation
- **Refresh models**: Click "Refresh Page Models" after navigation or significant page changes
- **Check status**: The popup shows sync status and last sync event

## Testing the Extension

### Test on These Sites

Good candidates for testing (responsive sites with clear sections):

- https://stripe.com
- https://tailwindcss.com
- https://www.apple.com/iphone
- Any modern responsive marketing site
- Your own responsive web app!

### What to Look For

- ✓ Scroll in desktop → mobile follows to matching section
- ✓ Sections with headings match well
- ✓ No jittery scrolling or loops
- ✓ Works after resize
- ✗ May need manual refresh after SPA navigation

## Troubleshooting

### Extension doesn't appear
- Check that build completed successfully
- Verify `dist/` folder contains files
- Try reloading the extension page

### Sync not working
- Open browser console and check for errors
- Verify both tabs are assigned (desktop/mobile)
- Check sync is enabled (green badge)
- Try clicking "Refresh Page Models"

### Build errors
```bash
# Clean and rebuild
npm run clean
npm install
npm run build
```

### Poor sync quality
- Check if page has semantic HTML (`<section>`, `<article>`)
- Verify headings are present in content blocks
- Try sites with clearer content structure

## Project Structure

```
present-on-multiple-displays/
├── src/              # Source TypeScript files
├── public/           # Static assets
├── dist/             # Built extension (generated)
├── node_modules/     # Dependencies (generated)
├── package.json      # Project config
├── tsconfig.json     # TypeScript config
├── build.js          # Build script
└── README.md         # Full documentation
```

## Next Steps

- Read [README.md](README.md) for detailed architecture and algorithm explanations
- Customize matching weights in `src/shared/constants.ts`
- Add your own block selectors for specific sites
- Explore debug mode (coming soon)

## Getting Help

- Check console logs in background worker, content script, and popup
- All logs are prefixed: `[Background]`, `[Content]`, `[SyncEngine]`, etc.
- Review the matching algorithm in `src/content/blockMatcher.ts`

Enjoy your synchronized demos! 🎉
