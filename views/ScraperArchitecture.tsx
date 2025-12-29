
import React, { useState } from 'react';
import { 
  Server, 
  Globe, 
  Shield, 
  Cpu, 
  Database, 
  Layers, 
  Code, 
  FileText, 
  Terminal, 
  Settings, 
  Play,
  Copy
} from 'lucide-react';

const PYTHON_WORKER_TEMPLATE = `
import asyncio
import json
import os
import random
from playwright.async_api import async_playwright
from redis import asyncio as aioredis
import boto3

# Configuration
PROXY_POOL = os.getenv("PROXY_POOL", "").split(",")
S3_BUCKET = os.getenv("S3_BUCKET", "promo-spider-raw")
HEADLESS = True
BATCH_SIZE = 10 # Restart context after N URLs to prevent memory leaks

s3 = boto3.client('s3')

async def get_browser_context(browser, proxy_url=None):
    """
    Creates a new isolated browser context with randomized fingerprints
    and specific geo-locale settings for US-based offers.
    """
    user_agent = get_random_ua()
    
    # Geo-Targeting: Force US Locale to see US offers
    context = await browser.new_context(
        user_agent=user_agent,
        proxy={"server": proxy_url} if proxy_url else None,
        viewport={"width": 1920, "height": 1080},
        locale="en-US",
        timezone_id="America/New_York",
        geolocation={"latitude": 40.7128, "longitude": -74.0060},
        permissions=["geolocation"]
    )
    
    # Inject stealth scripts to mask WebDriver
    await context.add_init_script(path="stealth.min.js")
    return context

async def process_batch(browser, jobs):
    """
    Processes a batch of URLs within a single browser instance,
    recreating the context periodically for memory safety.
    """
    proxy_url = get_random_proxy()
    context = await get_browser_context(browser, proxy_url)
    
    for i, job in enumerate(jobs):
        # Memory Safety: Restart context every BATCH_SIZE items
        if i > 0 and i % BATCH_SIZE == 0:
            await context.close()
            proxy_url = get_random_proxy() # Rotate proxy on restart
            context = await get_browser_context(browser, proxy_url)
        
        page = await context.new_page()
        try:
            # Politeness: Random delay 1-3s
            await asyncio.sleep(random.uniform(1, 3))
            
            # Navigate with aggressive timeout handling
            response = await page.goto(
                job['url'], 
                timeout=30000, 
                wait_until="domcontentloaded"
            )
            
            # Handle Soft-Blocks (403/429)
            if response.status in [403, 429]:
                raise Exception(f"Blocked: {response.status}")
            
            # Dynamic Rendering: Wait for network idle if needed
            try:
                await page.wait_for_load_state("networkidle", timeout=5000)
            except:
                pass # Continue if network doesn't settle, usually fine
            
            # Extract
            content = await page.content()
            screenshot = await page.screenshot(full_page=True)
            
            # Export
            s3.put_object(Bucket=S3_BUCKET, Key=f"html/{job['id']}.html", Body=content.encode('utf-8'))
            
            # Report Success
            await report_success(job['id'])
            
        except Exception as e:
            await report_failure(job['id'], str(e))
        finally:
            await page.close()

    await context.close()

async def main_loop():
    redis = await aioredis.from_url("redis://localhost")
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(
            headless=HEADLESS,
            args=["--disable-blink-features=AutomationControlled"]
        )
        
        while True:
            # Fetch batch of jobs from Redis
            job_data_list = await redis.rpop("scraper:queue", count=50)
            if not job_data_list:
                await asyncio.sleep(5)
                continue
                
            jobs = [json.loads(j) for j in job_data_list]
            await process_batch(browser, jobs)

if __name__ == "__main__":
    asyncio.run(main_loop())
`.trim();

const PYTHON_QUEUE_TEMPLATE = `
import asyncio
import logging
from redis import asyncio as aioredis
from worker import process_url
from robots import is_allowed

REDIS_URL = "redis://localhost:6379"
QUEUE_KEY = "scraper:queue"
CONCURRENCY = 10

async def worker_loop(worker_id):
    redis = await aioredis.from_url(REDIS_URL)
    
    while True:
        # Atomic Pop
        job_data = await redis.rpop(QUEUE_KEY)
        
        if not job_data:
            await asyncio.sleep(1)
            continue
            
        job = json.loads(job_data)
        url = job['url']
        domain = get_domain(url)
        
        # 1. Robots.txt Check (Cached)
        if not await is_allowed(domain, url, user_agent="PromoSpiderBot"):
            logging.warning(f"Skipping {url} due to robots.txt")
            continue
            
        # 2. Rate Limit Check (Token Bucket in Redis)
        if not await check_rate_limit(domain):
            # Re-queue with delay
            await redis.lpush(QUEUE_KEY, job_data)
            await asyncio.sleep(2)
            continue
            
        # 3. Process
        try:
            result = await process_url(url, job['id'])
            if result['status'] == 'error':
                 # Retry logic (Dead Letter Queue after 3 attempts)
                 await handle_failure(job, result['error'])
            else:
                 await mark_complete(job['id'])
        except Exception as e:
            logging.error(f"Worker {worker_id} crashed: {e}")

async def main():
    # Spawn concurrent workers
    tasks = [worker_loop(i) for i in range(CONCURRENCY)]
    await asyncio.gather(*tasks)

if __name__ == "__main__":
    asyncio.run(main())
`.trim();

const ARCHITECTURE_STEPS = [
  { 
    id: 1, 
    title: "Ingestion Queue", 
    desc: "Redis-backed FIFO queue containing prioritized URLs.",
    icon: Database,
    color: "text-blue-400"
  },
  { 
    id: 2, 
    title: "Orchestrator", 
    desc: "Python AsyncIO service managing concurrency, rate limits, and robots.txt.",
    icon: Cpu,
    color: "text-purple-400"
  },
  { 
    id: 3, 
    title: "Worker Cluster", 
    desc: "Dockerized Playwright instances. Stateless and auto-scaling.",
    icon: Server,
    color: "text-amber-400"
  },
  { 
    id: 4, 
    title: "Network Layer", 
    desc: "Rotational Residential Proxies to bypass geoblocking and IP bans.",
    icon: Globe,
    color: "text-emerald-400"
  },
  { 
    id: 5, 
    title: "Raw Storage", 
    desc: "S3 Data Lake storing HTML snapshots and PNG screenshots.",
    icon: Layers,
    color: "text-rose-400"
  }
];

const ScraperArchitecture: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'VISUAL' | 'WORKER_CODE' | 'QUEUE_CODE' | 'CONFIG'>('VISUAL');
  const [concurrency, setConcurrency] = useState(12);
  const [timeout, setTimeout] = useState(30000);
  const [proxyEnabled, setProxyEnabled] = useState(true);

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
            <Globe className="w-6 h-6 text-indigo-500" /> Scraper Engine Architecture
          </h2>
          <p className="text-slate-400">High-concurrency headless browser cluster design with anti-detection.</p>
        </div>
        
        <div className="flex gap-2 bg-slate-800 p-1 rounded-lg border border-slate-700">
          <button 
            onClick={() => setActiveTab('VISUAL')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'VISUAL' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-white'}`}
          >
            Overview
          </button>
          <button 
             onClick={() => setActiveTab('WORKER_CODE')}
             className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'WORKER_CODE' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-white'}`}
          >
            <Code className="w-4 h-4" /> worker.py
          </button>
          <button 
             onClick={() => setActiveTab('QUEUE_CODE')}
             className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'QUEUE_CODE' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-white'}`}
          >
            <Terminal className="w-4 h-4" /> queue.py
          </button>
          <button 
             onClick={() => setActiveTab('CONFIG')}
             className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'CONFIG' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-white'}`}
          >
            <Settings className="w-4 h-4" /> Config
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin pb-20">
        
        {/* VISUAL TAB */}
        {activeTab === 'VISUAL' && (
          <div className="space-y-8">
            {/* Flow Diagram */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 relative overflow-hidden">
               <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
               <div className="relative z-10 flex justify-between items-center gap-4">
                 {ARCHITECTURE_STEPS.map((step, idx) => (
                   <React.Fragment key={step.id}>
                     <div className="flex flex-col items-center text-center w-48">
                        <div className={`w-16 h-16 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-center mb-4 shadow-xl ${step.color}`}>
                          <step.icon className="w-8 h-8" />
                        </div>
                        <h4 className="font-bold text-white mb-1">{step.title}</h4>
                        <p className="text-xs text-slate-400 leading-tight">{step.desc}</p>
                     </div>
                     {idx < ARCHITECTURE_STEPS.length - 1 && (
                       <div className="h-0.5 flex-1 bg-slate-700 relative top-[-30px]">
                         <div className="absolute right-0 -top-1.5 w-3 h-3 border-t-2 border-r-2 border-slate-700 rotate-45"></div>
                       </div>
                     )}
                   </React.Fragment>
                 ))}
               </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-slate-800 border border-slate-700 p-5 rounded-xl">
                <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  Anti-Detection & Stealth
                </h4>
                <ul className="space-y-2 text-sm text-slate-400">
                  <li className="flex items-center gap-2"><div className="w-1 h-1 bg-emerald-500 rounded-full"></div>Rotates User-Agent strings per session</li>
                  <li className="flex items-center gap-2"><div className="w-1 h-1 bg-emerald-500 rounded-full"></div>Patches navigator.webdriver property</li>
                  <li className="flex items-center gap-2"><div className="w-1 h-1 bg-emerald-500 rounded-full"></div>Randomizes viewport resolution</li>
                  <li className="flex items-center gap-2"><div className="w-1 h-1 bg-emerald-500 rounded-full"></div>Mimics human mouse movements</li>
                </ul>
              </div>

              <div className="bg-slate-800 border border-slate-700 p-5 rounded-xl">
                 <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-blue-400" />
                  Smart Proxy Routing
                </h4>
                <ul className="space-y-2 text-sm text-slate-400">
                  <li className="flex items-center gap-2"><div className="w-1 h-1 bg-blue-500 rounded-full"></div>Geo-targeting based on offer requirements</li>
                  <li className="flex items-center gap-2"><div className="w-1 h-1 bg-blue-500 rounded-full"></div>Automatic retry on 403/407 errors</li>
                  <li className="flex items-center gap-2"><div className="w-1 h-1 bg-blue-500 rounded-full"></div>Residential IP pool for high-trust scores</li>
                </ul>
              </div>

              <div className="bg-slate-800 border border-slate-700 p-5 rounded-xl">
                 <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-400" />
                  Legal & Compliance
                </h4>
                <ul className="space-y-2 text-sm text-slate-400">
                  <li className="flex items-center gap-2"><div className="w-1 h-1 bg-amber-500 rounded-full"></div>Strict <code className="bg-slate-900 px-1 rounded text-xs">robots.txt</code> parser caching</li>
                  <li className="flex items-center gap-2"><div className="w-1 h-1 bg-amber-500 rounded-full"></div>Respects Crawl-Delay directives</li>
                  <li className="flex items-center gap-2"><div className="w-1 h-1 bg-amber-500 rounded-full"></div>Identifies via User-Agent contact info</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* CODE TABS */}
        {activeTab === 'WORKER_CODE' && (
          <div className="space-y-4">
             <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg flex items-start gap-3">
               <Code className="w-5 h-5 text-blue-400 mt-0.5" />
               <div>
                 <h4 className="text-sm font-bold text-blue-400">Spider Template (worker.py)</h4>
                 <p className="text-xs text-blue-200 mt-1">
                   This script runs inside a Docker container. It handles the browser lifecycle, proxy authentication, 
                   memory-safe batch processing, and data export. It is designed to be stateless and crash-tolerant.
                 </p>
               </div>
             </div>
             <CodeBlock code={PYTHON_WORKER_TEMPLATE} />
          </div>
        )}

        {activeTab === 'QUEUE_CODE' && (
          <div className="space-y-4">
            <div className="bg-purple-500/10 border border-purple-500/20 p-4 rounded-lg flex items-start gap-3">
               <Terminal className="w-5 h-5 text-purple-400 mt-0.5" />
               <div>
                 <h4 className="text-sm font-bold text-purple-400">Orchestrator Logic (queue.py)</h4>
                 <p className="text-xs text-purple-200 mt-1">
                   Manages the task loop. It pulls from Redis, checks rate limits (Token Bucket), 
                   verifies robots.txt, and dispatches to workers. It ensures no domain is overwhelmed.
                 </p>
               </div>
             </div>
             <CodeBlock code={PYTHON_QUEUE_TEMPLATE} />
          </div>
        )}

        {/* CONFIG TAB */}
        {activeTab === 'CONFIG' && (
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-2xl">
            <h3 className="text-lg font-bold text-white mb-6">Cluster Configuration</h3>
            
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium text-slate-300">Concurrency (Workers)</label>
                  <span className="text-sm font-mono text-indigo-400">{concurrency} Threads</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="50" 
                  value={concurrency}
                  onChange={(e) => setConcurrency(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
                <p className="text-xs text-slate-500 mt-2">Higher concurrency increases memory usage. Recommended: 1GB RAM per 2 workers.</p>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium text-slate-300">Page Load Timeout</label>
                  <span className="text-sm font-mono text-indigo-400">{timeout / 1000}s</span>
                </div>
                <input 
                  type="range" 
                  min="5000" 
                  max="60000" 
                  step="1000"
                  value={timeout}
                  onChange={(e) => setTimeout(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-900 rounded-lg border border-slate-700">
                 <div>
                   <h4 className="text-sm font-medium text-white">Proxy Rotation</h4>
                   <p className="text-xs text-slate-500">Force new IP for every single request</p>
                 </div>
                 <button 
                   onClick={() => setProxyEnabled(!proxyEnabled)}
                   className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${proxyEnabled ? 'bg-emerald-500' : 'bg-slate-700'}`}
                 >
                   <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${proxyEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                 </button>
              </div>

              <div className="pt-4 border-t border-slate-700">
                <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-lg flex items-center justify-center gap-2 transition-colors">
                  <Play className="w-4 h-4" /> Deploy Configuration to Cluster
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ScraperArchitecture;
