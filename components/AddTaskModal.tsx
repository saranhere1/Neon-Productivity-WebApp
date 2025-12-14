import React, { useState } from 'react';
import { X, Calendar as CalIcon, Clock, ChevronRight, Check } from 'lucide-react';
import { NEON_COLORS, ICONS, cn } from '../utils';
import { Task } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Task) => void;
}

export const AddTaskModal: React.FC<Props> = ({ isOpen, onClose, onSave }) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [color, setColor] = useState(NEON_COLORS[0].value);
  const [icon, setIcon] = useState(ICONS[0]);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  // Default to 10 days out
  const defaultEnd = new Date();
  defaultEnd.setDate(defaultEnd.getDate() + 9);
  const [endDate, setEndDate] = useState(defaultEnd.toISOString().split('T')[0]);
  
  const [sessionsPerDay, setSessionsPerDay] = useState(4);
  const [minutesPerSession, setMinutesPerSession] = useState(25);

  if (!isOpen) return null;

  const totalDays = Math.max(0, (new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 3600 * 24)) + 1;
  const totalSessions = totalDays * sessionsPerDay;

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => s - 1);

  const handleCreate = () => {
    const newTask: Task = {
      id: uuidv4(),
      name,
      color,
      icon,
      startDate,
      endDate,
      sessionsPerDay,
      minutesPerSession,
      history: {},
      archived: false,
    };
    onSave(newTask);
    onClose();
    // Reset form
    setStep(1);
    setName('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-xl border border-gray-800 bg-gray-900 p-6 shadow-2xl relative overflow-hidden">
        {/* Glow effect behind modal */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50"></div>

        <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white tracking-wider flex items-center gap-2">
                <span className="text-cyan-400">Step {step}</span>
                <span className="text-gray-600">/ 4</span>
            </h2>
            <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
                <X size={24} />
            </button>
        </div>

        {step === 1 && (
            <div className="space-y-6 animate-fadeIn">
                <div>
                    <label className="block text-gray-400 text-sm mb-2">Task Name</label>
                    <input 
                        autoFocus
                        type="text" 
                        value={name} 
                        onChange={e => setName(e.target.value)}
                        placeholder="e.g. DSA, Startup, Gym"
                        className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-3 focus:outline-none focus:border-cyan-400 transition-colors text-lg"
                    />
                </div>
                
                <div>
                    <label className="block text-gray-400 text-sm mb-2">Accent Color</label>
                    <div className="flex gap-3">
                        {NEON_COLORS.map(c => (
                            <button 
                                key={c.value}
                                onClick={() => setColor(c.value)}
                                className={cn(
                                    "w-8 h-8 rounded-full border-2 transition-transform hover:scale-110",
                                    color === c.value ? "border-white scale-110 shadow-[0_0_10px_currentColor]" : "border-transparent opacity-50"
                                )}
                                style={{ backgroundColor: c.value, color: c.value }}
                            />
                        ))}
                    </div>
                </div>

                 <div>
                    <label className="block text-gray-400 text-sm mb-2">Icon</label>
                    <div className="flex gap-3 flex-wrap">
                        {ICONS.map(i => (
                            <button 
                                key={i}
                                onClick={() => setIcon(i)}
                                className={cn(
                                    "w-10 h-10 rounded-lg border border-gray-700 bg-gray-800 text-xl flex items-center justify-center transition-all",
                                    icon === i ? `border-[${color}] shadow-[0_0_10px_${color}] text-white` : "opacity-60 hover:opacity-100"
                                )}
                                style={icon === i ? { borderColor: color, boxShadow: `0 0 10px ${color}` } : {}}
                            >
                                {i}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        )}

        {step === 2 && (
             <div className="space-y-6 animate-fadeIn">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-gray-400 text-sm mb-2 flex items-center gap-2"><CalIcon size={14}/> Start Date</label>
                        <input 
                            type="date"
                            value={startDate}
                            onChange={e => setStartDate(e.target.value)}
                            className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-3 focus:outline-none focus:border-cyan-400"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-400 text-sm mb-2 flex items-center gap-2"><CalIcon size={14}/> End Date</label>
                        <input 
                            type="date"
                            value={endDate}
                            min={startDate}
                            onChange={e => setEndDate(e.target.value)}
                            className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-3 focus:outline-none focus:border-cyan-400"
                        />
                    </div>
                </div>
                
                <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700 text-center">
                    <p className="text-gray-400 text-sm">Duration</p>
                    <p className="text-2xl font-bold text-white mt-1">{totalDays} <span className="text-base font-normal text-gray-500">Days</span></p>
                </div>
             </div>
        )}

        {step === 3 && (
            <div className="space-y-6 animate-fadeIn">
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-gray-400 text-sm mb-2">Sessions / Day</label>
                        <input 
                            type="number"
                            min="1"
                            max="20"
                            value={sessionsPerDay}
                            onChange={e => setSessionsPerDay(parseInt(e.target.value))}
                            className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-3 focus:outline-none focus:border-cyan-400"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-400 text-sm mb-2 flex items-center gap-2"><Clock size={14}/> Mins / Session</label>
                        <input 
                            type="number"
                            min="5"
                            max="120"
                            value={minutesPerSession}
                            onChange={e => setMinutesPerSession(parseInt(e.target.value))}
                            className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-3 focus:outline-none focus:border-cyan-400"
                        />
                    </div>
                </div>

                <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-400">Total Commitment</span>
                        <span className="text-white font-bold">{totalSessions} Sessions</span>
                    </div>
                     <div className="flex justify-between items-center">
                        <span className="text-gray-400">Total Time</span>
                        <span className="text-white font-bold">{Math.round((totalSessions * minutesPerSession) / 60)} Hours</span>
                    </div>
                </div>
            </div>
        )}

        {step === 4 && (
            <div className="space-y-6 text-center animate-fadeIn py-4">
                <div className="mx-auto w-20 h-20 rounded-full flex items-center justify-center text-4xl mb-4" style={{ backgroundColor: `${color}20`, border: `2px solid ${color}`, color: color, boxShadow: `0 0 20px ${color}40` }}>
                    {icon}
                </div>
                <h3 className="text-2xl font-bold text-white">{name}</h3>
                <p className="text-gray-400">
                    {totalDays} Days • {sessionsPerDay} sessions/day • {minutesPerSession}m each
                </p>
                <div className="text-sm text-cyan-400 font-mono mt-4 animate-pulse">
                    READY TO DEPLOY
                </div>
            </div>
        )}

        <div className="mt-8 flex justify-end gap-3">
             {step > 1 && (
                <button onClick={handleBack} className="px-4 py-2 text-gray-400 hover:text-white transition-colors">
                    Back
                </button>
            )}
            {step < 4 ? (
                <button 
                    disabled={!name}
                    onClick={handleNext} 
                    className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Next <ChevronRight size={16} />
                </button>
            ) : (
                <button 
                    onClick={handleCreate} 
                    className="flex items-center gap-2 bg-white text-black font-bold px-8 py-2 rounded-lg hover:scale-105 transition-transform shadow-[0_0_15px_rgba(255,255,255,0.4)]"
                >
                    Launch <Check size={16} />
                </button>
            )}
        </div>
      </div>
    </div>
  );
};
