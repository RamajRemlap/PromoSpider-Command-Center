import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  noPadding?: boolean;
}

const Card: React.FC<CardProps> = ({ children, className = '', onClick, noPadding = false }) => {
  return (
    <div 
      onClick={onClick}
      className={`
        relative group bg-[#0b1120] border border-slate-800 
        transition-all duration-300
        ${onClick ? 'cursor-pointer hover:border-indigo-500/50 hover:shadow-[0_0_20px_rgba(99,102,241,0.1)]' : ''}
        ${className}
      `}
    >
      {/* Tech Decoration: Top Left Bracket */}
      <div className="absolute -top-px -left-px w-3 h-3 border-t border-l border-slate-600 group-hover:border-indigo-400 transition-colors z-10"></div>
      
      {/* Tech Decoration: Bottom Right Bracket */}
      <div className="absolute -bottom-px -right-px w-3 h-3 border-b border-r border-slate-600 group-hover:border-indigo-400 transition-colors z-10"></div>

      {/* Tech Decoration: Grid Background Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none opacity-20"></div>

      {/* Content */}
      <div className={`relative z-0 ${noPadding ? '' : 'p-5'}`}>
        {children}
      </div>

      {/* Scanning Light Effect on Hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[scan_1s_ease-in-out_infinite] pointer-events-none opacity-0 group-hover:opacity-100 mix-blend-overlay"></div>
    </div>
  );
};

export default Card;