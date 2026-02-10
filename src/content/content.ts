interface FormatResponse {
  success: boolean;
  formattedText?: string;
  error?: string;
}

/**
 * Find ChatGPT input field using multiple selectors (future-proof)
 */
const findInputField = (): HTMLElement | null => {
  const selectors = [
    'textarea#prompt-textarea',
    'textarea[data-id]',
    'textarea[placeholder*="Message"]',
    'textarea[placeholder*="Send a message"]',
    'textarea[id*="prompt"]',
    'textarea',  // fallback: just find any textarea
    '[contenteditable="true"]',  // for contenteditable divs
  ];

  for (const selector of selectors) {
    const element = document.querySelector(selector) as HTMLElement;
    if (element && element.offsetParent !== null) { // Check if visible
      console.log('✓ Input field found:', selector);
      return element;
    }
  }

  console.warn('⚠ Input field not found. Available textareas:', document.querySelectorAll('textarea').length);
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
        border: 3px solid #11A32B;
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
  const bgColor = type === 'success' ? '#10B981' : '#EF4444';
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

  // Get text from either textarea.value or contenteditable.textContent
  const isTextarea = inputField instanceof HTMLTextAreaElement;
  const originalText = isTextarea 
    ? (inputField as HTMLTextAreaElement).value.trim()
    : (inputField.textContent || inputField.innerText || '').trim();
  
  if (!originalText) {
    showToast('Please type something first!', 'error');
    return;
  }

  console.log('→ Formatting prompt:', originalText.substring(0, 50) + '...');

  // Show loading
  showLoadingOverlay();

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

    // Update input field based on type
    if (isTextarea) {
      (inputField as HTMLTextAreaElement).value = response.formattedText || originalText;
    } else {
      inputField.textContent = response.formattedText || originalText;
    }
    
    // Trigger input event so ChatGPT recognizes the change
    inputField.dispatchEvent(new Event('input', { bubbles: true }));
    inputField.dispatchEvent(new Event('change', { bubbles: true }));
    
    // Focus
    inputField.focus();
    
    // Move cursor to end (only works for textarea)
    if (isTextarea) {
      const textarea = inputField as HTMLTextAreaElement;
      textarea.setSelectionRange(textarea.value.length, textarea.value.length);
    }

    showToast('Prompt enhanced successfully!', 'success');

  } catch (error: any) {
    console.error('✗ Format error:', error);
    showToast(error.message || 'Failed to format prompt', 'error');
  } finally {
    hideLoadingOverlay();
  }
};

/**
 * Text-to-Speech functionality
 */
let currentSpeech: SpeechSynthesisUtterance | null = null;

const speakText = (text: string): void => {
  // Stop any current speech
  window.speechSynthesis.cancel();

  if (!text) {
    showToast('No text selected!', 'error');
    return;
  }

  // Create speech utterance
  currentSpeech = new SpeechSynthesisUtterance(text);
  currentSpeech.lang = 'en-US';
  currentSpeech.rate = 1.0;
  currentSpeech.pitch = 1.0;
  currentSpeech.volume = 1.0;

  // Event handlers
  currentSpeech.onstart = () => {
    console.log('🔊 Started speaking');
    showToast('🔊 Reading text...', 'success');
  };

  currentSpeech.onend = () => {
    console.log('✓ Finished speaking');
    currentSpeech = null;
  };

  currentSpeech.onerror = (event) => {
    console.error('Speech error:', event);
    showToast('Speech error occurred', 'error');
    currentSpeech = null;
  };

  // Start speaking
  window.speechSynthesis.speak(currentSpeech);
};

const stopSpeaking = (): void => {
  if (window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
    showToast('🔇 Speech stopped', 'success');
  }
};

/**
 * Keyboard shortcut handler
 */
const handleKeyboardShortcut = (event: KeyboardEvent): void => {
  // Cmd+Shift+K - Format prompt
  if ((event.ctrlKey || event.metaKey) && event.shiftKey && (event.key === 'K' || event.key === 'k')) {
    event.preventDefault();
    console.log('→ Format shortcut triggered');
    formatPrompt();
    return;
  }

  // Cmd+Shift+V - Text to speech
  if ((event.ctrlKey || event.metaKey) && event.shiftKey && (event.key === 'V' || event.key === 'v')) {
    event.preventDefault();
    console.log('→ TTS shortcut triggered');
    
    // Get selected text
    const selectedText = window.getSelection()?.toString().trim();
    
    if (selectedText) {
      speakText(selectedText);
    } else {
      showToast('Please select some text first!', 'error');
    }
    return;
  }

  // Escape - Stop speaking
  if (event.key === 'Escape' && window.speechSynthesis.speaking) {
    event.preventDefault();
    stopSpeaking();
  }
};

/**
 * Initialize content script
 */
const init = (): void => {
  console.log('✓ AI Prompt Engineer loaded');
  console.log('  → Cmd+Shift+K: Format prompt');
  console.log('  → Cmd+Shift+V: Read selected text (TTS)');
  console.log('  → Escape: Stop reading');
  
  // Add keyboard listener
  document.addEventListener('keydown', handleKeyboardShortcut);
};

// Run initialization
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
