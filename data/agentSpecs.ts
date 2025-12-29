
import { AgentSpec } from '../types';

export const AGENT_SPECS: AgentSpec[] = [
  {
    id: "harvester-01",
    name: "Harvester Agent",
    role: "Discovery",
    objective: "Identify potential offer URLs from high-trust sources.",
    skills: ["Pattern Recognition", "API Polling", "RSS Monitoring", "Adaptive Scheduling"],
    tools: ["Jitter Scheduler", "Bloom Filter Dedupe", "Source Registry"],
    policies: [
      { name: "Rate Limit Respect", description: "Never exceed defined RPS per domain.", criticality: "HIGH" },
      { name: "Domain Allowlist", description: "Only crawl approved sources.", criticality: "MEDIUM" }
    ],
    safetyConstraints: ["Max 5000 URLs/day", "No Dark Web sources"],
    apiDependencies: ["Impact Radius API", "CJ Affiliate API", "Reddit API"],
    failureHandling: "Exponential Backoff (Base 2s)",
    loggingStrategy: "Log every discovered URL hash",
    metrics: ["urls_found", "api_latency", "duplicate_rate"],
    costOptimization: "Cache RSS feeds for 15m",
    humanReviewTriggers: ["New domain discovered", "Anomaly in URL pattern"],
    contract: {
      inputs: { "schedule_trigger": "CRON" },
      outputs: { "url_queue": "Redis List" },
      envVars: ["IMPACT_API_KEY", "CJ_API_KEY"]
    },
    downstreamAgents: ["scraper-01"],
    inputStreams: ["Optimizer Feedback", "Cron Schedule"]
  },
  {
    id: "scraper-01",
    name: "Scraper Agent",
    role: "Ingestion",
    objective: "Fetch raw HTML/Screenshot from target URLs without detection.",
    skills: ["Headless Browsing", "Anti-Fingerprinting", "Proxy Rotation"],
    tools: ["Playwright", "Residential Proxies", "Stealth Plugin"],
    policies: [
      { name: "Robots.txt", description: "Strict adherence to Disallow directives.", criticality: "HIGH" },
      { name: "Geo-Fencing", description: "Use US IPs for US offers.", criticality: "MEDIUM" }
    ],
    safetyConstraints: ["Timeout after 30s", "Max RAM 2GB per worker"],
    apiDependencies: ["BrightData / SmartProxy"],
    failureHandling: "Retry with new Proxy (Max 3)",
    loggingStrategy: "Trace ID per request",
    metrics: ["success_rate", "proxy_cost", "avg_latency"],
    costOptimization: "Spot Instances (Fargate)",
    humanReviewTriggers: ["Captcha Loop", "Cloudflare Block"],
    contract: {
      inputs: { "url": "string" },
      outputs: { "html_s3_key": "string" },
      envVars: ["PROXY_POOL_URL"]
    },
    downstreamAgents: ["parser-01"],
    inputStreams: ["Harvester Queue"]
  },
  {
    id: "parser-01",
    name: "Parser Agent",
    role: "Processing",
    objective: "Extract structured JSON offer data from raw unstructured HTML.",
    skills: ["NLP Extraction", "DOM Analysis", "Entity Recognition"],
    tools: ["Gemini 2.5 Flash", "Llama 3 (Fallback)", "BeautifulSoup"],
    policies: [
      { name: "Schema Strictness", description: "Reject if required fields missing.", criticality: "MEDIUM" }
    ],
    safetyConstraints: ["No PI Extraction", "Sanitize Scripts"],
    apiDependencies: ["Google Gemini API", "Groq API"],
    failureHandling: "Failover to Llama 3",
    loggingStrategy: "Log token usage per extraction",
    metrics: ["extraction_confidence", "token_usage"],
    costOptimization: "Use Flash model by default",
    humanReviewTriggers: ["Confidence < 0.7", "Unknown Currency"],
    contract: {
      inputs: { "html_s3_key": "string" },
      outputs: { "offer_json": "JSON" },
      envVars: ["GEMINI_API_KEY"]
    },
    downstreamAgents: ["validator-01"],
    inputStreams: ["Scraper Output"]
  },
  {
    id: "validator-01",
    name: "Validator Agent",
    role: "Verification",
    objective: "Verify the affiliate link redirects to the correct merchant page.",
    skills: ["Redirect Tracing", "Screenshot Analysis"],
    tools: ["Headless Chrome", "Link Tracer"],
    policies: [
      { name: "Domain Match", description: "Final URL must match merchant domain.", criticality: "HIGH" }
    ],
    safetyConstraints: ["Max 10 Redirects", "Detect Infinite Loops"],
    apiDependencies: ["SafeBrowsing API"],
    failureHandling: "Mark Offer as INVALID",
    loggingStrategy: "Log full redirect chain",
    metrics: ["valid_rate", "broken_links"],
    costOptimization: "Headless mode",
    humanReviewTriggers: ["Redirect mismatch", "404 Error"],
    contract: {
      inputs: { "affiliate_link": "string" },
      outputs: { "is_valid": "boolean" },
      envVars: []
    },
    downstreamAgents: ["compliance-01"],
    inputStreams: ["Parser Output"]
  },
  {
    id: "compliance-01",
    name: "Compliance Agent",
    role: "Safety",
    objective: "Ensure offer meets FTC guidelines and is not fraudulent.",
    skills: ["Risk Scoring", "TOS Analysis", "Keyword Scanning"],
    tools: ["Keyword Filter", "Fraud Model v2"],
    policies: [
      { name: "FTC Disclosure", description: "Ensure disclosure text exists.", criticality: "HIGH" },
      { name: "Anti-Scam", description: "Reject 'Get Rich Quick'.", criticality: "HIGH" }
    ],
    safetyConstraints: ["Block Adult/Gambling content"],
    apiDependencies: [],
    failureHandling: "Quarantine Offer",
    loggingStrategy: "Log all risk flags",
    metrics: ["risk_score", "auto_rejects"],
    costOptimization: "Regex before AI",
    humanReviewTriggers: ["Risk Score > 5", "New Merchant"],
    contract: {
      inputs: { "offer_json": "JSON" },
      outputs: { "compliance_status": "string" },
      envVars: ["BLOCKED_KEYWORDS_LIST"]
    },
    downstreamAgents: ["publisher-01"],
    inputStreams: ["Validator Output"]
  },
  {
    id: "publisher-01",
    name: "Publisher Agent",
    role: "Distribution",
    objective: "Generate SEO content and publish to the frontend/CMS.",
    skills: ["Copywriting", "SEO Optimization", "HTML Generation"],
    tools: ["Gemini Pro", "CMS API"],
    policies: [
      { name: "Disclosure Injection", description: "Append legal footer.", criticality: "HIGH" }
    ],
    safetyConstraints: ["No false claims"],
    apiDependencies: ["Wordpress API", "Next.js Revalidate"],
    failureHandling: "Retry Publish",
    loggingStrategy: "Log published URL",
    metrics: ["posts_published", "seo_score"],
    costOptimization: "Cache generated copy",
    humanReviewTriggers: ["Sentiment analysis fail"],
    contract: {
      inputs: { "validated_offer": "JSON" },
      outputs: { "public_url": "string" },
      envVars: ["CMS_API_KEY"]
    },
    downstreamAgents: ["tracking-01"],
    inputStreams: ["Compliance Output"]
  },
  {
    id: "tracking-01",
    name: "Tracking Agent",
    role: "Attribution",
    objective: "Record clicks and match them to conversions via webhooks.",
    skills: ["Event Stream Processing", "Identity Resolution"],
    tools: ["Redis", "Postgres", "FastAPI"],
    policies: [
      { name: "Privacy", description: "Hash all IPs.", criticality: "HIGH" }
    ],
    safetyConstraints: ["Do not store raw PII"],
    apiDependencies: ["Affiliate Webhooks"],
    failureHandling: "Buffer to Redis",
    loggingStrategy: "Structured Event Log",
    metrics: ["clicks", "conversions", "epc"],
    costOptimization: "Batch DB Inserts",
    humanReviewTriggers: ["Conversion spike > 200%"],
    contract: {
      inputs: { "http_request": "GET /clk" },
      outputs: { "redirect": "302" },
      envVars: ["REDIS_URL", "DB_URL"]
    },
    downstreamAgents: ["optimizer-01"],
    inputStreams: ["User Traffic", "Partner Traffic"]
  },
  {
    id: "partner-01",
    name: "Partner Agent",
    role: "Growth",
    objective: "Manage referral partners and calculate revenue share.",
    skills: ["Accounting", "Email Automation"],
    tools: ["Stripe Connect", "SMTP"],
    policies: [
      { name: "Payout Hold", description: "30 day clearing period.", criticality: "HIGH" }
    ],
    safetyConstraints: ["KYC Check"],
    apiDependencies: ["Stripe API"],
    failureHandling: "Manual Payout Queue",
    loggingStrategy: "Ledger Audit Trail",
    metrics: ["active_partners", "payout_volume"],
    costOptimization: "Monthly Batch Payouts",
    humanReviewTriggers: ["Payout > $500"],
    contract: {
      inputs: { "partner_id": "UUID" },
      outputs: { "ledger_entry": "SQL" },
      envVars: ["STRIPE_SECRET_KEY"]
    },
    downstreamAgents: ["tracking-01"],
    inputStreams: ["Partner Portal"]
  },
  {
    id: "optimizer-01",
    name: "Optimizer Agent",
    role: "Optimization",
    objective: "Analyze performance and tune the Harvester.",
    skills: ["Statistical Analysis", "A/B Testing"],
    tools: ["Scikit-Learn", "TimescaleDB"],
    policies: [
      { name: "Exploit vs Explore", description: "80% proven sources, 20% new.", criticality: "MEDIUM" }
    ],
    safetyConstraints: ["Min Sample Size 1000"],
    apiDependencies: [],
    failureHandling: "Default to Rule-Based",
    loggingStrategy: "Model versioning",
    metrics: ["lift", "ctr_improvement"],
    costOptimization: "Run nightly",
    humanReviewTriggers: ["Model Drift"],
    contract: {
      inputs: { "conversion_data": "SQL" },
      outputs: { "harvester_config": "JSON" },
      envVars: []
    },
    downstreamAgents: ["harvester-01"],
    inputStreams: ["Tracking Output"]
  }
];