import React, { useState } from 'react';
import { 
  Users, 
  Code, 
  DollarSign, 
  Database, 
  Layout, 
  Copy, 
  CheckCircle,
  TrendingUp,
  CreditCard,
  ShieldCheck,
  Server
} from 'lucide-react';

const SQL_SCHEMA = `
-- 1. Partners Table
CREATE TABLE partners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    api_key VARCHAR(64) UNIQUE, -- sk_live_...
    tracking_prefix VARCHAR(10) UNIQUE, -- e.g. "REF123"
    rev_share_pct DECIMAL(5,4) DEFAULT 0.2000, -- 20% split
    balance DECIMAL(12,2) DEFAULT 0.00,
    status VARCHAR(20) DEFAULT 'PENDING_KYC', -- ACTIVE, SUSPENDED
    min_payout DECIMAL(10,2) DEFAULT 50.00,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Partner Referral Events
-- Links clicks to partners for attribution
CREATE TABLE referral_clicks (
    id UUID PRIMARY KEY,
    partner_id UUID REFERENCES partners(id),
    offer_id UUID REFERENCES offers(id),
    visitor_ip_hash VARCHAR(64),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Earnings Ledger (Double Entry Lite)
CREATE TABLE payout_ledger (
    id UUID PRIMARY KEY,
    partner_id UUID REFERENCES partners(id),
    conversion_id UUID REFERENCES conversions(id),
    amount DECIMAL(10,2), -- The partner's cut
    transaction_type VARCHAR(20), -- 'COMMISSION', 'PAYOUT', 'ADJUSTMENT'
    status VARCHAR(20) DEFAULT 'PENDING_CLEARANCE', -- CLEARED after 30 days
    clearing_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES
CREATE INDEX idx_partner_referrals ON referral_clicks(partner_id, created_at);
CREATE INDEX idx_ledger_clearing ON payout_ledger(status, clearing_date);
`.trim();

const SQL_REV_SHARE = `
-- Periodical Revenue Calculation Job
-- Calculates clearable balance for monthly payouts

WITH clearable_txns AS (
    SELECT 
        partner_id,
        SUM(amount) as clearable_amount
    FROM payout_ledger
    WHERE status = 'PENDING_CLEARANCE'
      AND clearing_date <= NOW() -- 30 day hold is up
      AND transaction_type = 'COMMISSION'
    GROUP BY partner_id
)
UPDATE partners p
SET balance = balance + c.clearable_amount
FROM clearable_txns c
WHERE p.id = c.partner_id;

-- Mark ledger entries as CLEARED
UPDATE payout_ledger
SET status = 'CLEARED'
WHERE status = 'PENDING_CLEARANCE' 
  AND clearing_date <= NOW();
`.trim();

const PYTHON_API = `
from fastapi import APIRouter, Depends, HTTPException, Header
from pydantic import BaseModel

router = APIRouter(prefix="/v1/partners")

class PartnerOnboard(BaseModel):
    name: string
    email: string
    payment_method: string # 'stripe' | 'paypal'

@router.post("/register")
async def register_partner(data: PartnerOnboard, db: Session = Depends(get_db)):
    # 1. Check duplicates
    if db.query(Partner).filter_by(email=data.email).first():
        raise HTTPException(400, "Email exists")
    
    # 2. Generate Credentials
    api_key = f"sk_live_{secrets.token_urlsafe(16)}"
    prefix = generate_unique_prefix()
    
    # 3. Create Record
    partner = Partner(
        name=data.name,
        email=data.email,
        api_key=api_key,
        tracking_prefix=prefix,
        status="ACTIVE" # Or PENDING if manual approval needed
    )
    db.add(partner)
    db.commit()
    
    # 4. Email Welcome Kit
    send_email(data.email, "Welcome to PromoSpider Partner Network", template="onboarding")
    
    return {"api_key": api_key, "tracking_prefix": prefix}

@router.get("/stats")
async def get_stats(x_api_key: str = Header(...), db: Session = Depends(get_db)):
    partner = db.query(Partner).filter_by(api_key=x_api_key).first()
    if not partner:
        raise HTTPException(401, "Invalid Key")
        
    return {
        "balance": partner.balance,
        "clicks_today": get_click_count(partner.id, "today"),
        "conversions_today": get_conversion_count(partner.id, "today"),
        "next_payout_date": get_next_payout_date()
    }
`.trim();

const WIDGET_CODE = `
<!-- PromoSpider Offers Widget -->
<div id="ps-widget-container"></div>
<script>
  (function(w,d,s,id){
    var js,fjs=d.getElementsByTagName(s)[0];
    if(d.getElementById(id))return;
    js=d.createElement(s);js.id=id;
    js.src="https://cdn.promo-spider.com/embed.js";
    js.setAttribute("data-partner-id", "PARTNER_12345");
    js.setAttribute("data-theme", "dark");
    js.setAttribute("data-layout", "grid");
    fjs.parentNode.insertBefore(js,fjs);
  }(window,document,'script','ps-sdk'));
</script>
`.trim();

const PartnerPortal: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'DB' | 'API' | 'WIDGET'>('OVERVIEW');
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const CodeBlock = ({ code, lang }: { code: string, lang: string }) => (
    <div className="relative group mt-2">
      <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={() => handleCopy(code)}
          className="bg-slate-700 hover:bg-slate-600 text-white p-2 rounded-lg text-xs flex items-center gap-2"
        >
          {copied ? <CheckCircle className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <div className="bg-slate-900 text-xs font-mono text-slate-500 px-4 py-2 border-b border-slate-800 rounded-t-xl uppercase">{lang}</div>
      <pre className="bg-slate-950 p-6 rounded-b-xl border-x border-b border-slate-800 overflow-x-auto text-sm font-mono text-slate-300 leading-relaxed">
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
            <Users className="w-6 h-6 text-indigo-500" /> Partner & Referral System
          </h2>
          <p className="text-slate-400">Manage affiliates, track referrals, and automate revenue sharing.</p>
        </div>
        
        <div className="flex gap-2 bg-slate-800 p-1 rounded-lg border border-slate-700">
          <button onClick={() => setActiveTab('OVERVIEW')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'OVERVIEW' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-white'}`}>Overview</button>
          <button onClick={() => setActiveTab('DB')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'DB' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-white'}`}>Database & SQL</button>
          <button onClick={() => setActiveTab('API')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'API' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-white'}`}>API Backend</button>
          <button onClick={() => setActiveTab('WIDGET')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'WIDGET' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-white'}`}>White-Label Widget</button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin pb-20">
        
        {/* OVERVIEW TAB */}
        {activeTab === 'OVERVIEW' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-800 border border-slate-700 p-6 rounded-xl shadow-lg">
                <div className="w-12 h-12 bg-indigo-500/20 rounded-full flex items-center justify-center mb-4">
                  <Code className="w-6 h-6 text-indigo-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">1. Onboarding & Keys</h3>
                <p className="text-sm text-slate-400">
                  Partners register via portal. System assigns unique `api_key` and `tracking_prefix` (e.g., "XYZ-101").
                  All links generated by partner include this prefix for attribution.
                </p>
              </div>

              <div className="bg-slate-800 border border-slate-700 p-6 rounded-xl shadow-lg">
                <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-emerald-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">2. Tracking & Attribution</h3>
                <p className="text-sm text-slate-400">
                  Clicks are tracked in real-time. Conversions matched via subID postbacks. 
                  Revenue is split based on `rev_share_pct` (default 20%).
                </p>
              </div>

              <div className="bg-slate-800 border border-slate-700 p-6 rounded-xl shadow-lg">
                <div className="w-12 h-12 bg-amber-500/20 rounded-full flex items-center justify-center mb-4">
                  <DollarSign className="w-6 h-6 text-amber-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">3. Payouts & Clearing</h3>
                <p className="text-sm text-slate-400">
                  Commissions enter a "Pending" state for 30 days (return window). 
                  Auto-payouts via Stripe Connect or PayPal Mass Pay when balance &gt; $50.
                </p>
              </div>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Partner Dashboard Preview</h3>
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 relative overflow-hidden">
                <div className="grid grid-cols-4 gap-4 mb-6 opacity-75">
                  <div className="bg-slate-800 p-4 rounded text-center">
                     <span className="text-xs text-slate-500">Earnings</span>
                     <div className="text-xl font-bold text-emerald-400">$1,240.50</div>
                  </div>
                  <div className="bg-slate-800 p-4 rounded text-center">
                     <span className="text-xs text-slate-500">Clicks</span>
                     <div className="text-xl font-bold text-blue-400">8,921</div>
                  </div>
                  <div className="bg-slate-800 p-4 rounded text-center">
                     <span className="text-xs text-slate-500">Conversions</span>
                     <div className="text-xl font-bold text-amber-400">142</div>
                  </div>
                   <div className="bg-slate-800 p-4 rounded text-center">
                     <span className="text-xs text-slate-500">Next Payout</span>
                     <div className="text-xl font-bold text-white">Oct 15</div>
                  </div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center bg-slate-900/40 backdrop-blur-[1px]">
                  <span className="bg-indigo-600 text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg">Mockup View</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* DATABASE TAB */}
        {activeTab === 'DB' && (
          <div className="space-y-6">
             <div className="bg-slate-800 border border-slate-700 p-6 rounded-xl">
               <div className="flex items-center gap-2 mb-4">
                 <Database className="w-5 h-5 text-indigo-400" />
                 <h3 className="text-lg font-bold text-white">PostgreSQL Schema</h3>
               </div>
               <p className="text-sm text-slate-400 mb-4">
                 Defines the `partners` entity and the double-entry `payout_ledger` for financial integrity.
               </p>
               <CodeBlock code={SQL_SCHEMA} lang="sql" />
             </div>

             <div className="bg-slate-800 border border-slate-700 p-6 rounded-xl">
               <div className="flex items-center gap-2 mb-4">
                 <ShieldCheck className="w-5 h-5 text-emerald-400" />
                 <h3 className="text-lg font-bold text-white">Revenue Share Clearing Job</h3>
               </div>
               <p className="text-sm text-slate-400 mb-4">
                 This batch job runs nightly to move funds from `PENDING` to `CLEARED` after the 30-day refund window expires.
               </p>
               <CodeBlock code={SQL_REV_SHARE} lang="sql" />
             </div>
          </div>
        )}

        {/* API TAB */}
        {activeTab === 'API' && (
          <div className="space-y-6">
            <div className="bg-slate-800 border border-slate-700 p-6 rounded-xl">
               <div className="flex items-center gap-2 mb-4">
                 <Server className="w-5 h-5 text-blue-400" />
                 <h3 className="text-lg font-bold text-white">FastAPI Endpoints</h3>
               </div>
               <p className="text-sm text-slate-400 mb-4">
                 REST endpoints for the partner portal frontend. Handles registration and stats retrieval securely.
               </p>
               <CodeBlock code={PYTHON_API} lang="python" />
             </div>
          </div>
        )}

        {/* WIDGET TAB */}
        {activeTab === 'WIDGET' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
            <div className="bg-slate-800 border border-slate-700 p-6 rounded-xl flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                 <Layout className="w-5 h-5 text-pink-400" />
                 <h3 className="text-lg font-bold text-white">Embeddable Widget</h3>
              </div>
              <p className="text-sm text-slate-400 mb-6">
                Partners can copy this snippet to display a live feed of top offers on their own blog or sidebar.
                Automatically handles affiliate attribution.
              </p>
              
              <div className="space-y-4">
                <div>
                   <label className="text-xs text-slate-500 uppercase font-bold">Theme</label>
                   <div className="flex gap-2 mt-1">
                     <button className="px-3 py-1 bg-slate-700 text-white rounded text-xs">Dark</button>
                     <button className="px-3 py-1 bg-slate-900 border border-slate-700 text-slate-400 rounded text-xs">Light</button>
                   </div>
                </div>
                <div>
                   <label className="text-xs text-slate-500 uppercase font-bold">Layout</label>
                   <div className="flex gap-2 mt-1">
                     <button className="px-3 py-1 bg-slate-700 text-white rounded text-xs">Grid</button>
                     <button className="px-3 py-1 bg-slate-900 border border-slate-700 text-slate-400 rounded text-xs">List</button>
                   </div>
                </div>
              </div>

              <div className="mt-auto">
                <CodeBlock code={WIDGET_CODE} lang="html" />
              </div>
            </div>

            {/* Widget Preview */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-8 flex items-center justify-center relative bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-90">
              <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 w-full max-w-sm shadow-2xl">
                 <div className="flex justify-between items-center mb-3 border-b border-slate-800 pb-2">
                   <span className="text-xs font-bold text-white">Top Deals</span>
                   <span className="text-[10px] text-slate-500">Powered by PromoSpider</span>
                 </div>
                 <div className="space-y-3">
                   {[1, 2, 3].map(i => (
                     <div key={i} className="flex gap-3 items-center">
                       <div className="w-10 h-10 bg-slate-800 rounded flex items-center justify-center text-[10px] text-slate-500">Img</div>
                       <div>
                         <div className="h-3 w-32 bg-slate-800 rounded mb-1"></div>
                         <div className="h-2 w-16 bg-emerald-900/30 rounded"></div>
                       </div>
                       <button className="ml-auto bg-indigo-600 text-[10px] text-white px-2 py-1 rounded">Get</button>
                     </div>
                   ))}
                 </div>
              </div>
              <div className="absolute top-4 left-4 text-xs font-mono text-slate-600">PREVIEW RENDER</div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default PartnerPortal;
