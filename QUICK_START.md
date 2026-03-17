# Quick Start Guide

Get your Responsive Demo Sync extension up and running in 5 minutes!

## 🚀 Installation

```bash
# 1. Install dependencies
npm install

# 2. Build the extension
npm run build

# 3. Icons generated automatically
# (SVG icons created during initial setup)
```

## 📦 Load in Browser

### Chrome
1. Navigate to `chrome://extensions/`
2. Toggle **"Developer mode"** (top right)
3. Click **"Load unpacked"**
4. Select the `dist/` folder
5. Extension appears in toolbar ✓

### Edge
1. Navigate to `edge://extensions/`
2. Toggle **"Developer mode"** (left sidebar)
3. Click **"Load unpacked"**
4. Select the `dist/` folder
5. Extension appears in toolbar ✓

## 🎯 First Demo

### Setup (30 seconds)

1. **Open test page**
   ```bash
   # Serve locally or open directly
   open test-page.html
   ```

2. **Create two windows**
   - Window 1: Full width (~1200px)
   - Window 2: Mobile width (~375px)

   💡 Use device emulation: `Cmd+Opt+I` (Mac) or `Ctrl+Shift+I` (Windows)

3. **Load same URL in both windows**

### Configure (20 seconds)

4. **In desktop window:**
   - Click extension icon
   - Click **"Set as Desktop"**

5. **In mobile window:**
   - Click extension icon
   - Click **"Set as Mobile"**

6. **In either window:**
   - Click **"Desktop is Master"**
   - Click **"Enable Sync"**

### Test! (10 seconds)

7. **Scroll in desktop window**
   - Mobile window follows automatically
   - Sections stay aligned
   - No jitter or loops

8. **Success! 🎉**

## 🔍 Verify It's Working

### Good Signs ✓
- Mobile window scrolls when desktop scrolls
- Matching sections stay aligned
- Smooth, stable movement
- Status shows "Enabled" (green)

### If Not Working ✗
- Check both tabs assigned (Desktop: #, Mobile: #)
- Verify sync enabled (green badge)
- Try "Refresh Page Models"
- Check browser console for errors

## 🌐 Try Real Websites

Works great on:
- ✓ https://stripe.com
- ✓ https://tailwindcss.com
- ✓ https://www.apple.com/iphone
- ✓ Modern responsive marketing sites
- ✓ Your own web apps!

## 📝 Common Tasks

### Switch Master
```
Click "Mobile is Master" to control scrolling from mobile view
```

### After Navigation
```
Click "Refresh Page Models" to rebuild block detection
```

### Disable Sync
```
Click "Disable Sync" to pause synchronization
```

### Start Over
```
Close one of the tabs to reset session
```

## 🛠 Development

### Watch Mode
```bash
npm run watch
# Auto-rebuilds on file changes
# Reload extension in browser to see changes
```

### Clean Build
```bash
npm run clean
npm run build
```

### Check Output
```bash
ls -la dist/
# Should see: background.js, content.js, popup.js, manifest.json, etc.
```

## 💡 Tips

1. **Best Results**: Use sites with clear section structure and headings
2. **Resize Windows**: Click "Refresh Models" after major window size changes
3. **SPA Navigation**: Click "Refresh Models" after route changes
4. **Fast Scrolling**: Extension handles it! No need to scroll slowly
5. **Multiple Tabs**: Only one pair supported in MVP (desktop + mobile)

## 🐛 Debug

### Check Console Logs

**Background Worker:**
```
chrome://extensions/ → "Inspect views: service worker"
Look for [Background] logs
```

**Content Script:**
```
Open DevTools on the page (F12)
Look for [Content] and [SyncEngine] logs
```

**Popup:**
```
Right-click extension icon → Inspect
Look for [Popup] logs
```

### Common Issues

**"Sync not working"**
- Verify both tabs on same origin
- Check network/firewall not blocking
- Ensure tabs are actually different sizes

**"Poor sync quality"**
- Page might lack semantic structure
- Try adjusting constants in `src/shared/constants.ts`
- Check matching weights in `MATCHING_WEIGHTS`

**"Extension not appearing"**
- Check `dist/manifest.json` exists
- Verify build completed successfully
- Try reloading extensions page

## 📚 Learn More

- **Full Documentation**: [README.md](README.md)
- **Architecture**: [ARCHITECTURE.md](ARCHITECTURE.md)
- **Setup Guide**: [SETUP.md](SETUP.md)

## 🎓 Understanding the Algorithm

**In 30 seconds:**
1. Extension scans page for semantic blocks (sections, articles, etc.)
2. Creates fingerprints (headings, text, structure, position)
3. Matches blocks between desktop and mobile
4. When you scroll, detects active block
5. Finds matching block in other viewport
6. Scrolls to equivalent position

**Read more:** [ARCHITECTURE.md](ARCHITECTURE.md#smart-matching-algorithm)

## ✅ Checklist

Before your first demo:

- [ ] Extension built successfully
- [ ] Extension loaded in browser
- [ ] Test page opens correctly
- [ ] Two windows created (desktop + mobile)
- [ ] Both windows assigned correctly
- [ ] Master selected (desktop)
- [ ] Sync enabled (green badge)
- [ ] Scrolling in master → follower follows
- [ ] No console errors

## 🎬 Demo Script

For live presentations:

1. **Intro** (15 sec)
   "I'm going to show you our responsive design on two screens simultaneously"

2. **Setup** (30 sec)
   - Open two windows (already prepared)
   - Click extension, assign tabs
   - Enable sync

3. **Demo** (2-5 min)
   - Scroll through features
   - Show how layouts differ
   - Highlight sections staying aligned
   - "Notice how the mobile view follows desktop view automatically"

4. **Explain** (30 sec)
   "The extension uses smart semantic matching to keep content aligned,
   even though the layouts are completely different"

## 🚨 Troubleshooting Matrix

| Problem | Solution |
|---------|----------|
| Sync not starting | Check both tabs assigned, click Enable Sync |
| Jumpy scrolling | Click Refresh Models, check for console errors |
| Wrong section showing | Low confidence match, try global fallback |
| Extension not loading | Check dist/ folder exists, rebuild if needed |
| Can't assign tab | Check tab URL is valid (not chrome:// page) |
| Status shows error | Read error message, likely missing tab |

## 🎯 Success Metrics

Your setup is working well if:

- ✓ Sync latency < 200ms
- ✓ Section alignment accuracy > 90%
- ✓ No visible jitter or loops
- ✓ Stable during fast scrolling
- ✓ Works after window resize

## 🔗 Quick Links

- Build: `npm run build`
- Watch: `npm run watch`
- Clean: `npm run clean`
- Icons: `node generate-icons.js`
- Test: `open test-page.html`

---

**Ready to go?** Open your browser, load the extension, and start syncing! 🚀
