# Component Implementation Guide

Complete implementation code for all extension components.

## Table of Contents

1. [Background Service Worker](#background-service-worker)
2. [Content Script](#content-script)
3. [Popup UI](#popup-ui)
4. [TypeScript Types](#typescript-types)
5. [Utility Functions](#utility-functions)

---

## Background Service Worker

Complete implementation of the background service worker that handles API calls.

```typescript
// src/background/background.ts

interface FormatRequest {
  type: 'FORMAT_PROMPT';
  text: string;
  model?: string;
}

interface FormatResponse {
  success: boolean;
  formattedText?: string;
  error?: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

// OpenRouter configuration
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const DEFAULT_MODEL = 'openai/gpt-4-turbo-preview';

// Expert prompt engineering system prompt
const PROMPT_ENGINEER_SYSTEM = `You are an expert prompt engineer. Your job is to transform user's rough, unclear, or poorly structured prompts into clear, specific, well-engineered prompts that will get the best results from AI models.

## Your Task:
Take the user's input and improve it by:
1. **Adding clarity** - Make vague requests specific
2. **Adding context** - Include relevant background information
3. **Adding structure** - Organize thoughts logically with sections/bullets
4. **Adding constraints** - Specify format, length, tone, style, audience
5. **Adding examples** - Include examples when helpful (few-shot prompting)
6. **Removing ambiguity** - Make intent crystal clear

## Guidelines:
- Preserve the user's core intent and meaning
- Make it conversational and natural (not robotic)
- Add formatting (bullets, numbered lists, sections) when appropriate
- Include relevant constraints (tone, length, audience, format)
- Don't over-complicate simple requests
- Use specific numbers instead of vague terms (e.g., "500 words" not "brief")
- Output ONLY the improved prompt, no meta-commentary or explanations

## Examples:

**Input:** "write about dogs"
**Output:** "Write a 500-word informative article about dog breeds suitable for first-time owners. Include sections on: (1) Temperament and personality traits, (2) Exercise and care requirements, (3) Training difficulty and tips. Use a friendly, accessible tone appropriate for new pet owners. Include 3-5 specific breed recommendations with brief explanations."

**Input:** "make logo"
**Output:** "Design a modern, minimalist logo for a sustainable tech startup called 'GreenCircuit'. The logo should:
- Incorporate subtle elements suggesting both technology (circuits, connections) and sustainability (nature, leaves, recycling)
- Use a color palette of forest green (#2D5016) and charcoal gray (#333333)
- Be scalable and work in both color and monochrome
- Include both horizontal and stacked versions
- Be provided in vector format (SVG or AI)
The overall aesthetic should be professional, trustworthy, and forward-thinking."

**Input:** "fix this code"
**Output:** "Review the following [LANGUAGE] code and identify all bugs, performance issues, and code quality problems. For each issue found, provide:
1. **What's wrong**: Clear description of the issue
2. **Why it matters**: Impact on functionality, performance, or maintainability
3. **How to fix**: Corrected code with inline comments explaining changes

Prioritize issues in this order:
- Critical bugs (crashes, data corruption)
- Logic errors (incorrect behavior)
- Performance problems (memory leaks, inefficient algorithms)
- Code quality (readability, best practices)

Provide the corrected code in a single, runnable version at the end."

Now improve the user's prompt:`;

/**
 * Format prompt using OpenRouter API
 */
async function formatWithOpenRouter(
  text: string,
  apiKey: string,
  model: string = DEFAULT_MODEL
): Promise<FormatResponse> {
  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': chrome.runtime.getURL(''),
        'X-Title': 'AI Prompt Engineer Extension',
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'system',
            content: PROMPT_ENGINEER_SYSTEM,
          },
          {
            role: 'user',
            content: text,
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
        top_p: 1.0,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      
      // Handle specific error cases
      switch (response.status) {
        case 401:
          throw new Error('Invalid API key. Please check your settings.');
        case 429:
          throw new Error('Rate limit exceeded. Please wait a moment and try again.');
        case 402:
          throw new Error('Insufficient credits. Please add funds to your OpenRouter account.');
        case 500:
        case 503:
          throw new Error('OpenRouter service temporarily unavailable. Please try again.');
        default:
          throw new Error(error.error?.message || `API Error: ${response.status}`);
      }
    }

    const data = await response.json();
    
    // Validate response structure
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid API response format');
    }

    return {
      success: true,
      formattedText: data.choices[0].message.content.trim(),
      usage: data.usage ? {
        promptTokens: data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens,
        totalTokens: data.usage.total_tokens,
      } : undefined,
    };

  } catch (error) {
    console.error('OpenRouter API error:', error);
    
    if (error instanceof TypeError) {
      return {
        success: false,
        error: 'Network error. Please check your internet connection.',
      };
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Message listener - handles FORMAT_PROMPT requests
 */
chrome.runtime.onMessage.addListener(
  (request: FormatRequest, sender, sendResponse: (response: FormatResponse) => void) => {
    if (request.type === 'FORMAT_PROMPT') {
      (async () => {
        try {
          // Get API key and model from storage
          const storage = await chrome.storage.sync.get(['openrouterApiKey', 'selectedModel']);

          if (!storage.openrouterApiKey) {
            sendResponse({
              success: false,
              error: 'No API key configured. Please add one in extension settings.',
            });
            return;
          }

          const model = request.model || storage.selectedModel || DEFAULT_MODEL;

          // Format the prompt
          const result = await formatWithOpenRouter(
            request.text,
            storage.openrouterApiKey,
            model
          );

          sendResponse(result);

        } catch (error) {
          console.error('Background error:', error);
          sendResponse({
            success: false,
            error: 'An unexpected error occurred. Please try again.',
          });
        }
      })();

      return true; // Keep message channel open for async response
    }
  }
);

console.log('✓ AI Prompt Engineer background service worker loaded');
```

---

## Content Script

Complete implementation of the content script that interacts with ChatGPT.

```typescript
// src/content/content.ts

interface FormatResponse {
  success: boolean;
  formattedText?: string;
  error?: string;
}

/**
 * Find ChatGPT input field using multiple selectors (future-proof)
 */
const findInputField = (): HTMLTextAreaElement | null => {
  const selectors = [
    'textarea#prompt-textarea',
    'textarea[data-id]',
    'textarea[placeholder*="Message"]',
    '[contenteditable="true"]',
  ];

  for (const selector of selectors) {
    const element = document.querySelector(selector) as HTMLTextAreaElement;
    if (element) {
      console.log('✓ Input field found:', selector);
      return element;
    }
  }

  console.warn('⚠ Input field not found');
  return null;
};

/**
 * Create and show loading overlay
 */
const showLoadingOverlay = (): HTMLElement => {
  // Remove any existing overlay
  hideLoadingOverlay();

  const overlay = document.createElement('div');
  overlay.id = 'prompt-engineer-overlay';
  overlay.innerHTML = `
    <div style="
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0, 0, 0, 0.95);
      color: white;
      padding: 24px 32px;
      border-radius: 12px;
      z-index: 999999;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
      font-family: system-ui, -apple-system, sans-serif;
    ">
      <div style="
        width: 40px;
        height: 40px;
        border: 3px solid #fff;
        border-top-color: transparent;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      "></div>
      <div style="font-size: 16px; font-weight: 500;">
        Enhancing your prompt with AI...
      </div>
    </div>
    <style>
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    </style>
  `;
  
  document.body.appendChild(overlay);
  return overlay;
};

/**
 * Hide loading overlay
 */
const hideLoadingOverlay = (): void => {
  const overlay = document.getElementById('prompt-engineer-overlay');
  if (overlay) {
    overlay.remove();
  }
};

/**
 * Show toast notification
 */
const showToast = (message: string, type: 'success' | 'error' = 'success'): void => {
  const bgColor = type === 'success' ? '#10b981' : '#ef4444';
  const icon = type === 'success' ? '✓' : '✗';
  
  const toast = document.createElement('div');
  toast.innerHTML = `
    <div style="
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${bgColor};
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      z-index: 999999;
      font-size: 14px;
      font-weight: 500;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      animation: slideIn 0.3s ease-out;
      font-family: system-ui, -apple-system, sans-serif;
    ">
      ${icon} ${message}
    </div>
    <style>
      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
    </style>
  `;
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.remove();
  }, 3000);
};

/**
 * Main format function - orchestrates the entire flow
 */
const formatPrompt = async (): Promise<void> => {
  const inputField = findInputField();
  
  if (!inputField) {
    showToast('Could not find input field. Make sure you\'re on ChatGPT.', 'error');
    return;
  }

  const originalText = inputField.value.trim();
  
  if (!originalText) {
    showToast('Please type something first!', 'error');
    return;
  }

  console.log('→ Formatting prompt:', originalText.substring(0, 50) + '...');

  // Show loading
  const overlay = showLoadingOverlay();

  try {
    // Send to background script
    const response: FormatResponse = await chrome.runtime.sendMessage({
      type: 'FORMAT_PROMPT',
      text: originalText,
    });

    if (!response.success) {
      throw new Error(response.error || 'Unknown error occurred');
    }

    console.log('✓ Received formatted prompt:', response.formattedText?.substring(0, 50) + '...');

    // Update input field
    inputField.value = response.formattedText || originalText;
    
    // Trigger input event so ChatGPT recognizes the change
    inputField.dispatchEvent(new Event('input', { bubbles: true }));
    inputField.dispatchEvent(new Event('change', { bubbles: true }));
    
    // Focus and move cursor to end
    inputField.focus();
    inputField.setSelectionRange(inputField.value.length, inputField.value.length);

    showToast('Prompt enhanced successfully!', 'success');

  } catch (error: any) {
    console.error('✗ Format error:', error);
    showToast(error.message || 'Failed to format prompt', 'error');
  } finally {
    hideLoadingOverlay();
  }
};

/**
 * Keyboard shortcut handler
 */
const handleKeyboardShortcut = (event: KeyboardEvent): void => {
  // Ctrl+Shift+F (Windows/Linux) or Cmd+Shift+F (Mac)
  if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'F') {
    event.preventDefault();
    console.log('→ Keyboard shortcut triggered');
    formatPrompt();
  }
};

/**
 * Initialize content script
 */
const init = (): void => {
  console.log('✓ AI Prompt Engineer content script loaded');
  console.log('→ Press Ctrl+Shift+F (or Cmd+Shift+F on Mac) to format your prompt');
  
  // Add keyboard listener
  document.addEventListener('keydown', handleKeyboardShortcut);
};

// Run initialization
init();
```

---

## Popup UI

Complete implementation of the React popup interface.

### Popup HTML

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

### Popup Index

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

### Popup Component

```tsx
// src/popup/Popup.tsx
import React, { useState, useEffect } from 'react';

interface Settings {
  openrouterApiKey: string;
  selectedModel: string;
  huggingfaceApiKey?: string;
}

const AVAILABLE_MODELS = [
  { 
    id: 'openai/gpt-4-turbo-preview', 
    name: 'GPT-4 Turbo', 
    cost: 'Medium',
    description: 'Best quality, recommended'
  },
  { 
    id: 'openai/gpt-3.5-turbo', 
    name: 'GPT-3.5 Turbo', 
    cost: 'Low',
    description: 'Fast and affordable'
  },
  { 
    id: 'anthropic/claude-3-5-sonnet-20241022', 
    name: 'Claude 3.5 Sonnet', 
    cost: 'Medium',
    description: 'Excellent at prompts'
  },
  { 
    id: 'anthropic/claude-3-haiku', 
    name: 'Claude 3 Haiku', 
    cost: 'Low',
    description: 'Fast and cheap'
  },
  { 
    id: 'meta-llama/llama-3-70b-instruct', 
    name: 'Llama 3 70B', 
    cost: 'Free',
    description: 'Best free option'
  },
];

export const Popup: React.FC = () => {
  const [settings, setSettings] = useState<Settings>({
    openrouterApiKey: '',
    selectedModel: 'openai/gpt-4-turbo-preview',
  });
  
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  // Load settings on mount
  useEffect(() => {
    chrome.storage.sync.get(
      ['openrouterApiKey', 'selectedModel', 'huggingfaceApiKey'],
      (result) => {
        if (result.openrouterApiKey || result.selectedModel) {
          setSettings(result as Settings);
        }
        setLoading(false);
      }
    );
  }, []);

  // Save settings
  const handleSave = async (): Promise<void> => {
    await chrome.storage.sync.set(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleChange = (key: keyof Settings, value: string): void => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="w-[400px] p-6 flex items-center justify-center bg-white">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="w-[400px] bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
        <h1 className="text-2xl font-bold mb-1">AI Prompt Engineer</h1>
        <p className="text-blue-100 text-sm">
          Transform rough ideas into perfect prompts
        </p>
      </div>

      <div className="p-6 space-y-6">
        {/* OpenRouter API Key */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            OpenRouter API Key *
          </label>
          <div className="relative">
            <input
              type={showApiKey ? 'text' : 'password'}
              value={settings.openrouterApiKey}
              onChange={(e) => handleChange('openrouterApiKey', e.target.value)}
              placeholder="sk-or-v1-..."
              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
            <button
              onClick={() => setShowApiKey(!showApiKey)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg"
            >
              {showApiKey ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
          <div className="mt-2 flex items-start gap-2 text-xs text-gray-500">
            <span>ℹ️</span>
            <div>
              Get your free API key at{' '}
              <a
                href="https://openrouter.ai/keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                openrouter.ai/keys
              </a>
              <br />
              Your key is stored locally and never shared.
            </div>
          </div>
        </div>

        {/* Model Selection */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            AI Model
          </label>
          <select
            value={settings.selectedModel}
            onChange={(e) => handleChange('selectedModel', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            {AVAILABLE_MODELS.map((model) => (
              <option key={model.id} value={model.id}>
                {model.name} - {model.cost} cost
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-500">
            {AVAILABLE_MODELS.find(m => m.id === settings.selectedModel)?.description}
          </p>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={!settings.openrouterApiKey}
          className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
            saved
              ? 'bg-green-600 text-white'
              : settings.openrouterApiKey
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {saved ? '✓ Settings Saved!' : 'Save Settings'}
        </button>

        {/* Usage Instructions */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <h3 className="font-semibold text-sm text-gray-900">How to Use:</h3>
          <ol className="text-sm text-gray-600 space-y-2 list-decimal list-inside">
            <li>Go to ChatGPT or any supported chat interface</li>
            <li>Type your rough prompt in the input field</li>
            <li>
              Press{' '}
              <kbd className="px-2 py-1 bg-white border rounded text-xs font-mono">Ctrl</kbd>
              {' + '}
              <kbd className="px-2 py-1 bg-white border rounded text-xs font-mono">Shift</kbd>
              {' + '}
              <kbd className="px-2 py-1 bg-white border rounded text-xs font-mono">F</kbd>
            </li>
            <li>Watch your prompt get enhanced by AI! ✨</li>
          </ol>
        </div>

        {/* Footer Links */}
        <div className="text-center text-xs text-gray-500">
          <a 
            href="https://github.com/yourusername/prompt-formatter-extension" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-blue-600"
          >
            View on GitHub
          </a>
          {' • '}
          <a 
            href="https://openrouter.ai/docs" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-blue-600"
          >
            API Docs
          </a>
        </div>
      </div>
    </div>
  );
};
```

---

## TypeScript Types

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
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface Settings {
  openrouterApiKey: string;
  selectedModel: string;
  huggingfaceApiKey?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface Model {
  id: string;
  name: string;
  provider: 'openrouter' | 'huggingface';
  cost: 'free' | 'low' | 'medium' | 'high';
  description: string;
}
```

---

## Utility Functions

```typescript
// src/utils/storage.ts

export const storage = {
  async get<T>(keys: string[]): Promise<Partial<T>> {
    return new Promise((resolve) => {
      chrome.storage.sync.get(keys, (result) => {
        resolve(result as Partial<T>);
      });
    });
  },

  async set<T>(items: Partial<T>): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.sync.set(items, () => {
        resolve();
      });
    });
  },

  async clear(): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.sync.clear(() => {
        resolve();
      });
    });
  },
};
```

```typescript
// src/utils/messaging.ts

import type { FormatRequest, FormatResponse } from '../types/messages';

export async function sendFormatRequest(
  text: string,
  model?: string
): Promise<FormatResponse> {
  return chrome.runtime.sendMessage<FormatRequest, FormatResponse>({
    type: 'FORMAT_PROMPT',
    text,
    model,
  });
}
```

---

All components are now fully implemented and ready to use!
