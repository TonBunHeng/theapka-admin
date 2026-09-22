import { create } from 'zustand';
import api from '../lib/api';
import { queryClient } from '../lib/queryClient';

const STORAGE_KEY = 'theapka_auth';

function getInitialState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.state) {
        return parsed.state;
      }
    }
  } catch {
    // ignore parse errors
  }
  return {
    token: null,
    user: null,
    role: null,
    permissions: [],
    isAuthenticated: false,
  };
}

export const useAuthStore = create((set, get) => ({
  ...getInitialState(),
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token, user, role, permissions } = res.data.data;

      // Hard Rule: If the API returns role 'user' (couple), reject access immediately
      if (role === 'user' || (!role.includes('admin') && role !== 'super_admin')) {
        set({
          isLoading: false,
          error: 'This portal is for staff only.',
        });
        throw new Error('This portal is for staff only.');
      }

      const nextState = {
        token,
        user,
        role,
        permissions: permissions || [],
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };

      set(nextState);
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ state: nextState }));
      return nextState;
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err.message ||
        'Authentication failed. Please verify credentials.';
      set({ isLoading: false, error: msg });
      throw err;
    }
  },

  logout: async () => {
    try {
      if (get().token) {
        await api.post('/auth/logout').catch(() => {});
      }
    } finally {
      localStorage.removeItem(STORAGE_KEY);
      queryClient.clear(); // Clear all cached queries on logout for security
      set({
        token: null,
        user: null,
        role: null,
        permissions: [],
        isAuthenticated: false,
        error: null,
      });
      window.location.href = '/login';
    }
  },

  checkAuth: async () => {
    const { token } = get();
    if (!token) return;

    try {
      const res = await api.get('/auth/me');
      const { user, role, permissions } = res.data.data;

      if (role === 'user') {
        get().logout();
        return;
      }

      set((prev) => {
        const updated = {
          ...prev,
          user,
          role,
          permissions: permissions || [],
          isAuthenticated: true,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ state: updated }));
        return updated;
      });
    } catch (err) {
      if (err?.response?.status === 401) {
        get().logout();
      }
    }
  },
}));

export default useAuthStore;
