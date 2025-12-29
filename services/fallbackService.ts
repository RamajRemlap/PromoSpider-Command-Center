
import { ParsedOfferData, FallbackAIConfig } from '../types';

/**
 * Service to handle communication with Open Source models via OpenAI-compatible APIs.
 * Supports: Groq, Ollama, vLLM, LM Studio, HuggingFace Inference Endpoints.
 * Best Case Models: Llama 3, Mistral Large, Mixtral 8x7b.
 */

interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenAIRequest {
  model: string;
  messages: OpenAIMessage[];
  temperature?: number;
  max_tokens?: number;
  response_format?: { type: 'json_object' };
}

export const callOpenSourceLLM = async (
  config: FallbackAIConfig, 
  prompt: string, 
  systemInstruction: string,
  jsonMode: boolean = true
): Promise<string> => {
  if (!config.baseUrl) throw new Error("Fallback AI Base URL is missing");

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (config.apiKey) {
    headers['Authorization'] = `Bearer ${config.apiKey}`;
  }

  const payload: OpenAIRequest = {
    model: config.modelName || 'llama3-70b-8192',
    messages: [
      { role: 'system', content: systemInstruction },
      { role: 'user', content: prompt }
    ],
    temperature: 0.1,
  };

  // Enable JSON mode if supported by the provider (Groq/Ollama/vLLM usually support this)
  if (jsonMode) {
    payload.response_format = { type: 'json_object' };
  }

  try {
    // Normalize URL: Ensure it ends with /v1/chat/completions if not fully specified
    let url = config.baseUrl;
    if (!url.endsWith('/chat/completions')) {
        // Handle common base URL inputs like "http://localhost:11434" or "https://api.groq.com/openai/v1"
        url = url.endsWith('/') ? `${url}chat/completions` : `${url}/chat/completions`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Fallback AI Error (${response.status}): ${err}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "";

  } catch (error) {
    console.error("Fallback AI Request Failed:", error);
    throw error;
  }
};

export const parseOfferWithFallback = async (
  config: FallbackAIConfig,
  rawText: string
): Promise<ParsedOfferData> => {
  const systemPrompt = `You are an autonomous data extraction agent. 
  Extract structured data from the provided promotional text.
  Return ONLY valid JSON matching this schema:
  {
    "title": "string",
    "merchant": "string",
    "payout_terms": "string",
    "expiration_date": "YYYY-MM-DD or null",
    "redemption_steps": ["string"],
    "compliance_risk_score": number (1-10),
    "compliance_notes": "string",
    "is_scam_suspicion": boolean
  }`;

  const responseText = await callOpenSourceLLM(config, rawText, systemPrompt, true);
  
  try {
    const result = JSON.parse(responseText);
    // Enrich with provider metadata
    return {
      ...result,
      _ai_model_used: config.modelName,
      _ai_provider: 'FALLBACK_OPENSOURCE'
    };
  } catch (e) {
    throw new Error("Failed to parse JSON from Fallback AI response: " + responseText.substring(0, 100));
  }
};

export const generateCopyWithFallback = async (
  config: FallbackAIConfig,
  offer: ParsedOfferData
): Promise<string> => {
  const systemPrompt = "You are a professional affiliate marketing copywriter.";
  const userPrompt = `Write a short, engaging, and compliant blog post summary for this offer.
  Include a mandatory affiliate disclosure at the end.
  
  Offer Details:
  Merchant: ${offer.merchant}
  Deal: ${offer.payout_terms}
  Steps: ${offer.redemption_steps.join(', ')}`;

  return callOpenSourceLLM(config, userPrompt, systemPrompt, false);
};
