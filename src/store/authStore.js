// src/store/authStore.js
import { create } from 'zustand';
import { authAPI } from '../api';

const useAuthStore = create((set, get) => ({
  user: null,
  tokens: null,
  isLoading: true,
  isAuthenticated: false,

  init: async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return set({ isLoading: false });
    try {
      const { data } = await authAPI.me();
      set({ user: data.data, isAuthenticated: true, isLoading: false });
    } catch {
      localStorage.clear();
      set({ isLoading: false });
    }
  },

  login: async (credentials) => {
    const { data } = await authAPI.login(credentials);
    const { user, tokens } = data.data;
    localStorage.setItem('accessToken', tokens.accessToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);
    set({ user, tokens, isAuthenticated: true });
    return user;
  },

  register: async (formData) => {
    const { data } = await authAPI.register(formData);
    const { user, tokens } = data.data;
    localStorage.setItem('accessToken', tokens.accessToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);
    set({ user, tokens, isAuthenticated: true });
    return user;
  },

  logout: () => {
    localStorage.clear();
    set({ user: null, tokens: null, isAuthenticated: false });
  },

  updateUser: (updates) => set((state) => ({ user: { ...state.user, ...updates } })),

  addRole: async (role) => {
    const { data } = await authAPI.addRole(role);
    set((state) => ({ user: { ...state.user, roles: data.data.roles } }));
    return data.data;
  },

  hasRole: (role) => {
    const { user } = get();
    return user?.roles?.includes(role) ?? false;
  },
}));

export default useAuthStore;
