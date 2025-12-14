import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { V1Display } from './components/V1Display';
import { V2Tasks } from './components/V2Tasks';
import { TimerOverlay } from './components/TimerOverlay';
import { AddTaskModal } from './components/AddTaskModal';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { SettingsModal } from './components/SettingsModal';

const AppContent: React.FC = () => {
  const { state, dispatch } = useApp();

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden text-gray-200 selection:bg-cyan-500/30">
      {/* V1: Top Section (35%) */}
      <div className="h-[35%] shrink-0">
        <V1Display />
      </div>

      {/* V2: Bottom Section (65%) */}
      <div className="h-[65%] shrink-0 relative">
        <div className="absolute top-0 left-0 w-full h-4 bg-gradient-to-b from-black/50 to-transparent z-10 pointer-events-none" />
        <V2Tasks />
      </div>

      <TimerOverlay />

      {/* Modals */}
      <AddTaskModal 
        isOpen={state.ui.isAddTaskOpen}
        onClose={() => dispatch({ type: 'SET_UI_MODAL', payload: { modal: 'addTask', isOpen: false } })}
        onSave={(task) => dispatch({ type: 'ADD_TASK', payload: task })}
      />
      
      <AnalyticsDashboard 
        isOpen={state.ui.isAnalyticsOpen}
        onClose={() => dispatch({ type: 'SET_UI_MODAL', payload: { modal: 'analytics', isOpen: false } })}
      />
      
      <SettingsModal 
        isOpen={state.ui.isSettingsOpen}
        onClose={() => dispatch({ type: 'SET_UI_MODAL', payload: { modal: 'settings', isOpen: false } })}
      />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;
