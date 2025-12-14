import React, { useState, useMemo } from 'react';
import { Task } from '../types';
import { ChevronLeft, ChevronRight, Flame } from 'lucide-react';
import { SessionBox } from './SessionBox';
import { StreakPanel } from './StreakPanel';
import { formatDateKey, getNeonShadow, cn, getNeonText, calculateTaskStreak } from '../utils';
import { useApp } from '../context/AppContext';

interface Props {
  task: Task;
}

export const TaskBlock: React.FC<Props> = ({ task }) => {
  const { state: appState, dispatch } = useApp();
  const [viewDate, setViewDate] = useState(new Date());
  const [showStreak, setShowStreak] = useState(false);

  const viewDateKey = formatDateKey(viewDate);
  const todayKey = formatDateKey(new Date());

  // Navigation limits
  const isBeforeStart = viewDateKey < task.startDate;
  
  // Calculate Progress (Total)
  const allDays = Object.keys(task.history);
  let totalCompleted = 0;
  allDays.forEach(day => {
      totalCompleted += task.history[day]?.filter(s => s.state === 'completed').length || 0;
  });
  
  // Calculate expected total sessions
  const dayCount = (new Date(task.endDate).getTime() - new Date(task.startDate).getTime()) / (1000 * 3600 * 24) + 1;
  const totalExpected = Math.round(dayCount * task.sessionsPerDay);

  // Generate boxes for viewDate
  const sessions = useMemo(() => {
    const boxes = [];
    const historyForDay = task.history[viewDateKey] || [];
    
    for (let i = 1; i <= task.sessionsPerDay; i++) {
        // Check if there is an active timer for this specific box
        const isActiveTimer = appState.activeTimer && 
                              appState.activeTimer.taskId === task.id &&
                              appState.activeTimer.dateKey === viewDateKey &&
                              appState.activeTimer.sessionIndex === i;

        const hist = historyForDay.find(h => h.index === i);
        
        boxes.push({
            index: i,
            state: isActiveTimer ? 'running' : (hist ? hist.state : 'idle'),
        });
    }
    return boxes;
  }, [task.history, viewDateKey, task.sessionsPerDay, appState.activeTimer, task.id]);

  const handleSessionClick = (index: number) => {
    // Global Timer Check
    if (appState.activeTimer) {
        alert("A session is already running!");
        return;
    }

    const now = Date.now();
    const duration = task.minutesPerSession * 60 * 1000;
    
    dispatch({
        type: 'START_TIMER',
        payload: {
            taskId: task.id,
            dateKey: viewDateKey,
            sessionIndex: index,
            startTime: now,
            durationMinutes: task.minutesPerSession,
            expectedEndTime: now + duration
        }
    });
  };

  const shiftDate = (delta: number) => {
    const d = new Date(viewDate);
    d.setDate(d.getDate() + delta);
    setViewDate(d);
  };

  // Determine if we can interact
  // Monk Mode: If ANY timer is active, and this is NOT the active task, lock it?
  // Current requirement: "Locks app UI during active session". Usually implies settings/nav.
  // But standard logic implies you can't start another timer anyway.
  
  // Strict check:
  const isInteractable = viewDateKey <= todayKey && !isBeforeStart;
  const isLockedByMonkMode = appState.settings.monkMode && appState.activeTimer && appState.activeTimer.taskId !== task.id;

  return (
    <div className={cn(
        "relative flex flex-col bg-gray-900 rounded-xl border border-gray-800 overflow-hidden transition-all duration-500",
        appState.activeTimer?.taskId === task.id ? getNeonShadow(task.color) : "hover:border-gray-700",
        isLockedByMonkMode && "opacity-50 grayscale pointer-events-none"
    )}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-gray-950/50">
            <div className="flex items-center gap-3">
                <span className="text-2xl">{task.icon}</span>
                <div>
                    <h3 className="font-bold text-white leading-none">{task.name}</h3>
                    <p className={cn("text-xs font-mono mt-1 opacity-80", getNeonText(task.color))}>
                        {totalCompleted} / {totalExpected}
                    </p>
                </div>
            </div>
            
            <div className="flex items-center gap-2">
                 {/* Streak Toggle */}
                 <button 
                    onClick={() => setShowStreak(true)}
                    className="p-2 hover:bg-gray-800 rounded-lg text-gray-500 hover:text-orange-500 transition-colors"
                    disabled={!!isLockedByMonkMode}
                >
                    <Flame size={18} />
                 </button>

                 {/* Date Nav */}
                <div className="flex items-center bg-gray-800 rounded-lg p-1">
                    <button onClick={() => shiftDate(-1)} className="p-1 hover:text-white text-gray-500"><ChevronLeft size={16}/></button>
                    <span className="text-xs font-mono text-gray-300 w-24 text-center">
                        {viewDateKey === todayKey ? 'TODAY' : viewDateKey}
                    </span>
                    <button onClick={() => shiftDate(1)} className="p-1 hover:text-white text-gray-500"><ChevronRight size={16}/></button>
                </div>
            </div>
        </div>

        {/* Grid Content */}
        <div className="p-4 flex-1 relative">
            {isBeforeStart ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-600 space-y-2 min-h-[120px]">
                    <span className="text-2xl">🔒</span>
                    <p className="text-sm">Starts on {task.startDate}</p>
                </div>
            ) : (
                <div className="grid grid-cols-4 gap-3">
                    {sessions.map(session => (
                        <SessionBox 
                            key={session.index}
                            index={session.index}
                            state={session.state as any}
                            color={task.color}
                            disabled={!isInteractable}
                            onClick={() => handleSessionClick(session.index)}
                        />
                    ))}
                </div>
            )}
        </div>

        {/* Streak Overlay */}
        {showStreak && <StreakPanel task={task} onClose={() => setShowStreak(false)} />}
    </div>
  );
};
