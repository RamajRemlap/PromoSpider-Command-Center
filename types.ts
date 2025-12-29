

export enum AgentStatus {
  IDLE = 'IDLE',
  RUNNING = 'RUNNING',
  PAUSED = 'PAUSED',
  ERROR = 'ERROR',
}

export enum OfferStatus {
  DISCOVERED = 'DISCOVERED',
  VALIDATING = 'VALIDATING',
  COMPLIANCE_CHECK = 'COMPLIANCE_CHECK',
  PUBLISHED = 'PUBLISHED',
  REJECTED = 'REJECTED',
}

export interface Agent {
  id: string;
  name: string;
  role: string;
  status: AgentStatus;
  lastActive: string;
  logs: string[];
  tasksCompleted: number;
}

// --- New Deep Agent Spec Types ---

export interface AgentContract {
  inputs: Record<string, string>;
  outputs: Record<string, string>;
  envVars: string[];
}

export interface AgentPolicy {
  name: string;
  description: string;
  criticality: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface AgentSpec {
  id: string;
  name: string;
  role: string;
  objective: string;
  skills: string[];
  tools: string[];
  policies: AgentPolicy[];
  safetyConstraints: string[];
  apiDependencies: string[];
  failureHandling: string;
  loggingStrategy: string;
  metrics: string[];
  costOptimization: string;
  humanReviewTriggers: string[];
  contract: AgentContract;
  // Pipeline Connectivity
  downstreamAgents: string[]; 
  inputStreams: string[];
}

// -------------------------------

export interface Offer {
  id: string;
  title: string;
  merchant: string;
  description: string;
  payout: string;
  status: OfferStatus;
  complianceScore: number; // 0-100
  discoveredAt: string;
  affiliateLink?: string;
  tags: string[];
  canonicalHash?: string;
  confidenceScore?: number;
}

export interface ChartData {
  name: string;
  value: number;
  revenue?: number;
}

export interface ParsedOfferData {
  title: string;
  merchant: string;
  payout_terms: string;
  expiration_date: string | null;
  redemption_steps: string[];
  compliance_risk_score: number; // 1-10 (10 being high risk)
  compliance_notes: string;
  is_scam_suspicion: boolean;
  network_source?: string;
  raw_id?: string;
  // Metadata for the UI to show which model was used
  _ai_model_used?: string;
  _ai_provider?: 'GEMINI' | 'FALLBACK_OPENSOURCE';
}

export interface QueueMetric {
  queueName: string;
  pending: number;
  processing: number;
  completed: number;
  failed: number;
}

export interface SystemLog {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS';
  source: 'Harvester' | 'Scraper' | 'Validator' | 'System';
  message: string;
  metadata?: string;
}

export interface AffiliateNetwork {
  id: string;
  name: 'Impact' | 'CJ' | 'ShareASale' | 'Partnerize' | 'Amazon';
  apiKey: string;
  apiSecret?: string;
  publisherId?: string;
  status: 'ACTIVE' | 'PAUSED' | 'ERROR';
  lastSync: string;
}

// --- Scheduling Types ---

export type ScheduleStrategy = 'FIXED' | 'JITTER' | 'ADAPTIVE';

export interface HarvestSchedule {
  id: string;
  target: 'API_SYNC' | 'CRAWL_SPECIFIC' | 'CRAWL_DISCOVERY';
  cronExpression: string;
  jitterMinutes: number;
  enabled: boolean;
  strategy?: ScheduleStrategy;
  lastRun?: string;
  nextRun?: string;
}

export interface DeduplicationConfig {
  titleSimilarityThreshold: number; // 0.0 to 1.0 (e.g., 0.85)
  matchMerchantExactly: boolean;
  matchPayoutFuzzy: boolean;
}

export interface FallbackAIConfig {
  enabled: boolean;
  providerName: string; // e.g., "Llama 3 (Groq)" or "Local Ollama"
  baseUrl: string; // e.g. https://api.groq.com/openai/v1
  apiKey: string;
  modelName: string; // e.g. llama3-70b-8192
}

export interface SystemConfig {
  geminiApiKey: string;
  fallbackAi: FallbackAIConfig;
  proxyPool: string[];
  maxConcurrentScrapers: number;
  dailyBudgetUsd: number;
  complianceStrictness: 'LOW' | 'MEDIUM' | 'HIGH';
  blockedDomains: string[];
  affiliateNetworks: AffiliateNetwork[];
  harvestSchedules: HarvestSchedule[];
  deduplication: DeduplicationConfig;
}

// --- Prompt Library Types ---

export type PromptCategory = 'EXTRACTION' | 'COMPLIANCE' | 'PUBLISHING' | 'VALIDATION' | 'GROWTH';

export interface PromptExample {
  input: string;
  output: string;
}

export interface PromptTemplate {
  id: string;
  title: string;
  category: PromptCategory;
  agentRole: string;
  description: string;
  template: string;
  inputVariables: string[];
  outputFormat: string; // JSON or Text description
  examples: PromptExample[];
  selfCheckSteps: string[];
}

// --- Partner System Types ---

export interface Partner {
  id: string;
  name: string;
  email: string;
  status: 'PENDING' | 'ACTIVE' | 'SUSPENDED';
  apiKey: string;
  trackingPrefix: string;
  revSharePercentage: number; // 0.20 for 20%
  balance: number;
  joinedAt: string;
}

export interface Payout {
  id: string;
  partnerId: string;
  amount: number;
  status: 'PROCESSING' | 'PAID' | 'FAILED';
  periodStart: string;
  periodEnd: string;
}

export interface WidgetConfig {
  theme: 'LIGHT' | 'DARK';
  layout: 'GRID' | 'LIST';
  categories: string[];
  partnerId: string;
}

// --- Growth & Optimization Types ---

export interface Experiment {
  id: string;
  name: string;
  variantA: string; // Title/Copy A
  variantB: string; // Title/Copy B
  trafficSplit: number; // 0.5 = 50/50
  status: 'RUNNING' | 'CONCLUDED';
  stats: {
    impressionsA: number;
    conversionsA: number;
    impressionsB: number;
    conversionsB: number;
  };
  winner?: 'A' | 'B' | null;
}

export interface ScoringModel {
  weightPayout: number;
  weightConversionRate: number;
  weightCTR: number;
  weightNewness: number;
}

export interface PartnerQuality {
  id: string;
  name: string;
  conversionRate: number;
  reversalRate: number; // Chargebacks/Invalid
  qualityScore: number; // 0-100
  tier: 'ELITE' | 'STANDARD' | 'PROBATION';
}

// --- Autonomous Ops Types ---

export interface TaskDefinition {
  id: string;
  name: string;
  schedule: string; // Cron
  priority: 'P0' | 'P1' | 'P2';
  description: string;
  costEstimate: string; // e.g. "$0.05/run"
  jitter?: number;
}

export interface CycleEvent {
  time: string;
  task: string;
  type: 'CRAWL' | 'API' | 'MAINTENANCE';
}

// --- Sentient Types ---

export interface ThoughtProcess {
  id: string;
  agentId: string;
  timestamp: string;
  thought: string;
  context: string; // e.g., "Memory retrieval"
  confidence: number;
}

export interface MemoryVector {
  id: string;
  term: string;
  relevance: number;
  category: 'FACT' | 'RULE' | 'PATTERN';
}

export interface SentienceMetric {
  cognitiveLoad: number; // 0-100
  memoryUsage: number; // 0-100
  swarmConsensus: number; // 0-100
}

// --- Voice Types ---

export type VoiceCommandType = 
  | 'NAVIGATE' 
  | 'ACTIVATE_AUTONOMOUS' 
  | 'DEACTIVATE_AUTONOMOUS' 
  | 'SYSTEM_REPORT'
  | 'UNKNOWN';

export interface VoiceCommand {
  raw: string;
  type: VoiceCommandType;
  payload?: any;
}