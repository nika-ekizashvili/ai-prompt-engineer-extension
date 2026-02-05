# AI Prompt Engineer - Chrome Extension

> Transform rough, unclear prompts into clear, well-engineered prompts using AI (OpenRouter/HuggingFace)

## 🎯 Overview

This Chrome extension enhances your prompts in real-time as you type in ChatGPT or other AI chat interfaces. Instead of manually formatting your prompts, the extension sends your text to an AI model (via OpenRouter) that acts as a prompt engineering expert, returning a perfectly structured, clear, and effective prompt.

**Key Features:**
- ✨ AI-powered prompt enhancement (GPT-4, Claude, Llama, etc.)
- ⚡ Works in ChatGPT and expandable to other sites
- ⌨️ Simple keyboard shortcut (Ctrl+Shift+F)
- 🔑 User provides their own OpenRouter API key (secure & private)
- 🎨 Beautiful React + TailwindCSS popup UI
- 🚀 Built with React, TypeScript, and Vite

## 🏗️ Architecture

### Tech Stack
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite + @crxjs/vite-plugin
- **Styling**: TailwindCSS
- **Extension**: Chrome Manifest V3
- **AI Provider**: OpenRouter (with fallback to HuggingFace)
- **Storage**: Chrome Storage API

### Components
1. **Content Script** - Detects input fields, captures text, injects formatted results
2. **Background Service Worker** - Handles API calls to OpenRouter (avoids CORS)
3. **Popup UI (React)** - Settings interface for API keys and model selection
4. **Message Passing** - Chrome runtime messaging between components

## 📂 Project Structure

```
prompt-formatter-extension/
├── docs/                          # Documentation
│   ├── ARCHITECTURE.md           # Detailed architecture
│   ├── API_INTEGRATION.md        # OpenRouter/HuggingFace setup
│   ├── SETUP.md                  # Development setup
│   └── COMPONENTS.md             # Component details
├── public/
│   └── icons/                    # Extension icons
│       ├── icon16.png
│       ├── icon48.png
│       └── icon128.png
├── src/
│   ├── background/
│   │   └── background.ts         # Service worker + API calls
│   ├── content/
│   │   └── content.ts            # ChatGPT integration
│   ├── popup/
│   │   ├── popup.html
│   │   ├── Popup.tsx             # Settings UI
│   │   └── index.tsx
│   ├── types/
│   │   └── messages.ts           # TypeScript types
│   └── manifest.json             # Extension manifest
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── vite.config.ts
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Chrome browser
- OpenRouter account (free at [openrouter.ai](https://openrouter.ai/keys))

### Installation

```bash
# 1. Initialize project
npm create vite@latest prompt-formatter-extension -- --template react-ts
cd prompt-formatter-extension

# 2. Install dependencies
npm install
npm install -D @crxjs/vite-plugin tailwindcss postcss autoprefixer
npx tailwindcss init -p

# 3. Run development build
npm run dev

# 4. Load extension in Chrome
# - Open chrome://extensions/
# - Enable "Developer mode"
# - Click "Load unpacked"
# - Select the `dist` folder
```

### Get API Key
1. Visit [openrouter.ai/keys](https://openrouter.ai/keys)
2. Sign up (free)
3. Create API key
4. Add to extension settings popup

## 🎮 Usage

1. Navigate to [chat.openai.com](https://chat.openai.com)
2. Type your rough prompt in the input field
3. Press **Ctrl+Shift+F** (or **Cmd+Shift+F** on Mac)
4. Watch your prompt get enhanced by AI! ✨

**Example:**

**Before:**
```
write about dogs
```

**After (AI-enhanced):**
```
Write a 500-word informative article about dog breeds suitable for 
first-time owners. Include sections on temperament, care requirements, 
and training difficulty. Use a friendly, accessible tone appropriate 
for new pet owners.
```

## 📖 Documentation

For detailed documentation, see the `docs/` folder:

- **[ARCHITECTURE.md](./docs/ARCHITECTURE.md)** - System architecture and data flow
- **[SETUP.md](./docs/SETUP.md)** - Complete development setup guide
- **[API_INTEGRATION.md](./docs/API_INTEGRATION.md)** - OpenRouter & HuggingFace integration
- **[COMPONENTS.md](./docs/COMPONENTS.md)** - Component implementation details
- **[MANIFEST.md](./docs/MANIFEST.md)** - Extension manifest configuration
- **[ROADMAP.md](./docs/ROADMAP.md)** - Feature roadmap and future plans

## 💰 Cost Estimates

| Model | Cost per Format | 100 Formats |
|-------|----------------|-------------|
| GPT-4 Turbo | ~$0.02 | ~$2.00 |
| GPT-3.5 Turbo | ~$0.002 | ~$0.20 |
| Claude 3 Haiku | ~$0.005 | ~$0.50 |
| Llama 3 70B | **Free** | **$0** |

**Recommendation:** Start with Llama 3 70B (free) for testing, upgrade to GPT-4 for best quality.

## 🗺️ Roadmap

### Phase 1: MVP (Current)
- ✅ Basic AI formatting with OpenRouter
- ✅ ChatGPT support
- ✅ Simple settings UI
- ✅ Keyboard shortcut

### Phase 2: Enhanced UX
- [ ] Multiple AI provider support (OpenAI, Claude, HuggingFace)
- [ ] Template system (save favorite prompt patterns)
- [ ] History (view past formatted prompts)
- [ ] Before/After preview modal
- [ ] Context menu (right-click to format)

### Phase 3: Advanced Features
- [ ] Custom system prompts
- [ ] Prompt libraries (community templates)
- [ ] Streaming responses (real-time formatting)
- [ ] Usage tracking (costs, tokens, analytics)
- [ ] Support for more websites (Claude.ai, Bard, etc.)

### Phase 4: Pro Features
- [ ] Team settings sync
- [ ] Analytics dashboard
- [ ] Fine-tuned models
- [ ] Multi-language support
- [ ] Voice input integration

## 🛠️ Development

```bash
# Development build with hot reload
npm run dev

# Production build
npm run build

# Type checking
npm run type-check

# Linting
npm run lint
```

## 🔒 Security & Privacy

- **API keys stored locally** - Your OpenRouter/HuggingFace keys are stored in Chrome's secure storage and never transmitted anywhere except to the AI provider
- **No tracking** - We don't collect any usage data or analytics
- **Open source** - All code is visible and auditable
- **HTTPS only** - All API calls use encrypted connections

## 📝 License

MIT License - See LICENSE file for details

## 🤝 Contributing

Contributions are welcome! Please read CONTRIBUTING.md for guidelines.

## 📧 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/prompt-formatter-extension/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/prompt-formatter-extension/discussions)

## 🙏 Acknowledgments

- Inspired by [generateprompt.ai](https://generateprompt.ai)
- Built with [OpenRouter](https://openrouter.ai)
- Icons from [Lucide Icons](https://lucide.dev)

---

**Made with ❤️ for better prompts**
