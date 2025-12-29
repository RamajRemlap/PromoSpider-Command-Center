import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown, Minus, Activity } from 'lucide-react';
import Card from './ui/Card';

export type MetricType = 'CURRENCY' | 'NUMBER' | 'PERCENTAGE';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  icon: LucideIcon;
  color: string;
  type?: MetricType;
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  change, 
  isPositive, 
  icon: Icon, 
  color,
  type = 'NUMBER'
}) => {
  const formatValue = (val: string | number) => {
    if (typeof val === 'string') return val;
    
    switch (type) {
      case 'CURRENCY':
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
      case 'NUMBER':
        return new Intl.NumberFormat('en-US', { notation: "compact", compactDisplay: "short" }).format(val);
      case 'PERCENTAGE':
        return `${val}%`;
      default:
        return val;
    }
  };

  // Determine border/glow color based on 'color' prop input (e.g. 'text-emerald-500')
  const glowColor = color.includes('emerald') ? 'shadow-emerald-500/10 border-emerald-500/20' :
                    color.includes('rose') ? 'shadow-rose-500/10 border-rose-500/20' :
                    color.includes('amber') ? 'shadow-amber-500/10 border-amber-500/20' :
                    color.includes('blue') ? 'shadow-blue-500/10 border-blue-500/20' :
                    'shadow-slate-500/10 border-slate-500/20';

  return (
    <div className={`relative bg-[#0b1120] border ${glowColor} p-5 overflow-hidden group hover:shadow-lg transition-all duration-300`}>
      {/* Decorative Corner */}
      <div className={`absolute top-0 right-0 w-0 h-0 border-t-[30px] border-r-[30px] border-t-transparent border-r-slate-800 group-hover:border-r-${color.split('-')[1]}-900 transition-colors`}></div>

      <div className="flex justify-between items-start relative z-10">
        <div className="flex flex-col">
           <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-rajdhani">{title}</span>
           <h3 className="text-3xl font-bold text-white tracking-tight mt-1 font-mono">{formatValue(value)}</h3>
        </div>
        <div className={`p-2 bg-slate-900/50 border border-slate-700 rounded-sm ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
         {/* Sparkline Simulation */}
         <div className="flex gap-0.5 items-end h-6 opacity-30">
            {[40, 60, 45, 70, 50, 80, 60, 90, 75].map((h, i) => (
              <div key={i} className={`w-1 bg-current ${color}`} style={{ height: `${h}%` }}></div>
            ))}
         </div>

         {change ? (
          <div className="flex items-center text-xs font-mono font-bold">
            <span className={`flex items-center gap-1 ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {change}
            </span>
          </div>
        ) : (
           <div className="text-xs text-slate-600 font-mono">NO DATA</div>
        )}
      </div>

      {/* Bottom Bar */}
      <div className={`absolute bottom-0 left-0 h-0.5 transition-all duration-500 ${isPositive ? 'bg-emerald-500' : 'bg-rose-500'} w-0 group-hover:w-full`}></div>
    </div>
  );
};

export default StatCard;