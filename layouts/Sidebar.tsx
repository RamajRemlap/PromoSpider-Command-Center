
import React from 'react';
import { 
  LayoutDashboard, 
  Search, 
  Globe, 
  Bot, 
  Activity, 
  Database, 
  Settings, 
  Network, 
  Zap, 
  BookOpen, 
  TrendingUp, 
  Users, 
  Cloud,
  FileCode,
  Radio,
  ChevronRight,
  Brain,
  GitMerge
} from 'lucide-react';
import { View } from '../App';

interface SidebarProps {
  isOpen: boolean;
  currentView: View;
  onNavigate: (view: View) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, currentView, onNavigate }) => {
  
  const NavItem = ({ view, icon: Icon, label }: { view: View, icon: any, label: string }) => {
    const isActive = currentView === view;
    return (
      <button
        onClick={() => onNavigate(view)}
        className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium transition-all duration-200 relative group
          ${isActive 
            ? 'text-white bg-slate-800/50' 
            : 'text-slate-500 hover:text-indigo-400 hover:bg-slate-900'
          }`}
      >
        {/* Active Indicator LED */}
        <div className={`absolute left-0 top-0 bottom-0 w-0.5 transition-all ${isActive ? 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.8)]' : 'bg-transparent group-hover:bg-slate-700'}`}></div>
        
        <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-indigo-400' : 'text-slate-600 group-hover:text-indigo-400'}`} />
        
        {isOpen && (
          <span className={`font-rajdhani uppercase tracking-wider ${isActive ? 'text-glow' : ''}`}>
            {label}
          </span>
        )}

        {/* Hover Arrow */}
        {isOpen && isActive && <ChevronRight className="w-3 h-3 ml-auto text-indigo-500" />}
      </button>
    );
  };

  const GroupLabel = ({ label }: { label: string }) => (
    isOpen ? (
      <div className="px-4 mt-6 mb-2 flex items-center gap-2">
         <div className="h-px bg-slate-800 flex-1"></div>
         <span className="text-[10px] font-bold font-mono uppercase text-slate-600">{label}</span>
      </div>
    ) : <div className="h-4"></div>
  );

  return (
    <aside 
      className={`bg-[#050914] border-r border-slate-800 flex-shrink-0 transition-all duration-300 flex flex-col z-40
      ${isOpen ? 'w-64' : 'w-16 items-center'}
      `}
    >
      {/* Brand */}
      <div className="h-14 flex items-center px-4 border-b border-slate-800 bg-[#030712]">
        <div className="w-8 h-8 bg-indigo-900/20 border border-indigo-500/50 flex items-center justify-center flex-shrink-0 relative overflow-hidden group">
          <div className="absolute inset-0 bg-indigo-500/20 blur-sm group-hover:bg-indigo-400/30 transition-all"></div>
          <Globe className="w-5 h-5 text-indigo-400 relative z-10" />
        </div>
        {isOpen && (
          <div className="ml-3">
            <h1 className="font-bold text-white leading-none font-rajdhani text-lg tracking-wide">PROMO<span className="text-indigo-500">SPIDER</span></h1>
            <p className="text-[9px] text-slate-500 font-mono tracking-widest uppercase mt-0.5">Cmd Center v2.4</p>
          </div>
        )}
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin py-4">
        <NavItem view={View.DASHBOARD} icon={LayoutDashboard} label="Dashboard" />
        
        <GroupLabel label="OPS_CORE" />
        <NavItem view={View.AUTO_CONTROL} icon={Zap} label="Auto Control" />
        <NavItem view={View.PIPELINE} icon={GitMerge} label="Pipeline Arch" />
        <NavItem view={View.LIVE_FEED} icon={Activity} label="Data Stream" />
        <NavItem view={View.OFFERS} icon={Database} label="Catalog" />
        <NavItem view={View.PLAYBOOK} icon={BookOpen} label="Playbook" />

        <GroupLabel label="INTEL_LAYER" />
        <NavItem view={View.SENTIENT} icon={Brain} label="Sentient Cortex" />
        <NavItem view={View.AGENTS} icon={Bot} label="Agent Swarm" />
        <NavItem view={View.GROWTH} icon={TrendingUp} label="Growth Engine" />
        <NavItem view={View.ANALYZER} icon={Search} label="Neural Analyzer" />
        <NavItem view={View.PROMPTS} icon={FileCode} label="Prompt DB" />

        <GroupLabel label="INFRA_NET" />
        <NavItem view={View.INTEGRATIONS} icon={Network} label="Integrations" />
        <NavItem view={View.PARTNERS} icon={Users} label="Partner Grid" />
        <NavItem view={View.SCRAPER} icon={Globe} label="Scraper Cluster" />
        <NavItem view={View.TRACKING} icon={Radio} label="Track & Trace" />

        <GroupLabel label="SYS_ADMIN" />
        <NavItem view={View.DEPLOYMENT} icon={Cloud} label="Deployment" />
        <NavItem view={View.EXPORT} icon={FileCode} label="Engineer Export" />
        <NavItem view={View.SETTINGS} icon={Settings} label="System Config" />
      </div>

      {/* Footer User Profile */}
      <div className="p-4 border-t border-slate-800 bg-[#030712]">
        <div className={`flex items-center gap-3 ${!isOpen && 'justify-center'}`}>
          <div className="w-8 h-8 bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold font-mono text-white relative">
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-sm border border-black"></span>
            AD
          </div>
          {isOpen && (
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-white font-rajdhani uppercase tracking-wider">Administrator</p>
              <p className="text-[10px] text-slate-500 font-mono truncate">ID: 8829-ALPHA</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
