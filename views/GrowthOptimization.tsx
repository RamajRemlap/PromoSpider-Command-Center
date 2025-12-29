
import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Beaker, 
  ShieldAlert, 
  BarChart2, 
  Trophy,
  Target,
  Users,
  AlertOctagon,
  Copy,
  RefreshCw
} from 'lucide-react';
import { Experiment, ScoringModel } from '../types';

const MOCK_EXPERIMENTS: Experiment[] = [
  {
    id: "exp_101",
    name: "CTA Variation: 'Get Free' vs 'Claim Bonus'",
    variantA: "Get Free $50",
    variantB: "Claim $50 Bonus",
    trafficSplit: 0.5,
    status: "RUNNING",
    stats: {
      impressionsA: 4200, conversionsA: 180,
      impressionsB: 4150, conversionsB: 220
    }
  },
  {
    id: "exp_102",
    name: "Hero Image: Lifestyle vs Product",
    variantA: "Happy Couple",
    variantB: "Credit Card Isolated",
    trafficSplit: 0.5,
    status: "CONCLUDED",
    winner: "B",
    stats: {
      impressionsA: 12000, conversionsA: 400,
      impressionsB: 12100, conversionsB: 580
    }
  }
];

const ANALYTICAL_SQL = `
-- 1. Partner Quality Ranking (Fraud Detection)
WITH stats AS (
    SELECT 
        partner_id,
        COUNT(id) as total_conversions,
        SUM(CASE WHEN status = 'REVERSED' THEN 1 ELSE 0 END) as reversals
    FROM conversions
    WHERE created_at > NOW() - INTERVAL '30 days'
    GROUP BY partner_id
)
SELECT 
    p.name,
    s.total_conversions,
    (s.reversals::float / NULLIF(s.total_conversions,0)) as reversal_rate,
    CASE 
        WHEN s.total_conversions < 10 THEN 'NEW'
        WHEN (s.reversals::float / s.total_conversions) > 0.1 THEN 'RISK'
        ELSE 'ELITE'
    END as status
FROM stats s
JOIN partners p ON p.id = s.partner_id
ORDER BY reversal_rate DESC;

-- 2. Anomaly Detection (Time-to-Convert)
-- Finds bot-like behavior where conversion happens < 5 seconds after click
SELECT 
    c.partner_id,
    AVG(EXTRACT(EPOCH FROM (c.created_at - clk.created_at))) as avg_ttc_seconds
FROM conversions c
JOIN clicks clk ON c.click_id = clk.id
GROUP BY c.partner_id
HAVING AVG(EXTRACT(EPOCH FROM (c.created_at - clk.created_at))) < 10;
`.trim();

interface PartnerStat {
  id: string;
  name: string;
  conversions: number;
  reversals: number;
  payoutSpeed: string;
}

const GrowthOptimization: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'SCORING' | 'EXPERIMENTS' | 'FRAUD_ML' | 'ANALYTICS'>('SCORING');
  
  // Scoring Model State
  const [weights, setWeights] = useState<ScoringModel>({
    weightPayout: 0.5,
    weightConversionRate: 0.3,
    weightCTR: 0.1,
    weightNewness: 0.1
  });

  // Dynamic Partner Stats
  const [partnerStats, setPartnerStats] = useState<PartnerStat[]>([
    { id: 'p1', name: 'TechBargains Inc', conversions: 1240, reversals: 8, payoutSpeed: 'Instant' }, // Low risk
    { id: 'p2', name: 'CouponMom Blog', conversions: 850, reversals: 35, payoutSpeed: 'Net-30' },   // Med risk
    { id: 'p3', name: 'FreebieHunter X', conversions: 200, reversals: 42, payoutSpeed: 'Held' },    // High risk
  ]);

  const calculateTier = (stat: PartnerStat) => {
    if (stat.conversions === 0) return { tier: 'C', label: 'New', color: 'text-slate-400', bg: 'bg-slate-500/20' };
    
    const rate = stat.reversals / stat.conversions;
    
    if (rate < 0.01) return { tier: 'A', label: 'Elite', color: 'text-emerald-400', bg: 'bg-emerald-500/20' };
    if (rate < 0.05) return { tier: 'B', label: 'Standard', color: 'text-amber-400', bg: 'bg-amber-500/20' };
    return { tier: 'C', label: 'Probation', color: 'text-rose-400', bg: 'bg-rose-500/20' };
  };

  const calculateBayesianProb = (exp: Experiment) => {
    const crA = exp.stats.conversionsA / exp.stats.impressionsA;
    const crB = exp.stats.conversionsB / exp.stats.impressionsB;
    const lift = ((crB - crA) / crA) * 100;
    return { crA, crB, lift };
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] gap-6 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex justify-between items-center flex-shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-indigo-500" /> Growth Engine
          </h2>
          <p className="text-slate-400">Optimization algorithms, A/B testing, and predictive analytics.</p>
        </div>
        
        <div className="flex gap-2 bg-slate-800 p-1 rounded-lg border border-slate-700">
          <button onClick={() => setActiveTab('SCORING')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'SCORING' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-white'}`}>Offer Scoring</button>
          <button onClick={() => setActiveTab('EXPERIMENTS')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'EXPERIMENTS' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-white'}`}>Experiments</button>
          <button onClick={() => setActiveTab('FRAUD_ML')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'FRAUD_ML' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-white'}`}>Fraud ML</button>
          <button onClick={() => setActiveTab('ANALYTICS')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'ANALYTICS' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-white'}`}>SQL Analytics</button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin pb-20">

        {/* SCORING TAB */}
        {activeTab === 'SCORING' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <h3 className="font-bold text-white mb-6 flex items-center gap-2">
                <Target className="w-5 h-5 text-indigo-400" /> Ranking Algorithm Weights
              </h3>
              
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-medium text-slate-300">Payout Value (e.g. $50 vs $5)</label>
                    <span className="text-sm font-mono text-emerald-400">{(weights.weightPayout * 100).toFixed(0)}%</span>
                  </div>
                  <input type="range" min="0" max="1" step="0.1" value={weights.weightPayout} onChange={(e) => setWeights({...weights, weightPayout: parseFloat(e.target.value)})} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-medium text-slate-300">Conversion Rate (Historical)</label>
                    <span className="text-sm font-mono text-blue-400">{(weights.weightConversionRate * 100).toFixed(0)}%</span>
                  </div>
                  <input type="range" min="0" max="1" step="0.1" value={weights.weightConversionRate} onChange={(e) => setWeights({...weights, weightConversionRate: parseFloat(e.target.value)})} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500" />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-medium text-slate-300">Click-Through Rate (CTR)</label>
                    <span className="text-sm font-mono text-purple-400">{(weights.weightCTR * 100).toFixed(0)}%</span>
                  </div>
                  <input type="range" min="0" max="1" step="0.1" value={weights.weightCTR} onChange={(e) => setWeights({...weights, weightCTR: parseFloat(e.target.value)})} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500" />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-medium text-slate-300">Freshness (New Offer Boost)</label>
                    <span className="text-sm font-mono text-amber-400">{(weights.weightNewness * 100).toFixed(0)}%</span>
                  </div>
                  <input type="range" min="0" max="1" step="0.1" value={weights.weightNewness} onChange={(e) => setWeights({...weights, weightNewness: parseFloat(e.target.value)})} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500" />
                </div>
              </div>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <h3 className="font-bold text-white mb-6 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-400" /> Predicted Top Offers
              </h3>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                   <div key={i} className="flex items-center gap-4 bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                     <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center font-bold text-slate-400">#{i}</div>
                     <div className="flex-1">
                       <h4 className="text-sm font-bold text-white">Chase Sapphire Preferred {i===1 && <span className="text-[10px] bg-yellow-500/20 text-yellow-400 px-1.5 rounded ml-2">HOT</span>}</h4>
                       <p className="text-xs text-slate-500">Score: {(98 - (i*12))}</p>
                     </div>
                     <div className="text-right">
                       <div className="text-sm font-mono text-emerald-400">$750</div>
                       <div className="text-[10px] text-slate-500">Est. Payout</div>
                     </div>
                   </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* EXPERIMENTS TAB */}
        {activeTab === 'EXPERIMENTS' && (
          <div className="space-y-6">
             {MOCK_EXPERIMENTS.map((exp) => {
               const { crA, crB, lift } = calculateBayesianProb(exp);
               const isSignificant = Math.abs(lift) > 10; // Mock significance check

               return (
                 <div key={exp.id} className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                   <div className="flex justify-between items-start mb-4">
                     <div>
                       <div className="flex items-center gap-2 mb-1">
                         <h3 className="text-lg font-bold text-white">{exp.name}</h3>
                         <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${exp.status === 'RUNNING' ? 'bg-emerald-500/20 text-emerald-400 animate-pulse' : 'bg-slate-600 text-slate-300'}`}>
                           {exp.status}
                         </span>
                       </div>
                       <p className="text-sm text-slate-400">Split: {exp.trafficSplit * 100}% / {((1-exp.trafficSplit)*100)}%</p>
                     </div>
                     {exp.winner && (
                       <div className="px-3 py-1 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 rounded-lg text-xs font-bold flex items-center gap-1">
                         <Trophy className="w-3 h-3" /> Winner: Variant {exp.winner}
                       </div>
                     )}
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className={`p-4 rounded-lg border relative ${lift < 0 && isSignificant ? 'bg-emerald-900/10 border-emerald-500/30' : 'bg-slate-900 border-slate-700'}`}>
                        <span className="text-xs text-slate-500 uppercase font-bold mb-2 block">Variant A (Control)</span>
                        <p className="text-sm text-white font-medium mb-2">"{exp.variantA}"</p>
                        <div className="flex justify-between text-xs mt-4">
                          <span className="text-slate-400">CR: <span className="text-white font-mono">{(crA * 100).toFixed(2)}%</span></span>
                          <span className="text-slate-400">Conv: {exp.stats.conversionsA}</span>
                        </div>
                     </div>

                     <div className={`p-4 rounded-lg border relative ${lift > 0 && isSignificant ? 'bg-emerald-900/10 border-emerald-500/30' : 'bg-slate-900 border-slate-700'}`}>
                        <span className="text-xs text-slate-500 uppercase font-bold mb-2 block">Variant B (Test)</span>
                        <p className="text-sm text-white font-medium mb-2">"{exp.variantB}"</p>
                        <div className="flex justify-between text-xs mt-4">
                          <span className="text-slate-400">CR: <span className="text-white font-mono">{(crB * 100).toFixed(2)}%</span></span>
                          <span className="text-slate-400">Conv: {exp.stats.conversionsB}</span>
                        </div>
                        <div className={`absolute top-2 right-2 text-xs font-bold px-1.5 rounded ${lift > 0 ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'}`}>
                          {lift > 0 ? '+' : ''}{lift.toFixed(1)}% Lift
                        </div>
                     </div>
                   </div>
                 </div>
               );
             })}
          </div>
        )}

        {/* FRAUD ML TAB */}
        {activeTab === 'FRAUD_ML' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-500" /> Anomaly Detection (Isolation Forest)
              </h3>
              <p className="text-sm text-slate-400 mb-4">
                We monitor the distribution of "Time to Conversion". Outliers (e.g., converting in 2 seconds) are flagged as bots.
              </p>
              
              <div className="h-48 flex items-end justify-between gap-1 mt-6 px-4 pb-4 border-b border-l border-slate-700 relative">
                 {/* Mock Histogram */}
                 <div className="w-8 bg-rose-500/50 h-12 rounded-t hover:bg-rose-500 transition-colors group relative">
                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] text-rose-400 opacity-0 group-hover:opacity-100">Bots</span>
                 </div>
                 <div className="w-8 bg-slate-700 h-4 rounded-t"></div>
                 <div className="w-8 bg-slate-700 h-8 rounded-t"></div>
                 <div className="w-8 bg-indigo-500 h-32 rounded-t"></div>
                 <div className="w-8 bg-indigo-500 h-40 rounded-t"></div>
                 <div className="w-8 bg-indigo-500 h-24 rounded-t"></div>
                 <div className="w-8 bg-slate-700 h-16 rounded-t"></div>
                 <div className="w-8 bg-slate-700 h-8 rounded-t"></div>
                 <div className="absolute bottom-0 left-0 right-0 h-px bg-slate-700"></div>
              </div>
              <div className="flex justify-between text-xs text-slate-500 mt-2 px-2">
                <span>0s (Instant)</span>
                <span>60s</span>
                <span>5m+</span>
              </div>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
               <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-500" /> Partner Quality Scoring
              </h3>
               <p className="text-sm text-slate-400 mb-4">
                Partners are tiered based on their traffic quality (Chargeback Rate). Dynamic calculation below.
              </p>
              <div className="space-y-4">
                {partnerStats.map(stat => {
                  const info = calculateTier(stat);
                  const reversalRate = ((stat.reversals / stat.conversions) * 100).toFixed(1);
                  
                  return (
                    <div key={stat.id} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-slate-700 hover:bg-slate-900 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded ${info.bg} ${info.color} flex items-center justify-center font-bold text-xs`}>
                          {info.tier}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-white flex items-center gap-2">
                            {stat.name}
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-normal border border-slate-700 text-slate-400`}>
                              {stat.conversions} Sales
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-500 flex items-center gap-2">
                            <span>Rev Rate: {reversalRate}%</span>
                            <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                            <span>{info.label} Tier</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-sm font-bold ${info.color}`}>{stat.payoutSpeed}</div>
                        <div className="text-[10px] text-slate-500">Payout Speed</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ANALYTICS TAB */}
        {activeTab === 'ANALYTICS' && (
          <div className="space-y-6">
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <div className="flex justify-between items-center mb-4">
                 <h3 className="font-bold text-white flex items-center gap-2">
                  <BarChart2 className="w-5 h-5 text-purple-500" /> Analytical SQL Queries
                </h3>
                 <button className="text-xs text-slate-400 hover:text-white flex items-center gap-1">
                   <Copy className="w-3 h-3" /> Copy All
                 </button>
              </div>
              <p className="text-sm text-slate-400 mb-4">
                Use these queries in the `TimescaleDB` console to analyze partner behavior and fraud patterns.
              </p>
              
              <div className="relative group">
                <pre className="bg-slate-950 p-6 rounded-xl border border-slate-800 overflow-x-auto text-sm font-mono text-slate-300 leading-relaxed">
                  <code>{ANALYTICAL_SQL}</code>
                </pre>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default GrowthOptimization;
