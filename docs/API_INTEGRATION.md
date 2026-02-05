# API Integration Guide

This document covers integration with OpenRouter and future HuggingFace support.

## OpenRouter Integration (Primary)

### Why OpenRouter?

OpenRouter provides a unified API to access 100+ AI models with a single API key:

**Advantages:**
- ✅ Single API key for GPT-4, Claude, Llama, Mistral, etc.
- ✅ OpenAI-compatible API (easy migration)
- ✅ Pay-as-you-go pricing (no subscriptions)
- ✅ Built-in fallback support
- ✅ Usage analytics dashboard
- ✅ Free models available (Llama 3, Mixtral)

**Official Docs:** https://openrouter.ai/docs

---

## Getting Started with OpenRouter

### 1. Create Account
1. Visit [openrouter.ai](https://openrouter.ai)
2. Sign up (email or OAuth)
3. Verify email

### 2. Get API Key
1. Go to [openrouter.ai/keys](https://openrouter.ai/keys)
2. Click "Create Key"
3. Name it (e.g., "Prompt Formatter Extension")
4. Copy key (starts with `sk-or-v1-`)

### 3. Add Credits (Optional)
- Free models available (no credits needed)
- For GPT-4/Claude: Add $5-20 credits
- Payment via credit card or crypto

---

## API Implementation

### Base Configuration

```typescript
// src/background/background.ts

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

interface OpenRouterRequest {
  model: string;
  messages: Array<{ role: string; content: string }>;
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  stream?: boolean;
}

interface OpenRouterResponse {
  id: string;
  model: string;
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}
```

---

### Making API Calls

```typescript
async function formatWithOpenAI(
  text: string,
  apiKey: string,
  model: string = 'openai/gpt-4-turbo-preview'
): Promise<string> {
  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': chrome.runtime.getURL(''), // Optional: for analytics
      'X-Title': 'AI Prompt Engineer Extension', // Optional: for analytics
    },
    body: JSON.stringify({
      model: model,
      messages: [
        {
          role: 'system',
          content: PROMPT_ENGINEER_SYSTEM, // Your system prompt
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
    throw new Error(error.error?.message || `API Error: ${response.status}`);
  }

  const data: OpenRouterResponse = await response.json();
  return data.choices[0].message.content.trim();
}
```

---

### Error Handling

```typescript
async function formatWithOpenAI(text: string, apiKey: string): Promise<string> {
  try {
    const response = await fetch(OPENROUTER_API_URL, { ... });

    // Handle HTTP errors
    if (!response.ok) {
      const error = await response.json();
      
      switch (response.status) {
        case 401:
          throw new Error('Invalid API key. Please check your settings.');
        case 429:
          throw new Error('Rate limit exceeded. Please wait and try again.');
        case 402:
          throw new Error('Insufficient credits. Please add funds to OpenRouter.');
        case 500:
        case 503:
          throw new Error('OpenRouter service temporarily unavailable.');
        default:
          throw new Error(error.error?.message || 'Unknown API error');
      }
    }

    const data = await response.json();
    
    // Validate response structure
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid API response format');
    }

    return data.choices[0].message.content.trim();

  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error('Network error. Please check your internet connection.');
    }
    throw error;
  }
}
```

---

## Available Models

### Recommended Models for Prompt Engineering

| Model ID | Name | Quality | Speed | Cost | Notes |
|----------|------|---------|-------|------|-------|
| `openai/gpt-4-turbo-preview` | GPT-4 Turbo | ⭐⭐⭐⭐⭐ | Medium | $$ | Best quality, recommended |
| `openai/gpt-3.5-turbo` | GPT-3.5 | ⭐⭐⭐⭐ | Fast | $ | Good balance |
| `anthropic/claude-3-5-sonnet-20241022` | Claude 3.5 Sonnet | ⭐⭐⭐⭐⭐ | Medium | $$ | Excellent at prompts |
| `anthropic/claude-3-haiku` | Claude 3 Haiku | ⭐⭐⭐⭐ | Very Fast | $ | Fast & cheap |
| `meta-llama/llama-3-70b-instruct` | Llama 3 70B | ⭐⭐⭐⭐ | Fast | FREE | Best free option |
| `mistralai/mixtral-8x7b-instruct` | Mixtral 8x7B | ⭐⭐⭐ | Very Fast | FREE | Free & fast |

### Cost Breakdown

**Per 1,000 tokens (approximate):**

| Model | Input | Output | Avg Format Cost |
|-------|-------|--------|-----------------|
| GPT-4 Turbo | $0.01 | $0.03 | $0.02 |
| GPT-3.5 Turbo | $0.0005 | $0.0015 | $0.002 |
| Claude 3 Sonnet | $0.003 | $0.015 | $0.01 |
| Claude 3 Haiku | $0.00025 | $0.00125 | $0.001 |
| Llama 3 70B | FREE | FREE | $0 |

**Typical format:**
- Input: ~100-200 tokens (original prompt + system prompt)
- Output: ~200-500 tokens (formatted prompt)
- Total: ~300-700 tokens per format

---

## System Prompt

The quality of prompt enhancement depends heavily on your system prompt. Here's our optimized version:

```typescript
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

**Input:** "explain quantum computing"
**Output:** "Explain quantum computing in a comprehensive yet accessible way, targeting an audience with basic computer science knowledge but no physics background. 

Structure your explanation as follows:
1. **Core Concept** (200 words): What is quantum computing and how is it fundamentally different from classical computing?
2. **Key Principles** (300 words): Explain qubits, superposition, and entanglement using everyday analogies
3. **Practical Applications** (200 words): What problems can quantum computers solve better than classical computers?
4. **Current State** (150 words): Where is the technology today and what are the main challenges?

Use analogies and avoid heavy mathematical notation. Include 2-3 concrete examples to illustrate abstract concepts."

Now improve the user's prompt:`;
```

---

## Rate Limiting

### OpenRouter Limits

- **Free tier:** ~60 requests/minute per model
- **Paid tier:** ~180 requests/minute per model
- **Concurrent requests:** Max 10 simultaneous

### Implementation

```typescript
// Simple rate limiter
class RateLimiter {
  private queue: Array<() => Promise<any>> = [];
  private running = 0;
  private maxConcurrent = 3;
  private minDelay = 1000; // 1 second between requests

  async add<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          this.running++;
          const result = await fn();
          resolve(result);
        } catch (error) {
          reject(error);
        } finally {
          this.running--;
          setTimeout(() => this.process(), this.minDelay);
        }
      });
      this.process();
    });
  }

  private process() {
    if (this.running < this.maxConcurrent && this.queue.length > 0) {
      const fn = this.queue.shift();
      fn?.();
    }
  }
}

const rateLimiter = new RateLimiter();

// Usage
const result = await rateLimiter.add(() => formatWithOpenAI(text, apiKey));
```

---

## Streaming Support (Future Feature)

OpenRouter supports streaming responses for real-time formatting:

```typescript
async function* formatWithStreaming(text: string, apiKey: string) {
  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: { ... },
    body: JSON.stringify({
      model: 'openai/gpt-4-turbo-preview',
      messages: [...],
      stream: true, // Enable streaming
    }),
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split('\n').filter(line => line.trim() !== '');

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6);
        if (data === '[DONE]') return;

        try {
          const parsed = JSON.parse(data);
          const content = parsed.choices[0].delta.content;
          if (content) {
            yield content; // Yield each chunk
          }
        } catch (e) {
          // Skip invalid JSON
        }
      }
    }
  }
}

// Usage in content script
const chunks: string[] = [];
for await (const chunk of formatWithStreaming(text, apiKey)) {
  chunks.push(chunk);
  inputField.value = chunks.join(''); // Update in real-time
}
```

---

## HuggingFace Integration (Future)

### Setup

```typescript
const HUGGINGFACE_API_URL = 'https://api-inference.huggingface.co/models/';

async function formatWithHuggingFace(
  text: string,
  apiKey: string,
  model: string = 'meta-llama/Llama-2-70b-chat-hf'
): Promise<string> {
  const response = await fetch(`${HUGGINGFACE_API_URL}${model}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      inputs: `${PROMPT_ENGINEER_SYSTEM}\n\nUser prompt: ${text}\n\nImproved prompt:`,
      parameters: {
        max_new_tokens: 1000,
        temperature: 0.7,
        top_p: 0.95,
        return_full_text: false,
      },
    }),
  });

  const data = await response.json();
  return data[0].generated_text.trim();
}
```

### Available Models on HuggingFace

- `meta-llama/Llama-2-70b-chat-hf` - Free, good quality
- `mistralai/Mixtral-8x7B-Instruct-v0.1` - Free, fast
- `google/flan-t5-xxl` - Free, smaller

---

## Model Selection Strategy

### User Configuration

```typescript
// src/popup/Popup.tsx

const AVAILABLE_MODELS = [
  {
    id: 'openai/gpt-4-turbo-preview',
    name: 'GPT-4 Turbo',
    provider: 'openrouter',
    quality: 5,
    speed: 3,
    cost: 'medium',
    description: 'Best quality prompt engineering',
  },
  {
    id: 'openai/gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    provider: 'openrouter',
    quality: 4,
    speed: 5,
    cost: 'low',
    description: 'Fast and affordable',
  },
  {
    id: 'meta-llama/llama-3-70b-instruct',
    name: 'Llama 3 70B',
    provider: 'openrouter',
    quality: 4,
    speed: 4,
    cost: 'free',
    description: 'Free and high quality',
  },
];
```

---

## Testing API Integration

### Manual Testing

```bash
# Test OpenRouter API
curl -X POST https://openrouter.ai/api/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "model": "openai/gpt-3.5-turbo",
    "messages": [
      {"role": "user", "content": "Say hello"}
    ]
  }'
```

### Automated Testing

```typescript
// tests/api.test.ts

describe('OpenRouter API', () => {
  it('should format prompt successfully', async () => {
    const formatted = await formatWithOpenAI(
      'write about dogs',
      process.env.TEST_API_KEY!
    );
    
    expect(formatted).toBeTruthy();
    expect(formatted.length).toBeGreaterThan(50);
    expect(formatted).toContain('dog');
  });

  it('should handle invalid API key', async () => {
    await expect(
      formatWithOpenAI('test', 'invalid-key')
    ).rejects.toThrow('Invalid API key');
  });

  it('should handle rate limiting', async () => {
    // Make multiple rapid requests
    const promises = Array(10).fill(null).map(() =>
      formatWithOpenAI('test', apiKey)
    );
    
    await expect(Promise.all(promises)).resolves.not.toThrow();
  });
});
```

---

## Cost Tracking (Future Feature)

```typescript
interface UsageStats {
  totalRequests: number;
  totalTokens: number;
  totalCost: number;
  byModel: Record<string, {
    requests: number;
    tokens: number;
    cost: number;
  }>;
}

async function trackUsage(model: string, tokens: number) {
  const stats = await chrome.storage.local.get('usageStats');
  const cost = calculateCost(model, tokens);
  
  // Update stats
  const updated = {
    ...stats.usageStats,
    totalRequests: (stats.usageStats?.totalRequests || 0) + 1,
    totalTokens: (stats.usageStats?.totalTokens || 0) + tokens,
    totalCost: (stats.usageStats?.totalCost || 0) + cost,
  };
  
  await chrome.storage.local.set({ usageStats: updated });
}
```

---

This integration guide provides everything needed to connect your extension to OpenRouter and plan for future HuggingFace support.
