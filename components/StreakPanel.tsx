import React from 'react';
import { Task, TaskHistory } from '../types';
import { formatDateKey, getDaysArray, cn } from '../utils';
import { X, Flame } from 'lucide-react';

interface Props {
  task: Task;
  onClose: () => void;
}

export const StreakPanel: React.FC<Props> = ({ task, onClose }) => {
  const days = getDaysArray(task.startDate, task.endDate);
  const today = formatDateKey(new Date());

  // Calculate streaks
  let currentStreak = 0;
  let bestStreak = 0;
  let tempStreak = 0;
  
  // Simple streak logic: Does the day have ANY completed session?
  days.forEach(day => {
    const history = task.history[day] || [];
    const hasActivity = history.some(s => s.state === 'completed');
    
    // Don't break streak for future dates
    if (new Date(day) > new Date()) return;

    if (hasActivity) {
      tempStreak++;
    } else {
        // Only break if it's a past day, not today (unless today is over, simpler logic for now: strictly past days break it)
        if (day < today) {
             tempStreak = 0;
        }
    }
    
    if (tempStreak > bestStreak) bestStreak = tempStreak;
  });
  
  // Recalculate current from end backwards for accuracy or just use tempStreak if loop covers up to today properly
  // Let's do a quick backward scan for "Current Streak"
  let runningCurrent = 0;
  const historyKeys = Object.keys(task.history).sort().reverse();
  // ... this is complex to do perfectly in snippet, simplification:
  // If today has activity or yesterday had activity, count backward.
  
  const hasActivityToday = (task.history[today] || []).some(s => s.state === 'completed');
  let checkDate = new Date();
  if (!hasActivityToday) {
     checkDate.setDate(checkDate.getDate() - 1);
  }
  
  while(true) {
     const dKey = formatDateKey(checkDate);
     if (dKey < task.startDate) break;
     const h = task.history[dKey] || [];
     if (h.some(s => s.state === 'completed')) {
         runningCurrent++;
         checkDate.setDate(checkDate.getDate() - 1);
     } else {
         break;
     }
  }

  return (
    <div className="absolute inset-0 z-10 bg-black/90 backdrop-blur-md flex flex-col p-6 animate-fadeIn">
        <div className="flex justify-between items-center mb-6">
            <h3 className="text-white font-bold flex items-center gap-2">
                <Flame className={task.color === '#FF0055' ? 'text-white' : ''} style={{ color: task.color }} /> 
                Streak Analysis
            </h3>
            <button onClick={onClose} className="text-gray-500 hover:text-white">
                <X size={20} />
            </button>
        </div>

        <div className="flex gap-4 mb-8">
            <div className="bg-gray-900 border border-gray-800 p-4 rounded-lg flex-1 text-center">
                <p className="text-gray-500 text-xs uppercase tracking-widest mb-1">Current Streak</p>
                <p className="text-3xl font-mono text-white" style={{ textShadow: `0 0 10px ${task.color}` }}>{runningCurrent}</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 p-4 rounded-lg flex-1 text-center">
                <p className="text-gray-500 text-xs uppercase tracking-widest mb-1">Best Streak</p>
                <p className="text-3xl font-mono text-gray-300">{bestStreak}</p>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto">
            <h4 className="text-gray-500 text-sm mb-3">Activity Map</h4>
            <div className="grid grid-cols-7 gap-2">
                {days.map(day => {
                    const isFuture = day > today;
                    const history = task.history[day] || [];
                    const completedCount = history.filter(s => s.state === 'completed').length;
                    const intensity = completedCount / task.sessionsPerDay; // 0 to 1
                    
                    return (
                        <div key={day} className="flex flex-col items-center gap-1">
                             <div 
                                className={cn(
                                    "w-full aspect-square rounded-sm border border-gray-800 transition-all",
                                    isFuture ? "opacity-20" : "opacity-100"
                                )}
                                style={{
                                    backgroundColor: intensity > 0 ? task.color : 'transparent',
                                    opacity: isFuture ? 0.2 : (intensity > 0 ? 0.2 + (intensity * 0.8) : 1),
                                    borderColor: intensity > 0 ? task.color : '#374151'
                                }}
                                title={`${day}: ${completedCount}/${task.sessionsPerDay}`}
                             />
                        </div>
                    )
                })}
            </div>
        </div>
    </div>
  );
};