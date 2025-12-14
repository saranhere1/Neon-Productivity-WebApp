import React from 'react';
import { X, TrendingUp, Clock, Calendar, Zap, CheckCircle, Flame } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { calculateTaskStreak, cn } from '../utils';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const AnalyticsDashboard: React.FC<Props> = ({ isOpen, onClose }) => {
  const { state } = useApp();
  if (!isOpen) return null;

  const tasks = state.tasks.filter(t => !t.archived);

  // 1. Overview Metrics
  let totalSessions = 0;
  let totalMinutes = 0;
  let totalBestStreak = 0;

  // 2. Heatmap Data (Simple map of date -> count)
  const activityMap: Record<string, number> = {};

  tasks.forEach(task => {
    const { bestStreak } = calculateTaskStreak(task);
    if (bestStreak > totalBestStreak) totalBestStreak = bestStreak;

    Object.entries(task.history).forEach(([date, sessions]) => {
      const completedCount = sessions.filter(s => s.state === 'completed').length;
      if (completedCount > 0) {
        totalSessions += completedCount;
        totalMinutes += completedCount * task.minutesPerSession;
        activityMap[date] = (activityMap[date] || 0) + completedCount;
      }
    });
  });

  // Last 30 days for activity chart
  const last30Days = [];
  for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      last30Days.push(d.toISOString().split('T')[0]);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md">
      <div className="w-[90vw] h-[90vh] max-w-5xl bg-gray-950 rounded-2xl border border-gray-800 shadow-2xl flex flex-col overflow-hidden relative">
        {/* Header */}
        <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-gray-900/50">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <TrendingUp className="text-purple-400" /> System Analytics
            </h2>
            <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
                <X size={24} />
            </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8">
            
            {/* 1. Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
                    <div className="text-gray-500 text-xs uppercase tracking-widest mb-2 flex items-center gap-2">
                        <CheckCircle size={14} /> Total Sessions
                    </div>
                    <div className="text-4xl font-mono text-cyan-400 font-bold">{totalSessions}</div>
                </div>
                <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
                     <div className="text-gray-500 text-xs uppercase tracking-widest mb-2 flex items-center gap-2">
                        <Clock size={14} /> Focused Time
                    </div>
                    <div className="text-4xl font-mono text-purple-400 font-bold">
                        {Math.floor(totalMinutes / 60)}<span className="text-lg text-gray-600">h</span> {totalMinutes % 60}<span className="text-lg text-gray-600">m</span>
                    </div>
                </div>
                <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
                     <div className="text-gray-500 text-xs uppercase tracking-widest mb-2 flex items-center gap-2">
                        <Zap size={14} /> Active Tasks
                    </div>
                    <div className="text-4xl font-mono text-green-400 font-bold">{tasks.length}</div>
                </div>
                 <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
                     <div className="text-gray-500 text-xs uppercase tracking-widest mb-2 flex items-center gap-2">
                        <Flame size={14} /> Best Streak
                    </div>
                    <div className="text-4xl font-mono text-orange-400 font-bold">{totalBestStreak}</div>
                </div>
            </div>

            {/* 2. Global Activity Map */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                 <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <Calendar size={18} className="text-gray-400"/> Activity Heatmap (Last 30 Days)
                 </h3>
                 <div className="flex justify-between items-end h-32 gap-1">
                    {last30Days.map(day => {
                        const count = activityMap[day] || 0;
                        const height = Math.min(100, count * 10); // Scale roughly
                        return (
                            <div key={day} className="flex-1 flex flex-col justify-end gap-1 group relative">
                                <div 
                                    className={cn(
                                        "w-full rounded-t-sm transition-all duration-500",
                                        count > 0 ? "bg-cyan-500/50 hover:bg-cyan-400 shadow-[0_0_10px_rgba(0,255,209,0.3)]" : "bg-gray-800"
                                    )}
                                    style={{ height: count === 0 ? '4px' : `${height}%` }}
                                />
                                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-black text-xs px-2 py-1 rounded border border-gray-700 opacity-0 group-hover:opacity-100 whitespace-nowrap z-10 pointer-events-none">
                                    {day}: {count} sessions
                                </div>
                            </div>
                        );
                    })}
                 </div>
            </div>

            {/* 3. Task Performance Table */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-950/50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-800">
                            <th className="p-4">Protocol</th>
                            <th className="p-4">Sessions</th>
                            <th className="p-4">Consistency</th>
                            <th className="p-4">Status</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-300">
                        {tasks.map(task => {
                             const completed = Object.values(task.history).flat().filter(s => s.state === 'completed').length;
                             const days = (new Date(task.endDate).getTime() - new Date(task.startDate).getTime()) / (1000 * 3600 * 24) + 1;
                             const totalExpected = days * task.sessionsPerDay;
                             const rate = totalExpected > 0 ? (completed / totalExpected) * 100 : 0;
                             
                             return (
                                <tr key={task.id} className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
                                    <td className="p-4 font-bold flex items-center gap-2">
                                        <span className="text-xl">{task.icon}</span> 
                                        <span style={{color: task.color}}>{task.name}</span>
                                    </td>
                                    <td className="p-4 font-mono">{completed} / {totalExpected}</td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-24 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                                <div className="h-full bg-white" style={{ width: `${rate}%` }} />
                                            </div>
                                            <span className="text-xs text-gray-500 font-mono">{Math.round(rate)}%</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-xs font-mono uppercase text-gray-500">
                                        ACTIVE
                                    </td>
                                </tr>
                             )
                        })}
                    </tbody>
                </table>
            </div>

        </div>
      </div>
    </div>
  );
};