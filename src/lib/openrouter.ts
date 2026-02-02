// OpenRouter AI client for Mediator
// https://openrouter.ai/docs

export interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OpenRouterRequest {
  model: string;
  messages: OpenRouterMessage[];
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  stream?: boolean;
}

export interface OpenRouterResponse {
  id: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  model: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface OpenRouterError {
  error: {
    message: string;
    type: string;
    code: string;
  };
}

// Default model - can be overridden per request
// Popular free/cheap models on OpenRouter:
// - 'meta-llama/llama-3.1-8b-instruct:free' (free)
// - 'google/gemma-2-9b-it:free' (free)
// - 'mistralai/mistral-7b-instruct:free' (free)
// - 'anthropic/claude-3.5-sonnet' (paid but high quality)
// - 'openai/gpt-4o-mini' (cheap)
const DEFAULT_MODEL = process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.1-8b-instruct:free';

class OpenRouterClient {
  private apiKey: string | null;
  private baseUrl = 'https://openrouter.ai/api/v1';
  private siteUrl: string;
  private siteName: string;

  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY || null;
    this.siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    this.siteName = 'Mediator';
  }

  isConfigured(): boolean {
    return this.apiKey !== null && this.apiKey.length > 0;
  }

  async chat(
    messages: OpenRouterMessage[],
    options: {
      model?: string;
      maxTokens?: number;
      temperature?: number;
    } = {}
  ): Promise<string> {
    if (!this.apiKey) {
      throw new Error('OpenRouter API key not configured');
    }

    const { model = DEFAULT_MODEL, maxTokens = 512, temperature = 0.7 } = options;

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
        'HTTP-Referer': this.siteUrl,
        'X-Title': this.siteName,
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: maxTokens,
        temperature,
      } as OpenRouterRequest),
    });

    if (!response.ok) {
      const errorData = await response.json() as OpenRouterError;
      throw new Error(`OpenRouter API error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json() as OpenRouterResponse;

    if (!data.choices || data.choices.length === 0) {
      throw new Error('No response from OpenRouter');
    }

    return data.choices[0].message.content;
  }

  // Convenience method for single-turn prompts with system message
  async complete(
    systemPrompt: string,
    userPrompt: string,
    options: {
      model?: string;
      maxTokens?: number;
      temperature?: number;
    } = {}
  ): Promise<string> {
    return this.chat(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      options
    );
  }
}

// Singleton instance
export const openrouter = new OpenRouterClient();

// Helper to check if AI is available
export function isAIConfigured(): boolean {
  return openrouter.isConfigured();
}
