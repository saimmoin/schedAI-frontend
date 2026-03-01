import axios from 'axios';
import { useAuthStore } from './authStore';

const BASE_URL = 'http://127.0.0.1:5000';

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/auth';
    }
    return Promise.resolve(err.response ?? { data: [] });
  }
);

// ── Auth ──────────────────────────────────────────────────────
export const authApi = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
};

// ── Workspaces ────────────────────────────────────────────────
export const workspaceApi = {
  create: (name: string) => api.post('/workspaces', { name }),
  join: (invite_code: string) => api.post('/workspaces/join', { invite_code }),
  getMembers: (id: number) => api.get(`/workspaces/${id}/members`),
  seedCalendar: () => api.post('/workspaces/seed-calendar'),
};

// ── Availability ──────────────────────────────────────────────
export const availabilityApi = {
  save: (rules: object[]) => api.post('/availability', { rules }),
  get: (userId: number) => api.get(`/availability/${userId}`),
  getSlots: (userId: number, date: string) =>
    api.get(`/availability/${userId}/slots`, { params: { date } }),
};

// ── Appointments ──────────────────────────────────────────────
export const appointmentsApi = {
  getWeek: (week: string) => api.get('/appointments', { params: { week } }),
  create: (data: object) => api.post('/appointments', data),
  update: (id: number, data: object) => api.patch(`/appointments/${id}`, data),
  delete: (id: number) => api.delete(`/appointments/${id}`),
  saveTranscript: (id: number, content: string) =>
    api.post(`/appointments/${id}/transcript`, { content }),
};

// ── Public (no auth) ──────────────────────────────────────────
export const publicApi = {
  getSlots: (slug: string) =>
    axios.get(`${BASE_URL}/public/slots/${slug}`),
  book: (slug: string, data: object) =>
    axios.post(`${BASE_URL}/public/book/${slug}`, data),
  joinWaitlist: (slug: string, data: object) =>
    axios.post(`${BASE_URL}/public/waitlist/${slug}`, data),
};

// ── Waitlist ──────────────────────────────────────────────────
export const waitlistApi = {
  getAll: () => api.get('/waitlist'),
  remove: (id: number) => api.delete(`/waitlist/${id}`),
};

// ── AI ────────────────────────────────────────────────────────
export const aiApi = {
  scoreSlots: (slots: object[], context: object) =>
    api.post('/ai/score-slots', { slots, context }),
  optimize: (appointments: object[]) =>
    api.post('/ai/optimize', { appointments }),
  debrief: (appointmentId: number) =>
    api.post('/ai/debrief', { appointment_id: appointmentId }),
};
