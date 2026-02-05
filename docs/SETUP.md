# Development Setup Guide

Complete step-by-step guide to set up your development environment and build the AI Prompt Engineer Chrome extension.

## Prerequisites

### Required Software

1. **Node.js 18+**
   ```bash
   # Check version
   node --version  # Should be v18.0.0 or higher
   npm --version   # Should be 9.0.0 or higher
   ```
   
   Install from: https://nodejs.org/

2. **Chrome Browser**
   - Chrome 88+ (for Manifest V3 support)
   - Download from: https://www.google.com/chrome/

3. **Code Editor**
   - Recommended: VS Code with extensions:
     - ESLint
     - Prettier
     - TypeScript Vue Plugin (Volar)
     - Tailwind CSS IntelliSense

### Required Accounts

1. **OpenRouter Account**
   - Sign up: https://openrouter.ai
   - Get API key: https://openrouter.ai/keys
   - Optional: Add $5-10 credits (free models available)

2. **HuggingFace Account** (Optional, future feature)
   - Sign up: https://huggingface.co
   - Get token: https://huggingface.co/settings/tokens

---

## Project Initialization

### Step 1: Create Project

```bash
# Navigate to your projects directory
cd ~/desktop/projects

# Create project using Vite + React + TypeScript
npm create vite@latest prompt-formatter-extension -- --template react-ts

# Navigate to project
cd prompt-formatter-extension
```

### Step 2: Install Dependencies

```bash
# Install base dependencies
npm install

# Install Chrome extension tooling
npm install -D @crxjs/vite-plugin

# Install Tailwind CSS
npm install -D tailwindcss postcss autoprefixer

# Install types
npm install -D @types/chrome @types/node

# Initialize Tailwind
npx tailwindcss init -p
```

### Step 3: Configure Tailwind CSS

```javascript
// tailwind.config.js
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

```css
/* src/index.css */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

---

## Project Structure Setup

### Step 4: Create Directory Structure

```bash
# Create directories
mkdir -p src/background
mkdir -p src/content
mkdir -p src/popup
mkdir -p src/types
mkdir -p public/icons
mkdir -p docs
```

### Step 5: Create Manifest

```json
// src/manifest.json
{
  "manifest_version": 3,
  "name": "AI Prompt Engineer",
  "version": "1.0.0",
  "description": "Transform rough prompts into perfect, well-engineered prompts using AI",
  "permissions": [
    "storage",
    "activeTab"
  ],
  "host_permissions": [
    "https://chat.openai.com/*",
    "https://chatgpt.com/*"
  ],
  "background": {
    "service_worker": "src/background/background.ts",
    "type": "module"
  },
  "content_scripts": [
    {
      "matches": [
        "https://chat.openai.com/*",
        "https://chatgpt.com/*"
      ],
      "js": ["src/content/content.ts"],
      "run_at": "document_end"
    }
  ],
  "action": {
    "default_popup": "src/popup/popup.html",
    "default_icon": {
      "16": "icons/icon16.png",
      "48": "icons/icon48.png",
      "128": "icons/icon128.png"
    }
  },
  "icons": {
    "16": "icons/icon16.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  }
}
```

---

## Vite Configuration

### Step 6: Configure Vite for Chrome Extension

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { crx } from '@crxjs/vite-plugin';
import manifest from './src/manifest.json';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    crx({ manifest }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      input: {
        popup: 'src/popup/popup.html',
      },
    },
  },
});
```

### Step 7: Update TypeScript Config

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "types": ["chrome", "node"],

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,

    /* Path aliases */
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

---

## Create Extension Icons

### Step 8: Generate Icons

You can create simple icons using an online tool or design software. For MVP, you can use placeholder icons:

```bash
# Option 1: Use online icon generator
# Visit: https://www.favicon-generator.org/
# Upload a logo or create one, download 16x16, 48x48, 128x128

# Option 2: Use ImageMagick (if installed)
convert -size 128x128 xc:#4F46E5 -gravity center \
  -pointsize 60 -fill white -annotate +0+0 "AI" \
  public/icons/icon128.png

convert public/icons/icon128.png -resize 48x48 public/icons/icon48.png
convert public/icons/icon128.png -resize 16x16 public/icons/icon16.png
```

For production, design proper icons with:
- Clear, recognizable symbol
- Works in light and dark modes
- Follows Chrome Web Store guidelines

---

## Create Source Files

### Step 9: Create Background Service Worker

```typescript
// src/background/background.ts
// (Copy from ARCHITECTURE.md or COMPONENTS.md)

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// ... (full implementation in COMPONENTS.md)

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // ... implementation
});

console.log('AI Prompt Engineer background worker loaded');
```

### Step 10: Create Content Script

```typescript
// src/content/content.ts
// (Copy from ARCHITECTURE.md or COMPONENTS.md)

const findInputField = (): HTMLTextAreaElement | null => {
  // ... implementation
};

const formatPrompt = async (): Promise<void> => {
  // ... implementation
};

document.addEventListener('keydown', handleKeyboardShortcut);
```

### Step 11: Create Popup UI

```html
<!-- src/popup/popup.html -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AI Prompt Engineer</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/popup/index.tsx"></script>
</body>
</html>
```

```tsx
// src/popup/index.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Popup } from './Popup';
import '../index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>
);
```

```tsx
// src/popup/Popup.tsx
// (Copy from ARCHITECTURE.md or COMPONENTS.md)

export const Popup: React.FC = () => {
  // ... implementation
};
```

### Step 12: Create TypeScript Types

```typescript
// src/types/messages.ts

export interface FormatRequest {
  type: 'FORMAT_PROMPT';
  text: string;
  model?: string;
}

export interface FormatResponse {
  success: boolean;
  formattedText?: string;
  error?: string;
  usage?: {
    tokens: number;
    cost: number;
  };
}

export interface Settings {
  openrouterApiKey: string;
  selectedModel: string;
  huggingfaceApiKey?: string;
  temperature?: number;
  maxTokens?: number;
}
```

---

## Package.json Scripts

### Step 13: Update Package.json

```json
// package.json
{
  "name": "prompt-formatter-extension",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@crxjs/vite-plugin": "^2.0.0-beta.21",
    "@types/chrome": "^0.0.268",
    "@types/node": "^20.11.5",
    "@types/react": "^18.2.48",
    "@types/react-dom": "^18.2.18",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.17",
    "postcss": "^8.4.33",
    "tailwindcss": "^3.4.1",
    "typescript": "^5.3.3",
    "vite": "^5.0.11"
  }
}
```

---

## Development Workflow

### Step 14: Start Development Server

```bash
# Start Vite dev server
npm run dev

# Output should show:
# VITE v5.0.11  ready in 500 ms
# ➜  Local:   http://localhost:5173/
# ➜  CRXJS:   Extension files written to dist/
```

### Step 15: Load Extension in Chrome

1. Open Chrome
2. Navigate to `chrome://extensions/`
3. Enable **"Developer mode"** (top-right toggle)
4. Click **"Load unpacked"**
5. Select the `dist` folder in your project directory
6. Extension should now appear in your extensions list

### Step 16: Configure Extension

1. Click the extension icon in Chrome toolbar
2. Popup should open
3. Enter your OpenRouter API key
4. Select a model (try Llama 3 70B - it's free!)
5. Click "Save Settings"

---

## Testing

### Step 17: Test the Extension

1. Navigate to [chat.openai.com](https://chat.openai.com)
2. Click in the input field
3. Type: "write about dogs"
4. Press **Ctrl+Shift+F** (Windows/Linux) or **Cmd+Shift+F** (Mac)
5. Loading overlay should appear
6. Your prompt should be replaced with an enhanced version!

### Common Issues & Solutions

**Issue: Content script not injecting**
```bash
# Check console for errors
# Right-click extension icon → Inspect popup
# Check DevTools → Console tab
```

**Issue: "API key not found" error**
```bash
# Verify API key saved correctly
chrome.storage.sync.get(['openrouterApiKey'], (result) => {
  console.log('API Key:', result.openrouterApiKey);
});
```

**Issue: Input field not detected**
```bash
# ChatGPT may have changed selectors
# Update selectors in content.ts
const selectors = [
  'textarea#prompt-textarea',  // Current
  'textarea[data-id]',         // Fallback
  // Add more as needed
];
```

---

## Hot Reload

The @crxjs/vite-plugin provides automatic reload, but you may need to manually reload in some cases:

### Manual Reload

1. Make code changes
2. Save files
3. Go to `chrome://extensions/`
4. Click the refresh icon on your extension
5. Reload the ChatGPT page

### Watch Mode

```bash
# Development with watch mode
npm run dev

# In another terminal, watch for changes
npx vite build --watch
```

---

## Building for Production

### Step 18: Production Build

```bash
# Run production build
npm run build

# Output will be in dist/ folder
dist/
├── manifest.json
├── background.js
├── content.js
├── popup/
│   ├── popup.html
│   ├── index.js
│   └── assets/
└── icons/
```

### Step 19: Test Production Build

1. Go to `chrome://extensions/`
2. Remove development version
3. Click "Load unpacked"
4. Select `dist` folder
5. Test all functionality

---

## Environment Variables (Optional)

For storing development API keys:

```bash
# Create .env.local (add to .gitignore!)
echo "VITE_OPENROUTER_API_KEY=your-key-here" > .env.local
echo ".env.local" >> .gitignore
```

```typescript
// Access in code
const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
```

**⚠️ NEVER commit API keys to git!**

---

## Version Control

### Step 20: Initialize Git

```bash
# Initialize git repository
git init

# Create .gitignore
cat > .gitignore << 'EOF'
# Dependencies
node_modules/

# Build output
dist/
build/

# Environment variables
.env
.env.local
.env.*.local

# Editor
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

# Logs
*.log
EOF

# Initial commit
git add .
git commit -m "Initial commit: AI Prompt Engineer extension MVP"
```

---

## Next Steps

After completing setup:

1. **Test thoroughly** on different websites
2. **Add error handling** for edge cases
3. **Implement caching** to reduce API calls
4. **Add history feature** (Phase 2)
5. **Create demo video** for documentation
6. **Prepare for Chrome Web Store** submission

---

## Troubleshooting

### TypeScript Errors

```bash
# Clear TypeScript cache
rm -rf node_modules/.vite
npm run type-check
```

### Build Errors

```bash
# Clear build cache and rebuild
rm -rf dist/
npm run build
```

### Extension Not Updating

```bash
# Hard refresh extension
1. Remove extension from chrome://extensions/
2. Delete dist/ folder
3. npm run dev
4. Reload extension
```

---

## Resources

- **Vite Docs**: https://vitejs.dev/
- **@crxjs Plugin**: https://crxjs.dev/vite-plugin/
- **Chrome Extensions**: https://developer.chrome.com/docs/extensions/
- **OpenRouter**: https://openrouter.ai/docs
- **React**: https://react.dev/
- **TailwindCSS**: https://tailwindcss.com/docs

---

You're now ready to build! Follow the implementation details in COMPONENTS.md for complete code examples.
