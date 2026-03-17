# Troubleshooting Guide

## Extension Werkt Niet - Geen Logs Zichtbaar

### Symptomen
- Geen `[Content]` logs in page console
- Geen `[Background]` logs in service worker console
- Geen `[SyncEngine]` logs
- Navigation sync werkt niet
- Scroll sync werkt niet

### Oorzaken
1. Extension niet correct geladen
2. Content script inject mislukt
3. Service worker crashed
4. Manifest permission errors

### Oplossing

#### Stap 1: Complete Reset
```bash
1. chrome://extensions/
2. Zoek "Responsive Demo Sync"
3. Klik "Remove" (verwijder extension)
4. Sluit alle browser tabs
5. Herstart browser
```

#### Stap 2: Fresh Install
```bash
cd /Users/doruit/present-on-multiple-displays
npm run build
```

```bash
1. chrome://extensions/
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select: /Users/doruit/present-on-multiple-displays/dist
5. Extension should load with green checkmark
```

#### Stap 3: Verify Installation
```bash
1. chrome://extensions/
2. Find "Responsive Demo Sync"
3. Should show:
   - Version: 1.0.0
   - Enabled: ON
   - Errors: 0
```

#### Stap 4: Check Service Worker
```bash
1. chrome://extensions/
2. Find "Responsive Demo Sync"
3. Click "Inspect views: service worker"
4. Console should show:
   [Background] Service worker initialized
   [Background] Session store initialized
```

If you DON'T see these logs → Service worker is broken!

#### Stap 5: Test Content Script
```bash
1. Open a new tab: https://nu.nl
2. Press F12 (open console)
3. Should see:
   [Content] Initializing Responsive Demo Sync content script
   [SyncEngine] Initialized
```

If you DON'T see these logs → Content script not injecting!

## Common Errors

### Error: "Service worker registration failed"
**Fix:**
```bash
1. Close all browser tabs
2. chrome://extensions/ → Remove extension
3. Restart browser
4. Reinstall extension
```

### Error: "Cannot access chrome.runtime"
**Fix:**
- Extension not properly loaded
- Reload extension
- Check manifest.json for errors

### Error: Content script not injecting
**Fix:**
```json
// Check manifest.json has:
"content_scripts": [
  {
    "matches": ["<all_urls>"],
    "js": ["content.js"],
    "run_at": "document_idle"
  }
]
```

### Error: Permission denied
**Fix:**
```json
// Check manifest.json has:
"permissions": [
  "tabs",
  "storage",
  "activeTab",
  "scripting"
],
"host_permissions": [
  "<all_urls>"
]
```

## Verification Checklist

After installation, verify:

- [ ] Extension shows in chrome://extensions/
- [ ] Extension is enabled (toggle ON)
- [ ] No errors shown in extension card
- [ ] Service worker console shows initialization logs
- [ ] New tab console shows content script logs
- [ ] Popup opens when clicking icon
- [ ] Popup shows "Current Tab: [number]"

## Still Not Working?

### Check Build Output
```bash
cd /Users/doruit/present-on-multiple-displays
ls -la dist/

# Should show:
# - manifest.json
# - background.js
# - content.js
# - popup.js
# - popup.html
# - popup.css
# - icons/
```

### Rebuild from Scratch
```bash
npm run clean
rm -rf node_modules
rm -rf dist
npm install
npm run build
```

### Check Browser Console for Errors
```bash
1. chrome://extensions/
2. Enable "Developer mode"
3. Reload extension
4. Check for red error messages
5. Click "Errors" if shown
```

## Debug Mode

Enable verbose logging:

1. Open service worker console
2. Paste this:
```javascript
console.log('Extension status check');
chrome.runtime.getManifest();
```

Should return manifest object. If error → extension broken.

## Contact / Report Bug

If still not working after all steps:
1. Check browser version (needs Chrome 88+)
2. Try in incognito mode
3. Try different website
4. Check for conflicting extensions
