import { create } from 'zustand';
import { User, Workspace } from '../types';

interface AuthState {
  token: string | null;
  user: User | null;
  workspace: Workspace | null;
  setAuth: (token: string, user: User) => void;
  setWorkspace: (workspace: Workspace) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

const safeParseJSON = (key: string) => {
  try {
    const val = localStorage.getItem(key);
    if (!val || val === 'undefined' || val === 'null') return null;
    return JSON.parse(val);
  } catch {
    localStorage.removeItem(key);
    return null;
  }
};

export const useAuthStore = create<AuthState>((set, get) => ({
  token: localStorage.getItem('schedai_token') || null,
  user: safeParseJSON('schedai_user'),
  workspace: safeParseJSON('schedai_workspace'),

  setAuth: (token, user) => {
    localStorage.setItem('schedai_token', token);
    localStorage.setItem('schedai_user', JSON.stringify(user));
    set({ token, user });
  },

  setWorkspace: (workspace) => {
    localStorage.setItem('schedai_workspace', JSON.stringify(workspace));
    set({ workspace });
  },

  logout: () => {
    localStorage.removeItem('schedai_token');
    localStorage.removeItem('schedai_user');
    localStorage.removeItem('schedai_workspace');
    set({ token: null, user: null, workspace: null });
  },

  isAuthenticated: () => !!get().token && !!get().user,
}));