import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { AppState, AppAction, Task, ActiveTimer, AppSettings, User } from '../types';
import { initializeFirebase, subscribeToAuth, loginWithGoogle, logoutFirebase, isFirebaseInitialized } from '../services/firebaseService';

const defaultSettings: AppSettings = {
  monkMode: false,
  soundEnabled: true,
  notificationsEnabled: true,
  themeAccent: '#00FFD1',
  dailyGoalSessions: 10,
};

const defaultUser: User = {
    id: 'guest',
    name: 'Guest Monk',
    isGuest: true
};

const initialState: AppState = {
  user: defaultUser,
  tasks: [],
  activeTimer: null,
  settings: defaultSettings,
  ui: {
    isSettingsOpen: false,
    isAnalyticsOpen: false,
    isAddTaskOpen: false,
  }
};

const STORAGE_KEY = 'neomonk_state_v2';
const FIREBASE_CONFIG_KEY = 'neomonk_firebase_config';

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'LOAD_STATE':
      return {
          ...state,
          ...action.payload,
          ui: { isSettingsOpen: false, isAnalyticsOpen: false, isAddTaskOpen: false },
          settings: { ...defaultSettings, ...action.payload.settings }
      };

    case 'ADD_TASK':
      return { ...state, tasks: [...state.tasks, action.payload] };

    case 'START_TIMER':
      return { ...state, activeTimer: action.payload };

    case 'CANCEL_TIMER':
      return { ...state, activeTimer: null };

    case 'COMPLETE_SESSION': {
      const { taskId, dateKey, sessionIndex } = action.payload;
      return {
        ...state,
        activeTimer: null,
        tasks: state.tasks.map((t) => {
          if (t.id !== taskId) return t;

          const dayHistory = t.history[dateKey] || [];
          const existingSession = dayHistory.find((s) => s.index === sessionIndex);
          
          let newHistoryForDay;
          if (existingSession) {
             newHistoryForDay = dayHistory.map(s => s.index === sessionIndex ? { ...s, state: 'completed', completedAt: Date.now() } : s);
          } else {
             newHistoryForDay = [...dayHistory, { index: sessionIndex, state: 'completed' as const, completedAt: Date.now() }];
          }

          return {
            ...t,
            history: {
              ...t.history,
              [dateKey]: newHistoryForDay,
            },
          };
        }),
      };
    }
    
    case 'DELETE_TASK':
        return {
            ...state,
            tasks: state.tasks.map(t => t.id === action.payload ? { ...t, archived: true } : t)
        };

    case 'UPDATE_SETTINGS':
        return {
            ...state,
            settings: { ...state.settings, ...action.payload }
        };

    case 'SET_UI_MODAL':
        return {
            ...state,
            ui: {
                ...state.ui,
                [`is${action.payload.modal.charAt(0).toUpperCase() + action.payload.modal.slice(1)}Open`]: action.payload.isOpen
            }
        };
    
    case 'LOGIN_USER':
        return { ...state, user: action.payload };

    case 'LOGOUT_USER':
        return { ...state, user: defaultUser };

    default:
      return state;
  }
};

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  getTaskById: (id: string) => Task | undefined;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  saveFirebaseConfig: (config: any) => boolean;
  isFirebaseConfigured: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const [isFirebaseConfigured, setIsFirebaseConfigured] = React.useState(false);

  // Load App State
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        dispatch({ type: 'LOAD_STATE', payload: parsed });
      } catch (e) {
        console.error("Failed to load state", e);
      }
    }
  }, []);

  // Initialize Firebase if Config Exists
  useEffect(() => {
      const fbConfigStr = localStorage.getItem(FIREBASE_CONFIG_KEY);
      if (fbConfigStr) {
          try {
              const config = JSON.parse(fbConfigStr);
              if (initializeFirebase(config)) {
                  setIsFirebaseConfigured(true);
              }
          } catch(e) {
              console.error("Invalid Firebase Config in storage", e);
          }
      }
  }, []);

  // Subscribe to Auth Changes
  useEffect(() => {
      if (isFirebaseConfigured) {
          const unsubscribe = subscribeToAuth((firebaseUser) => {
              if (firebaseUser) {
                  dispatch({
                      type: 'LOGIN_USER',
                      payload: {
                          id: firebaseUser.uid,
                          name: firebaseUser.displayName || 'Anonymous Monk',
                          email: firebaseUser.email || undefined,
                          photoURL: firebaseUser.photoURL || undefined,
                          isGuest: false
                      }
                  });
              } else {
                  // Only logout if we were previously logged in as a real user
                  // We don't want to override guest state on initial load if auth is slow
                  // But for now, simple approach:
                  // dispatch({ type: 'LOGOUT_USER' }); 
              }
          });
          return () => unsubscribe();
      }
  }, [isFirebaseConfigured]);

  // Save State
  useEffect(() => {
    if (state !== initialState) {
        const stateToSave = { ...state, ui: initialState.ui };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    }
  }, [state]);

  // Timer Fail-Safe
  useEffect(() => {
    if (!state.activeTimer) return;

    const interval = setInterval(() => {
      const now = Date.now();
      if (now >= state.activeTimer!.expectedEndTime) {
        if (state.settings.soundEnabled) {
             const audio = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg');
             audio.play().catch(e => console.log("Audio play failed", e));
        }
        
        dispatch({
          type: 'COMPLETE_SESSION',
          payload: {
            taskId: state.activeTimer!.taskId,
            dateKey: state.activeTimer!.dateKey,
            sessionIndex: state.activeTimer!.sessionIndex,
          },
        });
        
        if (state.settings.notificationsEnabled && Notification.permission === 'granted') {
             new Notification("Session Complete!", { body: "Neo-Monk: Time to rest." });
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [state.activeTimer, state.settings]);

  useEffect(() => {
    if (state.settings.notificationsEnabled && Notification.permission === 'default') {
        Notification.requestPermission();
    }
  }, [state.settings.notificationsEnabled]);

  const getTaskById = useCallback((id: string) => {
    return state.tasks.find((t) => t.id === id);
  }, [state.tasks]);

  const login = async () => {
      if (!isFirebaseConfigured) throw new Error("Firebase not configured");
      await loginWithGoogle();
  };

  const logout = async () => {
      await logoutFirebase();
      dispatch({ type: 'LOGOUT_USER' });
  };

  const saveFirebaseConfig = (config: any) => {
      if (initializeFirebase(config)) {
          localStorage.setItem(FIREBASE_CONFIG_KEY, JSON.stringify(config));
          setIsFirebaseConfigured(true);
          return true;
      }
      return false;
  };

  return (
    <AppContext.Provider value={{ state, dispatch, getTaskById, login, logout, saveFirebaseConfig, isFirebaseConfigured }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};