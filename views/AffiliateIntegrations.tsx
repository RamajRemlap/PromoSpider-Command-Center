import React, { useState } from 'react';
import { 
  Network, 
  Webhook, 
  FileText, 
  ShieldAlert, 
  CheckCircle, 
  Code, 
  Globe, 
  DollarSign,
  ArrowRight,
  Activity,
  AlertTriangle
} from 'lucide-react';

const INTEGRATION_GUIDES = [
  {
    id: 'impact',
    name: 'Impact',
    type: 'API & Webhook',
    auth: 'SID + Auth Token',
    endpoints: {
      offers: 'GET /Mediapartners/{AccountSID}/Campaigns',
      reports: 'GET /Mediapartners/{AccountSID}/Reports/ActionListing',
      links: 'POST /Mediapartners/{AccountSID}/Actions/Promocodes'
    },
    notes: 'Impact requires Signed Requests for some actions. Webhooks are configured in the UI under "Event Notifications". Payouts are usually Net 30.'
  },
  {
    id: 'cj',
    name: 'CJ Affiliate',
    type: 'GraphQL',
    auth: 'Personal Access Token',
    endpoints: {
      offers: 'POST /query (publisherLinkSearch)',
      reports: 'POST /query (publisherCommissionDetail)',
    },
    notes: 'CJ moved to GraphQL. Allows deep querying of link attributes. Requires whitelisted IP for API access.'
  },
  {
    id: 'amazon',
    name: 'Amazon Associates',
    type: 'PA-API 5.0',
    auth: 'Access Key + Secret + Signed Request',
    endpoints: {
      items: 'POST /paapi5/searchitems',
    },
    notes: 'Extremely strict throttle policies. One request per second strictly enforced. Requires valid sales within 180 days to keep API access.'
  }
];

const AffiliateIntegrations: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'NETWORKS' | 'SIMULATOR' | 'RECONCILIATION' | 'LEGAL'>('NETWORKS');
  const [selectedNetwork, setSelectedNetwork] = useState(INTEGRATION_GUIDES[0]);

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] gap-6 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex justify-between items-center flex-shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Network className="w-6 h-6 text-indigo-500" /> Integration Hub
          </h2>
          <p className="text-slate-400">Affiliate API documentation, webhook simulators, and compliance protocols.</p>
        </div>

        <div className="flex gap-1 bg-slate-800 p-1 rounded-lg border border-slate-700">
          <button onClick={() => setActiveTab('NETWORKS')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'NETWORKS' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-white'}`}>Networks</button>
          <button onClick={() => setActiveTab('SIMULATOR')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'SIMULATOR' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-white'}`}>Simulators</button>
          <button onClick={() => setActiveTab('RECONCILIATION')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'RECONCILIATION' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-white'}`}>Reconciliation</button>
          <button onClick={() => setActiveTab('LEGAL')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'LEGAL' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-white'}`}>Legal</button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin pb-20">
        
        {/* NETWORK GUIDES TAB */}
        {activeTab === 'NETWORKS' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              {INTEGRATION_GUIDES.map(net => (
                <button
                  key={net.id}
                  onClick={() => setSelectedNetwork(net)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    selectedNetwork.id === net.id
                      ? 'bg-indigo-900/20 border-indigo-500/50 shadow-md'
                      : 'bg-slate-800 border-slate-700 hover:border-slate-600'
                  }`}
                >
                  <h3 className={`font-bold ${selectedNetwork.id === net.id ? 'text-indigo-400' : 'text-white'}`}>{net.name}</h3>
                  <p className="text-xs text-slate-500 mt-1">{net.type}</p>
                </button>
              ))}
            </div>

            <div className="lg:col-span-2 bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5 text-indigo-500" /> {selectedNetwork.name} Integration Spec
              </h3>
              
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-900 p-4 rounded-lg border border-slate-700">
                    <span className="text-xs text-slate-500 uppercase font-bold block mb-1">Authentication Method</span>
                    <span className="text-sm text-emerald-400 font-mono">{selectedNetwork.auth}</span>
                  </div>
                  <div className="bg-slate-900 p-4 rounded-lg border border-slate-700">
                     <span className="text-xs text-slate-500 uppercase font-bold block mb-1">API Type</span>
                     <span className="text-sm text-blue-400 font-mono">{selectedNetwork.type}</span>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-300 mb-2">Key Endpoints</h4>
                  <div className="bg-slate-950 rounded-lg p-4 font-mono text-xs text-slate-400 space-y-2 border border-slate-800">
                    {Object.entries(selectedNetwork.endpoints).map(([key, url]) => (
                      <div key={key} className="flex gap-2">
                        <span className="text-purple-400 uppercase w-16">{key}</span>
                        <span className="text-slate-300">{url}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-lg">
                  <h4 className="text-sm font-bold text-amber-400 mb-1 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" /> Implementation Notes
                  </h4>
                  <p className="text-sm text-amber-200/80">{selectedNetwork.notes}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SIMULATOR TAB */}
        {activeTab === 'SIMULATOR' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Webhook className="w-5 h-5 text-pink-500" /> Conversion Webhook Simulator
              </h3>
              <p className="text-sm text-slate-400 mb-4">
                Simulate an incoming HTTP POST from an affiliate network confirming a sale.
              </p>
              
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 font-mono text-xs text-emerald-300 mb-4 whitespace-pre-wrap">
{`{
  "event_type": "conversion",
  "network": "IMPACT",
  "click_id": "clk_882910_uuid_v4",
  "amount": 49.99,
  "currency": "USD",
  "commission": 12.50,
  "status": "APPROVED",
  "transaction_id": "tx_9988112",
  "occurred_at": "${new Date().toISOString()}"
}`}
              </div>
              
              <button className="w-full bg-slate-700 hover:bg-slate-600 text-white font-medium py-2 rounded-lg transition-colors">
                Fire Test Webhook
              </button>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-500" /> Click Event Payload
              </h3>
              <p className="text-sm text-slate-400 mb-4">
                The internal data structure tracked when a user clicks a promo link.
              </p>
              
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 font-mono text-xs text-blue-300 mb-4 whitespace-pre-wrap">
{`{
  "event_id": "evt_55123",
  "offer_id": "off_112233",
  "user_ip": "hash(192.168.1.1)", 
  "user_agent": "Mozilla/5.0...",
  "referer": "https://promo-spider.com/best-deals",
  "sub_id_1": "partner_123",
  "timestamp": "${new Date().toISOString()}",
  "redirect_url": "https://merchant.com?ref=123&subId=evt_55123"
}`}
              </div>
              <p className="text-xs text-slate-500 italic">
                * Note: `redirect_url` appends the `event_id` as a SubID parameter for reconciliation.
              </p>
            </div>
          </div>
        )}

        {/* RECONCILIATION TAB */}
        {activeTab === 'RECONCILIATION' && (
          <div className="space-y-6">
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 relative overflow-hidden">
               <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 items-center text-center">
                 
                 <div className="flex flex-col items-center">
                   <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mb-4 border border-blue-500/50">
                     <Activity className="w-8 h-8 text-blue-400" />
                   </div>
                   <h4 className="font-bold text-white">1. Outbound Click</h4>
                   <p className="text-xs text-slate-400 mt-1">
                     User clicks link. System generates `click_id` and appends as `subId` param.
                   </p>
                 </div>

                 <div className="hidden md:flex justify-center">
                   <ArrowRight className="w-8 h-8 text-slate-600" />
                 </div>

                 <div className="flex flex-col items-center">
                   <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mb-4 border border-purple-500/50">
                     <DollarSign className="w-8 h-8 text-purple-400" />
                   </div>
                   <h4 className="font-bold text-white">2. Conversion</h4>
                   <p className="text-xs text-slate-400 mt-1">
                     User buys. Merchant reports sale to Network. Network records `subId`.
                   </p>
                 </div>

                 <div className="hidden md:flex justify-center">
                   <ArrowRight className="w-8 h-8 text-slate-600" />
                 </div>

                 <div className="flex flex-col items-center">
                   <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mb-4 border border-emerald-500/50">
                     <CheckCircle className="w-8 h-8 text-emerald-400" />
                   </div>
                   <h4 className="font-bold text-white">3. Attribution</h4>
                   <p className="text-xs text-slate-400 mt-1">
                     Network calls Webhook with `subId`. System matches `click_id` and credits partner.
                   </p>
                 </div>

               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-800 border border-slate-700 p-6 rounded-xl">
                 <h4 className="font-bold text-white mb-2">Fraud Detection Heuristics</h4>
                 <ul className="space-y-2 text-sm text-slate-400">
                   <li className="flex items-start gap-2">
                     <ShieldAlert className="w-4 h-4 text-rose-500 mt-0.5" />
                     <span><strong>Click Spamming:</strong> >50 clicks from same IP within 1 hour.</span>
                   </li>
                   <li className="flex items-start gap-2">
                     <ShieldAlert className="w-4 h-4 text-rose-500 mt-0.5" />
                     <span><strong>Conversion Velocity:</strong> Conversion time &lt; 10s from click (Bot behavior).</span>
                   </li>
                   <li className="flex items-start gap-2">
                     <ShieldAlert className="w-4 h-4 text-rose-500 mt-0.5" />
                     <span><strong>Geo Mismatch:</strong> Click from US, Conversion from RU.</span>
                   </li>
                 </ul>
              </div>

              <div className="bg-slate-800 border border-slate-700 p-6 rounded-xl">
                 <h4 className="font-bold text-white mb-2">Attribution Windows</h4>
                 <ul className="space-y-2 text-sm text-slate-400">
                   <li className="flex items-start gap-2">
                     <div className="w-1.5 h-1.5 rounded-full bg-slate-500 mt-1.5"></div>
                     <span><strong>Last Click Wins:</strong> Standard for 95% of networks.</span>
                   </li>
                   <li className="flex items-start gap-2">
                     <div className="w-1.5 h-1.5 rounded-full bg-slate-500 mt-1.5"></div>
                     <span><strong>Cookie Duration:</strong> Usually 30 days. Validated by Validator Agent.</span>
                   </li>
                 </ul>
              </div>
            </div>
          </div>
        )}

        {/* LEGAL TAB */}
        {activeTab === 'LEGAL' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-500" /> FTC Compliance & Disclosure Playbook
              </h3>
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-bold text-slate-300 mb-2">Mandatory Disclosure (Top of Page)</h4>
                  <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 text-slate-300 italic">
                    "This site is supported by our readers. When you buy through links on our site, we may earn an affiliate commission."
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    Must be placed <strong>before</strong> any affiliate links. "Clear and Conspicuous" standard.
                  </p>
                </div>

                <div className="h-px bg-slate-700"></div>

                <div>
                  <h4 className="text-sm font-bold text-slate-300 mb-2">Prohibited Practices (Safe Harbor)</h4>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-slate-400">
                    <li className="flex items-center gap-2 text-rose-400">
                      <ShieldAlert className="w-4 h-4" /> No "Typosquatting" domains
                    </li>
                    <li className="flex items-center gap-2 text-rose-400">
                      <ShieldAlert className="w-4 h-4" /> No Cookie Stuffing (invisible iframes)
                    </li>
                    <li className="flex items-center gap-2 text-rose-400">
                      <ShieldAlert className="w-4 h-4" /> No False Scarcity ("Ends in 5 mins" when it doesn't)
                    </li>
                    <li className="flex items-center gap-2 text-rose-400">
                      <ShieldAlert className="w-4 h-4" /> No Encouraging Multi-Accounting
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Email Marketing Compliance (CAN-SPAM)</h3>
              <ul className="list-disc list-inside space-y-2 text-sm text-slate-400">
                <li>Must include physical postal address in footer.</li>
                <li>Must verify sender domain (SPF/DKIM).</li>
                <li>Opt-out links must process within 10 days.</li>
                <li>Subject line must not be deceptive.</li>
              </ul>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AffiliateIntegrations;