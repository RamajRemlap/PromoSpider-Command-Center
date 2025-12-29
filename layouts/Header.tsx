import React from 'react';
import { Menu, Bell, Search, Wifi, Shield, Cpu, Activity, AlertTriangle } from 'lucide-react';
import { View } from '../App';

interface HeaderProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  title: View;
}

const Header: React.FC<HeaderProps> = ({ isSidebarOpen, toggleSidebar, title }) => {
  return (
    <header className="h-14 bg-[#030712] border-b border-slate-800 flex items-center justify-between px-4 sticky top-0 z-50">
      
      {/* Left: View Context */}
      <div className="flex items-center gap-4 min-w-[200px]">
        <button 
          onClick={toggleSidebar}
          className="text-slate-400 hover:text-indigo-400 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-500 uppercase font-mono leading-none">System View</span>
          <h2 className="text-lg font-bold text-white tracking-widest font-rajdhani uppercase text-glow">
            {title.replace(/_/g, ' ')}
          </h2>
        </div>
      </div>

      {/* Center: Live System Ticker */}
      <div className="hidden lg:flex flex-1 mx-8 h-8 bg-slate-900/50 border border-slate-800 items-center overflow-hidden relative rounded-sm">
         <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 animate-pulse"></div>
         <div className="whitespace-nowrap animate-[scan_10s_linear_infinite] pl-4 text-xs font-mono text-indigo-300/80 flex gap-8">
            <span>[SYSTEM] Scraper Cluster: OPTIMAL</span>
            <span>[NETWORK] Proxy Latency: 42ms</span>
            <span>[WARN] High CPU on Worker-04</span>
            <span>[INFO] Payout cycle complete</span>
            <span>[SYSTEM] New firewall rules applied</span>
         </div>
         {/* Fade Edges */}
         <div className="absolute left-0 w-8 h-full bg-gradient-to-r from-[#030712] to-transparent"></div>
         <div className="absolute right-0 w-8 h-full bg-gradient-to-l from-[#030712] to-transparent"></div>
      </div>

      {/* Right: Metrics & Tools */}
      <div className="flex items-center gap-6">
        
        {/* Metric Cluster */}
        <div className="hidden md:flex items-center gap-4 border-r border-slate-800 pr-6">
           <div className="flex flex-col items-end">
             <span className="text-[10px] text-slate-500 font-bold uppercase">Mainnet</span>
             <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-400">
               <span className="w-1.5 h-1.5 bg-emerald-500 rounded-sm animate-pulse"></span>
               ONLINE
             </div>
           </div>

           <div className="flex flex-col items-end">
             <span className="text-[10px] text-slate-500 font-bold uppercase">Proxies</span>
             <div className="flex items-center gap-1.5 text-xs font-mono text-cyan-400">
               <Wifi className="w-3 h-3" />
               98.2%
             </div>
           </div>

           <div className="flex flex-col items-end">
             <span className="text-[10px] text-slate-500 font-bold uppercase">Load</span>
             <div className="flex items-center gap-1.5 text-xs font-mono text-amber-400">
               <Cpu className="w-3 h-3" />
               34%
             </div>
           </div>
        </div>

        {/* Global Search */}
        <div className="relative hidden xl:block">
          <input 
            type="text" 
            placeholder="CMD_SEARCH..." 
            className="bg-slate-900 border border-slate-700 h-8 w-64 pl-3 pr-8 text-xs font-mono text-white focus:border-indigo-500 focus:bg-slate-800 outline-none transition-all placeholder:text-slate-600"
          />
          <Search className="w-3 h-3 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2" />
        </div>

        <button className="relative text-slate-400 hover:text-white transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 rounded-sm animate-pulse"></span>
        </button>
      </div>
    </header>
  );
};

export default Header;