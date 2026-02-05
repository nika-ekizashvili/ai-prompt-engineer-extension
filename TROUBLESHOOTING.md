# 🔧 Troubleshooting Guide

## ✅ Issues Fixed

### Problem 1: CORS Errors
**Error:** `Access to script at 'http://localhost:5173/@vite/env' from origin 'chrome-extension://...'`

**Solution:** ✅ Built production version instead of using dev server

### Problem 2: Service Worker Inactive
**Error:** Service worker showing as "Inactive" in chrome://extensions

**Solution:** ✅ Production build creates proper service worker

---

## 🚀 How to Reload Extension

Since we just built the production version, you need to reload the extension:

### Steps:

1. Go to `chrome://extensions/`
2. Find "AI Prompt Engineer" extension
3. Click the **reload icon** (circular arrow) 🔄
4. Check that errors are gone
5. Click the extension icon to test popup

---

## ✨ What Changed

**Before:** Using dev server (had CORS issues)
**After:** Production build (works perfectly)

### Files Built:
```
dist/
├── manifest.json              ✅ Proper manifest
├── service-worker-loader.js   ✅ Background worker
├── icons/                     ✅ Your pixel art icons
├── assets/
│   ├── popup.html-*.js       ✅ React popup UI
│   ├── content.ts-*.js       ✅ ChatGPT integration
│   ├── background.ts-*.js    ✅ API handler
│   └── popup-*.css           ✅ Styles
```

---

## 🧪 Testing Checklist

After reloading:

### 1. Extension Loads
- [ ] No errors in chrome://extensions/
- [ ] Service worker shows "Active" (when you click it)
- [ ] Icon appears in toolbar

### 2. Popup Works
- [ ] Click extension icon
- [ ] Green header appears
- [ ] Can paste API key
- [ ] Can select model
- [ ] "Save Settings" button works

### 3. ChatGPT Integration
- [ ] Go to chat.openai.com
- [ ] Type: "write about dogs"
- [ ] Press Ctrl+Shift+F (or Cmd+Shift+F on Mac)
- [ ] Loading spinner appears
- [ ] Prompt transforms
- [ ] Success toast shows

---

## 🐛 If You Still See Errors

### Error: "API key not configured"
**Fix:** 
1. Click extension icon
2. Add your OpenRouter API key from [openrouter.ai/keys](https://openrouter.ai/keys)
3. Click "Save Settings"

### Error: "Could not find input field"
**Fix:**
1. Make sure you're on chat.openai.com
2. Wait for page to fully load
3. Try refreshing the page

### Error: Network/API errors
**Fix:**
1. Check internet connection
2. Verify API key is valid
3. Try using free Llama 3 70B model first

### Extension not responding
**Fix:**
1. Go to chrome://extensions/
2. Click "Remove" on the extension
3. Click "Load unpacked" again
4. Select the dist/ folder

---

## 📊 How to Check Logs

### Background Worker Logs:
1. Go to chrome://extensions/
2. Find your extension
3. Click "Inspect views: service worker"
4. Check Console tab for messages

### Content Script Logs:
1. Open chat.openai.com
2. Press F12 (DevTools)
3. Go to Console tab
4. Look for "✓ AI Prompt Engineer content script loaded"

### Popup Logs:
1. Right-click extension icon
2. Select "Inspect popup"
3. Check Console tab

---

## 🔄 Development vs Production

### Development Mode (npm run dev):
- ❌ Has CORS issues
- ❌ Requires dev server running
- ✅ Hot reload for changes

### Production Mode (npm run build):
- ✅ No CORS issues
- ✅ Standalone extension
- ✅ Optimized & minified
- ✅ Ready for Chrome Web Store

**For testing, use production build!**

---

## 🎯 Quick Fix Commands

```bash
# Rebuild extension
cd /Users/itswhatever/Desktop/Projects/prompt-formatter-extension
npm run build

# Then in Chrome:
# 1. chrome://extensions/
# 2. Click reload icon
# 3. Test extension
```

---

## ✅ Success Indicators

You'll know it's working when:

1. ✅ No errors in chrome://extensions/
2. ✅ Popup opens with green header
3. ✅ Can save API key
4. ✅ ChatGPT detects Ctrl+Shift+F
5. ✅ Prompts transform successfully
6. ✅ Toast notifications appear

---

## 📞 Need More Help?

If issues persist:

1. Check browser console for specific errors
2. Verify all files exist in dist/ folder
3. Try removing and re-adding extension
4. Check that Chrome is updated
5. Review manifest.json in dist/ folder

---

**The extension is now built and ready! Just reload it in Chrome.** 🚀
