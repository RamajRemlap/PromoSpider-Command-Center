import React, { useState } from 'react';
import { 
  ClipboardList, 
  AlertTriangle, 
  Book, 
  CheckSquare, 
  Server, 
  Shield, 
  TrendingUp,
  Activity,
  LifeBuoy,
  WifiOff,
  Database,
  Clock
} from 'lucide-react';

const OperationsPlaybook: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ROUTINE' | 'INCIDENTS' | 'ONBOARDING' | 'SCALING'>('ROUTINE');

  const ChecklistItem = ({ label, freq }: { label: string, freq: string }) => (
    <div className="flex items-start gap-3 p-3 bg-slate-900/50 rounded-lg border border-slate-800 hover:bg-slate-900 transition-colors cursor-pointer group">
      <div className="mt-0.5 w-5 h-5 rounded border border-slate-600 bg-slate-800 flex items-center justify-center group-hover:border-indigo-500">
        <div className="w-3 h-3 bg-indigo-500 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity"></div>
      </div>
      <div className="flex-1">
        <p className="text-sm text-slate-300 group-hover:text-white transition-colors">{label}</p>
        <span className="text-[10px] text-slate-500 uppercase tracking-wider">{freq}</span>
      </div>
    </div>
  );

  const RunbookCard = ({ title, severity, symptoms, resolution }: { title: string, severity: 'CRITICAL' | 'HIGH' | 'MEDIUM', symptoms: string[], resolution: string[] }) => (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <h3 className="font-bold text-white flex items-center gap-2">
          {severity === 'CRITICAL' ? <AlertTriangle className="w-5 h-5 text-rose-500" /> : <Activity className="w-5 h-5 text-amber-500" />}
          {title}
        </h3>
        <span className={`px-2 py-1 rounded text-[10px] font-bold ${
          severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400' : 
          severity === 'HIGH' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'
        }`}>
          SEV-{severity === 'CRITICAL' ? '1' : severity === 'HIGH' ? '2' : '3'}
        </span>
      </div>

      <div className="space-y-4">
        <div>
          <span className="text-xs text-slate-500 uppercase font-bold block mb-2">Symptoms</span>
          <div className="flex flex-wrap gap-2">
            {symptoms.map((s, i) => (
              <span key={i} className="text-xs bg-slate-900 text-slate-400 px-2 py-1 rounded border border-slate-700">
                {s}
              </span>
            ))}
          </div>
        </div>
        
        <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-800">
          <span className="text-xs text-slate-500 uppercase font-bold block mb-2">Resolution Steps</span>
          <ol className="list-decimal list-inside space-y-1 text-sm text-slate-300 marker:text-slate-500">
            {resolution.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] gap-6 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex justify-between items-center flex-shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-indigo-500" /> Operations Playbook
          </h2>
          <p className="text-slate-400">Standard Operating Procedures, Runbooks, and Maintenance Checklists.</p>
        </div>
        
        <div className="flex gap-2 bg-slate-800 p-1 rounded-lg border border-slate-700">
          <button onClick={() => setActiveTab('ROUTINE')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'ROUTINE' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-white'}`}>Routine Ops</button>
          <button onClick={() => setActiveTab('INCIDENTS')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'INCIDENTS' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-white'}`}>Incidents</button>
          <button onClick={() => setActiveTab('ONBOARDING')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'ONBOARDING' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-white'}`}>Onboarding</button>
          <button onClick={() => setActiveTab('SCALING')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'SCALING' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-white'}`}>Scaling & Cost</button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin pb-20">
        
        {/* ROUTINE OPS TAB */}
        {activeTab === 'ROUTINE' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-500" /> Daily Checklist
              </h3>
              <div className="space-y-2">
                <ChecklistItem label="Review Harvester Queue Depth (< 5k)" freq="09:00 UTC" />
                <ChecklistItem label="Check Validator Error Rate (< 5%)" freq="09:00 UTC" />
                <ChecklistItem label="Triage 'High Risk' Compliance Flags" freq="Daily" />
                <ChecklistItem label="Verify Stripe Partner Payout Balance" freq="Daily" />
                <ChecklistItem label="Monitor 'Zero Conversion' Alerts" freq="Daily" />
              </div>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-500" /> Weekly Maintenance
              </h3>
              <div className="space-y-2">
                <ChecklistItem label="Rotate Proxy User-Agent Strings" freq="Monday" />
                <ChecklistItem label="Refresh Affiliate API Tokens (Oauth)" freq="Monday" />
                <ChecklistItem label="Database Vacuum / Reindex" freq="Sunday" />
                <ChecklistItem label="Review Blocked Domains List" freq="Weekly" />
                <ChecklistItem label="Partner Commission Payout Run" freq="Friday" />
              </div>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-purple-500" /> Monthly Audit
              </h3>
              <div className="space-y-2">
                <ChecklistItem label="Full Affiliate Payout Reconciliation" freq="1st of Month" />
                <ChecklistItem label="Review Cloud Provider Costs (AWS/Gemini)" freq="Monthly" />
                <ChecklistItem label="Update 'Robots.txt' Compliance Rules" freq="Monthly" />
                <ChecklistItem label="Performance Tuning (Slow Queries)" freq="Monthly" />
              </div>
            </div>
          </div>
        )}

        {/* INCIDENTS TAB */}
        {activeTab === 'INCIDENTS' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <RunbookCard 
              title="Scraper Ban / High 403 Rate"
              severity="HIGH"
              symptoms={["Success rate < 50%", "Logs show 'Captcha Challenge'", "Proxy Latency Spike"]}
              resolution={[
                "Pause 'Scraper Agent' immediately.",
                "Rotate to new Proxy Region (e.g., US-West -> US-East).",
                "Increase 'min_delay' in Queue Config (Jitter).",
                "Check 'Stealth' plugin updates for Playwright.",
                "Resume with 10% concurrency."
              ]}
            />
            
            <RunbookCard 
              title="API Rate Limit Exceeded"
              severity="MEDIUM"
              symptoms={["Affiliate Sync Failing", "HTTP 429 Errors", "Harvester Queue Stalled"]}
              resolution={[
                "Identify offending Network (Impact/CJ).",
                "Adjust 'Cron Schedule' to spread load.",
                "Implement exponential backoff in API Client.",
                "Contact Network Support if limit is unexpectedly low."
              ]}
            />

            <RunbookCard 
              title="Zero Conversion Alert"
              severity="CRITICAL"
              symptoms={["Clicks > 100 but Conversions = 0", "Partner complaints", "Revenue drop"]}
              resolution={[
                "Test Tracking Link manually (End-to-End).",
                "Verify 'subId' is passing to Merchant landing page.",
                "Check Affiliate Dashboard for 'Inactive' status.",
                "Inspect Redis Event Logs for dropped postbacks.",
                "Flush Redis Cache for Offer Redirects."
              ]}
            />

            <RunbookCard 
              title="Database Connection Saturation"
              severity="HIGH"
              symptoms={["Timeout errors in logs", "Slow Dashboard loading", "High CPU on DB"]}
              resolution={[
                "Check Active Connections count in Postgres.",
                "Restart API Service containers.",
                "Enable Connection Pooling (PgBouncer).",
                "Kill long-running analytical queries."
              ]}
            />
          </div>
        )}

        {/* ONBOARDING TAB */}
        {activeTab === 'ONBOARDING' && (
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-8">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <LifeBuoy className="w-6 h-6 text-emerald-500" /> Affiliate Network Onboarding Guide
            </h3>
            
            <div className="space-y-8 relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-700"></div>

              <div className="relative pl-12">
                <div className="absolute left-0 top-0 w-8 h-8 rounded-full bg-slate-900 border-2 border-indigo-500 flex items-center justify-center font-bold text-indigo-500 text-sm z-10">1</div>
                <h4 className="text-lg font-bold text-white mb-2">Registration & Approval</h4>
                <p className="text-slate-400 text-sm mb-2">
                  Apply to the network (Impact, CJ, etc.) using the corporate entity details.
                </p>
                <ul className="text-sm text-slate-500 list-disc list-inside">
                  <li>Use "PromoSpider" as the website name.</li>
                  <li>Category: "Coupons / Deals / Loyalty".</li>
                  <li>Promotional Methods: "Search, Social, Display, Email".</li>
                </ul>
              </div>

              <div className="relative pl-12">
                <div className="absolute left-0 top-0 w-8 h-8 rounded-full bg-slate-900 border-2 border-indigo-500 flex items-center justify-center font-bold text-indigo-500 text-sm z-10">2</div>
                <h4 className="text-lg font-bold text-white mb-2">Technical Integration</h4>
                <p className="text-slate-400 text-sm mb-2">
                  Configure the API and Postback URL in the network dashboard.
                </p>
                <div className="bg-slate-950 p-3 rounded border border-slate-800 font-mono text-xs text-slate-300">
                  Postback URL: https://api.promo-spider.com/webhooks/{`{NETWORK_ID}`}?click_id={`{SUB_ID}`}
                </div>
              </div>

              <div className="relative pl-12">
                <div className="absolute left-0 top-0 w-8 h-8 rounded-full bg-slate-900 border-2 border-indigo-500 flex items-center justify-center font-bold text-indigo-500 text-sm z-10">3</div>
                <h4 className="text-lg font-bold text-white mb-2">Compliance Verification</h4>
                <p className="text-slate-400 text-sm mb-2">
                  Review program terms for restricted keywords (e.g., "TM Bidding").
                </p>
                <ul className="text-sm text-slate-500 list-disc list-inside">
                  <li>Add disallowed keywords to `Compliance Agent` config.</li>
                  <li>Upload tax documents (W-9 / W-8BEN).</li>
                  <li>Set up payment method (ACH/Wire).</li>
                </ul>
              </div>

              <div className="relative pl-12">
                <div className="absolute left-0 top-0 w-8 h-8 rounded-full bg-slate-900 border-2 border-indigo-500 flex items-center justify-center font-bold text-indigo-500 text-sm z-10">4</div>
                <h4 className="text-lg font-bold text-white mb-2">Go Live</h4>
                <p className="text-slate-400 text-sm">
                  Enable the `Harvester Agent` for this network and run a test conversion.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* SCALING TAB */}
        {activeTab === 'SCALING' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                <Database className="w-5 h-5 text-blue-500" /> Database Partitioning Strategy
              </h3>
              <p className="text-sm text-slate-400 mb-4">
                As click volume grows, the `events` table will become a bottleneck.
              </p>
              <ul className="space-y-3 text-sm text-slate-300">
                <li className="flex gap-2">
                  <div className="mt-1 w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                  <span><strong>Time-Partitioning:</strong> Use TimescaleDB or Postgres native partitioning by `created_at` (Monthly).</span>
                </li>
                <li className="flex gap-2">
                  <div className="mt-1 w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                  <span><strong>Cold Storage:</strong> Archive events older than 1 year to S3/Parquet.</span>
                </li>
                <li className="flex gap-2">
                  <div className="mt-1 w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                  <span><strong>Read Replicas:</strong> Offload 'Reporting' queries to a read-only replica.</span>
                </li>
              </ul>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                <Server className="w-5 h-5 text-purple-500" /> Caching & Cost Control
              </h3>
              <p className="text-sm text-slate-400 mb-4">
                Optimizing compute and LLM token usage.
              </p>
              <ul className="space-y-3 text-sm text-slate-300">
                <li className="flex gap-2">
                  <div className="mt-1 w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                  <span><strong>HTML Caching:</strong> Store raw HTML in S3 for 24h. Don't re-scrape for duplicates.</span>
                </li>
                <li className="flex gap-2">
                  <div className="mt-1 w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                  <span><strong>LLM Batching:</strong> Use "Flash" models for extraction. Only use "Pro" for difficult cases.</span>
                </li>
                <li className="flex gap-2">
                  <div className="mt-1 w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                  <span><strong>Redirect Cache:</strong> Cache `Offer -> Affiliate Link` mapping in Redis (TTL 1 hour).</span>
                </li>
              </ul>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-500" /> Safety Guardrails
              </h3>
              <div className="grid grid-cols-2 gap-4 text-center">
                 <div className="bg-slate-900 p-3 rounded border border-slate-700">
                   <span className="block text-xl font-bold text-white">100/min</span>
                   <span className="text-xs text-slate-500">Max Emails Sent</span>
                 </div>
                 <div className="bg-slate-900 p-3 rounded border border-slate-700">
                   <span className="block text-xl font-bold text-white">$500</span>
                   <span className="text-xs text-slate-500">Max Auto-Approved Payout</span>
                 </div>
                 <div className="bg-slate-900 p-3 rounded border border-slate-700">
                   <span className="block text-xl font-bold text-white">80%</span>
                   <span className="text-xs text-slate-500">Max Conversion Rate (Suspicion)</span>
                 </div>
                 <div className="bg-slate-900 p-3 rounded border border-slate-700">
                   <span className="block text-xl font-bold text-white">5%</span>
                   <span className="text-xs text-slate-500">Max 404 Error Rate</span>
                 </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default OperationsPlaybook;