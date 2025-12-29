import { ParsedOfferData, DeduplicationConfig } from '../types';

/**
 * Generates a canonical hash to uniquely identify an offer based on core attributes.
 * Strategy: SHA-256(Normalized Merchant + Normalized Title Keyterms + Normalized Payout)
 */
export const generateCanonicalHash = async (offer: ParsedOfferData): Promise<string> => {
  const normalize = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  // Extract numerical value from payout for normalization (e.g., "$50" -> "50")
  const payoutValue = offer.payout_terms.replace(/[^0-9.]/g, '');
  
  const fingerprint = `${normalize(offer.merchant)}|${normalize(offer.title).substring(0, 20)}|${payoutValue}`;
  
  // Use SubtleCrypto for hashing in the browser
  const msgBuffer = new TextEncoder().encode(fingerprint);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

/**
 * Calculates Levenshtein Distance between two strings.
 * Used for fuzzy title matching.
 */
const levenshteinDistance = (a: string, b: string): number => {
  const matrix = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) == a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          Math.min(
            matrix[i][j - 1] + 1, // insertion
            matrix[i - 1][j] + 1 // deletion
          )
        );
      }
    }
  }

  return matrix[b.length][a.length];
};

/**
 * Returns a similarity score between 0.0 and 1.0
 */
export const calculateSimilarity = (str1: string, str2: string): number => {
  const maxLength = Math.max(str1.length, str2.length);
  if (maxLength === 0) return 1.0;
  const distance = levenshteinDistance(str1.toLowerCase(), str2.toLowerCase());
  return 1.0 - (distance / maxLength);
};

interface DuplicationResult {
  isDuplicate: boolean;
  confidenceScore: number;
  reasons: string[];
}

/**
 * Advanced Deduplication Logic.
 * Calculates a weighted confidence score based on Merchant, Title, Payout, and Date.
 */
export const checkDuplicate = (
  newOffer: ParsedOfferData, 
  existingOffer: ParsedOfferData, 
  config: DeduplicationConfig
): DuplicationResult => {
  const reasons: string[] = [];
  let score = 0;

  // Weights
  const WEIGHT_MERCHANT = 0.35;
  const WEIGHT_TITLE = 0.45;
  const WEIGHT_PAYOUT = 0.20;

  // 1. Merchant Matching
  const merchantSim = calculateSimilarity(newOffer.merchant, existingOffer.merchant);
  if (config.matchMerchantExactly) {
    if (newOffer.merchant.toLowerCase() === existingOffer.merchant.toLowerCase()) {
      score += WEIGHT_MERCHANT;
      reasons.push(`Exact merchant match (${newOffer.merchant})`);
    } else {
      // If merchant doesn't match exactly and strict mode is on, it's likely not a dupe
      // However, if similarity is high (e.g. "Uber" vs "Uber Eats"), we might still consider it partially
      if (merchantSim > 0.8) {
        score += (WEIGHT_MERCHANT * 0.5); // Partial credit
        reasons.push(`High merchant similarity (${Math.round(merchantSim*100)}%)`);
      }
    }
  } else {
    // Fuzzy Merchant
    if (merchantSim > 0.7) {
      score += (merchantSim * WEIGHT_MERCHANT);
      reasons.push(`Fuzzy merchant match (${Math.round(merchantSim*100)}%)`);
    }
  }

  // 2. Title Similarity
  const titleSim = calculateSimilarity(newOffer.title, existingOffer.title);
  if (titleSim >= config.titleSimilarityThreshold) {
    score += (titleSim * WEIGHT_TITLE);
    reasons.push(`Title similarity high (${Math.round(titleSim*100)}%)`);
  } else if (titleSim > 0.5) {
     score += (titleSim * WEIGHT_TITLE * 0.5); // Partial credit
  }

  // 3. Payout Fuzzy Match
  const p1 = parseFloat(newOffer.payout_terms.replace(/[^0-9.]/g, ''));
  const p2 = parseFloat(existingOffer.payout_terms.replace(/[^0-9.]/g, ''));
  
  if (!isNaN(p1) && !isNaN(p2)) {
    const diff = Math.abs(p1 - p2);
    if (diff < 1.0) { // Within $1
      score += WEIGHT_PAYOUT;
      reasons.push(`Payout match ($${p1} vs $${p2})`);
    } else if (config.matchPayoutFuzzy && diff < 5.0) {
      score += (WEIGHT_PAYOUT * 0.5);
    }
  } else {
    // Non-numerical payout (e.g. "Free Trial")
    if (newOffer.payout_terms.toLowerCase() === existingOffer.payout_terms.toLowerCase()) {
      score += WEIGHT_PAYOUT;
      reasons.push("Payout text match");
    }
  }

  // 4. Expiration Date Check (Penalty Factor)
  // If dates are significantly different, they might be different offers (e.g., Nov promo vs Dec promo)
  if (newOffer.expiration_date && existingOffer.expiration_date) {
    if (newOffer.expiration_date !== existingOffer.expiration_date) {
      score = score * 0.8; // Reduce confidence by 20%
      reasons.push("Expiration dates differ");
    }
  }

  return {
    isDuplicate: score >= 0.75, // Threshold to declare duplicate
    confidenceScore: score,
    reasons
  };
};

/**
 * Legacy wrapper for backward compatibility
 */
export const isDuplicate = (
  newOffer: ParsedOfferData, 
  existingOffer: ParsedOfferData, 
  config: DeduplicationConfig
): boolean => {
  return checkDuplicate(newOffer, existingOffer, config).isDuplicate;
};