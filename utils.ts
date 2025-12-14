import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Task } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatDateKey = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const getDaysArray = (start: string, end: string) => {
  const arr = [];
  const dt = new Date(start);
  const endDt = new Date(end);
  
  while (dt <= endDt) {
    arr.push(new Date(dt).toISOString().split('T')[0]);
    dt.setDate(dt.getDate() + 1);
  }
  return arr;
};

// Generates a neon shadow class based on color hex
export const getNeonShadow = (color: string) => {
  switch (color) {
    case '#00FFD1': return 'shadow-[0_0_15px_rgba(0,255,209,0.4)] border-[#00FFD1]';
    case '#BD00FF': return 'shadow-[0_0_15px_rgba(189,0,255,0.4)] border-[#BD00FF]';
    case '#42FF00': return 'shadow-[0_0_15px_rgba(66,255,0,0.4)] border-[#42FF00]';
    case '#FF0055': return 'shadow-[0_0_15px_rgba(255,0,85,0.4)] border-[#FF0055]';
    case '#007FFF': return 'shadow-[0_0_15px_rgba(0,127,255,0.4)] border-[#007FFF]';
    default: return 'shadow-[0_0_15px_rgba(255,255,255,0.4)] border-white';
  }
};

export const getNeonText = (color: string) => {
   switch (color) {
    case '#00FFD1': return 'text-[#00FFD1]';
    case '#BD00FF': return 'text-[#BD00FF]';
    case '#42FF00': return 'text-[#42FF00]';
    case '#FF0055': return 'text-[#FF0055]';
    case '#007FFF': return 'text-[#007FFF]';
    default: return 'text-white';
  }
};

export const NEON_COLORS = [
  { label: 'Cyan', value: '#00FFD1' },
  { label: 'Purple', value: '#BD00FF' },
  { label: 'Green', value: '#42FF00' },
  { label: 'Pink', value: '#FF0055' },
  { label: 'Blue', value: '#007FFF' },
];

export const ICONS = ['⚡', '📘', '🧠', '🔥', '💻', '🎨', '🏋️', '🧘', '🚀', '🛠️', '🎵', '📚'];

// Analytics Helpers
export const calculateTaskStreak = (task: Task) => {
    let currentStreak = 0;
    let bestStreak = 0;
    let tempStreak = 0;
    const today = formatDateKey(new Date());
    const days = getDaysArray(task.startDate, task.endDate);
    
    // Forward pass for best streak
    days.forEach(day => {
        if (day > today) return;
        const history = task.history[day] || [];
        const hasActivity = history.some(s => s.state === 'completed');
        
        if (hasActivity) {
            tempStreak++;
        } else {
             // Strict streak: missed day breaks it
             if (day < today) tempStreak = 0;
        }
        if (tempStreak > bestStreak) bestStreak = tempStreak;
    });

    // Backward pass for current streak
    let checkDate = new Date();
    // If today has no activity yet, start checking from yesterday? 
    // "Current streak" usually implies active consecutive days ending today or yesterday.
    const hasActivityToday = (task.history[today] || []).some(s => s.state === 'completed');
    if (!hasActivityToday) {
        checkDate.setDate(checkDate.getDate() - 1);
    }

    while(true) {
        const dKey = formatDateKey(checkDate);
        if (dKey < task.startDate) break;
        const h = task.history[dKey] || [];
        if (h.some(s => s.state === 'completed')) {
            currentStreak++;
            checkDate.setDate(checkDate.getDate() - 1);
        } else {
            break;
        }
    }

    return { currentStreak, bestStreak };
};
