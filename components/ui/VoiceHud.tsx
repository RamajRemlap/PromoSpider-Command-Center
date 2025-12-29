
import React, { useEffect, useState } from 'react';
import { Mic, MicOff, Activity, Zap, Radio } from 'lucide-react';
import { VoiceCommand, VoiceCommandType } from '../../types';

interface VoiceHudProps {
  isListening: boolean;
  lastCommand: VoiceCommand | null;
  onToggle: () => void;
  isAutonomous: boolean;
}

const VoiceHud: React.FC<VoiceHudProps> = ({ isListening, lastCommand, onToggle, isAutonomous }) => {
  const [visualizerBars, setVisualizerBars] = useState<number[]>(new Array(12).fill(10));

  // Simulate audio visualizer effect when listening
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isListening) {
      interval = setInterval(() => {
        setVisualizerBars(prev => prev.map(() => 10 + Math.random() * 40));
      }, 100);
    } else {
      setVisualizerBars(new Array(12).fill(5));
    }
    return () => clearInterval(interval);
  }, [isListening]);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
      
      {/* Command Feedback Toast */}
      {lastCommand && (
        <div className={`mb-4 p-4 rounded-xl border backdrop-blur-md shadow-2xl animate-in slide-in-from-bottom duration-300 max-w-sm pointer-events-auto ${
          lastCommand.type === 'UNKNOWN' 
            ? 'bg-slate-900/80 border-slate-700 text-slate-400' 
            : 'bg-indigo-900/80 border-indigo-500 text-white'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${lastCommand.type === 'UNKNOWN' ? 'bg-slate-500' : 'bg-emerald-400 animate-ping'}`}></div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">
                {lastCommand.type === 'UNKNOWN' ? 'Unrecognized Input' : 'Command Executed'}
              </p>
              <p className="font-rajdhani font-bold text-lg leading-none mt-1">"{lastCommand.raw}"</p>
            </div>
          </div>
        </div>
      )}

      {/* Main HUD Orb */}
      <div className={`
        relative group pointer-events-auto transition-all duration-500
        ${isListening ? 'scale-100' : 'scale-95 opacity-80 hover:opacity-100'}
      `}>
        
        {/* Orbital Rings Animation */}
        {isListening && (
          <>
            <div className="absolute inset-0 border-2 border-indigo-500/30 rounded-full animate-[spin_4s_linear_infinite]"></div>
            <div className="absolute -inset-2 border border-indigo-400/20 rounded-full animate-[spin_6s_linear_infinite_reverse]"></div>
          </>
        )}

        {/* Core Button */}
        <button
          onClick={onToggle}
          className={`
            w-16 h-16 rounded-full flex items-center justify-center border-2 backdrop-blur-xl shadow-[0_0_30px_rgba(0,0,0,0.5)]
            transition-colors duration-300 relative overflow-hidden
            ${isListening 
              ? 'bg-indigo-600/20 border-indigo-400 text-white shadow-[0_0_20px_rgba(99,102,241,0.4)]' 
              : 'bg-slate-900/80 border-slate-700 text-slate-500 hover:border-slate-500 hover:text-slate-300'
            }
            ${isAutonomous ? 'border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.4)]' : ''}
          `}
        >
          {isAutonomous && (
            <div className="absolute inset-0 bg-emerald-500/10 animate-pulse"></div>
          )}
          
          {isListening ? (
            <div className="flex items-center gap-0.5 h-8">
              {visualizerBars.map((h, i) => (
                <div 
                  key={i} 
                  className={`w-1 bg-current rounded-full transition-all duration-100 ${isAutonomous ? 'text-emerald-400' : 'text-indigo-400'}`}
                  style={{ height: `${h}%` }}
                ></div>
              ))}
            </div>
          ) : (
            <MicOff className="w-6 h-6" />
          )}
        </button>

        {/* Status Label */}
        <div className="absolute top-1/2 right-20 -translate-y-1/2 pointer-events-none whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-end pr-2">
          <span className="text-white font-rajdhani font-bold uppercase tracking-wider text-sm shadow-black drop-shadow-md">
            {isListening ? 'Neural Listener Active' : 'Voice Systems Offline'}
          </span>
          {isAutonomous && <span className="text-emerald-400 text-[10px] font-mono uppercase font-bold">Autonomous Mode Engaged</span>}
        </div>

      </div>
    </div>
  );
};

export default VoiceHud;