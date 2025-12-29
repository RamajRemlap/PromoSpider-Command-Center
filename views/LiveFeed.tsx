import React, { useState, useEffect } from 'react';
import { Database, Check, X, Activity, Zap, Filter, Trash2, PauseCircle, PlayCircle } from 'lucide-react';
import { SystemLog, QueueMetric } from '../types';
import Terminal from '../components/ui/Terminal';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const LiveFeed: React.FC = () => {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [logFilter, setLogFilter] = useState<'ALL' | 'ERROR' | 'WARN'>('ALL');
  
  const [metrics, setMetrics] = useState<QueueMetric[]>([
    { queueName: 'discovery_queue', pending: 124, processing: 4, completed: 8540, failed: 12 },
    { queueName: 'scraping_queue', pending: 45, processing: 12, completed: 4210, failed: 89 },
    { queueName: 'extraction_queue', pending: 12, processing: 8, completed: 4190, failed: 2 },
    { queueName: 'validation_queue', pending: 8, processing: 2, completed: 3500, failed: 690 },
  ]);

  // Simulate logs
  useEffect(() => {
    const sources: SystemLog['source'][] = ['Harvester', 'Scraper', 'Validator', 'System'];
    const messages = [
      'Found new URL: https://example.com/promo',
      'Rate limit hit for domain: impact.com (Retry in 2s)',
      'Gemini extraction successful (Confidence: 0.98)',
      'Redirect chain verification failed: Loop detected',
      'Offer #9281 Published to catalog',
      'Proxy rotation: 192.168.1.1 -> 10.0.0.5',
      'API Sync completed: Impact Radius (142 new offers)',
      'Compliance Check: "Get Rich Quick" keyword detected'
    ];

    const interval = setInterval(() => {
      if (isPaused) return;

      const randomMsg = messages[Math.floor(Math.random() * messages.length)];
      const randomSource = sources[Math.floor(Math.random() * sources.length)];
      
      let level: SystemLog['level'] = 'INFO';
      if (randomMsg.includes('failed') || randomMsg.includes('detected')) level = 'ERROR';
      else if (randomMsg.includes('limit')) level = 'WARN';
      else if (randomMsg.includes('Published') || randomMsg.includes('successful')) level = 'SUCCESS';
      
      const newLog: SystemLog = {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toISOString(),
        level,
        source: randomSource,
        message: randomMsg
      };

      setLogs(prev => [...prev.slice(-199), newLog]);
      
      setMetrics(prev => prev.map(m => ({
        ...m,
        pending: Math.max(0, m.pending + Math.floor(Math.random() * 5) - 2),
        completed: m.completed + (Math.random() > 0.5 ? 1 : 0),
        processing: Math.max(1, Math.min(20, m.processing + Math.floor(Math.random() * 3) - 1))
      })));
    }, 800);

    return () => clearInterval(interval);
  }, [isPaused]);

  const filteredLogs = logs.filter(log => {
    if (logFilter === 'ALL') return true;
    if (logFilter === 'ERROR') return log.level === 'ERROR';
    if (logFilter === 'WARN') return log.level === 'WARN' || log.level === 'ERROR';
    return true;
  });

  return (
    <div className="flex flex-col gap-6 h-[calc(100vh-140px)] animate-in fade-in duration-500 pb-20">
      
      {/* Queue Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 flex-shrink-0">
        {metrics.map((queue) => {
          const loadPercent = Math.round((queue.processing / (queue.processing + queue.pending + 1)) * 100);
          return (
            <div key={queue.queueName} className="bg-[#0b1120] border border-slate-700 p-5 relative overflow-hidden group">
              {/* Background Bar */}
              <div className="absolute bottom-0 left-0 h-1 bg-indigo-900 w-full">
                <div 
                  className={`h-full transition-all duration-500 ${queue.failed > 100 ? 'bg-rose-500' : 'bg-cyan-400'}`}
                  style={{ width: `${loadPercent}%` }}
                ></div>
              </div>

              <div className="flex justify-between items-start mb-2">
                 <h4 className="font-mono text-[10px] text-slate-500 uppercase tracking-widest">{queue.queueName.replace('_', ' ')}</h4>
                 <Activity className={`w-3 h-3 ${loadPercent > 80 ? 'text-amber-400 animate-pulse' : 'text-slate-600'}`} />
              </div>

              <div className="flex items-baseline gap-2 mb-4">
                 <span className="text-2xl font-mono font-bold text-white tracking-tight">{queue.pending}</span>
                 <span className="text-[10px] text-slate-500 uppercase">Items Queued</span>
              </div>

              {/* Mini Bar Gauge */}
              <div className="flex gap-0.5 h-6 items-end">
                {[...Array(10)].map((_, i) => (
                  <div 
                    key={i} 
                    className={`flex-1 transition-colors ${i < (loadPercent/10) ? 'bg-indigo-500' : 'bg-slate-800'}`}
                    style={{ height: `${20 + (Math.random() * 80)}%` }}
                  ></div>
                ))}
              </div>
              
              <div className="flex justify-between text-[10px] font-mono pt-3 border-t border-slate-800 mt-3">
                 <span className="text-emerald-400">{queue.completed} OK</span>
                 <span className={`${queue.failed > 0 ? 'text-rose-400' : 'text-slate-600'}`}>{queue.failed} ERR</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Terminal Section */}
      <div className="flex-1 min-h-0 flex flex-col border border-slate-700 bg-black relative">
        
        {/* Toolbar */}
        <div className="flex items-center justify-between p-2 bg-[#111] border-b border-slate-800">
          <div className="flex items-center gap-4 px-2">
             <div className="flex items-center gap-2 text-slate-300">
               <Zap className="w-4 h-4 text-amber-500" />
               <span className="font-rajdhani font-bold text-sm uppercase">SYS_STREAM_V1</span>
             </div>
             <div className="h-4 w-px bg-slate-800"></div>
             <div className="flex gap-1">
               {['ALL', 'WARN', 'ERROR'].map(f => (
                 <button 
                   key={f}
                   onClick={() => setLogFilter(f as any)}
                   className={`px-3 py-1 text-[10px] font-bold uppercase transition-colors ${logFilter === f ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-white bg-slate-900'}`}
                 >
                   {f}
                 </button>
               ))}
             </div>
          </div>

          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              className="!p-1 h-6 w-6" 
              onClick={() => setIsPaused(!isPaused)}
            >
              {isPaused ? <PlayCircle className="w-4 h-4 text-emerald-400" /> : <PauseCircle className="w-4 h-4 text-slate-400" />}
            </Button>
            <Button 
              variant="ghost" 
              className="!p-1 h-6 w-6 hover:text-rose-400"
              onClick={() => setLogs([])}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <Terminal 
          logs={filteredLogs} 
          height="h-full" 
          className="flex-1 !border-0" 
          title="promo_spider_core.log"
        />
      </div>
    </div>
  );
};

export default LiveFeed;