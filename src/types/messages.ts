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
