import React from 'react';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', className = '' }) => {
  const getStyles = () => {
    switch (variant) {
      case 'success': return 'bg-emerald-950/50 text-emerald-400 border-emerald-500/30 border-l-2 border-l-emerald-500';
      case 'warning': return 'bg-amber-950/50 text-amber-400 border-amber-500/30 border-l-2 border-l-amber-500';
      case 'danger': return 'bg-rose-950/50 text-rose-400 border-rose-500/30 border-l-2 border-l-rose-500';
      case 'info': return 'bg-cyan-950/50 text-cyan-400 border-cyan-500/30 border-l-2 border-l-cyan-500';
      case 'neutral': return 'bg-slate-800 text-slate-400 border-slate-600 border-l-2 border-l-slate-500';
      default: return 'bg-slate-800 text-slate-300 border-slate-600 border-l-2 border-l-slate-400';
    }
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-[10px] uppercase font-mono font-bold tracking-wider border border-l-2 ${getStyles()} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;