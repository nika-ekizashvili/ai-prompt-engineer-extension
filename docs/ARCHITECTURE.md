# Architecture Documentation

## System Overview

The AI Prompt Engineer extension follows a standard Chrome Extension Manifest V3 architecture with three main components communicating via Chrome's message passing API.

```
┌─────────────────────────────────────────────────────────────┐
│                        User Interface                        │
│                     (ChatGPT Website)                        │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ 1. User types text
                         │ 2. Presses Ctrl+Shift+F
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    Content Script (TS)                       │
│  • Detects input field                                       │
│  • Extracts user text                                        │
│  • Shows loading indicator                                   │
│  • Injects formatted result                                  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ chrome.runtime.sendMessage()
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│           Background Service Worker (TS)                     │
│  • Receives format request                                   │
│  • Gets API key from storage                                 │
│  • Calls OpenRouter API                                      │
│  • Returns formatted text                                    │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ HTTPS Request
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    OpenRouter API                            │
│  • GPT-4, Claude, Llama, etc.                               │
│  • Prompt engineering system prompt                          │
│  • Returns enhanced prompt                                   │
└─────────────────────────────────────────────────────────────┘
```

## Component Architecture

### 1. Content Script (`src/content/content.ts`)

**Purpose:** Interacts with the webpage DOM to detect input fields and inject formatted results.

**Responsibilities:**
- Detect ChatGPT input field using multiple selectors (future-proof)
- Listen for keyboard shortcut (Ctrl+Shift+F)
- Extract text from input field
- Show loading overlay during API call
- Inject formatted text back into input
- Trigger input events so ChatGPT recognizes changes
- Display success/error toasts

**Key Functions:**
```typescript
findInputField(): HTMLTextAreaElement | null
  - Searches for ChatGPT's textarea using multiple selectors
  - Returns the input element if found

formatPrompt(): Promise<void>
  - Main orchestration function
  - Extracts text, sends to background, injects result

showLoadingOverlay(): void
  - Creates and displays loading spinner

handleKeyboardShortcut(event: KeyboardEvent): void
  - Listens for Ctrl+Shift+F
  - Triggers formatPrompt()
```

**DOM Injection:**
- Creates temporary overlay elements for loading/toasts
- Uses `display: fixed` and high `z-index` to overlay on page
- Cleans up after completion

**Message Flow:**
```typescript
// Send to background
const response = await chrome.runtime.sendMessage({
  type: 'FORMAT_PROMPT',
  text: originalText,
});
```

---

### 2. Background Service Worker (`src/background/background.ts`)

**Purpose:** Handles API calls and business logic. Service workers run in the background and have full network access (no CORS restrictions).

**Responsibilities:**
- Listen for messages from content script
- Retrieve API key from Chrome storage
- Make HTTPS requests to OpenRouter API
- Handle errors and rate limiting
- Return formatted text to content script

**Key Functions:**
```typescript
formatWithOpenAI(text: string, apiKey: string, options: any): Promise<string>
  - Makes POST request to OpenRouter
  - Uses prompt engineering system prompt
  - Returns formatted text

chrome.runtime.onMessage.addListener()
  - Listens for FORMAT_PROMPT messages
  - Orchestrates API call
  - Sends response back to content script
```

**API Integration:**
```typescript
const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`,
  },
  body: JSON.stringify({
    model: 'openai/gpt-4-turbo-preview',
    messages: [
      { role: 'system', content: PROMPT_ENGINEER_SYSTEM },
      { role: 'user', content: text }
    ],
    temperature: 0.7,
    max_tokens: 1000,
  }),
});
```

**System Prompt:**
The background worker contains a detailed system prompt that teaches the AI to act as a prompt engineering expert (inspired by generateprompt.ai):

```typescript
const PROMPT_ENGINEER_SYSTEM = `You are an expert prompt engineer...
- Add clarity
- Add context
- Add structure
- Add constraints
- Add examples
- Remove ambiguity
...`;
```

---

### 3. Popup UI (`src/popup/Popup.tsx`)

**Purpose:** Settings interface for users to configure API keys, model selection, and preferences.

**Responsibilities:**
- Display current settings
- Allow user to input OpenRouter API key
- Select AI model (GPT-4, Claude, Llama, etc.)
- Save settings to Chrome storage
- Show usage instructions

**State Management:**
```typescript
interface Settings {
  openrouterApiKey: string;
  selectedModel: string;
  huggingfaceApiKey?: string;
}

// Load from storage
useEffect(() => {
  chrome.storage.sync.get(['openrouterApiKey', 'selectedModel'], (result) => {
    setSettings(result);
  });
}, []);

// Save to storage
const handleSave = async () => {
  await chrome.storage.sync.set(settings);
};
```

**Available Models:**
- GPT-4 Turbo (best quality, medium cost)
- GPT-3.5 Turbo (fast, low cost)
- Claude 3 Sonnet (alternative, good quality)
- Claude 3 Haiku (fast, low cost)
- Llama 3 70B (free, good quality)

---

## Data Flow

### Complete User Journey

1. **User Action:**
   - User navigates to chat.openai.com
   - Types rough prompt: "write about dogs"
   - Presses Ctrl+Shift+F

2. **Content Script Processing:**
   - `handleKeyboardShortcut()` fires
   - `findInputField()` locates textarea
   - Extracts text: "write about dogs"
   - Shows loading overlay
   - Sends message to background:
     ```javascript
     chrome.runtime.sendMessage({
       type: 'FORMAT_PROMPT',
       text: 'write about dogs'
     })
     ```

3. **Background Processing:**
   - Receives message
   - Retrieves API key from `chrome.storage.sync`
   - Makes HTTPS POST to OpenRouter:
     ```
     POST https://openrouter.ai/api/v1/chat/completions
     {
       model: 'openai/gpt-4-turbo-preview',
       messages: [
         { role: 'system', content: PROMPT_ENGINEER_SYSTEM },
         { role: 'user', content: 'write about dogs' }
       ]
     }
     ```

4. **OpenRouter Processing:**
   - Routes request to GPT-4
   - GPT-4 enhances prompt using system instructions
   - Returns: "Write a 500-word informative article about dog breeds suitable for first-time owners..."

5. **Background Response:**
   - Parses API response
   - Sends formatted text back to content script:
     ```javascript
     sendResponse({
       success: true,
       formattedText: "Write a 500-word informative article..."
     })
     ```

6. **Content Script Injection:**
   - Receives formatted text
   - Updates textarea: `inputField.value = formattedText`
   - Triggers input event: `inputField.dispatchEvent(new Event('input'))`
   - Hides loading overlay
   - Shows success toast

---

## Message Passing Protocol

### Message Types

```typescript
// Request: Content Script → Background
interface FormatRequest {
  type: 'FORMAT_PROMPT';
  text: string;
  model?: string;
}

// Response: Background → Content Script
interface FormatResponse {
  success: boolean;
  formattedText?: string;
  error?: string;
  usage?: {
    tokens: number;
    cost: number;
  };
}
```

### Implementation

**Sender (Content Script):**
```typescript
const response: FormatResponse = await chrome.runtime.sendMessage({
  type: 'FORMAT_PROMPT',
  text: originalText,
});
```

**Receiver (Background):**
```typescript
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'FORMAT_PROMPT') {
    (async () => {
      try {
        const formatted = await formatWithOpenAI(request.text, apiKey);
        sendResponse({ success: true, formattedText: formatted });
      } catch (error) {
        sendResponse({ success: false, error: error.message });
      }
    })();
    return true; // Keep channel open for async response
  }
});
```

---

## Storage Architecture

### Chrome Storage API

We use `chrome.storage.sync` for user settings (syncs across devices) and `chrome.storage.local` for cache/history (device-specific).

**Settings Storage (sync):**
```typescript
// Save
await chrome.storage.sync.set({
  openrouterApiKey: 'sk-or-v1-...',
  selectedModel: 'openai/gpt-4-turbo-preview',
  temperature: 0.7,
  maxTokens: 1000,
});

// Load
const result = await chrome.storage.sync.get([
  'openrouterApiKey',
  'selectedModel',
  'temperature',
  'maxTokens'
]);
```

**Cache Storage (local):**
```typescript
// Future feature: Cache formatted prompts
await chrome.storage.local.set({
  history: [
    { original: '...', formatted: '...', timestamp: Date.now() },
  ],
});
```

---

## Security Considerations

### API Key Storage
- Keys stored in `chrome.storage.sync` (encrypted by Chrome)
- Never transmitted anywhere except to OpenRouter
- Never logged or exposed in console
- User can delete anytime

### Content Security Policy (CSP)
```json
// manifest.json
{
  "content_security_policy": {
    "extension_pages": "script-src 'self'; object-src 'self'"
  }
}
```

### CORS Handling
- Content scripts have CORS restrictions
- Background service worker makes all external API calls
- No direct fetch from content script

### Input Sanitization
- Text is sent as-is to AI (no execution risk)
- No eval() or innerHTML usage
- All DOM manipulation uses safe methods (textContent, value)

---

## Performance Optimizations

### Current Optimizations
1. **Debouncing:** (Future) Debounce rapid format requests
2. **Caching:** (Future) Cache identical prompts for 5 minutes
3. **Lazy Loading:** Content script only loads when on supported sites
4. **Minimal Bundle:** Tree-shaking and code-splitting with Vite

### Future Optimizations
1. **Request Deduplication:** Don't send duplicate requests simultaneously
2. **Streaming:** Show formatted text as it's generated (SSE)
3. **Local Models:** Support for local LLMs (WebLLM, Transformers.js)
4. **Compression:** Compress large prompts before sending

---

## Error Handling

### Error Types

1. **API Errors:**
   - Invalid API key → Show error toast, prompt user to check settings
   - Rate limiting → Show "Please wait" message, retry after delay
   - Network failure → Show retry button

2. **DOM Errors:**
   - Input field not found → Log warning, show toast
   - Can't inject text → Fallback to clipboard copy

3. **Storage Errors:**
   - Can't read API key → Prompt user to configure
   - Quota exceeded → Clear old history

### Error Recovery

```typescript
try {
  const response = await chrome.runtime.sendMessage({ ... });
  if (!response.success) {
    throw new Error(response.error);
  }
} catch (error) {
  console.error('Format error:', error);
  showToast(error.message || 'Failed to format prompt', 'error');
  
  // Optional: Fallback to clipboard
  if (confirm('Copy formatted text to clipboard instead?')) {
    navigator.clipboard.writeText(formattedText);
  }
}
```

---

## Extension Lifecycle

### Installation
1. User clicks "Load unpacked" in chrome://extensions/
2. Chrome reads manifest.json
3. Background service worker starts
4. Extension icon appears in toolbar

### Content Script Injection
1. User navigates to chat.openai.com
2. Chrome automatically injects content.ts
3. Content script initializes keyboard listener
4. Ready to format prompts

### Background Worker Lifecycle
- Service worker may sleep when inactive (Manifest V3 behavior)
- Wakes up when receiving messages
- Keeps minimal state in memory
- Uses storage for persistence

---

## Testing Strategy

### Manual Testing
1. Load extension in Chrome
2. Navigate to ChatGPT
3. Type test prompt
4. Press Ctrl+Shift+F
5. Verify formatted result

### Future Automated Testing
1. **Unit Tests:** (Jest + Testing Library)
   - Test message parsing
   - Test API client functions
   - Test storage utilities

2. **Integration Tests:** (Playwright)
   - Test full format flow
   - Test error handling
   - Test keyboard shortcuts

3. **E2E Tests:** (Puppeteer)
   - Test on real ChatGPT page
   - Test across different browsers
   - Test performance

---

## Browser Compatibility

### Supported Browsers
- ✅ Chrome 88+ (Manifest V3)
- ✅ Edge 88+ (Chromium-based)
- ✅ Brave (Chromium-based)
- ✅ Opera (Chromium-based)
- ⚠️ Firefox (requires Manifest V2 adaptation)
- ❌ Safari (different extension architecture)

### API Compatibility
- `chrome.runtime` - Message passing (all Chromium)
- `chrome.storage` - Storage API (all Chromium)
- `chrome.scripting` - Future feature (Chrome 88+)

---

## Build Pipeline

### Development Build
```bash
npm run dev
# → Vite dev server with HMR
# → @crxjs/vite-plugin watches manifest.json
# → Auto-reload extension on changes
```

### Production Build
```bash
npm run build
# → TypeScript compilation
# → Vite bundling + optimization
# → Tree-shaking unused code
# → Output to dist/
```

### Build Output
```
dist/
├── manifest.json
├── icons/
├── background.js (service worker)
├── content.js (content script)
└── popup/
    ├── popup.html
    ├── popup.js
    └── assets/
```

---

This architecture provides a solid foundation for the MVP and is designed to scale to Phase 4 features like templates, history, and multi-site support.
