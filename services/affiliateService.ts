import { AffiliateNetwork, ParsedOfferData } from '../types';

/**
 * Standardized adapter interface for Affiliate Networks
 */
interface NetworkAdapter {
  fetchOffers(config: AffiliateNetwork): Promise<ParsedOfferData[]>;
  validateLink(link: string): Promise<boolean>;
}

/**
 * Mock Adapter for Impact Radius API
 */
const ImpactAdapter: NetworkAdapter = {
  fetchOffers: async (config: AffiliateNetwork) => {
    // In a real app, this would use fetch() with config.apiKey
    console.log(`[ImpactAdapter] Connecting to Impact API with ID: ${config.publisherId}...`);
    
    // Simulate API latency
    await new Promise(resolve => setTimeout(resolve, 800));

    // Return mock data normalized to our schema
    return [
      {
        title: "Uber Eats - $25 First Order Promo",
        merchant: "Uber Eats",
        payout_terms: "$10.00 CPA",
        expiration_date: "2024-12-31",
        redemption_steps: ["Click link", "Install App", "Order > $25"],
        compliance_risk_score: 1,
        compliance_notes: "Standard CPA offer.",
        is_scam_suspicion: false,
        network_source: "IMPACT",
        raw_id: "IMP-10293"
      },
      {
        title: "Bluehost Hosting - 60% Off + Free Domain",
        merchant: "Bluehost",
        payout_terms: "$65.00 CPA",
        expiration_date: null,
        redemption_steps: ["Sign up for 12mo plan"],
        compliance_risk_score: 2,
        compliance_notes: "Requires purchase.",
        is_scam_suspicion: false,
        network_source: "IMPACT",
        raw_id: "IMP-55412"
      }
    ];
  },
  validateLink: async (link: string) => link.includes('impact.com')
};

/**
 * Mock Adapter for CJ Affiliate
 */
const CJAdapter: NetworkAdapter = {
  fetchOffers: async (config: AffiliateNetwork) => {
    console.log(`[CJAdapter] Connecting to CJ API...`);
    await new Promise(resolve => setTimeout(resolve, 1200));
    return [
      {
        title: "HelloFresh - 16 Free Meals + Free Shipping",
        merchant: "HelloFresh",
        payout_terms: "$20.00 CPA",
        expiration_date: "2024-11-30",
        redemption_steps: ["Subscribe to weekly plan"],
        compliance_risk_score: 1,
        compliance_notes: "Subscription required.",
        is_scam_suspicion: false,
        network_source: "CJ",
        raw_id: "CJ-998811"
      }
    ];
  },
  validateLink: async (link: string) => link.includes('cj.com') || link.includes('qksrv.net')
};

/**
 * Factory to get the correct adapter
 */
export const getAdapter = (networkName: string): NetworkAdapter => {
  switch (networkName) {
    case 'Impact': return ImpactAdapter;
    case 'CJ': return CJAdapter;
    // Fallback or other adapters
    default: return ImpactAdapter;
  }
};

/**
 * Main Service Function to Sync
 */
export const syncNetwork = async (network: AffiliateNetwork): Promise<ParsedOfferData[]> => {
  try {
    const adapter = getAdapter(network.name);
    const offers = await adapter.fetchOffers(network);
    return offers;
  } catch (error) {
    console.error(`Failed to sync ${network.name}`, error);
    throw error;
  }
};