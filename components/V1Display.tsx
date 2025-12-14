import React from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Settings, Activity, User as UserIcon, Flame } from 'lucide-react';
import { cn, calculateTaskStreak } from '../utils';

export const V1Display: React.FC = () => {
  const { state, dispatch } = useApp();
  const activeTasks = state.tasks.filter(t => !t.archived);

  // Calculate Data for Custom Bars
  const taskProgressData = activeTasks.map(t => {
      const completed = Object.values(t.history).flat().filter(s => s.state === 'completed').length;
      const days = (new Date(t.endDate).getTime() - new Date(t.startDate).getTime()) / (1000 * 3600 * 24) + 1;
      const total = Math.round(days * t.sessionsPerDay);
      const percentage = total > 0 ? (completed / total) * 100 : 0;
      const { currentStreak } = calculateTaskStreak(t);
      
      return {
          ...t,
          completed,
          total,
          percentage,
          currentStreak
      };
  });

  const isMonkModeLocked = state.settings.monkMode && !!state.activeTimer;

  return (
    <div className="h-full flex flex-col bg-gray-950 border-b border-gray-800">
      
      <div className="flex-1 flex overflow-hidden">
        {/* H1: Graphs & Streaks (70%) */}
        <div className="w-[70%] p-6 border-r border-gray-800 relative flex flex-col">
             <div className="absolute top-4 left-6 flex items-center gap-2 text-gray-500 text-sm font-mono tracking-widest uppercase">
                <Activity size={14} /> System Status
             </div>

             <div className="flex-1 mt-8 overflow-y-auto pr-2 space-y-4">
                 {activeTasks.length === 0 ? (
                     <div className="h-full flex items-center justify-center text-gray-600 font-mono">
                        <div className="text-center">
                            <p className="mb-2">SYSTEM EMPTY</p>
                            <p className="text-xs opacity-50">Initialize a protocol via Toolbar (+)</p>
                        </div>
                     </div>
                 ) : (
                    taskProgressData.map(task => (
                        <div key={task.id} className="group">
                            <div className="flex justify-between items-end mb-1">
                                <span className="text-sm font-bold text-gray-300 flex items-center gap-2">
                                    {task.icon} {task.name}
                                </span>
                                <div className="flex items-center gap-3">
                                    {task.currentStreak > 0 && (
                                        <div className="flex items-center gap-1 text-orange-500 animate-pulse" title="Current Streak">
                                            <Flame size={12} fill="currentColor" />
                                            <span className="text-xs font-mono font-bold">{task.currentStreak}</span>
                                        </div>
                                    )}
                                    <span className="text-xs font-mono text-gray-500">{Math.round(task.percentage)}%</span>
                                </div>
                            </div>
                            <div className="h-2 w-full bg-gray-900 rounded-full overflow-hidden border border-gray-800">
                                <div 
                                    className="h-full transition-all duration-1000 ease-out relative"
                                    style={{ 
                                        width: `${task.percentage}%`, 
                                        backgroundColor: task.color,
                                        boxShadow: `0 0 10px ${task.color}`
                                    }}
                                >
                                    <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                            </div>
                        </div>
                    ))
                 )}
             </div>
        </div>

        {/* H2: Toolbar (30%) - Icons Only */}
        <div className="w-[30%] bg-gray-900/30 flex flex-col justify-center items-center">
             <div className="grid grid-cols-2 gap-4 p-4">
                {/* Add Task */}
                <button 
                    onClick={() => dispatch({ type: 'SET_UI_MODAL', payload: { modal: 'addTask', isOpen: true } })}
                    disabled={isMonkModeLocked}
                    className={cn(
                        "w-14 h-14 rounded-xl flex items-center justify-center border transition-all duration-200",
                        isMonkModeLocked 
                            ? "border-gray-800 bg-gray-900 text-gray-700 cursor-not-allowed" 
                            : "border-gray-700 bg-gray-800 text-cyan-400 hover:border-cyan-400 hover:shadow-[0_0_15px_rgba(0,255,209,0.2)] hover:scale-105"
                    )}
                    title="Add Task"
                >
                    <Plus size={24} />
                </button>

                {/* Analytics */}
                <button 
                    onClick={() => dispatch({ type: 'SET_UI_MODAL', payload: { modal: 'analytics', isOpen: true } })}
                    disabled={isMonkModeLocked}
                    className={cn(
                         "w-14 h-14 rounded-xl flex items-center justify-center border transition-all duration-200",
                         isMonkModeLocked
                            ? "border-gray-800 bg-gray-900 text-gray-700 cursor-not-allowed"
                            : "border-gray-700 bg-gray-800 text-purple-400 hover:border-purple-400 hover:shadow-[0_0_15px_rgba(189,0,255,0.2)] hover:scale-105"
                    )}
                    title="Analytics"
                >
                    <Activity size={24} />
                </button>

                {/* Settings */}
                <button 
                    onClick={() => dispatch({ type: 'SET_UI_MODAL', payload: { modal: 'settings', isOpen: true } })}
                    disabled={isMonkModeLocked}
                    className={cn(
                        "w-14 h-14 rounded-xl flex items-center justify-center border transition-all duration-200",
                        isMonkModeLocked
                            ? "border-gray-800 bg-gray-900 text-gray-700 cursor-not-allowed"
                            : "border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-400 hover:text-white hover:scale-105"
                    )}
                    title="Settings"
                >
                    <Settings size={24} />
                </button>

                {/* Account */}
                <button 
                    onClick={() => dispatch({ type: 'SET_UI_MODAL', payload: { modal: 'settings', isOpen: true } })} // Account is inside settings for now
                    disabled={isMonkModeLocked}
                    className={cn(
                        "w-14 h-14 rounded-xl flex items-center justify-center border transition-all duration-200",
                        isMonkModeLocked
                            ? "border-gray-800 bg-gray-900 text-gray-700 cursor-not-allowed"
                            : "border-gray-700 bg-gray-800 text-gray-400 hover:border-green-400 hover:text-green-400 hover:scale-105"
                    )}
                    title="Account"
                >
                    <UserIcon size={24} />
                </button>
             </div>
             
             {isMonkModeLocked && (
                 <div className="mt-4 px-4 py-2 bg-red-950/30 border border-red-900/50 rounded text-red-500 text-xs font-mono animate-pulse">
                     MONK MODE ACTIVE
                 </div>
             )}
        </div>
      </div>
    </div>
  );
};
