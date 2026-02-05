import React, { useState, useEffect } from 'react';

interface Settings {
  openrouterApiKey: string;
  selectedModel: string;
  huggingfaceApiKey?: string;
}

const AVAILABLE_MODELS = [
  { 
    id: 'meta-llama/llama-3-70b-instruct', 
    name: 'Llama 3 70B', 
    cost: 'Free',
    description: 'Best free option, great quality'
  },
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
];

export const Popup: React.FC = () => {
  const [settings, setSettings] = useState<Settings>({
    openrouterApiKey: '',
    selectedModel: 'meta-llama/llama-3-70b-instruct',
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
      <div className="bg-gradient-to-r from-primary to-primary/80 p-6 text-white">
        <h1 className="text-2xl font-bold mb-1">AI Prompt Engineer</h1>
        <p className="text-white/90 text-sm">
          Transform rough ideas into perfect prompts
        </p>
      </div>

      <div className="p-6 space-y-6">
        {/* OpenRouter API Key */}
        <div>
          <label className="block text-sm font-semibold text-text-primary mb-2">
            OpenRouter API Key <span className="text-error">*</span>
          </label>
          <div className="relative">
            <input
              type={showApiKey ? 'text' : 'password'}
              value={settings.openrouterApiKey}
              onChange={(e) => handleChange('openrouterApiKey', e.target.value)}
              placeholder="sk-or-v1-..."
              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
            />
            <button
              onClick={() => setShowApiKey(!showApiKey)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg"
              type="button"
            >
              {showApiKey ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
          <div className="mt-2 flex items-start gap-2 text-xs text-text-secondary">
            <span>ℹ️</span>
            <div>
              Get your free API key at{' '}
              <a
                href="https://openrouter.ai/keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline font-medium"
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
          <label className="block text-sm font-semibold text-text-primary mb-2">
            AI Model
          </label>
          <select
            value={settings.selectedModel}
            onChange={(e) => handleChange('selectedModel', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all cursor-pointer"
          >
            {AVAILABLE_MODELS.map((model) => (
              <option key={model.id} value={model.id}>
                {model.name} - {model.cost} cost
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-text-secondary">
            {AVAILABLE_MODELS.find(m => m.id === settings.selectedModel)?.description}
          </p>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={!settings.openrouterApiKey}
          className={`w-full py-3 px-4 rounded-lg font-semibold transition-all ${
            saved
              ? 'bg-success text-white'
              : settings.openrouterApiKey
              ? 'bg-primary text-white hover:bg-primary/90 hover:shadow-green hover:-translate-y-0.5'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {saved ? '✓ Settings Saved!' : 'Save Settings'}
        </button>

        {/* Usage Instructions */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <h3 className="font-semibold text-sm text-text-primary">How to Use:</h3>
          <ol className="text-sm text-text-secondary space-y-2 list-decimal list-inside">
            <li>Go to ChatGPT or any supported chat interface</li>
            <li>Type your rough prompt in the input field</li>
            <li className="flex items-center gap-1">
              Press{' '}
              <kbd className="px-2 py-1 bg-white border rounded text-xs font-mono">Cmd</kbd>
              {' + '}
              <kbd className="px-2 py-1 bg-white border rounded text-xs font-mono">Shift</kbd>
              {' + '}
              <kbd className="px-2 py-1 bg-white border rounded text-xs font-mono">K</kbd>
            </li>
            <li>Watch your prompt get enhanced by AI! ✨</li>
          </ol>
        </div>

        {/* Footer Links */}
        <div className="text-center text-xs text-text-secondary">
          <a 
            href="https://github.com/yourusername/prompt-formatter-extension" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors"
          >
            View on GitHub
          </a>
          {' • '}
          <a 
            href="https://openrouter.ai/docs" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors"
          >
            API Docs
          </a>
        </div>
      </div>
    </div>
  );
};
