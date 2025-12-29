
import React, { useState, useMemo } from 'react';
import { AGENT_SPECS } from '../data/agentSpecs';
import { AgentSpec } from '../types';
import { 
  Bot, 
  Code, 
  ShieldCheck, 
  Activity, 
  Cpu, 
  AlertTriangle, 
  Terminal, 
  ChevronRight,
  Database,
  Network,
  ArrowRight,
  Workflow,
  Radio,
  Share2
} from 'lucide-react';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';

const AgentOrchestration: React.FC = () => {
  const [selectedAgentId, setSelectedAgentId] = useState<string>(AGENT_SPECS[0].id);
  
  const selectedAgent = useMemo(() => 
    AGENT_SPECS.find(a => a.id === selectedAgentId) || AGENT_SPECS[0]
  , [selectedAgentId]);

  // Find the full spec for downstream agents to get their readable names
  const downstreamAgentDetails = useMemo(() => 
    selectedAgent.downstreamAgents.map(id => 
      AGENT_SPECS.find(spec => spec.id === id) || { id, name: id, role: 'Unknown' }
    )
  , [selectedAgent]);

  const handleAgentSelect = (id: string) => {
    setSelectedAgentId(id);
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-140px)] gap-6 animate-in fade-in duration-500">
      
      {/* Agent List */}
      <div className="w-full lg:w-1/4 flex flex-col gap-3 overflow-y-auto scrollbar-thin lg:pb-20">
        <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2 font-rajdhani uppercase tracking-wide">
          <Bot className="w-6 h-6 text-indigo-500" /> Agent Swarm
        </h2>
        <div className="space-y-2">
          {AGENT_SPECS.map((agent) => (
            <div
              key={agent.id}
              onClick={() => handleAgentSelect(agent.id)}
              className={`cursor-pointer transition-all duration-300 relative group overflow-hidden border ${
                selectedAgentId === agent.id 
                  ? 'bg-indigo-900/10 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.2)]' 
                  : 'bg-[#0b1120] border-slate-800 hover:border-slate-600'
              }`}
            >
              {/* Holographic Active Bar */}
              {selectedAgentId === agent.id && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 shadow-[0_0_10px_#6366f1]"></div>
              )}
              
              <div className="p-3 flex items-center justify-between">
                <div>
                  <h3 className={`font-bold text-xs uppercase tracking-wider font-rajdhani ${selectedAgentId === agent.id ? 'text-indigo-300 text-glow' : 'text-slate-300'}`}>
                    {agent.name}
                  </h3>
                  <p className="text-[9px] text-slate-500 mt-0.5 uppercase font-mono">{agent.role}</p>
                </div>
                <ChevronRight className={`w-3 h-3 transition-transform ${selectedAgentId === agent.id ? 'text-indigo-400 rotate-90' : 'text-slate-600 group-hover:text-slate-400'}`} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Agent Details & Topology */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <Card className="flex-1 flex flex-col h-full border-slate-700 bg-slate-900/20" noPadding>
          
          {/* Header */}
          <div className="p-6 border-b border-slate-700 bg-slate-950/50">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold text-white font-rajdhani uppercase tracking-widest">{selectedAgent.name}</h2>
                  <Badge variant="success" className="animate-pulse">ACTIVE_NODE</Badge>
                </div>
                <p className="text-slate-400 mt-1 text-sm font-light max-w-2xl">{selectedAgent.objective}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-[10px] text-slate-500 font-mono">UID: {selectedAgent.id.toUpperCase()}</span>
                <span className="text-[10px] text-slate-500 font-mono">CLUSTER: US-EAST-1</span>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {selectedAgent.skills.map((skill, idx) => (
                <span key={idx} className="px-2 py-0.5 bg-indigo-900/10 border border-indigo-500/20 text-[9px] uppercase font-bold text-indigo-400 tracking-wider">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Content Scrollable */}
          <div className="flex-1 overflow-y-auto p-6 scrollbar-thin space-y-10">
            
            {/* NEW: Topology Visualizer */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                <Workflow className="w-4 h-4 text-indigo-400" /> Topology & Data Flow
              </h4>
              
              <div className="relative bg-black/40 border border-slate-800 p-8 flex items-center justify-between min-h-[220px] overflow-hidden rounded-sm">
                {/* Visual Grid Background */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.03)_0%,transparent_70%)]"></div>
                
                {/* SVG Connections Layer */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                   <defs>
                     <linearGradient id="flowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="transparent" />
                        <stop offset="50%" stopColor="#6366f1" />
                        <stop offset="100%" stopColor="transparent" />
                     </linearGradient>
                   </defs>
                   {/* Inputs to Central */}
                   {selectedAgent.inputStreams.map((_, i) => (
                      <path 
                        key={`in-${i}`}
                        d={`M 150 ${80 + (i * 40)} L 300 110`}
                        stroke="#1e293b"
                        strokeWidth="1"
                        fill="none"
                      />
                   ))}
                   {/* Central to Downstream */}
                   {selectedAgent.downstreamAgents.map((_, i) => (
                      <path 
                        key={`out-${i}`}
                        d={`M 450 110 L 600 ${80 + (i * 60)}`}
                        stroke="#1e293b"
                        strokeWidth="1"
                        fill="none"
                      />
                   ))}
                   {/* Active Energy Pulse Simulation (Conceptual) */}
                   <circle cx="375" cy="110" r="2" fill="#6366f1" className="animate-ping" />
                </svg>

                {/* Upstream Section */}
                <div className="flex flex-col gap-3 relative z-10 w-40">
                  <span className="text-[9px] font-mono text-slate-600 uppercase mb-1 text-center">Inbound Streams</span>
                  {selectedAgent.inputStreams.map((stream, idx) => (
                    <div key={idx} className="bg-slate-900 border border-slate-800 px-3 py-1.5 text-[10px] text-slate-400 font-mono flex items-center gap-2 shadow-lg">
                      <Radio className="w-3 h-3 text-indigo-500/50" />
                      <span className="truncate">{stream}</span>
                    </div>
                  ))}
                  {selectedAgent.inputStreams.length === 0 && (
                     <div className="text-[9px] text-slate-700 italic text-center">No static streams</div>
                  )}
                </div>

                {/* Central Focus Node */}
                <div className="flex flex-col items-center relative z-10">
                   <div className="w-20 h-20 bg-indigo-950/20 border-2 border-indigo-500 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.2)] group transition-transform hover:scale-105">
                      <Bot className="w-10 h-10 text-indigo-400 group-hover:text-indigo-300 transition-colors" />
                   </div>
                   <div className="mt-3 bg-indigo-500 text-black font-bold text-[9px] px-2 py-0.5 uppercase tracking-tighter">
                     FOCAL_AGENT
                   </div>
                </div>

                {/* Downstream Section */}
                <div className="flex flex-col gap-3 relative z-10 w-48">
                  <span className="text-[9px] font-mono text-slate-600 uppercase mb-1 text-center">Downstream Pipeline</span>
                  {downstreamAgentDetails.map((agent, idx) => (
                    <button 
                      key={idx}
                      onClick={() => handleAgentSelect(agent.id)}
                      className="bg-slate-900 border border-slate-700 hover:border-indigo-500 hover:bg-slate-800 px-3 py-2 text-[10px] text-slate-300 font-bold flex items-center justify-between shadow-lg group transition-all"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Share2 className="w-3 h-3 text-emerald-500" />
                        <span className="truncate">{agent.name}</span>
                      </div>
                      <ArrowRight className="w-3 h-3 text-slate-600 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                    </button>
                  ))}
                  {downstreamAgentDetails.length === 0 && (
                     <div className="text-[9px] text-slate-700 italic text-center">End of pipeline</div>
                  )}
                </div>
              </div>
            </div>

            {/* Interface & Contract */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                <Code className="w-4 h-4 text-purple-400" /> API Interface Contract
              </h4>
              <div className="bg-black border border-slate-800 p-5 font-mono text-[11px] text-slate-300 relative overflow-hidden group shadow-inner">
                <div className="absolute top-0 right-0 p-3 opacity-30 text-[9px] text-slate-600 uppercase font-bold tracking-widest">Read-Only Secure Block</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-slate-950/50 p-4 border-l border-purple-900/50">
                    <span className="text-purple-400 font-bold block mb-3 text-xs uppercase tracking-widest">Expected Inputs</span>
                    <pre className="text-slate-400 whitespace-pre-wrap">{JSON.stringify(selectedAgent.contract.inputs, null, 2)}</pre>
                  </div>
                  <div className="bg-slate-950/50 p-4 border-l border-emerald-900/50">
                    <span className="text-emerald-400 font-bold block mb-3 text-xs uppercase tracking-widest">Standard Outputs</span>
                    <pre className="text-slate-400 whitespace-pre-wrap">{JSON.stringify(selectedAgent.contract.outputs, null, 2)}</pre>
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-900">
                  <span className="text-amber-500 font-bold block mb-2 text-[10px] uppercase">Required Environment Variables</span>
                  <div className="flex flex-wrap gap-2">
                    {selectedAgent.contract.envVars.map(v => (
                      <span key={v} className="bg-slate-900 text-slate-500 px-2 py-1 rounded-sm border border-slate-800 text-[10px]">
                        {v}
                      </span>
                    ))}
                    {selectedAgent.contract.envVars.length === 0 && <span className="text-slate-700 text-xs italic">No environment dependencies.</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* Policies & Safety */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2 mb-4">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" /> Behavioral Policies
                </h4>
                <div className="space-y-3">
                  {selectedAgent.policies.map((policy, idx) => (
                    <div key={idx} className="bg-slate-900/40 p-4 border border-slate-800 group hover:bg-slate-900/60 transition-colors">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-slate-100 text-xs uppercase tracking-wide">{policy.name}</span>
                        <span className={`text-[9px] font-bold px-2 py-0.5 border ${
                          policy.criticality === 'HIGH' ? 'border-rose-500/50 text-rose-400 bg-rose-950/30' : 'border-blue-500/50 text-blue-400 bg-blue-950/30'
                        }`}>
                          {policy.criticality}
                        </span>
                      </div>
                      <p className="text-slate-500 text-[11px] leading-relaxed">{policy.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2 mb-4">
                  <AlertTriangle className="w-4 h-4 text-amber-400" /> Intervention Triggers
                </h4>
                <div className="bg-amber-950/5 border border-amber-900/20 p-5 space-y-3 rounded-sm">
                  <p className="text-[10px] text-amber-500/80 uppercase font-bold mb-2">Monitor will pause execution if:</p>
                  {selectedAgent.humanReviewTriggers.map((trigger, idx) => (
                    <div key={idx} className="flex items-start gap-3 text-xs text-amber-200/70 font-mono">
                      <span className="text-amber-600 font-bold">[{idx + 1}]</span>
                      <span>{trigger}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer Specifications */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-slate-800 lg:pb-10">
              <div className="bg-slate-950/40 p-5 border border-slate-800/80 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-rose-500/50 group-hover:bg-rose-500 transition-all"></div>
                <h5 className="text-[10px] text-slate-500 uppercase font-bold mb-3 flex items-center gap-2">
                  <Cpu className="w-3 h-3 text-rose-400" /> Error Remediation
                </h5>
                <p className="text-xs text-slate-400 leading-relaxed font-mono">{selectedAgent.failureHandling}</p>
              </div>
              <div className="bg-slate-950/40 p-5 border border-slate-800/80 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500/50 group-hover:bg-emerald-500 transition-all"></div>
                <h5 className="text-[10px] text-slate-500 uppercase font-bold mb-3 flex items-center gap-2">
                  <Database className="w-3 h-3 text-emerald-400" /> Resource Efficiency
                </h5>
                <p className="text-xs text-slate-400 leading-relaxed font-mono">{selectedAgent.costOptimization}</p>
              </div>
              <div className="bg-slate-950/40 p-5 border border-slate-800/80 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-blue-500/50 group-hover:bg-blue-500 transition-all"></div>
                <h5 className="text-[10px] text-slate-500 uppercase font-bold mb-3 flex items-center gap-2">
                  <Network className="w-3 h-3 text-blue-400" /> Core Dependencies
                </h5>
                <div className="flex flex-wrap gap-1.5">
                  {selectedAgent.apiDependencies.map((api, idx) => (
                    <span key={idx} className="text-[9px] bg-slate-900 border border-slate-700 px-2 py-1 text-slate-400 uppercase font-mono">{api}</span>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </Card>
      </div>
    </div>
  );
};

export default AgentOrchestration;
