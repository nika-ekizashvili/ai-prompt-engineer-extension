# 🔧 Quick Fix - Remove & Re-add Extension

## The Problem:
Chrome is loading the old dev server version (localhost:5173) instead of the production build.

## Fix (2 minutes):

### 1. Remove Extension
- Go to `chrome://extensions/`
- Find "AI Prompt Engineer"
- Click **"Remove"** button
- Confirm removal

### 2. Re-add from Correct Folder
- Click **"Load unpacked"** button
- Navigate to: `/Users/itswhatever/Desktop/Projects/prompt-formatter-extension/dist`
- **IMPORTANT:** Select the `dist` folder, NOT the root folder
- Click "Select"

### 3. Test
- Go to `chat.openai.com`
- Type: "write about dogs"
- Press: **Cmd+Shift+K**
- Should work now!

---

**Why this happened:** Chrome cached the old dev server path. Removing and re-adding forces it to load the production build.
