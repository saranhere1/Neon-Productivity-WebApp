import React, { useState } from 'react';
import { X, User, Bell, Monitor, Zap, Database, Shield, Layout, LogOut, Save } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { NEON_COLORS, cn } from '../utils';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const TABS = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'general', label: 'General', icon: Layout },
    { id: 'focus', label: 'Time & Focus', icon: Zap },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'data', label: 'Data & Sync', icon: Database },
];

export const SettingsModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { state, dispatch, login, logout, isFirebaseConfigured, saveFirebaseConfig } = useApp();
  const [activeTab, setActiveTab] = useState('account');
  const [firebaseInput, setFirebaseInput] = useState('');
  const [showConfigInput, setShowConfigInput] = useState(false);

  if (!isOpen) return null;

  const handleClearData = () => {
      if (confirm("DANGER: This will wipe all tasks and history. This action cannot be undone. Proceed?")) {
          localStorage.clear();
          window.location.reload();
      }
  };

  const handleLogin = async () => {
      if (!isFirebaseConfigured) {
          setShowConfigInput(true);
          return;
      }
      try {
          await login();
      } catch(e) {
          console.error(e);
          alert("Login failed. Check console.");
      }
  };

  const handleSaveConfig = () => {
      try {
          const config = JSON.parse(firebaseInput);
          if (saveFirebaseConfig(config)) {
              setShowConfigInput(false);
              alert("Configuration saved! You can now sign in.");
          } else {
              alert("Invalid configuration. Initialization failed.");
          }
      } catch(e) {
          alert("Invalid JSON format.");
      }
  };

  const renderContent = () => {
      switch(activeTab) {
          case 'account':
              return (
                  <div className="space-y-6 animate-fadeIn">
                      <div className="bg-gray-800 p-6 rounded-xl flex items-center justify-between border border-gray-700">
                          <div className="flex items-center gap-4">
                              <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center text-2xl overflow-hidden">
                                  {state.user.photoURL ? (
                                      <img src={state.user.photoURL} alt={state.user.name} className="w-full h-full object-cover" />
                                  ) : (
                                      state.user.isGuest ? '👻' : '👤'
                                  )}
                              </div>
                              <div>
                                  <h3 className="text-xl font-bold text-white">{state.user.name}</h3>
                                  <p className="text-gray-400 text-sm">{state.user.isGuest ? 'Guest User (Local Storage)' : state.user.email}</p>
                              </div>
                          </div>
                          {state.user.isGuest ? (
                               <button 
                                onClick={handleLogin}
                                className="bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 px-4 py-2 rounded-lg hover:bg-cyan-500/30 transition-colors"
                               >
                                   Connect Google
                               </button>
                          ) : (
                               <button 
                                onClick={logout}
                                className="text-red-400 hover:text-red-300 flex items-center gap-2"
                               >
                                   <LogOut size={16} /> Sign Out
                               </button>
                          )}
                      </div>

                      {showConfigInput && state.user.isGuest && (
                          <div className="bg-gray-900 border border-gray-700 p-4 rounded-lg animate-fadeIn">
                              <h4 className="text-white font-bold mb-2">Setup Firebase</h4>
                              <p className="text-gray-400 text-sm mb-3">Paste your Firebase Project Configuration JSON here to enable authentication.</p>
                              <textarea 
                                value={firebaseInput}
                                onChange={e => setFirebaseInput(e.target.value)}
                                placeholder='{"apiKey": "...", "authDomain": "...", ...}'
                                className="w-full h-32 bg-gray-950 border border-gray-800 rounded p-3 text-xs font-mono text-green-400 focus:outline-none focus:border-cyan-500"
                              />
                              <div className="flex justify-end mt-2 gap-2">
                                  <button onClick={() => setShowConfigInput(false)} className="px-3 py-1 text-gray-500 text-sm">Cancel</button>
                                  <button onClick={handleSaveConfig} className="px-3 py-1 bg-cyan-600 text-white rounded text-sm flex items-center gap-1"><Save size={14}/> Save Config</button>
                              </div>
                          </div>
                      )}
                      
                      <div className="p-4 border border-gray-800 rounded-lg bg-gray-900/50">
                          <h4 className="text-gray-400 mb-2 text-sm uppercase">Cloud Sync Status</h4>
                          <div className="flex items-center gap-2">
                               {state.user.isGuest ? (
                                   <>
                                        <div className="w-2 h-2 rounded-full bg-yellow-500" />
                                        <span className="text-sm font-mono text-yellow-500">LOCAL STORAGE</span>
                                   </>
                               ) : (
                                   <>
                                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                        <span className="text-sm font-mono text-green-400">SYNCED TO GOOGLE</span>
                                   </>
                               )}
                          </div>
                      </div>
                  </div>
              );
          
          case 'focus':
              return (
                  <div className="space-y-6 animate-fadeIn">
                      <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg border border-gray-700">
                          <div>
                              <h4 className="text-white font-bold flex items-center gap-2"><Shield size={16} className="text-red-400"/> Monk Mode</h4>
                              <p className="text-gray-400 text-sm">Locks UI during active timer sessions.</p>
                          </div>
                          <button 
                            onClick={() => dispatch({ type: 'UPDATE_SETTINGS', payload: { monkMode: !state.settings.monkMode } })}
                            className={cn(
                                "w-12 h-6 rounded-full transition-colors relative",
                                state.settings.monkMode ? "bg-cyan-500" : "bg-gray-600"
                            )}
                          >
                              <div className={cn("absolute top-1 w-4 h-4 rounded-full bg-white transition-all", state.settings.monkMode ? "left-7" : "left-1")} />
                          </button>
                      </div>
                  </div>
              );

          case 'notifications':
               return (
                  <div className="space-y-6 animate-fadeIn">
                       <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg border border-gray-700">
                          <div>
                              <h4 className="text-white font-bold">Sound Effects</h4>
                              <p className="text-gray-400 text-sm">Play sounds on session complete.</p>
                          </div>
                          <button 
                            onClick={() => dispatch({ type: 'UPDATE_SETTINGS', payload: { soundEnabled: !state.settings.soundEnabled } })}
                            className={cn(
                                "w-12 h-6 rounded-full transition-colors relative",
                                state.settings.soundEnabled ? "bg-cyan-500" : "bg-gray-600"
                            )}
                          >
                              <div className={cn("absolute top-1 w-4 h-4 rounded-full bg-white transition-all", state.settings.soundEnabled ? "left-7" : "left-1")} />
                          </button>
                      </div>
                       <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg border border-gray-700">
                          <div>
                              <h4 className="text-white font-bold">Browser Notifications</h4>
                              <p className="text-gray-400 text-sm">Show alerts when app is in background.</p>
                          </div>
                          <button 
                            onClick={() => dispatch({ type: 'UPDATE_SETTINGS', payload: { notificationsEnabled: !state.settings.notificationsEnabled } })}
                            className={cn(
                                "w-12 h-6 rounded-full transition-colors relative",
                                state.settings.notificationsEnabled ? "bg-cyan-500" : "bg-gray-600"
                            )}
                          >
                              <div className={cn("absolute top-1 w-4 h-4 rounded-full bg-white transition-all", state.settings.notificationsEnabled ? "left-7" : "left-1")} />
                          </button>
                      </div>
                  </div>
               );

          case 'data':
              return (
                  <div className="space-y-6 animate-fadeIn">
                       <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
                           <h4 className="text-white font-bold mb-4">Export Data</h4>
                           <div className="flex gap-4">
                               <button 
                                    onClick={() => {
                                        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state));
                                        const downloadAnchorNode = document.createElement('a');
                                        downloadAnchorNode.setAttribute("href",     dataStr);
                                        downloadAnchorNode.setAttribute("download", "neomonk_export.json");
                                        document.body.appendChild(downloadAnchorNode); // required for firefox
                                        downloadAnchorNode.click();
                                        downloadAnchorNode.remove();
                                    }}
                                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors border border-gray-600"
                               >
                                   Download JSON
                               </button>
                           </div>
                       </div>
                       
                       <div className="p-4 border border-red-900/50 bg-red-950/20 rounded-lg">
                           <h4 className="text-red-500 font-bold mb-2">Danger Zone</h4>
                           <p className="text-gray-400 text-sm mb-4">Irreversible actions.</p>
                           <button 
                                onClick={handleClearData}
                                className="px-4 py-2 bg-red-900/50 hover:bg-red-800 text-red-200 rounded-lg border border-red-800 transition-colors"
                           >
                               Factory Reset App
                           </button>
                       </div>
                  </div>
              );

          default:
              return (
                   <div className="flex items-center justify-center h-full text-gray-500">
                       Select a category
                   </div>
              );
      }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md">
      <div className="w-[800px] h-[600px] bg-gray-950 rounded-2xl border border-gray-800 shadow-2xl flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-gray-900 border-r border-gray-800 p-4 flex flex-col">
            <h2 className="text-xl font-bold text-white mb-8 px-2 tracking-widest">CONTROL</h2>
            <div className="space-y-1 flex-1">
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                            "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all",
                            activeTab === tab.id ? "bg-gray-800 text-white border border-gray-700 shadow-lg" : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                        )}
                    >
                        <tab.icon size={16} /> {tab.label}
                    </button>
                ))}
            </div>
            <div className="text-xs text-gray-600 px-2 mt-4">
                Version 2.0.0 (Neo-Monk)
            </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col relative">
             <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white">
                <X size={24} />
            </button>
            <div className="p-8 h-full overflow-y-auto">
                <h2 className="text-2xl font-bold text-white mb-6 border-b border-gray-800 pb-4">
                    {TABS.find(t => t.id === activeTab)?.label}
                </h2>
                {renderContent()}
            </div>
        </div>
      </div>
    </div>
  );
};