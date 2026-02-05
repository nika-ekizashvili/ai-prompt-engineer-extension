# 🚀 Quick Setup & Testing Guide

## Prerequisites

Make sure you have:
- ✅ Node.js 18+ installed
- ✅ npm installed
- ✅ Chrome browser
- ✅ OpenRouter API key (get free at [openrouter.ai/keys](https://openrouter.ai/keys))

---

## Step 1: Install Dependencies

```bash
cd /Users/itswhatever/Desktop/Projects/prompt-formatter-extension
npm install
```

This will install:
- React & React DOM
- Vite & build tools
- TailwindCSS
- @crxjs/vite-plugin (Chrome extension support)
- TypeScript & types

---

## Step 2: Start Development Server

```bash
npm run dev
```

You should see:
```
VITE v5.x.x  ready in xxx ms
➜  Local:   http://localhost:5173/
➜  CRXJS:   Extension files written to dist/
```

**Keep this terminal running!** Vite will auto-rebuild when you make changes.

---

## Step 3: Load Extension in Chrome

1. Open Chrome browser
2. Navigate to `chrome://extensions/`
3. Enable **"Developer mode"** (toggle in top-right corner)
4. Click **"Load unpacked"** button
5. Select the `dist/` folder from your project
6. ✅ Extension should now appear with your pixel art icon!

---

## Step 4: Configure API Key

1. Click the extension icon in Chrome toolbar
2. Popup window opens with green header
3. Enter your OpenRouter API key in the password field
4. Select your preferred model (Llama 3 70B is free and selected by default)
5. Click **"Save Settings"**
6. You should see "✓ Settings Saved!" confirmation

---

## Step 5: Test on ChatGPT

1. Navigate to [chat.openai.com](https://chat.openai.com)
2. In the ChatGPT input field, type a rough prompt:
   ```
   write about dogs
   ```
3. Press **Ctrl+Shift+F** (or **Cmd+Shift+F** on Mac)
4. Watch the magic happen! ✨

**Expected Result:**
- Loading spinner appears
- AI processes your prompt
- Enhanced prompt appears in the input field
- Success toast notification shows
- Your prompt is now detailed and professional!

**Example transformation:**
```
Before: "write about dogs"

After: "Write a 500-word informative article about dog breeds 
suitable for first-time owners. Include sections on: (1) Temperament 
and personality traits, (2) Exercise and care requirements, 
(3) Training difficulty and tips. Use a friendly, accessible tone..."
```

---

## Troubleshooting

### Extension not loading?
```bash
# Stop dev server (Ctrl+C)
rm -rf dist/
npm run dev
# Reload extension in chrome://extensions/
```

### "API key not found" error?
- Open extension popup
- Re-enter your OpenRouter API key
- Click "Save Settings"
- Try again on ChatGPT

### Input field not detected?
- Make sure you're on chat.openai.com
- Press F12 to open DevTools
- Check Console for errors
- ChatGPT may have updated their DOM structure

### Keyboard shortcut not working?
- Check browser console (F12) for errors
- Try reloading the ChatGPT page
- Make sure extension is enabled in chrome://extensions/

---

## Development Workflow

### Making Changes

1. Edit code in your editor
2. Vite automatically rebuilds (watch terminal)
3. Go to `chrome://extensions/`
4. Click the refresh icon on your extension
5. Reload ChatGPT page if testing content script
6. Test your changes

### Checking Logs

**Content Script Logs** (ChatGPT page):
```
1. Open ChatGPT
2. Press F12 (DevTools)
3. Go to Console tab
4. Look for "✓ AI Prompt Engineer content script loaded"
```

**Background Worker Logs**:
```
1. Go to chrome://extensions/
2. Find your extension
3. Click "Inspect views: service worker"
4. Check Console tab
```

**Popup Logs**:
```
1. Right-click extension icon
2. Select "Inspect popup"
3. Check Console tab
```

---

## Build for Production

When ready to distribute:

```bash
npm run build
```

This creates an optimized production build in `dist/`.

To package for Chrome Web Store:
```bash
cd dist
zip -r ../ai-prompt-engineer-v1.0.0.zip *
```

---

## Project Structure

```
prompt-formatter-extension/
├── src/
│   ├── background/
│   │   └── background.ts       # API calls, OpenRouter integration
│   ├── content/
│   │   └── content.ts          # ChatGPT detection & UI
│   ├── popup/
│   │   ├── popup.html          # Popup entry point
│   │   ├── index.tsx           # React entry
│   │   └── Popup.tsx           # Settings UI (green theme)
│   ├── types/
│   │   └── messages.ts         # TypeScript interfaces
│   ├── manifest.json           # Extension configuration
│   └── index.css               # Global styles + Tailwind
├── public/
│   └── icons/                  # Your pixel art icons! 🎨
├── dist/                       # Build output (auto-generated)
├── package.json
├── vite.config.ts
├── tailwind.config.js          # Green theme config
└── tsconfig.json
```

---

## Available Commands

```bash
# Development mode (with hot reload)
npm run dev

# Type checking
npm run type-check

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## Features Checklist

✅ **Core Features:**
- AI-powered prompt enhancement
- OpenRouter integration (100+ models)
- Works on ChatGPT
- Keyboard shortcut (Ctrl+Shift+F)
- Modern green-themed UI
- Loading animations & toasts
- Error handling with helpful messages

✅ **Models Available:**
- Llama 3 70B (Free)
- GPT-4 Turbo
- GPT-3.5 Turbo
- Claude 3.5 Sonnet
- Claude 3 Haiku

---

## Next Steps

1. **Get OpenRouter API Key**: [openrouter.ai/keys](https://openrouter.ai/keys)
2. **Test thoroughly**: Try different types of prompts
3. **Customize**: Adjust colors, add features, etc.
4. **Share**: Get feedback from friends
5. **Publish**: Submit to Chrome Web Store (optional)

---

## Common Issues & Solutions

### Issue: Extension shows errors in console
**Solution**: Run `npm run type-check` to find TypeScript errors

### Issue: Styles not loading
**Solution**: Make sure Tailwind is building correctly, check `npm run dev` output

### Issue: API returns error
**Solution**: 
- Check your API key is valid
- Verify you have credits (or use free Llama model)
- Check network connection

### Issue: ChatGPT input not found
**Solution**: ChatGPT may have updated their DOM. Update selectors in `src/content/content.ts`

---

## Support & Resources

- **Documentation**: See the `docs/` folder for detailed guides
- **OpenRouter Docs**: [openrouter.ai/docs](https://openrouter.ai/docs)
- **Chrome Extension Docs**: [developer.chrome.com/docs/extensions](https://developer.chrome.com/docs/extensions)
- **Vite Docs**: [vitejs.dev](https://vitejs.dev)

---

**🎉 Congratulations! Your AI Prompt Engineer extension is ready to use!**

Press **Ctrl+Shift+F** on ChatGPT and watch your prompts transform! ✨
