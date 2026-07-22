import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Redirect to login on 401 (expired/invalid session)
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && !err.config.url.includes('/auth/')) {
      localStorage.removeItem('token');
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  logoutAll: () => api.post('/auth/logout-all'),
  refresh: () => api.post('/auth/refresh'),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  getMe: () => api.get('/auth/me'),
};

export const userAPI = {
  updateProfile: (data) => api.put('/users/profile', data),
  updateSettings: (data) => api.put('/users/settings', data),
  changePassword: (data) => api.put('/users/password', data),
};

export const pasteAPI = {
  createPaste: (data) => api.post('/pastes', data),
  getPaste: (id) => api.get(`/pastes/${id}`),
  unlockPaste: (id, password) => api.post(`/pastes/${id}/unlock`, { password }),
  updatePaste: (id, data) => api.put(`/pastes/${id}`, data),
  deletePaste: (id) => api.delete(`/pastes/${id}`),
  archivePaste: (id) => api.post(`/pastes/${id}/archive`),
  restorePaste: (id) => api.post(`/pastes/${id}/restore`),
  duplicatePaste: (id) => api.post(`/pastes/${id}/duplicate`),
  getRecentPublic: () => api.get('/pastes/recent'),
  getTrending: () => api.get('/pastes/trending'),
  searchPastes: (params) => api.get('/pastes/search', { params }),
  getMyPastes: (params) => api.get('/pastes/mine', { params }),
  getDashboard: () => api.get('/pastes/dashboard'),
  getQr: (id) => api.get(`/pastes/${id}/qr`),
  downloadUrl: (id, format) => `${api.defaults.baseURL}/pastes/${id}/download?format=${format}`,
  toggleFavorite: (id) => api.post(`/pastes/${id}/favorite`),
  isFavorited: (id) => api.get(`/pastes/${id}/favorite`),
  getFavorites: () => api.get('/pastes/favorites'),
};

export const reportAPI = {
  create: (data) => api.post('/reports', data),
};

export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  listUsers: () => api.get('/admin/users'),
  updateUserRole: (id, role) => api.put(`/admin/users/${id}/role`, { role }),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  listPastes: () => api.get('/admin/pastes'),
  deletePaste: (id) => api.delete(`/admin/pastes/${id}`),
  listReports: () => api.get('/admin/reports'),
  resolveReport: (id) => api.put(`/admin/reports/${id}/resolve`),
  listAnnouncements: () => api.get('/admin/announcements'),
  createAnnouncement: (data) => api.post('/admin/announcements', data),
  deleteAnnouncement: (id) => api.delete(`/admin/announcements/${id}`),
};

export const announcementAPI = {
  getActive: () => api.get('/announcements'),
};

export default api;
