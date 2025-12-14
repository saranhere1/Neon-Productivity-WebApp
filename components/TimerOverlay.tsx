import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { getNeonText, cn } from '../utils';

export const TimerOverlay: React.FC = () => {
  const { state, getTaskById, dispatch } = useApp();
  const [timeLeft, setTimeLeft] = useState('');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!state.activeTimer) return;

    const tick = () => {
        const now = Date.now();
        const diff = state.activeTimer!.expectedEndTime - now;
        
        if (diff <= 0) {
            setTimeLeft("00:00");
            setProgress(100);
            return;
        }

        const totalDuration = state.activeTimer!.durationMinutes * 60 * 1000;
        const elapsed = totalDuration - diff;
        setProgress((elapsed / totalDuration) * 100);

        const mins = Math.floor(diff / 60000);
        const secs = Math.floor((diff % 60000) / 1000);
        setTimeLeft(`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [state.activeTimer]);

  if (!state.activeTimer) return null;

  const task = getTaskById(state.activeTimer.taskId);
  if (!task) return null;

  return (
    <div className="fixed bottom-0 left-0 w-full h-16 bg-gray-900 border-t border-gray-800 z-50 flex items-center px-6 justify-between shadow-[0_-5px_20px_rgba(0,0,0,0.5)]">
        <div className="absolute top-0 left-0 h-[2px] bg-gray-800 w-full">
            <div 
                className="h-full transition-all duration-1000 ease-linear" 
                style={{ width: `${progress}%`, backgroundColor: task.color, boxShadow: `0 0 10px ${task.color}` }} 
            />
        </div>
        
        <div className="flex items-center gap-4">
            <span className="text-2xl animate-pulse">{task.icon}</span>
            <div>
                <span className="text-gray-400 text-xs uppercase tracking-widest">Running Protocol</span>
                <h3 className={cn("font-bold", getNeonText(task.color))}>{task.name}</h3>
            </div>
        </div>

        <div className="font-mono text-3xl font-bold text-white tracking-widest">
            {timeLeft}
        </div>
        
        <button 
            onClick={() => {
                if(confirm("Abort session? Progress will be lost.")) {
                    dispatch({ type: 'CANCEL_TIMER' });
                }
            }}
            className="text-xs text-red-500 hover:text-red-400 font-mono border border-red-900/50 px-3 py-1 rounded bg-red-950/20"
        >
            ABORT
        </button>
    </div>
  );
};