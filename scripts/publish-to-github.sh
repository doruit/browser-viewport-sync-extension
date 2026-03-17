#!/bin/bash

# Browser Viewport Sync Extension - GitHub Publishing Script
# This script uses gh CLI to create the repository and publish the first release

set -e  # Exit on error

REPO_NAME="browser-viewport-sync-extension"
REPO_DESCRIPTION="Smart cross-viewport demo synchronization for Chrome/Edge - Show desktop and mobile views side-by-side with intelligent scroll sync"
VERSION="v1.0.0"

echo "🚀 Publishing $REPO_NAME to GitHub..."
echo ""

# Step 1: Create repository on GitHub
echo "📦 Creating GitHub repository..."
gh repo create "$REPO_NAME" \
  --public \
  --description "$REPO_DESCRIPTION" \
  --clone=false

echo "✅ Repository created: https://github.com/doruit/$REPO_NAME"
echo ""

# Step 2: Initialize local git repository
echo "🔧 Initializing local git repository..."
git init
git branch -M main

echo "✅ Git initialized"
echo ""

# Step 3: Add all files and commit
echo "📝 Adding files and creating initial commit..."
git add .
git commit -m "feat: initial release v1.0.0

- Semantic content block detection and matching
- Automatic scroll synchronization between viewports
- Automatic navigation synchronization
- Master/follower mode selection
- Session state persistence
- Service worker restart resilience
- Tab validation
- Comprehensive documentation

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

echo "✅ Initial commit created"
echo ""

# Step 4: Add remote and push
echo "⬆️  Pushing to GitHub..."
git remote add origin "https://github.com/doruit/$REPO_NAME.git"
git push -u origin main

echo "✅ Code pushed to main branch"
echo ""

# Step 5: Create and push tag
echo "🏷️  Creating version tag..."
git tag -a "$VERSION" -m "Release $VERSION - Initial public release"
git push origin "$VERSION"

echo "✅ Tag $VERSION created and pushed"
echo ""

# Step 6: Build extension (if not already built)
if [ ! -d "dist" ]; then
  echo "🔨 Building extension..."
  npm run build
fi

# Step 7: Create zip file (if not already exists)
ZIP_FILE="browser-viewport-sync-extension-${VERSION}.zip"
if [ ! -f "$ZIP_FILE" ]; then
  echo "📦 Creating release package..."
  cd dist
  zip -r "../$ZIP_FILE" .
  cd ..
fi

echo "✅ Release package created: $ZIP_FILE"
echo ""

# Step 8: Create GitHub release
echo "🎉 Creating GitHub release..."
gh release create "$VERSION" \
  --title "$VERSION - Initial Release" \
  --notes "# Browser Viewport Sync Extension - v1.0.0

## 🎉 Initial Release

Smart cross-viewport synchronization for responsive web demos. Show your app on two displays simultaneously with intelligent scroll and navigation sync.

### ✨ Features

- **Semantic Content Alignment**: Matches content blocks between viewports based on structure, text, and position
- **Automatic Navigation Sync**: When you click a link in the master tab, the follower navigates too
- **Automatic Scroll Sync**: Scroll in the master tab, follower scrolls to equivalent content
- **Intelligent Fallback Strategy**: Gracefully degrades from semantic → document order → global progress
- **Zero App Modifications**: Works with any web app without code changes
- **Responsive-Aware**: Handles different layouts, heights, and content reflow
- **Loop Prevention**: Stable synchronization without feedback loops or jitter
- **Master/Follower Mode**: Control which viewport drives the sync
- **Service Worker Resilient**: Handles Chrome service worker restarts automatically
- **Session Persistence**: Settings persist across page refreshes

### 📦 Installation

1. Download \`browser-viewport-sync-extension-v1.0.0.zip\`
2. Extract the ZIP file
3. Open \`chrome://extensions/\`
4. Enable \"Developer mode\"
5. Click \"Load unpacked\"
6. Select the extracted \`dist\` folder

### 🎯 Quick Start

1. Open two tabs with the same website
2. On Tab 1: Press F12 → Toggle device toolbar → Select mobile device
3. Click extension icon → Set Desktop/Mobile → Enable Sync
4. Scroll in desktop → mobile follows automatically!

### 📚 Documentation

- [README.md](https://github.com/doruit/browser-viewport-sync-extension#readme) - Full documentation
- [ARCHITECTURE.md](https://github.com/doruit/browser-viewport-sync-extension/blob/main/ARCHITECTURE.md) - Technical details
- [QUICK_START.md](https://github.com/doruit/browser-viewport-sync-extension/blob/main/QUICK_START.md) - Getting started guide
- [TROUBLESHOOTING.md](https://github.com/doruit/browser-viewport-sync-extension/blob/main/TROUBLESHOOTING.md) - Common issues

### 🐛 Known Issues

See [issues](https://github.com/doruit/browser-viewport-sync-extension/issues) for current known issues.

### 🙏 Credits

Built with TypeScript, esbuild, and Chrome Extension Manifest V3.

---

Perfect for live demos, presentations, and teaching responsive web development!" \
  "$ZIP_FILE"

echo "✅ GitHub release created!"
echo ""

# Step 9: Set repository topics
echo "🏷️  Setting repository topics..."
gh repo edit --add-topic chrome-extension \
  --add-topic edge-extension \
  --add-topic typescript \
  --add-topic responsive-design \
  --add-topic demo-tool \
  --add-topic presentation \
  --add-topic semantic-matching \
  --add-topic scroll-sync \
  --add-topic multi-display

echo "✅ Topics added"
echo ""

# Done!
echo "🎉 All done!"
echo ""
echo "📍 Repository: https://github.com/doruit/$REPO_NAME"
echo "📦 Release: https://github.com/doruit/$REPO_NAME/releases/tag/$VERSION"
echo ""
echo "Next steps:"
echo "  1. Add screenshots or demo GIF to README.md"
echo "  2. Consider submitting to Chrome Web Store"
echo "  3. Share with the world! 🌍"
