
import React from 'react';
import { 
  GitMerge, 
  ArrowRight, 
  Bot, 
  Database, 
  Globe, 
  Cpu, 
  ShieldCheck, 
  FileText, 
  Activity, 
  Users, 
  TrendingUp,
  Zap
} from 'lucide-react';
import Card from '../components/ui/Card';
import NeuralNode from '../components/ui/NeuralNode';

// Map agents to icons
const AGENT_MAP: Record<string, { icon: any, color: string, label: string }> = {
  "Harvester": { icon: Globe, color: "text-blue-400", label: "Discovery" },
  "Scraper": { icon: Database, color: "text-amber-400", label: "Ingestion" },
  "Parser": { icon: Cpu, color: "text-purple-400", label: "AI Extraction" },
  "Validator": { icon: ShieldCheck, color: "text-cyan-400", label: "Verification" },
  "Compliance": { icon: ShieldCheck, color: "text-rose-400", label: "Safety" },
  "Publisher": { icon: FileText, color: "text-emerald-400", label: "Distribution" },
  "Tracking": { icon: Activity, color: "text-indigo-400", label: "Attribution" },
  "Partner": { icon: Users, color: "text-pink-400", label: "Partners" },
  "Optimizer": { icon: TrendingUp, color: "text-yellow-400", label: "Growth ML" }
};

const PipelineArchitecture: React.FC = () => {

  const Node = ({ id, next }: { id: string, next?: boolean }) => {
    const config = AGENT_MAP[id];
    return (
      <div className="flex flex-col items-center relative group">
        <div className={`
          w-20 h-20 bg-slate-900 border-2 border-slate-700 rounded-xl 
          flex flex-col items-center justify-center gap-2
          shadow-lg transition-all duration-300
          group-hover:border-indigo-500 group-hover:shadow-[0_0_20px_rgba(99,102,241,0.3)]
          relative z-10
        `}>
          <config.icon className={`w-8 h-8 ${config.color}`} />
          <span className="text-[10px] font-bold text-white uppercase">{id}</span>
        </div>
        
        {/* Connection Line */}
        {next && (
          <div className="absolute top-1/2 left-full w-12 h-0.5 bg-slate-700 -z-0">
             <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 border-t-2 border-r-2 border-slate-700 rotate-45"></div>
             {/* Flow Animation */}
             <div className="absolute top-0 left-0 h-full w-4 bg-indigo-500 animate-[moveRight_2s_linear_infinite]"></div>
          </div>
        )}

        <div className="mt-2 text-[9px] text-slate-500 font-mono bg-slate-950 px-2 py-1 rounded border border-slate-800">
          {config.label}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] gap-6 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex justify-between items-center flex-shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2 font-rajdhani uppercase">
            <GitMerge className="w-6 h-6 text-indigo-500" /> Pipeline Architecture
          </h2>
          <p className="text-slate-400">End-to-end autonomous workflow DAG visualization.</p>
        </div>
        <div className="flex items-center gap-2 bg-slate-900 px-3 py-1 rounded border border-slate-800">
          <NeuralNode active={true} size={10} color="bg-emerald-500" />
          <span className="text-xs text-emerald-400 font-mono">SYSTEM_FLOW: OPTIMAL</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin pb-20">
        <Card className="min-h-[600px] border-slate-700 bg-slate-950/50 relative overflow-hidden flex items-center justify-center">
           
           {/* Background Grid */}
           <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]"></div>

           <div className="relative z-10 flex flex-col gap-16">
              
              {/* Row 1: Ingestion */}
              <div className="flex items-center gap-12">
                 <Node id="Harvester" next />
                 <Node id="Scraper" next />
                 <Node id="Parser" next />
                 <Node id="Validator" />
              </div>

              {/* Connector Down */}
              <div className="absolute right-[88px] top-[80px] h-[130px] w-0.5 bg-slate-700">
                 <div className="absolute top-0 left-0 w-full h-8 bg-indigo-500 animate-[moveDown_2s_linear_infinite]"></div>
              </div>

              {/* Row 2: Processing */}
              <div className="flex items-center gap-12 pl-[380px]">
                 <Node id="Compliance" next />
                 <Node id="Publisher" />
              </div>

              {/* Connector Down */}
               <div className="absolute right-[88px] top-[240px] h-[130px] w-0.5 bg-slate-700">
                 <div className="absolute top-0 left-0 w-full h-8 bg-indigo-500 animate-[moveDown_2s_linear_infinite]"></div>
              </div>

              {/* Row 3: Revenue & Growth */}
              <div className="flex items-center gap-12">
                 <Node id="Partner" next />
                 <Node id="Tracking" next />
                 <Node id="Optimizer" />
              </div>

              {/* Feedback Loop (Optimizer -> Harvester) */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
                 <path 
                   d="M 690 440 L 800 440 L 800 550 L 100 550 L 100 80" 
                   fill="none" 
                   stroke="#334155" 
                   strokeWidth="2" 
                   strokeDasharray="5,5"
                 />
                 <circle cx="800" cy="550" r="4" fill="#6366f1" className="animate-ping" />
                 <path 
                   d="M 100 80 L 95 90 M 100 80 L 105 90" 
                   stroke="#334155" 
                   strokeWidth="2"
                 />
                 <text x="400" y="540" className="fill-indigo-400 text-[10px] font-mono font-bold tracking-widest">FEEDBACK LOOP (RE-TRAINING)</text>
              </svg>

           </div>
        </Card>

        {/* Legend */}
        <div className="grid grid-cols-3 gap-6 mt-6">
           <Card className="border-l-4 border-l-blue-500">
              <h4 className="font-bold text-white mb-2 font-rajdhani uppercase">Discovery Layer</h4>
              <p className="text-xs text-slate-400">Scans high-trust sources. Filters using Bloom Filters. Ingests raw HTML.</p>
           </Card>
           <Card className="border-l-4 border-l-purple-500">
              <h4 className="font-bold text-white mb-2 font-rajdhani uppercase">Cognitive Layer</h4>
              <p className="text-xs text-slate-400">LLM-based extraction. Semantic risk analysis. Automated copywriting.</p>
           </Card>
           <Card className="border-l-4 border-l-emerald-500">
              <h4 className="font-bold text-white mb-2 font-rajdhani uppercase">Revenue Layer</h4>
              <p className="text-xs text-slate-400">Attribution tracking. Partner payouts. Yield optimization algorithms.</p>
           </Card>
        </div>
      </div>
    </div>
  );
};

export default PipelineArchitecture;