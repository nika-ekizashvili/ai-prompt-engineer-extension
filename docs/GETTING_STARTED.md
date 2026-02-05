# Getting Started - Quick Reference

> **Goal:** Get your AI Prompt Engineer extension up and running in 30 minutes.

## Prerequisites Checklist

Before you start, make sure you have:

- [ ] Node.js 18+ installed (`node --version`)
- [ ] npm installed (`npm --version`)
- [ ] Chrome browser (version 88+)
- [ ] OpenRouter account ([sign up here](https://openrouter.ai))
- [ ] Code editor (VS Code recommended)

---

## Step 1: Project Setup (5 minutes)

### Create Project

```bash
cd ~/desktop/projects/prompt-formatter-extension

# Initialize Vite project
npm create vite@latest . -- --template react-ts

# Install dependencies
npm install

# Install Chrome extension tools
npm install -D @crxjs/vite-plugin

# Install Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Install types
npm install -D @types/chrome @types/node
```

### Verify Installation

```bash
npm run dev
# Should show: VITE v5.x.x ready in xxx ms
```

Press Ctrl+C to stop the dev server.

---

## Step 2: Project Structure (5 minutes)

### Create Directories

```bash
mkdir -p src/background
mkdir -p src/content
mkdir -p src/popup
mkdir -p src/types
mkdir -p public/icons
mkdir -p docs
```

### File Checklist

Copy the following files from the documentation:

**From COMPONENTS.md:**
- [ ] `src/background/background.ts`
- [ ] `src/content/content.ts`
- [ ] `src/popup/Popup.tsx`
- [ ] `src/popup/popup.html`
- [ ] `src/popup/index.tsx`
- [ ] `src/types/messages.ts`

**From MANIFEST.md:**
- [ ] `src/manifest.json`

**From SETUP.md:**
- [ ] `vite.config.ts`
- [ ] `tailwind.config.js`
- [ ] `tsconfig.json`

---

## Step 3: Configuration Files (5 minutes)

### Update `vite.config.ts`

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { crx } from '@crxjs/vite-plugin';
import manifest from './src/manifest.json';
import path from 'path';

export default defineConfig({
  plugins: [react(), crx({ manifest })],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

### Update `tailwind.config.js`

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

### Update `src/index.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

---

## Step 4: Create Placeholder Icons (2 minutes)

### Option 1: Download Icons

Visit [favicon-generator.org](https://www.favicon-generator.org/) and generate:
- icon16.png (16x16)
- icon48.png (48x48)  
- icon128.png (128x128)

Save to `public/icons/`

### Option 2: Use Placeholders

Create simple colored squares for now:

```bash
# On Mac with ImageMagick installed:
convert -size 128x128 xc:#4F46E5 -gravity center \
  -pointsize 60 -fill white -annotate +0+0 "AI" \
  public/icons/icon128.png

convert public/icons/icon128.png -resize 48x48 public/icons/icon48.png
convert public/icons/icon128.png -resize 16x16 public/icons/icon16.png
```

---

## Step 5: Build Extension (2 minutes)

```bash
# Start development build
npm run dev
```

You should see:
```
VITE v5.0.11  ready in 500 ms
➜  Local:   http://localhost:5173/
➜  CRXJS:   Extension files written to dist/
```

Keep this terminal running.

---

## Step 6: Load in Chrome (2 minutes)

1. Open Chrome
2. Go to `chrome://extensions/`
3. Enable **"Developer mode"** (top-right toggle)
4. Click **"Load unpacked"**
5. Select the `dist` folder in your project
6. Extension should appear with your icon!

---

## Step 7: Get OpenRouter API Key (5 minutes)

1. Visit [openrouter.ai](https://openrouter.ai)
2. Sign up (email or OAuth)
3. Verify your email
4. Go to [openrouter.ai/keys](https://openrouter.ai/keys)
5. Click "Create Key"
6. Name it: "Prompt Formatter Extension"
7. Copy the key (starts with `sk-or-v1-...`)
8. **Optional:** Add $5 credits (or use free models)

---

## Step 8: Configure Extension (2 minutes)

1. Click your extension icon in Chrome toolbar
2. Popup should open
3. Paste your OpenRouter API key
4. Select a model:
   - **Llama 3 70B** (free, good quality) ← Start here
   - **GPT-4 Turbo** (best quality, costs money)
5. Click **"Save Settings"**
6. Should show "✓ Settings Saved!"

---

## Step 9: Test It! (2 minutes)

1. Go to [chat.openai.com](https://chat.openai.com)
2. Click in the ChatGPT input field
3. Type: **"write about dogs"**
4. Press **Ctrl+Shift+F** (Windows/Linux) or **Cmd+Shift+F** (Mac)
5. Loading overlay should appear
6. After 2-3 seconds, your prompt should transform!

**Expected Result:**
```
Write a 500-word informative article about dog breeds 
suitable for first-time owners. Include sections on: 
(1) Temperament and personality traits, (2) Exercise 
and care requirements, (3) Training difficulty and tips...
```

---

## Troubleshooting

### Problem: Extension not loading
**Solution:**
```bash
# Stop dev server (Ctrl+C)
rm -rf dist/
npm run dev
# Reload extension in chrome://extensions/
```

### Problem: "API key not found"
**Solution:**
- Open extension popup
- Re-enter API key
- Click "Save Settings"
- Try again

### Problem: "Input field not found"
**Solution:**
- Make sure you're on chat.openai.com
- Check browser console (F12) for errors
- ChatGPT may have changed their DOM - update selectors in `src/content/content.ts`

### Problem: Nothing happens when pressing Ctrl+Shift+F
**Solution:**
- Check if content script loaded: F12 → Console → Look for "AI Prompt Engineer content script loaded"
- Try reloading the ChatGPT page
- Check chrome://extensions/ for errors

### Problem: TypeScript errors
**Solution:**
```bash
npm run type-check
# Fix any errors shown
```

---

## Development Workflow

### Making Changes

1. Edit code in your editor
2. Save file
3. Vite automatically rebuilds (watch terminal)
4. Go to `chrome://extensions/`
5. Click refresh icon on your extension
6. Reload ChatGPT page
7. Test your changes

### Checking Logs

**Content Script Logs:**
- Open ChatGPT
- Press F12
- Go to Console tab
- Look for messages from content script

**Background Worker Logs:**
- Go to `chrome://extensions/`
- Find your extension
- Click "Inspect views: service worker"
- Check Console tab

**Popup Logs:**
- Right-click extension icon
- Select "Inspect popup"
- Check Console tab

---

## Next Steps

### After MVP Works:

1. **Read the documentation:**
   - `docs/ARCHITECTURE.md` - Understand how it works
   - `docs/API_INTEGRATION.md` - Learn about OpenRouter
   - `docs/ROADMAP.md` - See future features

2. **Improve the extension:**
   - Better error messages
   - More AI models
   - Caching for faster responses
   - History feature

3. **Test thoroughly:**
   - Different prompt types
   - Error scenarios
   - Different websites
   - Edge cases

4. **Share with friends:**
   - Get feedback
   - Iterate on UX
   - Fix bugs

5. **Prepare for launch:**
   - Create nice icons
   - Take screenshots
   - Write Chrome Web Store description
   - Submit for review

---

## Useful Commands

```bash
# Start development
npm run dev

# Type check
npm run type-check

# Build for production
npm run build

# Clean and rebuild
rm -rf dist/ node_modules/
npm install
npm run dev
```

---

## File Structure Reference

```
prompt-formatter-extension/
├── src/
│   ├── background/
│   │   └── background.ts         # API calls, business logic
│   ├── content/
│   │   └── content.ts            # ChatGPT integration
│   ├── popup/
│   │   ├── popup.html            # Popup HTML
│   │   ├── Popup.tsx             # React settings UI
│   │   └── index.tsx             # React entry point
│   ├── types/
│   │   └── messages.ts           # TypeScript types
│   ├── manifest.json             # Extension config
│   └── index.css                 # Global styles
├── public/
│   └── icons/
│       ├── icon16.png
│       ├── icon48.png
│       └── icon128.png
├── docs/                         # Documentation
├── dist/                         # Build output (auto-generated)
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

---

## Quick Tips

### Pro Tips for Development:

1. **Keep terminal visible** - Watch for build errors
2. **Use browser DevTools** - Essential for debugging
3. **Test incrementally** - Don't write all code at once
4. **Read error messages** - They usually tell you exactly what's wrong
5. **Check docs when stuck** - All answers are in the docs/ folder

### Common Mistakes to Avoid:

1. ❌ Forgetting to reload extension after changes
2. ❌ Not checking browser console for errors
3. ❌ Using wrong selectors for ChatGPT input
4. ❌ Not handling async operations properly
5. ❌ Hardcoding API keys (always use storage!)

---

## Resources

### Documentation
- **Project Plan:** `PROJECT_PLAN.md` - Complete overview
- **Setup Guide:** `docs/SETUP.md` - Detailed setup
- **Components:** `docs/COMPONENTS.md` - Full code examples
- **Architecture:** `docs/ARCHITECTURE.md` - How it works

### External
- **OpenRouter:** https://openrouter.ai/docs
- **Chrome Extensions:** https://developer.chrome.com/docs/extensions/
- **Vite:** https://vitejs.dev/
- **React:** https://react.dev/

---

## Success Checklist

By the end of this guide, you should have:

- ✅ Working development environment
- ✅ Extension loaded in Chrome
- ✅ OpenRouter API key configured
- ✅ Successfully formatted at least one prompt
- ✅ Understanding of basic architecture
- ✅ Know where to find help (docs/)

---

## What to Do If You Get Stuck

1. **Check the logs** - Console, terminal, errors
2. **Read the docs** - Specific answer probably in docs/
3. **Google the error** - Likely someone had same issue
4. **Start fresh** - Delete dist/, reinstall, rebuild
5. **Ask for help** - Chrome extension communities, forums

---

**Congratulations! You now have a working AI Prompt Engineer extension!** 🎉

Next: Read `PROJECT_PLAN.md` for the complete project overview and `docs/ROADMAP.md` for future features.

**Happy coding! 🚀**
