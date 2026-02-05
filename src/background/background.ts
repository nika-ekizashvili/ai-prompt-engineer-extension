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
const DEFAULT_MODEL = 'meta-llama/llama-3-70b-instruct';

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
  (request: FormatRequest, _sender, sendResponse: (response: FormatResponse) => void) => {
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
