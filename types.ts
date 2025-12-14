export type TaskColor = '#00FFD1' | '#BD00FF' | '#42FF00' | '#FF0055' | '#007FFF';

export interface SessionState {
  index: number;
  state: 'idle' | 'running' | 'completed';
  completedAt?: number;
}

export interface TaskHistory {
  [dateString: string]: SessionState[];
}

export interface Task {
  id: string;
  name: string;
  color: string;
  icon: string;
  startDate: string; // ISO Date YYYY-MM-DD
  endDate: string;   // ISO Date YYYY-MM-DD
  sessionsPerDay: number;
  minutesPerSession: number;
  history: TaskHistory;
  archived: boolean;
}

export interface ActiveTimer {
  taskId: string;
  dateKey: string; // YYYY-MM-DD
  sessionIndex: number;
  startTime: number;
  durationMinutes: number;
  expectedEndTime: number;
}

export interface AppSettings {
  monkMode: boolean; // Locks UI during active sessions
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  themeAccent: TaskColor;
  dailyGoalSessions: number; // Global goal for analytics
}

export interface User {
  id: string;
  name: string;
  email?: string;
  photoURL?: string;
  isGuest: boolean;
}

export interface AppState {
  user: User;
  tasks: Task[];
  activeTimer: ActiveTimer | null;
  settings: AppSettings;
  ui: {
    isSettingsOpen: boolean;
    isAnalyticsOpen: boolean;
    isAddTaskOpen: boolean;
  };
}

export type AppAction =
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'START_TIMER'; payload: ActiveTimer }
  | { type: 'COMPLETE_SESSION'; payload: { taskId: string; dateKey: string; sessionIndex: number } }
  | { type: 'CANCEL_TIMER' }
  | { type: 'LOAD_STATE'; payload: AppState }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<AppSettings> }
  | { type: 'SET_UI_MODAL'; payload: { modal: 'settings' | 'analytics' | 'addTask'; isOpen: boolean } }
  | { type: 'LOGIN_USER'; payload: User }
  | { type: 'LOGOUT_USER' };