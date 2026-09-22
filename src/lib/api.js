import axios from 'axios';
import { toast } from '../components/Toast';
import { setupMockServer } from './mock/mockServer';

const baseURL = import.meta.env.VITE_API_URL || '/api';

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 15000,
});

// Auto-wire mock server if VITE_USE_MOCK is true
if (import.meta.env.VITE_USE_MOCK === 'true') {
  setupMockServer(api);
}

// Request interceptor: Attach Sanctum Bearer token
api.interceptors.request.use(
  (config) => {
    try {
      const stored = localStorage.getItem('theapka_auth');
      if (stored) {
        const { state } = JSON.parse(stored);
        if (state?.token) {
          config.headers.Authorization = `Bearer ${state.token}`;
        }
      }
    } catch {
      // ignore parse errors
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Handle 401 unauthenticated and 403 forbidden
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

    if (status === 401) {
      // Clear auth from localStorage and redirect to login if not already on login page
      localStorage.removeItem('theapka_auth');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login?expired=1';
      }
    } else if (status === 403) {
      toast.error('Access Forbidden: You lack permissions for this administrative operation.');
    }

    return Promise.reject(error);
  }
);

export default api;
