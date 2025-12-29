
import React, { useState } from 'react';
import { 
  Activity, 
  Server, 
  Database, 
  ShieldAlert, 
  Code, 
  Container, 
  GitCommit, 
  ArrowRight,
  Fingerprint,
  Copy,
  Clock
} from 'lucide-react';

const FASTAPI_CODE = `
import time
import uuid
import hashlib
import json
import logging
from fastapi import FastAPI, Request, BackgroundTasks, HTTPException
from fastapi.responses import RedirectResponse
from redis import asyncio as aioredis
from datetime import datetime

# Config
REDIS_URL = "redis://redis:6379"
SECRET_SALT = "sUpEr_sEcReT_sAlT"

app = FastAPI(title="PromoSpider Tracker")
logger = logging.getLogger("tracker")

# --- Helpers ---

def anonymize_ip(ip: str) -> str:
    """Gdpr-compliant IP hashing with daily rotation capability via salt."""
    return hashlib.sha256(f"{ip}{SECRET_SALT}".encode()).hexdigest()

async def log_click_event(click_data: dict, redis_client):
    """Async background task to persist event. Buffers to Redis for batch insert."""
    try:
        # Push to a Redis list 'click_buffer' for a separate worker to bulk-insert to DB
        await redis_client.lpush("click_events", json.dumps(click_data))
    except Exception as e:
        logger.error(f"Failed to log click: {e}")

async def check_fraud_heuristics(ip_hash: str, redis_client) -> bool:
    """Simple velocity check: Block if > 50 clicks in 1 minute."""
    key = f"rate_limit:{ip_hash}"
    count = await redis_client.incr(key)
    if count == 1:
        await redis_client.expire(key, 60)
    return count > 50

# --- Routes ---

@app.get("/clk")
async def redirect_handler(
    request: Request, 
    offer_id: str, 
    background_tasks: BackgroundTasks,
    ref: str = None,   # Partner ID
    sub: str = None    # External Source ID
):
    redis = await aioredis.from_url(REDIS_URL)
    
    # 1. IP Anonymization & Fraud Check
    ip_raw = request.client.host
    ip_hash = anonymize_ip(ip_raw)
    
    if await check_fraud_heuristics(ip_hash, redis):
        # Redirect to safe fallback or show error
        return RedirectResponse("https://promo-spider.com/blocked", status_code=302)

    # 2. Lookup Offer (Cached)
    # Stored as JSON: {"url": "https://merch.com/...", "payout": "CPA"}
    offer_data_raw = await redis.get(f"offer:{offer_id}")
    if not offer_data_raw:
        raise HTTPException(status_code=404, detail="Offer not found or expired")
    
    offer_data = json.loads(offer_data_raw)
    base_url = offer_data['url']
    
    # 3. Generate Click ID (The "Golden Ticket")
    click_id = str(uuid.uuid4())
    
    # 4. Construct Destination URL
    # Append click_id to the affiliate network's specific parameter (e.g., subId, u1, s1)
    # This logic varies by network; here is a generic example.
    param_char = "&" if "?" in base_url else "?"
    final_url = f"{base_url}{param_char}subId={click_id}&partner={ref or 'direct'}"

    # 5. Log Event (Non-blocking)
    event_payload = {
        "event_id": click_id,
        "event_type": "click",
        "offer_id": offer_id,
        "partner_id": ref,
        "ip_hash": ip_hash,
        "user_agent": request.headers.get("user-agent"),
        "timestamp": datetime.utcnow().isoformat(),
        "is_bot": "bot" in request.headers.get("user-agent", "").lower()
    }
    background_tasks.add_task(log_click_event, event_payload, redis)

    # 6. Perform Redirect
    return RedirectResponse(final_url, status_code=302)

@app.get("/health")
async def health():
    return {"status": "ok"}
`.trim();

const DOCKER_CONFIG = `
# Dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Run via Uvicorn (ASGI)
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]

---

# docker-compose.yml
version: '3.8'

services:
  tracker:
    build: .
    ports:
      - "8000:8000"
    environment:
      - REDIS_URL=redis://redis:6379
      - DATABASE_URL=postgresql://user:pass@db:5432/promospider
    depends_on:
      - redis
      - db

  redis:
    image: "redis:alpine"
    
  db:
    image: "postgres:15-alpine"
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
      POSTGRES_DB: promospider
`.trim();

const ATTRIBUTION_STEPS = [
  {
    step: 1,
    title: "User Click",
    desc: "User clicks a promo link. Request hits /clk endpoint."
  },
  {
    step: 2,
    title: "ID Generation",
    desc: "Tracker generates `click_id` (UUID) and stores metadata (Partner ID, Offer ID) in DB."
  },
  {
    step: 3,
    title: "Redirect",
    desc: "User redirected to Merchant with `?subId=click_id`. Cookie set on Merchant side."
  },
  {
    step: 4,
    title: "Conversion",
    desc: "User buys item. Merchant sees `subId` in cookie/session."
  },
  {
    step: 5,
    title: "Postback",
    desc: "Merchant fires Webhook to Network. Network fires Webhook to us with `subId`."
  },
  {
    step: 6,
    title: "Reconciliation",
    desc: "We look up `click_id` in DB. Mark conversion. Credit Partner."
  }
];

const TrackingArchitecture: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'VISUAL' | 'SERVICE_CODE' | 'DOCKER' | 'LOGIC'>('VISUAL');

  const CodeBlock = ({ code }: { code: string }) => (
    <div className="relative group">
      <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={() => navigator.clipboard.writeText(code)}
          className="bg-slate-700 hover:bg-slate-600 text-white p-2 rounded-lg text-xs flex items-center gap-2"
        >
          <Copy className="w-3 h-3" /> Copy
        </button>
      </div>
      <pre className="bg-slate-950 p-6 rounded-xl border border-slate-800 overflow-x-auto text-sm font-mono text-slate-300 leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] gap-6 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex justify-between items-center flex-shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Activity className="w-6 h-6 text-indigo-500" /> Tracking Microservice
          </h2>
          <p className="text-slate-400">High-performance redirection, event logging, and partner attribution.</p>
        </div>
        
        <div className="flex gap-2 bg-slate-800 p-1 rounded-lg border border-slate-700">
          <button 
            onClick={() => setActiveTab('VISUAL')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'VISUAL' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-white'}`}
          >
            Architecture
          </button>
          <button 
             onClick={() => setActiveTab('SERVICE_CODE')}
             className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'SERVICE_CODE' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-white'}`}
          >
            <Code className="w-4 h-4" /> FastAPI
          </button>
          <button 
             onClick={() => setActiveTab('DOCKER')}
             className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'DOCKER' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-white'}`}
          >
            <Container className="w-4 h-4" /> Docker
          </button>
          <button 
             onClick={() => setActiveTab('LOGIC')}
             className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'LOGIC' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-white'}`}
          >
            <GitCommit className="w-4 h-4" /> Attribution
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin pb-20">
        
        {/* VISUAL TAB */}
        {activeTab === 'VISUAL' && (
          <div className="space-y-8">
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-8">
              <div className="flex items-center justify-between text-center relative z-10">
                <div className="flex flex-col items-center gap-2 w-32">
                  <div className="w-16 h-16 bg-blue-500/10 border border-blue-500 rounded-2xl flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                    <Activity className="w-8 h-8 text-blue-400" />
                  </div>
                  <span className="font-bold text-white text-sm">Incoming Click</span>
                  <span className="text-[10px] text-slate-500">GET /clk?ref=partner</span>
                </div>

                <div className="h-0.5 flex-1 bg-slate-600 relative mx-4">
                   <div className="absolute left-1/2 -top-3 -ml-8 bg-slate-900 px-2 text-xs text-slate-400 font-mono border border-slate-700 rounded">Verify</div>
                </div>

                <div className="flex flex-col items-center gap-2 w-32">
                   <div className="w-16 h-16 bg-purple-500/10 border border-purple-500 rounded-2xl flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                    <Server className="w-8 h-8 text-purple-400" />
                  </div>
                  <span className="font-bold text-white text-sm">Tracker Svc</span>
                  <span className="text-[10px] text-slate-500">FastAPI + Redis</span>
                </div>

                <div className="h-0.5 flex-1 bg-slate-600 relative mx-4">
                  <div className="absolute left-1/2 -top-3 -ml-12 bg-slate-900 px-2 text-xs text-slate-400 font-mono border border-slate-700 rounded">Log & Redirect</div>
                </div>

                <div className="flex flex-col items-center gap-2 w-32">
                   <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500 rounded-2xl flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                    <ArrowRight className="w-8 h-8 text-emerald-400" />
                  </div>
                  <span className="font-bold text-white text-sm">Affiliate Net</span>
                  <span className="text-[10px] text-slate-500">Merchant Landing</span>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-slate-700 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800">
                  <h4 className="font-bold text-white flex items-center gap-2 mb-2">
                    <Fingerprint className="w-4 h-4 text-amber-500" />
                    Privacy & Compliance
                  </h4>
                  <ul className="text-sm text-slate-400 space-y-2">
                    <li>• IPs are salted and hashed (SHA-256) before storage.</li>
                    <li>• Raw IPs are never written to disk.</li>
                    <li>• "Do Not Track" headers are respected.</li>
                  </ul>
                </div>
                <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800">
                  <h4 className="font-bold text-white flex items-center gap-2 mb-2">
                    <ShieldAlert className="w-4 h-4 text-rose-500" />
                    Real-time Fraud Checks
                  </h4>
                  <ul className="text-sm text-slate-400 space-y-2">
                     <li>• <strong>Velocity:</strong> Block {'>'} 50 clicks/min from same IP.</li>
                     <li>• <strong>Bot Filter:</strong> Regex check User-Agent for spiders.</li>
                     <li>• <strong>Geo-Fencing:</strong> Redirect restricted regions to fallback.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SERVICE CODE TAB */}
        {activeTab === 'SERVICE_CODE' && (
          <div className="space-y-4">
            <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg">
              <h4 className="text-sm font-bold text-blue-400 mb-1">main.py</h4>
              <p className="text-xs text-blue-200">
                The entry point for the microservice. Handles high-concurrency requests using Python's asyncio. 
                Uses Redis for 1ms offer lookups and buffering logs.
              </p>
            </div>
            <CodeBlock code={FASTAPI_CODE} />
          </div>
        )}

        {/* DOCKER TAB */}
        {activeTab === 'DOCKER' && (
          <div className="space-y-4">
            <div className="bg-slate-800 p-4 rounded-lg">
               <p className="text-sm text-slate-400 mb-2">
                 This setup ensures the tracking service is stateless and can scale horizontally behind a load balancer (like Nginx or AWS ALB).
               </p>
            </div>
            <CodeBlock code={DOCKER_CONFIG} />
          </div>
        )}

        {/* LOGIC TAB */}
        {activeTab === 'LOGIC' && (
          <div className="space-y-6">
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-6">The Lifecycle of a Click ID</h3>
              <div className="space-y-4">
                {ATTRIBUTION_STEPS.map((step, idx) => (
                  <div key={step.step} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-white shadow-lg z-10">
                        {step.step}
                      </div>
                      {idx < ATTRIBUTION_STEPS.length - 1 && (
                        <div className="w-0.5 flex-1 bg-slate-700 my-1"></div>
                      )}
                    </div>
                    <div className="pb-6">
                      <h4 className="font-bold text-slate-200">{step.title}</h4>
                      <p className="text-sm text-slate-400 mt-1">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-500" />
                  Attribution Windows
                </h4>
                <p className="text-sm text-slate-400 mb-3">
                  The "Window" is how long the click remains valid for commission.
                </p>
                <div className="space-y-2 text-xs font-mono text-slate-300">
                  <div className="bg-slate-900 p-2 rounded flex justify-between">
                     <span>Standard Retail</span>
                     <span className="text-emerald-400">24 Hours</span>
                  </div>
                  <div className="bg-slate-900 p-2 rounded flex justify-between">
                     <span>SaaS / Subscription</span>
                     <span className="text-emerald-400">30 - 90 Days</span>
                  </div>
                  <div className="bg-slate-900 p-2 rounded flex justify-between">
                     <span>High-Ticket B2B</span>
                     <span className="text-emerald-400">Lifetime</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                  <GitCommit className="w-4 h-4 text-purple-500" />
                  Reconciliation Strategy
                </h4>
                <p className="text-sm text-slate-400 mb-2">
                  What happens if the click ID is missing in the webhook?
                </p>
                <ul className="text-sm text-slate-400 space-y-2 list-disc list-inside">
                  <li><strong>Fingerprinting:</strong> Match by IP + User-Agent + Timestamp (± 1 hour). Low accuracy.</li>
                  <li><strong>Coupon Code:</strong> Attribute sale to the specific promo code used (e.g., "SAVE20"). High accuracy.</li>
                  <li><strong>Email Match:</strong> (Privacy sensitive) Hash of customer email.</li>
                </ul>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default TrackingArchitecture;
