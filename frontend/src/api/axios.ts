import axios from 'axios';
import { useAuthStore } from '@/store/auth.store';

const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    // If accessed via Network IP (e.g. 192.168.x.x) or domain, point to backend on port 8000
    if (host !== 'localhost' && host !== '127.0.0.1' && !host.endsWith('.loca.lt') && !host.endsWith('.ngrok-free.app')) {
      return `http://${host}:8000/api`;
    }
  }
  return import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
};

const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor: attach JWT ──────────────────────────────
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor: handle 401 ─────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthRequest = error.config?.url?.includes('/auth/');
    if (error.response?.status === 401 && !isAuthRequest) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

