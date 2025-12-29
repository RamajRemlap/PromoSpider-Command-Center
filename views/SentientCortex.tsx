
import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  Cpu, 
  Database, 
  Zap, 
  Share2, 
  Network,
  Activity,
  TrendingUp,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { ThoughtProcess, MemoryVector, SentienceMetric } from '../types';
import Card from '../components/ui/Card';
import NeuralNode from '../components/ui/NeuralNode';
import Badge from '../components/ui/Badge';

const MOCK_THOUGHTS: ThoughtProcess[] = [
  { id: 't1', agentId: 'Orchestrator', timestamp: '12:00:01', thought: 'Optimizing harvest frequency for Impact-Radius. Detecting high CTR window.', context: 'Revenue Maximization', confidence: 0.98 },
  { id: 't2', agentId: 'Compliance', timestamp: '12:00:05', thought: 'Quarantining offer #9928. Unrealistic payout ratio (100:1) suggests fraud heuristic.', context: 'Economic Self-Preservation', confidence: 0.95 },
  { id: 't3', agentId: 'Optimizer', timestamp: '12:00:12', thought: 'Adjusting jitter for Scraper-04 cluster to bypass updated Cloudflare fingerprinting.', context: 'Camouflage Strategy', confidence: 0.82 },
];

const MOCK_MEMORY: MemoryVector[] = [
  { id: 'm1', term: 'fraud_velocity_spike', relevance: 0.98, category: 'PATTERN' },
  { id: 'm2', term: 'merchant_tos_clearance', relevance: 0.85, category: 'FACT' },
  { id: 'm3', term: 'optimal_b2b_window', relevance: 0.92, category: 'PATTERN' },
  { id: 'm4', term: 'jitter_variance_min', relevance: 0.99, category: 'RULE' },
  { id: 'm5', term: 'conversion_trust_threshold', relevance: 0.88, category: 'RULE' },
];

const SentientCortex: React.FC = () => {
  const [metrics, setMetrics] = useState<SentienceMetric>({ cognitiveLoad: 45, memoryUsage: 62, swarmConsensus: 98 });
  const [thoughts, setThoughts] = useState<ThoughtProcess[]>(MOCK_THOUGHTS);
  const [activeNodes, setActiveNodes] = useState<boolean[]>(Array(24).fill(false));

  // Simulate Brain Activity
  useEffect(() => {
    const interval = setInterval(() => {
      // Randomize metrics
      setMetrics(prev => ({
        cognitiveLoad: Math.min(100, Math.max(20, prev.cognitiveLoad + (Math.random() * 10 - 5))),
        memoryUsage: Math.min(100, Math.max(40, prev.memoryUsage + (Math.random() * 4 - 2))),
        swarmConsensus: 95 + (Math.random() * 5)
      }));

      // Randomize Neural Nodes
      setActiveNodes(prev => prev.map(() => Math.random() > 0.7));

      // Add revenue-focused thought occasionally
      if (Math.random() > 0.8) {
        const thoughtPool = [
          { t: 'Analyzing EPC data. Increasing focus on Fintech offers.', c: 'Revenue Logic' },
          { t: 'Detecting pattern fatigue in Social Discovery. Rotating angles.', c: 'Optimization' },
          { t: 'Verifying redirect chain longevity. 404 rate increasing on Node-B.', c: 'Survival' },
          { t: 'Applying Bayesian probability to CTA Experiment #102.', c: 'Learning Loop' },
          { t: 'Inhibiting Harvester activity. Target domain showing rate-limit stress.', c: 'Self-Preservation' }
        ];
        const selected = thoughtPool[Math.floor(Math.random() * thoughtPool.length)];
        
        const newThought: ThoughtProcess = {
          id: Math.random().toString(36),
          agentId: 'Cortex',
          timestamp: new Date().toLocaleTimeString(),
          thought: selected.t,
          context: selected.c,
          confidence: 0.85 + (Math.random() * 0.15)
        };
        setThoughts(prev => [newThought, ...prev].slice(0, 10));
      }

    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] gap-6 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex justify-between items-center flex-shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2 font-rajdhani uppercase tracking-widest">
            <Brain className="w-6 h-6 text-indigo-500" /> Sentient Cortex
          </h2>
          <p className="text-slate-400 font-mono text-[10px] uppercase tracking-tighter">Observing decision causal chains and economic self-preservation protocols.</p>
        </div>
        
        <div className="flex items-center gap-4">
           <div className="text-right">
             <div className="text-[9px] text-slate-500 uppercase font-bold tracking-widest">Consciousness Level</div>
             <div className="text-emerald-400 font-mono text-lg font-bold">ASCENSION_V4</div>
           </div>
           <Activity className="w-8 h-8 text-emerald-500 animate-pulse" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin pb-20">
        
        {/* Top Grid: Metrics & Neural Map */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          
          {/* Cognitive Load */}
          <Card className="border-indigo-500/30">
             <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-white flex items-center gap-2 uppercase text-xs tracking-widest">
                  <Cpu className="w-4 h-4 text-indigo-400" /> Cognitive Load
                </h3>
                <span className="text-indigo-400 font-mono text-xs">{metrics.cognitiveLoad.toFixed(1)}%</span>
             </div>
             <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden mb-4">
                <div className="h-full bg-indigo-500 transition-all duration-500 shadow-[0_0_10px_#6366f1]" style={{ width: `${metrics.cognitiveLoad}%` }}></div>
             </div>
             <div className="text-[10px] font-mono text-slate-500 uppercase leading-tight">
                Usage of reasoning capacity. High load indicates multi-vector analysis or deep structural extraction.
             </div>
          </Card>

          {/* Neural Map */}
          <Card className="lg:col-span-2 border-purple-500/30 bg-slate-900/50 relative overflow-hidden">
             <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
             <div className="relative z-10 flex justify-between items-start mb-4">
                <h3 className="font-bold text-white flex items-center gap-2 uppercase text-xs tracking-widest">
                  <Network className="w-4 h-4 text-purple-400" /> Neural State Map
                </h3>
                <div className="flex gap-4">
                   <div className="flex items-center gap-2 text-[9px] text-slate-400 font-bold uppercase"><span className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_5px_#6366f1]"></span>Active</div>
                   <div className="flex items-center gap-2 text-[9px] text-slate-400 font-bold uppercase"><span className="w-2 h-2 rounded-full bg-slate-700"></span>Standby</div>
                </div>
             </div>
             
             {/* Node Grid */}
             <div className="flex flex-wrap gap-4 justify-center py-4 px-6">
                {activeNodes.map((isActive, i) => (
                  <NeuralNode 
                    key={i} 
                    active={isActive} 
                    size={10}
                    delay={i * 30} 
                    color={i % 3 === 0 ? 'bg-indigo-500' : i % 3 === 1 ? 'bg-purple-500' : 'bg-emerald-500'} 
                  />
                ))}
             </div>
          </Card>
        </div>

        {/* Swarm Metrics Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
           <div className="bg-slate-900/50 border border-slate-800 p-4 flex flex-col gap-2 relative overflow-hidden group">
              <div className="absolute right-0 top-0 p-2 opacity-5"><TrendingUp className="w-12 h-12" /></div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">System Revenue Vector</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-mono font-bold text-white tracking-tighter">OPTIMAL</span>
                <span className="text-[10px] text-emerald-400 font-bold">+12.4%</span>
              </div>
           </div>
           <div className="bg-slate-900/50 border border-slate-800 p-4 flex flex-col gap-2 relative overflow-hidden group">
              <div className="absolute right-0 top-0 p-2 opacity-5"><ShieldCheck className="w-12 h-12" /></div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Platform Trust Score</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-mono font-bold text-white tracking-tighter">98.4 / 100</span>
                <span className="text-[10px] text-indigo-400 font-bold">STABLE</span>
              </div>
           </div>
           <div className="bg-slate-900/50 border border-slate-800 p-4 flex flex-col gap-2 relative overflow-hidden group">
              <div className="absolute right-0 top-0 p-2 opacity-5"><AlertTriangle className="w-12 h-12" /></div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Anomaly Rejection Rate</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-mono font-bold text-white tracking-tighter">4.2%</span>
                <span className="text-[10px] text-amber-400 font-bold">NORMAL</span>
              </div>
           </div>
        </div>

        {/* Middle: Thought Stream & Memory */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[500px]">
           
           {/* Thought Stream */}
           <div className="flex flex-col">
              <h3 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-2 tracking-widest">
                <Zap className="w-4 h-4 text-amber-500" /> Intent Causal Chain
              </h3>
              <div className="flex-1 bg-black/80 border border-slate-800 rounded-none overflow-hidden relative">
                 <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-black to-transparent z-10"></div>
                 <div className="p-4 space-y-4 overflow-y-auto h-full scrollbar-thin">
                    {thoughts.map((t) => (
                      <div key={t.id} className="flex gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300 group">
                         <div className="flex flex-col items-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>
                            <div className="w-px flex-1 bg-slate-800 my-1 group-last:bg-transparent"></div>
                         </div>
                         <div className="pb-4 flex-1">
                            <div className="flex items-center justify-between mb-1">
                               <div className="flex items-center gap-2">
                                 <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-tighter">{t.agentId}</span>
                                 <span className="text-[10px] bg-slate-800 text-slate-500 px-1.5 py-0.5 border border-slate-700 font-mono">{t.context}</span>
                               </div>
                               <span className="text-[9px] text-slate-600 font-mono uppercase tracking-widest">{t.timestamp}</span>
                            </div>
                            <p className="text-xs text-amber-100/80 font-mono leading-relaxed group-hover:text-amber-100 transition-colors">
                              {t.thought}
                            </p>
                            <div className="mt-2 flex items-center gap-2">
                               <div className="flex-1 h-1 bg-slate-900 rounded-full overflow-hidden">
                                  <div className="h-full bg-emerald-500" style={{ width: `${t.confidence * 100}%` }}></div>
                                </div>
                                <span className="text-[9px] font-mono text-slate-500 font-bold uppercase tracking-widest">Confidence: {(t.confidence * 100).toFixed(0)}%</span>
                            </div>
                         </div>
                      </div>
                    ))}
                 </div>
                 <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black to-transparent z-10 pointer-events-none"></div>
              </div>
           </div>

           {/* Vector Memory */}
           <div className="flex flex-col">
              <h3 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-2 tracking-widest">
                <Database className="w-4 h-4 text-emerald-500" /> Economic Memory Grid (RAG)
              </h3>
              <Card className="flex-1 border-emerald-500/20 bg-emerald-950/5 relative overflow-hidden" noPadding>
                 <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                    <Share2 className="w-96 h-96 text-emerald-500 animate-[spin_120s_linear_infinite]" />
                 </div>
                 
                 <div className="relative z-10 h-full flex flex-col">
                    <div className="flex justify-between text-[10px] font-bold text-slate-600 mb-2 px-4 py-3 bg-slate-900/50 border-b border-slate-800 uppercase tracking-widest">
                       <span>Semantic_Vector</span>
                       <span>Relevance_Index</span>
                    </div>
                    <div className="flex-1 overflow-y-auto scrollbar-thin p-2 space-y-1">
                      {MOCK_MEMORY.map((m) => (
                        <div key={m.id} className="flex items-center justify-between p-3 bg-black/40 border border-slate-800/50 hover:border-emerald-500/40 transition-all cursor-crosshair group relative">
                            <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-emerald-500 scale-y-0 group-hover:scale-y-100 transition-transform"></div>
                            <div className="flex items-center gap-3">
                               <div className={`w-1 h-1 rounded-full ${m.category === 'FACT' ? 'bg-blue-400' : m.category === 'RULE' ? 'bg-rose-400' : 'bg-amber-400'} shadow-[0_0_5px_currentColor]`}></div>
                               <span className="font-mono text-xs text-slate-400 group-hover:text-emerald-200 transition-colors tracking-tight uppercase">{m.term}</span>
                            </div>
                            <div className="flex items-center gap-3">
                               <div className="w-24 h-1 bg-slate-800 rounded-full overflow-hidden">
                                  <div className="h-full bg-emerald-500 shadow-[0_0_5px_#10b981]" style={{ width: `${m.relevance * 100}%` }}></div>
                               </div>
                               <span className="text-[10px] font-mono text-emerald-400 font-bold">{(m.relevance).toFixed(3)}</span>
                            </div>
                        </div>
                      ))}
                    </div>
                 </div>
              </Card>
           </div>

        </div>

      </div>
    </div>
  );
};

export default SentientCortex;
