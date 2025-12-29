import React from 'react';
import { Agent, AgentStatus } from '../types';
import { Activity, PauseCircle, PlayCircle, AlertTriangle } from 'lucide-react';

interface AgentStatusCardProps {
  agent: Agent;
  onToggle: (id: string) => void;
}

const AgentStatusCard: React.FC<AgentStatusCardProps> = ({ agent, onToggle }) => {
  const getStatusColor = (status: AgentStatus) => {
    switch (status) {
      case AgentStatus.RUNNING: return 'text-emerald-400 border-emerald-500/50 bg-emerald-500/10';
      case AgentStatus.PAUSED: return 'text-amber-400 border-amber-500/50 bg-amber-500/10';
      case AgentStatus.ERROR: return 'text-rose-400 border-rose-500/50 bg-rose-500/10';
      default: return 'text-slate-400 border-slate-500/50 bg-slate-500/10';
    }
  };

  const getStatusIcon = (status: AgentStatus) => {
    switch (status) {
      case AgentStatus.RUNNING: return <Activity className="w-4 h-4 animate-pulse" />;
      case AgentStatus.PAUSED: return <PauseCircle className="w-4 h-4" />;
      case AgentStatus.ERROR: return <AlertTriangle className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 flex flex-col h-full">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h4 className="text-white font-semibold flex items-center gap-2">
            {agent.name}
          </h4>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider">{agent.role}</p>
        </div>
        <div className={`px-2 py-1 rounded-full text-xs font-medium border flex items-center gap-1.5 ${getStatusColor(agent.status)}`}>
          {getStatusIcon(agent.status)}
          {agent.status}
        </div>
      </div>

      <div className="flex-1 bg-slate-900 rounded-md p-3 mb-4 overflow-hidden flex flex-col">
        <div className="text-xs text-slate-500 mb-2 border-b border-slate-800 pb-1">Live Logs</div>
        <div className="flex-1 overflow-y-auto scrollbar-thin font-mono text-xs space-y-1">
          {agent.logs.map((log, idx) => (
            <div key={idx} className="text-emerald-500/80 truncate">
              <span className="text-slate-600 mr-2">[{new Date().toLocaleTimeString()}]</span>
              {log}
            </div>
          ))}
          {agent.logs.length === 0 && <span className="text-slate-700 italic">Waiting for activity...</span>}
        </div>
      </div>

      <div className="flex justify-between items-center mt-auto pt-2 border-t border-slate-700">
        <span className="text-xs text-slate-400">Tasks: <span className="text-white">{agent.tasksCompleted}</span></span>
        <button 
          onClick={() => onToggle(agent.id)}
          className={`p-1.5 rounded-md transition-colors ${
            agent.status === AgentStatus.RUNNING 
              ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30' 
              : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
          }`}
        >
          {agent.status === AgentStatus.RUNNING ? <PauseCircle className="w-5 h-5" /> : <PlayCircle className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
};

export default AgentStatusCard;