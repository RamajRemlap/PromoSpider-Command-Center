
import React from 'react';

interface NeuralNodeProps {
  active: boolean;
  size?: number;
  color?: string;
  delay?: number;
}

const NeuralNode: React.FC<NeuralNodeProps> = ({ active, size = 12, color = 'bg-indigo-500', delay = 0 }) => {
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {active && (
        <>
          <span 
            className={`absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping ${color}`} 
            style={{ animationDelay: `${delay}ms` }}
          ></span>
          <span 
            className={`relative inline-flex rounded-full h-2/3 w-2/3 ${color}`}
          ></span>
        </>
      )}
      {!active && (
        <span className="relative inline-flex rounded-full h-1/2 w-1/2 bg-slate-800 border border-slate-700"></span>
      )}
    </div>
  );
};

export default NeuralNode;
