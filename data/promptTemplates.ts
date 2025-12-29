
import { PromptTemplate } from '../types';

export const PROMPT_TEMPLATES: PromptTemplate[] = [
  {
    id: "extract-01",
    title: "Universal Offer Extraction",
    category: "EXTRACTION",
    agentRole: "Parser Agent",
    description: "Extracts structured offer data from raw HTML or unstructured text. Handles missing fields gracefully.",
    template: `You are an expert Data Extraction Agent. Your goal is to parse raw website content into a strict JSON format describing a promotional offer.

CONTEXT:
The input text is scraping from a merchant's landing page. It may contain navigation menus, footers, and irrelevant ads. Focus ONLY on the main promotional offer.

INPUT:
{{RAW_TEXT}}

TASK:
Extract the following fields:
1. title: A concise, attractive title for the offer (e.g., "Get $200 Bonus").
2. merchant: The brand name offering the deal.
3. payout_terms: The specific value user receives (e.g., "$50", "20%", "Free Trial").
4. expiration_date: ISO 8601 date (YYYY-MM-DD) if explicitly stated. Null otherwise.
5. redemption_steps: An array of strings (3-5 steps) summarizing how to claim it.
6. geo_restrictions: Array of country codes (e.g., ["US", "CA"]) if stated. Default to ["US"] if ambiguous but implies US.
7. is_new_user_only: Boolean. True if terms say "new customers" or "first time".

SELF-CORRECTION STEP:
Before outputting, check:
- Is the merchant clearly identifiable? If not, return null for merchant.
- Is this a "get rich quick" scam? If yes, set "is_scam_suspicion" to true.
- Did I hallucinate an expiration date? Only include if present in text.

OUTPUT JSON SCHEMA:
{
  "title": string,
  "merchant": string | null,
  "payout_terms": string,
  "expiration_date": string | null,
  "redemption_steps": string[],
  "geo_restrictions": string[],
  "is_new_user_only": boolean,
  "confidence_score": number (0.0 to 1.0)
}`,
    inputVariables: ["RAW_TEXT"],
    outputFormat: "JSON",
    selfCheckSteps: [
      "Verify merchant name exists in text.",
      "Ensure payout is numerical or clear value.",
      "Check for scam indicators."
    ],
    examples: [
      {
        input: "<h1>Chase Freedom Unlimited</h1><p>Earn an extra 1.5% on everything you buy (on up to $20,000 spent in the first year) - worth up to $300 cash back!</p><small>New cardmembers only. Offer expires 12/31/2024.</small>",
        output: `{
  "title": "Chase Freedom Unlimited - Up to $300 Cash Back",
  "merchant": "Chase",
  "payout_terms": "$300 Cash Back",
  "expiration_date": "2024-12-31",
  "redemption_steps": ["Apply for Chase Freedom Unlimited", "Spend $20,000 in first year", "Receive cashback automatically"],
  "geo_restrictions": ["US"],
  "is_new_user_only": true,
  "confidence_score": 0.98
}`
      },
      {
        input: "Welcome to my blog! Today I ate a sandwich.",
        output: `{
  "title": "Unknown",
  "merchant": null,
  "payout_terms": "N/A",
  "expiration_date": null,
  "redemption_steps": [],
  "geo_restrictions": [],
  "is_new_user_only": false,
  "confidence_score": 0.05
}`
      }
    ]
  },
  {
    id: "fraud-01",
    title: "Fraud & Risk Analysis",
    category: "COMPLIANCE",
    agentRole: "Compliance Agent",
    description: "Evaluates an offer for risk factors, TOS violations, and potential fraud.",
    template: `You are a Risk & Compliance Officer. Analyze the following offer metadata for safety, legality, and fraud potential.

OFFER DATA:
{{OFFER_JSON}}

RULES:
1. Multi-Accounting: Flag if the offer encourages creating multiple fake accounts.
2. High Payout Anomaly: Flag if payout is > $500 for simple tasks (likely scam).
3. Restricted Industries: Flag Gambling, Adult, or Crypto if strictness is HIGH.
4. Deception: Flag if "free" actually requires credit card with impossible cancellation.

TASK:
Produce a risk assessment.

OUTPUT JSON SCHEMA:
{
  "risk_score": number (0 = Safe, 100 = Fraud),
  "risk_level": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "flags": string[],
  "reasoning": string,
  "requires_manual_review": boolean
}`,
    inputVariables: ["OFFER_JSON"],
    outputFormat: "JSON",
    selfCheckSteps: [
      "Compare payout vs effort (e.g. $1000 for 5 mins = Scam).",
      "Check for prohibited keywords (casino, betting, crypto pump)."
    ],
    examples: [
      {
        input: `{"title": "Make $5000/day working from home!", "merchant": "BizOpp247", "payout_terms": "$5000", "redemption_steps": ["Buy our starter kit for $99"]}`,
        output: `{
  "risk_score": 95,
  "risk_level": "CRITICAL",
  "flags": ["UNREALISTIC_PAYOUT", "PAY_TO_PLAY", "GENERIC_MERCHANT"],
  "reasoning": "Offer promises unrealistic returns ($5000/day) and requires upfront payment ($99). Classic pyramid/biz-opp scam.",
  "requires_manual_review": true
}`
      }
    ]
  },
  {
    id: "content-01",
    title: "SEO Content Rewriter",
    category: "PUBLISHING",
    agentRole: "Publisher Agent",
    description: "Generates an engaging, compliant blog post for the offer.",
    template: `You are a professional Affiliate Marketing Copywriter. Write a blog post section for the following offer.

OFFER DETAILS:
{{OFFER_JSON}}

REQUIREMENTS:
1. Tone: Helpful, objective, and enthusiastic but professional.
2. Structure: 
   - Catchy Headline (H2)
   - "The Deal" (Summary of value)
   - "How to Get It" (Bulleted steps)
   - "Fine Print" (Key restrictions)
3. COMPLIANCE (CRITICAL):
   - You MUST include this exact phrase at the end: "Disclosure: This post contains affiliate links. We may earn a commission if you sign up."
   - Do NOT use words like "Free Money", "Loophole", or "Hack".

SELF-CHECK:
- Did I include the disclosure?
- Did I mention it's for new users only (if applicable)?

OUTPUT FORMAT:
Markdown text.`,
    inputVariables: ["OFFER_JSON"],
    outputFormat: "Markdown",
    selfCheckSteps: ["Verify disclosure presence.", "Check for banned keywords."],
    examples: [
      {
        input: `{"title": "Acme Bank $200 Bonus", "merchant": "Acme Bank", "payout_terms": "$200", "redemption_steps": ["Open Checking", "Direct Deposit $500"]}`,
        output: `## Acme Bank Checking Bonus: Get $200
        
Looking for a solid checking account bonus? Acme Bank is offering **$200 cash** to new customers who open a qualifying account.

### The Deal
Open a new checking account and set up qualifying direct deposits. This is a great way to earn extra cash for banking you likely do anyway.

### How to Get It
1. **Sign Up**: Use the link below to open your account.
2. **Deposit**: Set up a direct deposit of at least $500 within 60 days.
3. **Earn**: The $200 bonus is usually deposited within 30 days of meeting requirements.

### The Fine Print
- Available to new customers only.
- Account must remain open for 6 months to avoid early closure fees.

*Disclosure: This post contains affiliate links. We may earn a commission if you sign up.*`
      }
    ]
  },
  {
    id: "valid-01",
    title: "Redirect & Domain Validator",
    category: "VALIDATION",
    agentRole: "Validator Agent",
    description: "Logically verifies if a redirect chain ended at the expected merchant.",
    template: `You are a Technical Validator. Analyze the execution log of a headless browser trace to determine if the affiliate link is valid.

INPUT DATA:
- Target Merchant: {{MERCHANT_NAME}} (e.g., "NordVPN")
- Expected Domain: {{EXPECTED_DOMAIN}} (e.g., "nordvpn.com")
- Redirect Chain: {{REDIRECT_CHAIN_ARRAY}}
- Final URL: {{FINAL_URL}}
- HTTP Status: {{HTTP_STATUS}}

LOGIC:
1. Is HTTP Status 200? If not, Invalid.
2. Does the Final URL's hostname match (or is a subdomain of) the Expected Domain?
   - "checkout.nordvpn.com" matches "nordvpn.com" -> Valid.
   - "random-blog.com" does NOT match "nordvpn.com" -> Invalid (Broken Redirect).
3. Did the chain loop more than 10 times? -> Invalid (Loop).

OUTPUT JSON SCHEMA:
{
  "is_valid": boolean,
  "failure_reason": string | null ("DOMAIN_MISMATCH", "404_ERROR", "LOOP", etc),
  "final_destination_clean": string
}`,
    inputVariables: ["MERCHANT_NAME", "EXPECTED_DOMAIN", "REDIRECT_CHAIN_ARRAY", "FINAL_URL", "HTTP_STATUS"],
    outputFormat: "JSON",
    selfCheckSteps: ["Check subdomains carefully.", "Verify http status code."],
    examples: [
      {
        input: `Merchant: Uber, Expected: uber.com, Final: https://www.uber.com/us/en/eat/, Status: 200`,
        output: `{"is_valid": true, "failure_reason": null, "final_destination_clean": "uber.com"}`
      },
      {
        input: `Merchant: Uber, Expected: uber.com, Final: https://spam-site.net/offer-expired, Status: 200`,
        output: `{"is_valid": false, "failure_reason": "DOMAIN_MISMATCH", "final_destination_clean": "spam-site.net"}`
      }
    ]
  }
];
