
import React, { useState } from 'react';
import { 
  FileCode, 
  Terminal as TerminalIcon, 
  Database, 
  ShieldCheck, 
  Download, 
  Copy, 
  CheckCircle,
  Layout,
  Server,
  Key
} from 'lucide-react';
import { PROMPT_TEMPLATES } from '../data/promptTemplates';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const ARTIFACTS = {
  REQUIREMENTS: `
fastapi==0.109.0
uvicorn==0.27.0
sqlalchemy==2.0.25
alembic==1.13.1
asyncpg==0.29.0
redis==5.0.1
playwright==1.41.1
boto3==1.34.23
google-generativeai==0.3.2
pydantic-settings==2.1.0
python-jose==3.3.0
stripe==7.1.0
prometheus-client==0.19.0
sentry-sdk==1.40.0
`.trim(),

  ENV_EXAMPLE: `
# --- Core ---
ENV=development
DEBUG=true
LOG_LEVEL=INFO

# --- Database ---
DATABASE_URL=postgresql://user:pass@localhost:5432/promospider
REDIS_URL=redis://localhost:6379/0

# --- AI & Extraction ---
GEMINI_API_KEY=sk_...

# --- Security ---
SECRET_KEY=change_this_to_a_secure_random_string
ACCESS_TOKEN_EXPIRE_MINUTES=1440
CORS_ORIGINS=["http://localhost:3000"]

# --- Infrastructure ---
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1
S3_BUCKET_RAW=promo-spider-raw

# --- Scraper ---
PROXY_POOL=http://u:p@host1:port,http://u:p@host2:port
MAX_CONCURRENCY=10

# --- Payments ---
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
`.trim(),

  CONFIG_YAML: `
system:
  name: "PromoSpider"
  version: "1.0.0"

compliance:
  strictness: "HIGH"
  blocked_domains:
    - "scam-site.com"
    - "phishing.org"
  prohibited_keywords:
    - "hack"
    - "loophole"
    - "free money"
    - "crypto pump"

scraping:
  user_agent_rotation: true
  min_delay_seconds: 2
  max_delay_seconds: 10
  timeout_seconds: 30

affiliates:
  impact:
    enabled: true
    sync_interval_minutes: 60
  cj:
    enabled: true
    sync_interval_minutes: 240
`.trim(),

  FASTAPI_MAIN: `
import logging
from fastapi import FastAPI, BackgroundTasks
from contextlib import asynccontextmanager
from database import init_db
from routers import tracking, partners, webhooks

logger = logging.getLogger("promospider")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting up PromoSpider Engine...")
    await init_db()
    yield
    logger.info("Shutting down...")

app = FastAPI(title="PromoSpider API", lifespan=lifespan)

# Routers
app.include_router(tracking.router, prefix="/trk", tags=["Tracking"])
app.include_router(partners.router, prefix="/api/v1/partners", tags=["Partners"])
app.include_router(webhooks.router, prefix="/webhooks", tags=["Webhooks"])

@app.get("/health")
async def health_check():
    return {"status": "ok", "version": "1.0.0"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
`.trim(),

  WORKER_PY: `
import asyncio
import os
from playwright.async_api import async_playwright
from redis import asyncio as aioredis
import boto3

S3 = boto3.client('s3')
BUCKET = os.getenv("S3_BUCKET_RAW")

async def scrape_task(url: str, job_id: str):
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(user_agent="Mozilla/5.0...")
        page = await context.new_page()
        
        try:
            await page.goto(url, timeout=30000, wait_until="domcontentloaded")
            content = await page.content()
            
            # Save to S3
            S3.put_object(Bucket=BUCKET, Key=f"html/{job_id}.html", Body=content)
            
            return {"status": "success"}
        except Exception as e:
            return {"status": "error", "error": str(e)}
        finally:
            await browser.close()
`.trim(),

  DB_SCHEMA: `
-- Core Offers
CREATE TABLE offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    merchant VARCHAR(255) NOT NULL,
    payout_terms VARCHAR(100),
    affiliate_link TEXT,
    status VARCHAR(50) DEFAULT 'DISCOVERED',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tracking
CREATE TABLE clicks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    offer_id UUID REFERENCES offers(id),
    partner_id UUID, -- Nullable (organic)
    ip_hash VARCHAR(64) NOT NULL,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Financials
CREATE TABLE conversions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    click_id UUID REFERENCES clicks(id),
    amount DECIMAL(10,2),
    commission DECIMAL(10,2),
    status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, APPROVED, REVERSED
    created_at TIMESTAMPTZ DEFAULT NOW()
);
`.trim(),

  SETUP_GUIDE: `
# PromoSpider Development Setup

1. **Prerequisites**
   - Python 3.11+
   - Docker & Docker Compose
   - PostgreSQL 15+
   - Redis 7+

2. **Environment**
   \`\`\`bash
   cp .env.example .env
   # Edit .env with your keys
   \`\`\`

3. **Install Deps**
   \`\`\`bash
   python -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   \`\`\`

4. **Start Infrastructure**
   \`\`\`bash
   docker-compose up -d db redis
   alembic upgrade head
   \`\`\`

5. **Run Services**
   - API: \`uvicorn main:app --reload\`
   - Worker: \`python worker.py\`
`.trim(),

  COMPLIANCE: `
# Legal & Safety Manifesto

1. **FTC Disclosure**: All outgoing links MUST be accompanied by a "clear and conspicuous" affiliate disclosure.
2. **Data Privacy (GDPR/CCPA)**: 
   - Never store raw IP addresses. Hash them immediately with a salt.
   - PII (emails) must be encrypted at rest.
3. **Anti-Fraud**:
   - Do not encourage "multi-accounting".
   - Do not bypass paywalls or CAPTCHAs illegally.
   - Respect \`robots.txt\` and \`Crawl-Delay\`.
4. **Terms of Service**:
   - Only scrape public data.
   - Verify merchant TOS allows "incentivized traffic" before promoting.
`.trim()
};

const EngineerExport: React.FC = () => {
  const [activeTab, setActiveTab] = useState('CODE');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const ArtifactBlock = ({ title, content, id, lang = 'bash' }: { title: string, content: string, id: string, lang?: string }) => (
    <div className="bg-black border border-slate-800 overflow-hidden mb-6 group hover:border-slate-600 transition-colors">
      <div className="px-4 py-2 bg-slate-900/50 border-b border-slate-800 flex justify-between items-center">
        <h3 className="text-xs font-bold text-slate-300 flex items-center gap-2 font-mono uppercase">
          {lang === 'python' ? <FileCode className="w-3 h-3 text-blue-400" /> : 
           lang === 'sql' ? <Database className="w-3 h-3 text-purple-400" /> :
           <TerminalIcon className="w-3 h-3 text-slate-500" />}
          {title}
        </h3>
        <Button 
          variant="ghost"
          size="sm"
          onClick={() => handleCopy(id, content)}
          className="text-slate-500 hover:text-white"
        >
          {copiedKey === id ? <CheckCircle className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          {copiedKey === id ? 'COPIED' : 'COPY'}
        </Button>
      </div>
      <pre className="p-4 overflow-x-auto text-[10px] font-mono text-slate-300 leading-relaxed bg-black/50 scrollbar-thin">
        <code>{content}</code>
      </pre>
    </div>
  );

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] gap-6 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex justify-between items-center flex-shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2 font-rajdhani uppercase">
            <Download className="w-6 h-6 text-indigo-500" /> Engineer Export
          </h2>
          <p className="text-slate-400">Production artifacts and source code generation.</p>
        </div>
        
        <div className="flex gap-1 bg-slate-900 p-1 border border-slate-800">
          <Button variant={activeTab === 'CODE' ? 'primary' : 'ghost'} size="sm" onClick={() => setActiveTab('CODE')}>Codebase</Button>
          <Button variant={activeTab === 'DATA' ? 'primary' : 'ghost'} size="sm" onClick={() => setActiveTab('DATA')}>Data</Button>
          <Button variant={activeTab === 'DOCS' ? 'primary' : 'ghost'} size="sm" onClick={() => setActiveTab('DOCS')}>Documentation</Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin pb-20">
        
        {/* CODE TAB */}
        {activeTab === 'CODE' && (
          <div className="max-w-4xl mx-auto">
            <ArtifactBlock title="requirements.txt" content={ARTIFACTS.REQUIREMENTS} id="reqs" />
            <ArtifactBlock title=".env.example" content={ARTIFACTS.ENV_EXAMPLE} id="env" />
            <ArtifactBlock title="config.yml" content={ARTIFACTS.CONFIG_YAML} id="conf" lang="yaml" />
            <ArtifactBlock title="main.py (FastAPI Service)" content={ARTIFACTS.FASTAPI_MAIN} id="api" lang="python" />
            <ArtifactBlock title="worker.py (Scraper)" content={ARTIFACTS.WORKER_PY} id="worker" lang="python" />
            <ArtifactBlock title="schema.sql (PostgreSQL)" content={ARTIFACTS.DB_SCHEMA} id="sql" lang="sql" />
          </div>
        )}

        {/* DATA TAB */}
        {activeTab === 'DATA' && (
          <div className="max-w-4xl mx-auto">
             <Card className="mb-6">
               <h3 className="font-bold text-white mb-2 font-rajdhani uppercase">Prompt Library JSON</h3>
               <p className="text-xs text-slate-400 mb-4 font-mono">
                 Full export of current system prompts for DB seeding.
               </p>
               <ArtifactBlock 
                 title="prompts.json" 
                 content={JSON.stringify(PROMPT_TEMPLATES, null, 2)} 
                 id="prompts" 
                 lang="json" 
               />
             </Card>
          </div>
        )}

        {/* DOCS TAB */}
        {activeTab === 'DOCS' && (
          <div className="max-w-4xl mx-auto grid grid-cols-1 gap-6">
             <ArtifactBlock title="Development Setup Guide" content={ARTIFACTS.SETUP_GUIDE} id="setup" lang="markdown" />
             
             <Card noPadding>
               <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex items-center gap-2">
                 <ShieldCheck className="w-4 h-4 text-emerald-500" />
                 <h3 className="text-xs font-bold text-slate-300 font-mono uppercase">Safety & Compliance</h3>
               </div>
               <div className="p-6">
                 <pre className="whitespace-pre-wrap font-sans text-xs text-slate-300 leading-relaxed">
                   {ARTIFACTS.COMPLIANCE}
                 </pre>
               </div>
             </Card>
          </div>
        )}

      </div>
    </div>
  );
};

export default EngineerExport;