
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { ParsedOfferData, FallbackAIConfig } from "../types";
import { parseOfferWithFallback, generateCopyWithFallback } from "./fallbackService";

// Initialize AI with process.env.API_KEY as per guidelines
const getClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Hybrid AI Analysis.
 * Strategy: Primary (Gemini) -> Failover -> Secondary (Open Source / Llama 3).
 */
export const analyzeOfferText = async (
  rawText: string,
  fallbackConfig?: FallbackAIConfig
): Promise<ParsedOfferData> => {
  
  let primaryError: any = null;

  // 1. Try Primary Model (Gemini 3 Pro for complex extraction/reasoning)
  try {
    console.log("[AI Service] Attempting Primary (Gemini 3 Pro)...");
    const ai = getClient();

    const schema: Schema = {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING, description: "A catchy, SEO-friendly title for the offer." },
        merchant: { type: Type.STRING, description: "The name of the company or merchant." },
        payout_terms: { type: Type.STRING, description: "What the user gets (e.g., '$200 bonus', '20% off')." },
        expiration_date: { type: Type.STRING, description: "ISO date string or null if not found." },
        redemption_steps: { 
          type: Type.ARRAY, 
          items: { type: Type.STRING },
          description: "Simplified step-by-step instructions to redeem."
        },
        compliance_risk_score: { 
          type: Type.INTEGER, 
          description: "1 to 10 score. 10 is high risk (fraud/abuse likely)." 
        },
        compliance_notes: { type: Type.STRING, description: "Explanation of the risk score." },
        is_scam_suspicion: { type: Type.BOOLEAN, description: "True if the text sounds like a known scam pattern." }
      },
      required: ["title", "merchant", "payout_terms", "compliance_risk_score", "is_scam_suspicion", "redemption_steps"]
    };

    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `
        You are an Autonomous Validator Agent for PromoSpider.
        Analyze the following raw text from a potential promotional offer page.
        Extract the key structured data. 
        Pay special attention to compliance: flag anything that encourages multi-accounting, fraud, or violates standard terms.

        RAW TEXT:
        "${rawText}"
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: 0.1,
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response text from Gemini");
    
    const result = JSON.parse(text) as ParsedOfferData;
    return {
      ...result,
      _ai_provider: 'GEMINI',
      _ai_model_used: 'gemini-3-pro-preview'
    };

  } catch (error) {
    console.warn("[AI Service] Primary (Gemini) Failed. Initiating Failover sequence...", error);
    primaryError = error;
  }

  // 2. Try Fallback Model (Open Source)
  if (fallbackConfig && fallbackConfig.enabled && fallbackConfig.baseUrl) {
    console.info(`[AI Service] Switching to Fallback Provider: ${fallbackConfig.providerName}`);
    try {
      const result = await parseOfferWithFallback(fallbackConfig, rawText);
      console.log("[AI Service] Fallback Success.");
      return result;
    } catch (fallbackError) {
      console.error("[AI Service] Fallback AI Failed:", fallbackError);
      throw new Error(`AI Critical Failure. Primary: ${primaryError?.message || 'N/A'}. Secondary: ${fallbackError}`);
    }
  }

  throw new Error("AI Processing Failed: Gemini Service unavailable and no Fallback AI configured.");
};

/**
 * Generates marketing copy using Gemini 3 Flash for efficiency.
 */
export const generatePublicationCopy = async (
  offer: ParsedOfferData,
  fallbackConfig?: FallbackAIConfig
): Promise<string> => {
  
  // 1. Try Primary (Gemini 3 Flash for simple text tasks)
  try {
    const ai = getClient();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `
        You are a Publisher Agent. Write a short, engaging, and legally compliant blog post summary for this offer.
        Include a mandatory affiliate disclosure at the end.
        
        Offer Details:
        Merchant: ${offer.merchant}
        Deal: ${offer.payout_terms}
        Steps: ${offer.redemption_steps.join(', ')}
      `
    });
    return response.text || "Failed to generate copy.";
  } catch (error) {
    console.warn("Primary AI (Gemini) Copy Gen Failed:", error);
  }

  // 2. Try Fallback
  if (fallbackConfig && fallbackConfig.enabled && fallbackConfig.baseUrl) {
    return await generateCopyWithFallback(fallbackConfig, offer);
  }

  throw new Error("Copy Generation Failed: No available AI provider.");
};
