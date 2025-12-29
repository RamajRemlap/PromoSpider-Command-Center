import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line, AreaChart, Area } from 'recharts';
import { DollarSign, Eye, MousePointerClick, ShieldCheck, Zap, Server, Activity, PauseCircle, PlayCircle, AlertTriangle } from 'lucide-react';
import StatCard from '../components/StatCard';
import { Agent, AgentStatus } from '../types';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';

const MOCK_REVENUE_DATA = [
  { name: 'Mon', revenue: 420 },
  { name: 'Tue', revenue: 380 },
  { name: 'Wed', revenue: 550 },
  { name: 'Thu', revenue: 720 },
  { name: 'Fri', revenue: 890 },
  { name: 'Sat', revenue: 650 },
  { name: 'Sun', revenue: 950 },
];

const MOCK_CONVERSION_DATA = [
  { name: '00:00', clicks: 120, conversions: 5 },
  { name: '04:00', clicks: 80, conversions: 2 },
  { name: '08:00', clicks: 450, conversions: 20 },
  { name: '12:00', clicks: 900, conversions: 45 },
  { name: '16:00', clicks: 1100, conversions: 55 },
  { name: '20:00', clicks: 850, conversions: 40 },
  { name: '23:59', clicks: 300, conversions: 12 },
];

const INITIAL_AGENTS: Agent[] = [
  {
    id: '1',
    name: 'Harvester-01',
    role: 'Discovery',
    status: AgentStatus.RUNNING,
    lastActive: 'Now',
    tasksCompleted: 1420,
    logs: ['Scanning r/churning...', 'Detected new offer: "Chase Sapphire"']
  },
  {
    id: '2',
    name: 'Validator-X',
    role: 'Verification',
    status: AgentStatus.RUNNING,
    lastActive: 'Now',
    tasksCompleted: 304,
    logs: ['Checking redirect chain', 'Cookie verified: 30 days']
  },
  {
    id: '3',
    name: 'Sentinel-AI',
    role: 'Compliance',
    status: AgentStatus.IDLE,
    lastActive: '5m ago',
    tasksCompleted: 89,
    logs: ['Waiting for queue...', 'Analysis complete']
  },
  {
    id: '4',
    name: 'Publisher-V2',
    role: 'Distribution',
    status: AgentStatus.ERROR,
    lastActive: '1m ago',
    tasksCompleted: 45,
    logs: ['CMS API Timeout', 'Retrying...']
  }
];

const AgentModule: React.FC<{ agent: Agent }> = ({ agent }) => (
  <div className="bg-[#0f172a] border border-slate-800 p-4 relative group hover:border-indigo-500/50 transition-colors">
    <div className="flex justify-between items-start mb-3">
      <div>
        <h4 className="font-rajdhani font-bold text-white uppercase tracking-wider">{agent.name}</h4>
        <div className="text-[10px] text-slate-500 font-mono uppercase">{agent.role}</div>
      </div>
      <Badge variant={
        agent.status === AgentStatus.RUNNING ? 'success' : 
        agent.status === AgentStatus.ERROR ? 'danger' : 'neutral'
      }>
        {agent.status}
      </Badge>
    </div>
    
    <div className="h-20 bg-black/50 border border-slate-800 p-2 mb-3 font-mono text-[10px] text-emerald-500/80 overflow-hidden relative">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
      {agent.logs.map((log, i) => (
        <div key={i} className="truncate">
          <span className="text-slate-600 mr-2">{'>'}</span>{log}
        </div>
      ))}
    </div>

    <div className="flex justify-between items-center pt-2 border-t border-slate-800">
      <span className="text-[10px] text-slate-400 font-mono">OP_COUNT: <span className="text-white">{agent.tasksCompleted}</span></span>
      <Activity className={`w-4 h-4 ${agent.status === AgentStatus.RUNNING ? 'text-emerald-500 animate-pulse' : 'text-slate-600'}`} />
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>(INITIAL_AGENTS);

  // Fake live data update
  useEffect(() => {
    const interval = setInterval(() => {
      setAgents(prev => prev.map(a => 
        a.status === AgentStatus.RUNNING 
          ? { ...a, tasksCompleted: a.tasksCompleted + 1, logs: [`Process ID: ${Math.random().toString(16).substr(2,6)}`, ...a.logs].slice(0,2) }
          : a
      ));
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Net Revenue" value={4560.00} change="12.5%" isPositive icon={DollarSign} color="text-emerald-500" type="CURRENCY" />
        <StatCard title="Active Offers" value={324} change="5" isPositive icon={Zap} color="text-amber-500" />
        <StatCard title="Traffic Vol" value={2402} change="8.1%" isPositive icon={MousePointerClick} color="text-cyan-500" />
        <StatCard title="Risk Flags" value={12} change="2" isPositive={false} icon={ShieldCheck} color="text-rose-500" />
      </div>

      {/* Main Visualization Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Revenue Chart */}
        <Card className="lg:col-span-2 min-h-[400px]">
          <div className="flex justify-between items-center mb-6">
            <div>
               <h3 className="font-rajdhani font-bold text-lg text-white uppercase tracking-wider">Revenue Velocity</h3>
               <p className="text-xs text-slate-500 font-mono">7-Day Performance Trend</p>
            </div>
            <div className="flex gap-2">
               <Badge variant="neutral">Weekly</Badge>
               <Badge variant="neutral">USD</Badge>
            </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MOCK_REVENUE_DATA}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={val => `$${val}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', color: '#f8fafc', fontFamily: 'JetBrains Mono' }} 
                  itemStyle={{ color: '#10b981' }}
                  cursor={{ stroke: '#10b981', strokeWidth: 1 }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Conversion Chart */}
        <Card className="min-h-[400px]">
          <div className="flex justify-between items-center mb-6">
            <div>
               <h3 className="font-rajdhani font-bold text-lg text-white uppercase tracking-wider">Funnel Efficiency</h3>
               <p className="text-xs text-slate-500 font-mono">Clicks vs Conversions (24h)</p>
            </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={MOCK_CONVERSION_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                   contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', color: '#f8fafc', fontFamily: 'JetBrains Mono' }}
                />
                <Line type="step" dataKey="clicks" stroke="#06b6d4" strokeWidth={2} dot={false} />
                <Line type="step" dataKey="conversions" stroke="#f59e0b" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div className="bg-cyan-950/30 p-2 border border-cyan-900/50">
               <span className="text-[10px] text-cyan-400 font-bold uppercase block">Clicks</span>
               <span className="text-lg font-mono text-white">4,812</span>
            </div>
             <div className="bg-amber-950/30 p-2 border border-amber-900/50">
               <span className="text-[10px] text-amber-400 font-bold uppercase block">Conversions</span>
               <span className="text-lg font-mono text-white">185</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Agent Swarm Status */}
      <div>
        <h3 className="font-rajdhani font-bold text-white uppercase tracking-widest text-lg mb-4 flex items-center gap-2">
          <Server className="w-5 h-5 text-indigo-500" /> Agent Swarm Status
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {agents.map(agent => (
            <AgentModule key={agent.id} agent={agent} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;