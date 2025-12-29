
import React, { useState, useMemo } from 'react';
import { 
  Clock, 
  Layers, 
  Zap, 
  ShieldAlert, 
  Power, 
  DollarSign,
  Activity,
  ArrowRight,
  RefreshCw,
  AlertTriangle,
  RotateCcw,
  GripVertical,
  ListOrdered,
  Lock,
  Eye,
  History,
  // Fix: Added missing icons referenced in the UI
  Radio,
  CheckCircle
} from 'lucide-react';
import { TaskDefinition, CycleEvent, HarvestSchedule } from '../types';
import { calculateNextRuns, formatRunTime } from '../services/schedulerService';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

const DAILY_CYCLE: CycleEvent[] = [
  { time: "00:00 UTC", task: "Partition Rotation & Maintenance", type: "MAINTENANCE" },
  { time: "01:00 UTC", task: "B2B Offer Harvest (High Intent)", type: "API" },
  { time: "04:00 UTC", task: "Deep Crawl (New Arbitrage Vectors)", type: "CRAWL" },
  { time: "08:00 UTC", task: "Validation: Peak Consumer Volume", type: "MAINTENANCE" },
  { time: "12:00 UTC", task: "Incremental Sync: Fast-Moving Deals", type: "API" },
  { time: "16:00 UTC", task: "Diurnal Traffic Cycle Optimization", type: "MAINTENANCE" },
  { time: "20:00 UTC", task: "Exhausted Source Cooling Sequence", type: "CRAWL" },
  { time: "23:00 UTC", task: "System Preservation & Backup", type: "MAINTENANCE" }
];

const INITIAL_TASKS: TaskDefinition[] = [
  { id: "t1", name: "Impact/CJ Real-time Sync", schedule: "*/15 * * * *", priority: "P0", description: "Aggressive sync for short-lived arbitrage. P0 intent.", costEstimate: "$0.00", jitter: 2 },
  { id: "t2", name: "Sentiment & Compliance Check", schedule: "Event-Triggered", priority: "P0", description: "Mandatory sentient validation before publishing.", costEstimate: "$0.02/run" },
  { id: "t3", name: "Deep Domain Discovery", schedule: "0 2 * * *", priority: "P1", description: "High-risk scraping. Maximum jitter required for camouflage.", costEstimate: "$2.50/run", jitter: 45 },
  { id: "t4", name: "Inventory Refresh Cycle", schedule: "0 0 * * *", priority: "P2", description: "Evergreen maintenance. Non-critical timing.", costEstimate: "$0.01/run", jitter: 15 },
];

const AutonomousControl: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'SCHEDULE' | 'QUEUES' | 'SAFETY' | 'COST'>('SCHEDULE');
  const [systemStatus, setSystemStatus] = useState<'ONLINE' | 'DRAINING' | 'OFFLINE'>('ONLINE');
  const [currentTasks, setCurrentTasks] = useState<TaskDefinition[]>(INITIAL_TASKS);
  const [selectedTaskId, setSelectedTaskId] = useState<string>(INITIAL_TASKS[0].id);

  const selectedTask = useMemo(() => 
    currentTasks.find(t => t.id === selectedTaskId) || currentTasks[0]
  , [selectedTaskId, currentTasks]);

  const sortedTasks = useMemo(() => {
    const priorityMap = { 'P0': 0, 'P1': 1, 'P2': 2 };
    return [...currentTasks].sort((a, b) => priorityMap[a.priority] - priorityMap[b.priority]);
  }, [currentTasks]);

  const handleShutdown = () => {
    if (confirm("ORCHESTRATION_HALT: Confirm emergency shutdown? All active revenue pools will be drained.")) {
      setSystemStatus('DRAINING');
      setTimeout(() => setSystemStatus('OFFLINE'), 3000);
    }
  };

  const updatePriority = (taskId: string, newPriority: 'P0' | 'P1' | 'P2') => {
    setCurrentTasks(prev => prev.map(t => t.id === taskId ? { ...t, priority: newPriority } : t));
  };

  const getNextRuns = (task: TaskDefinition) => {
    const sched: HarvestSchedule = {
      id: task.id,
      target: 'CRAWL_SPECIFIC',
      cronExpression: task.schedule,
      jitterMinutes: task.jitter || 0,
      enabled: true
    };
    return calculateNextRuns(sched, 5);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] gap-6 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex justify-between items-center flex-shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2 font-rajdhani uppercase tracking-widest">
            <Zap className="w-6 h-6 text-indigo-500" /> Autonomous Ops
          </h2>
          <p className="text-slate-400 font-mono text-[10px] uppercase tracking-tighter">Converting Time and Computation into Scaleable Affiliate Income.</p>
        </div>
        
        <div className="flex items-center gap-4">
           <div className={`px-4 py-1.5 border flex items-center gap-2 font-bold font-mono text-[10px] uppercase tracking-wider ${
             systemStatus === 'ONLINE' ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]' :
             systemStatus === 'DRAINING' ? 'bg-amber-950/30 border-amber-500/50 text-amber-400' :
             'bg-rose-950/30 border-rose-500/50 text-rose-400'
           }`}>
             <Power className={`w-3 h-3 ${systemStatus === 'ONLINE' ? 'animate-pulse' : ''}`} /> SYSTEM_STATUS: {systemStatus}
           </div>
           
           <div className="flex gap-1 bg-slate-900 p-1 border border-slate-800 rounded-none">
            <Button variant={activeTab === 'SCHEDULE' ? 'primary' : 'ghost'} size="sm" onClick={() => setActiveTab('SCHEDULE')}>VECTORS</Button>
            <Button variant={activeTab === 'QUEUES' ? 'primary' : 'ghost'} size="sm" onClick={() => setActiveTab('QUEUES')}>PIPELINE</Button>
            <Button variant={activeTab === 'SAFETY' ? 'primary' : 'ghost'} size="sm" onClick={() => setActiveTab('SAFETY')}>PRESERVATION</Button>
            <Button variant={activeTab === 'COST' ? 'primary' : 'ghost'} size="sm" onClick={() => setActiveTab('COST')}>ECONOMICS</Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin pb-20">
        
        {/* SCHEDULE TAB */}
        {activeTab === 'SCHEDULE' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-indigo-500/20">
                <h3 className="font-bold text-white mb-6 flex items-center justify-between font-rajdhani uppercase text-sm tracking-widest">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-indigo-400" /> Behavioral Execution Cycle
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 uppercase tracking-tighter">Anti-Bot Philosophy Active</div>
                </h3>
                
                <div className="relative pl-6 border-l border-slate-800 space-y-8">
                  {DAILY_CYCLE.map((event, idx) => (
                    <div key={idx} className="relative flex items-center gap-4 group">
                      <div className={`absolute -left-[31px] w-4 h-4 rounded-full border-2 border-slate-900 z-10 flex items-center justify-center transition-all group-hover:scale-125 ${
                        event.type === 'CRAWL' ? 'bg-amber-500 shadow-[0_0_10px_orange]' :
                        event.type === 'API' ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' :
                        'bg-slate-600'
                      }`}></div>
                      
                      <div className="bg-slate-950/50 p-4 w-full border border-slate-800 flex justify-between items-center group-hover:border-slate-600 transition-colors cursor-default">
                        <div>
                          <div className="text-[9px] font-mono text-slate-500 mb-1 uppercase tracking-widest">{event.time}</div>
                          <div className="font-bold text-white text-xs tracking-widest uppercase">{event.task}</div>
                        </div>
                        <Badge variant={event.type === 'CRAWL' ? 'warning' : event.type === 'API' ? 'success' : 'neutral'}>
                          {event.type}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Jitter Simulator */}
              {selectedTask && (
                <Card className="border-emerald-500/20 bg-black/40">
                  <h3 className="font-bold text-white mb-4 flex items-center justify-between font-rajdhani uppercase text-sm tracking-widest">
                    <div className="flex items-center gap-2">
                      <RotateCcw className="w-5 h-5 text-emerald-500" /> Pattern Variance Simulator
                    </div>
                    <Badge variant={selectedTask.priority === 'P0' ? 'danger' : selectedTask.priority === 'P1' ? 'warning' : 'neutral'}>
                      MONETIZATION_PRIORITY: {selectedTask.priority}
                    </Badge>
                  </h3>
                  <div className="bg-black/60 p-5 border border-slate-800">
                    <div className="flex justify-between items-center mb-6 pb-6 border-b border-slate-800/50">
                       <div>
                         <span className="text-[9px] text-slate-500 uppercase font-bold tracking-widest">Node Ident</span>
                         <h4 className="text-white font-bold font-mono text-sm tracking-widest">{selectedTask.id.toUpperCase()}_VECTOR</h4>
                       </div>
                       <div className="text-right">
                         <span className="text-[9px] text-slate-500 uppercase font-bold tracking-widest">Cron Intent</span>
                         <div className="font-mono text-indigo-400 text-sm">{selectedTask.schedule}</div>
                       </div>
                       <div className="text-right">
                         <span className="text-[9px] text-slate-500 uppercase font-bold tracking-widest">Camouflage Jitter</span>
                         <div className="font-mono text-amber-400 text-sm">±{selectedTask.jitter}m</div>
                       </div>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-[9px] text-slate-600 mb-3 uppercase font-bold tracking-[0.2em]">Next 5 Revenue Harvest Windows</p>
                      {getNextRuns(selectedTask).map((date, i) => (
                        <div key={i} className="flex justify-between items-center text-[11px] p-3 bg-slate-900/30 border-l-2 border-indigo-500/40 hover:bg-slate-900 transition-colors">
                          <span className="text-slate-500 font-mono uppercase tracking-tighter">Vector_Run_0{i+1}</span>
                          <span className="text-white font-mono">{formatRunTime(date)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-6 p-4 bg-indigo-950/10 border border-indigo-500/20 flex gap-4 items-start">
                       <History className="w-4 h-4 text-indigo-400 mt-1" />
                       <p className="text-[10px] text-slate-400 font-mono leading-relaxed uppercase">
                         PROMPT_OVERRIDE: Schedules are behavior patterns, not rigid timers. Jitter is mandatory to maintain platform trust and prevent algorithmic fingerprinting.
                       </p>
                    </div>
                  </div>
                </Card>
              )}
            </div>

            {/* Priority Registry */}
            <div className="space-y-6">
               <Card className="bg-slate-900/50 border-indigo-500/10">
                 <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-3">
                   <h3 className="font-bold text-white font-rajdhani uppercase tracking-widest flex items-center gap-2 text-xs">
                     <ListOrdered className="w-4 h-4 text-indigo-400" /> Execution Registry
                   </h3>
                   <div className="text-[9px] text-slate-500 font-mono font-bold uppercase tracking-tighter">Dynamic_Sort</div>
                 </div>
                 <div className="space-y-3">
                   {sortedTasks.map((task, idx) => (
                     <div 
                       key={task.id} 
                       onClick={() => setSelectedTaskId(task.id)}
                       className={`p-4 border transition-all relative overflow-hidden group cursor-pointer ${
                         selectedTaskId === task.id 
                           ? 'bg-indigo-950/20 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.15)]' 
                           : 'bg-black/40 border-slate-800 hover:border-slate-700'
                       }`}
                     >
                       <div className="absolute top-0 right-0 p-1.5">
                         <span className="text-[8px] font-mono text-slate-700 group-hover:text-indigo-500/50 transition-colors font-bold tracking-tighter">
                           [Q_POS: {(idx + 1).toString().padStart(3, '0')}]
                         </span>
                       </div>

                       <div className="absolute left-1 top-1/2 -translate-y-1/2 opacity-10 group-hover:opacity-100 transition-opacity">
                         <GripVertical className="w-3 h-3 text-slate-600" />
                       </div>

                       <div className="pl-4">
                         <div className="flex justify-between items-start mb-2">
                           <span className={`text-[11px] font-bold uppercase tracking-widest ${selectedTaskId === task.id ? 'text-indigo-300' : 'text-slate-400'}`}>{task.name}</span>
                           <div className="flex gap-1">
                              {(['P0', 'P1', 'P2'] as const).map(p => (
                                <button
                                  key={p}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updatePriority(task.id, p);
                                  }}
                                  className={`px-2 py-0.5 text-[8px] font-bold border transition-all duration-300 ${
                                    task.priority === p 
                                      ? p === 'P0' ? 'bg-rose-600 border-rose-500 text-white shadow-[0_0_10px_rgba(225,29,72,0.4)]' : 
                                        p === 'P1' ? 'bg-amber-600 border-amber-500 text-white shadow-[0_0_10px_rgba(245,158,11,0.4)]' : 
                                        'bg-indigo-600 border-indigo-500 text-white shadow-[0_0_10px_rgba(79,70,229,0.4)]'
                                      : 'bg-slate-950 border-slate-800 text-slate-600 hover:text-slate-400'
                                  }`}
                                >
                                  {p}
                                </button>
                              ))}
                           </div>
                         </div>
                         <p className="text-[9px] text-slate-500 font-mono uppercase mb-3 leading-tight line-clamp-2">
                            {task.description}
                         </p>
                         <div className="flex justify-between items-center text-[9px] font-mono text-slate-600 border-t border-slate-800/50 pt-2">
                           <span className="flex items-center gap-1 uppercase tracking-tighter"><Clock className="w-2.5 h-2.5" />{task.schedule}</span>
                           <span className="flex items-center gap-1 uppercase tracking-tighter font-bold text-indigo-400">
                             <Activity className="w-2.5 h-2.5" />
                             EST_COST: {task.costEstimate}
                           </span>
                         </div>
                       </div>
                     </div>
                   ))}
                 </div>
                 
                 <div className="mt-8 p-5 bg-slate-950 border border-slate-800 rounded-none relative overflow-hidden group">
                   <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                      <ShieldAlert className="w-10 h-10 text-rose-500" />
                   </div>
                   <h4 className="text-[10px] font-bold text-slate-500 uppercase mb-3 flex items-center gap-2 tracking-[0.2em]">
                     <AlertTriangle className="w-3 h-3 text-rose-500" /> Preservation Logic
                   </h4>
                   <p className="text-[9px] text-slate-600 leading-relaxed font-mono uppercase">
                     Profitability outranks persistence. Repeated failures trigger automatic priority downgrades. 
                     Current risk profile: <span className="text-emerald-400 font-bold">STABLE</span>.
                   </p>
                 </div>
               </Card>
            </div>
          </div>
        )}

        {/* ... (Other tabs follow similar sentient/obsidian refinements if needed) ... */}
        {activeTab === 'QUEUES' && (
          <Card className="text-center bg-slate-900/20 border-slate-800 min-h-[400px] flex flex-col justify-center">
             <div className="p-8">
               <h3 className="text-lg font-bold text-white mb-2 font-rajdhani uppercase tracking-widest">Sentient Flow Pipeline</h3>
               <p className="text-xs text-slate-500 font-mono uppercase mb-12">Visualizing causal chains from discovery to monetization.</p>
               
               <div className="flex flex-col lg:flex-row items-center justify-center gap-12">
                  <div className="p-6 bg-slate-950 border border-indigo-500/30 w-full lg:w-56 shadow-2xl relative">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2 bg-slate-950 border border-indigo-500 text-[8px] font-bold text-indigo-400 uppercase tracking-[0.2em]">Source</div>
                    <Radio className="w-6 h-6 text-indigo-500 mx-auto mb-3 animate-pulse" />
                    <span className="text-[10px] text-white font-mono uppercase tracking-tighter block">Signal_Ingest_Feed</span>
                    <span className="text-[8px] text-slate-600 font-mono mt-1 block">Latency: 12ms</span>
                  </div>

                  <ArrowRight className="text-slate-800 w-8 h-8 animate-pulse hidden lg:block" />

                  <div className="p-8 bg-indigo-600/10 border-2 border-indigo-500 w-full lg:w-64 shadow-[0_0_30px_rgba(99,102,241,0.2)] group hover:scale-105 transition-transform relative">
                     <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-indigo-600 text-white text-[9px] font-bold uppercase tracking-[0.3em]">Cortex_Router</div>
                     <Zap className="w-8 h-8 text-indigo-400 mx-auto mb-4 animate-pulse" />
                     <p className="text-[10px] text-indigo-300 font-mono uppercase leading-tight">
                       Autonomous intent mapping & safety clearance.
                     </p>
                  </div>

                  <ArrowRight className="text-slate-800 w-8 h-8 animate-pulse hidden lg:block" />

                  <div className="w-full lg:w-64 flex flex-col gap-3">
                    <div className="p-3 bg-emerald-950/20 border border-emerald-500/40 text-left flex items-center gap-3 group overflow-hidden">
                       <CheckCircle className="w-4 h-4 text-emerald-500" />
                       <div>
                         <span className="text-[10px] text-emerald-400 font-mono font-bold uppercase">Revenue_Lane</span>
                         <div className="w-24 h-0.5 bg-slate-800 mt-1"><div className="h-full bg-emerald-500 w-[80%] animate-pulse"></div></div>
                       </div>
                    </div>
                    <div className="p-3 bg-rose-950/20 border border-rose-500/40 text-left flex items-center gap-3 opacity-50">
                       <ShieldAlert className="w-4 h-4 text-rose-500" />
                       <div>
                         <span className="text-[10px] text-rose-400 font-mono font-bold uppercase">Quarantine_Pool</span>
                         <div className="w-24 h-0.5 bg-slate-800 mt-1"><div className="h-full bg-rose-500 w-[5%]"></div></div>
                       </div>
                    </div>
                  </div>
               </div>
             </div>
          </Card>
        )}

      </div>
    </div>
  );
};

export default AutonomousControl;
