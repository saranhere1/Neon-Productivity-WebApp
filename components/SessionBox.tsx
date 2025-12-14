import React from 'react';
import { cn } from '../utils';

interface Props {
  index: number; // 1-based index
  state: 'idle' | 'running' | 'completed';
  color: string;
  onClick: () => void;
  disabled: boolean;
  progress?: number; // 0-100 for running state
}

export const SessionBox: React.FC<Props> = ({ index, state, color, onClick, disabled, progress }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled || state === 'completed'}
      className={cn(
        "relative w-full aspect-square rounded-md border transition-all duration-300 overflow-hidden flex items-center justify-center group",
        state === 'idle' && "border-gray-800 bg-gray-900/50 hover:border-gray-600",
        state === 'completed' && "border-transparent text-black",
        state === 'running' && "border-white animate-pulse"
      )}
      style={{
        backgroundColor: state === 'completed' ? color : undefined,
        borderColor: state === 'running' ? color : undefined,
        boxShadow: state === 'completed' || state === 'running' ? `0 0 10px ${color}40` : 'none'
      }}
    >
      {state === 'idle' && (
        <span className="text-gray-700 text-xs font-mono group-hover:text-gray-500">{index}</span>
      )}
      
      {state === 'completed' && (
        <span className="font-bold text-black/70">✓</span>
      )}

      {state === 'running' && (
        <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
             {/* Simple visual spinner or timer text could go here */}
             <div className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: color }}></div>
        </div>
      )}

      {/* Hover glow for idle */}
      {state === 'idle' && !disabled && (
        <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity" style={{ backgroundColor: color }}></div>
      )}
    </button>
  );
};
