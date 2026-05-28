// src/api/index.js
import api from './client';

// AUTH
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  refresh: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
  me: () => api.get('/auth/me'),
  addRole: (role) => api.post('/auth/add-role', { role }),
  changePassword: (data) => api.post('/auth/change-password', data),
};

// SESSIONS
export const sessionsAPI = {
  getAll: (params) => api.get('/sessions', { params }),
  getById: (id) => api.get(`/sessions/${id}`),
  create: (data) => api.post('/sessions', data),
  createQuick: (data) => api.post('/sessions/quick', data),
  enroll: (id) => api.post(`/sessions/${id}/enroll`),
  unenroll: (id) => api.delete(`/sessions/${id}/enroll`),
  updateStatus: (id, status) => api.patch(`/sessions/${id}/status`, { status }),
};

// USERS
export const usersAPI = {
  me: () => api.get('/users/me'),
  updateMe: (data) => api.patch('/users/me', data),
  getById: (id) => api.get(`/users/${id}`),
  getTutors: (params) => api.get('/users/tutors', { params }),
  getHistory: () => api.get('/users/me/history'),
  getFavorites: () => api.get('/users/me/favorites'),
  toggleFavorite: (sessionId) => api.post(`/users/me/favorites/${sessionId}`),
};

// REVIEWS
export const reviewsAPI = {
  create: (data) => api.post('/reviews', data),
  getByTutor: (tutorId, params) => api.get(`/reviews/tutor/${tutorId}`, { params }),
};

// CHAT
export const chatAPI = {
  getConversations: () => api.get('/chat'),
  getMessages: (convId, params) => api.get(`/chat/${convId}`, { params }),
  send: (data) => api.post('/chat/send', data),
};

// ADMIN
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (params) => api.get('/admin/users', { params }),
  toggleUser: (id) => api.patch(`/admin/users/${id}/toggle`),
};
