import React, { useRef, useEffect } from 'react';
import { Terminal as TerminalIcon } from 'lucide-react';

interface TerminalProps {
  title?: string;
  logs: Array<{ id: string; timestamp: string; source: string; level: string; message: string }>;
  height?: string;
  className?: string;
}

const Terminal: React.FC<TerminalProps> = ({ 
  title = "sys_out.log", 
  logs, 
  height = "h-96",
  className = "" 
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'ERROR': return 'text-rose-500 font-bold text-glow';
      case 'WARN': return 'text-amber-400';
      case 'SUCCESS': return 'text-emerald-400';
      default: return 'text-slate-300';
    }
  };

  return (
    <div className={`flex flex-col rounded-none border border-slate-700 bg-black relative overflow-hidden ${className}`}>
      
      {/* CRT Effects */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_2px,3px_100%] pointer-events-none z-10"></div>
      <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,0.9)] pointer-events-none z-20"></div>

      {/* Terminal Header */}
      <div className="flex items-center justify-between px-3 py-1 bg-[#111] border-b border-slate-800 z-30">
        <div className="flex items-center gap-2">
          <TerminalIcon className="w-3 h-3 text-slate-500" />
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">{title}</span>
        </div>
        <div className="flex gap-1">
           <div className="w-2 h-2 bg-slate-800"></div>
           <div className="w-2 h-2 bg-slate-800"></div>
           <div className="w-2 h-2 bg-slate-800"></div>
        </div>
      </div>

      {/* Terminal Body */}
      <div 
        ref={scrollRef}
        className={`flex-1 overflow-y-auto p-4 font-mono text-[11px] leading-relaxed ${height} scrollbar-thin relative z-0`}
      >
        {logs.length === 0 && (
          <div className="text-slate-600 italic">Initializing data stream...</div>
        )}
        {logs.map((log) => (
          <div key={log.id} className="flex gap-3 mb-1 opacity-90 hover:opacity-100 hover:bg-white/5 transition-opacity">
            <span className="text-slate-600 flex-shrink-0 w-20">
              {log.timestamp.split('T')[1].slice(0, 8)}
            </span>
            <span className={`flex-shrink-0 w-24 font-bold uppercase tracking-wider ${
              log.source === 'Harvester' ? 'text-blue-400' :
              log.source === 'Scraper' ? 'text-amber-500' :
              log.source === 'Validator' ? 'text-purple-400' : 'text-slate-500'
            }`}>
              {log.source}
            </span>
            <span className={`flex-1 break-all ${getLevelColor(log.level)}`}>
              {log.message}
            </span>
          </div>
        ))}
        {/* Blinking Cursor */}
        <div className="w-2 h-4 bg-emerald-500 animate-pulse mt-2 inline-block"></div>
      </div>
    </div>
  );
};

export default Terminal;