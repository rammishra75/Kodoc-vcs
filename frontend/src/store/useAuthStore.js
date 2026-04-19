import { create } from "zustand";
import axios from "axios";
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

export const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem("user")) || null,
  token: localStorage.getItem("token") || null,
  isAuthenticated: Boolean(localStorage.getItem("token")),
  loading: false,
  error: null,
  signup: async (userData) => {
    try {
      set({ loading: true });
      const res = await axios.post(`${API_BASE_URL}/api/auth/signup`, userData);
      set({
        user: res.data.user,
        token: res.data.token,
        isAuthenticated: true,
        loading: false,
        error: null,
      });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
    } catch (err) {
      set({
        error: err.response?.data?.message || "Signup failed",
        loading: false,
      });
    }
  },
  signin: async (userData) => {
    try {
      set({ loading: true });
      const res = await axios.post(`${API_BASE_URL}/api/auth/signin`, userData);
      set({
        user: res.data.user,
        token: res.data.token,
        isAuthenticated: true,
        loading: false,
        error: null,
      });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
    } catch (err) {
      set({
        error: err.response?.data?.message || "Signin failed",
        loading: false,
      });
    }
  },
  logout: () => {
    set({
      user: null,
      token: null,
      isAuthenticated: false,
    });
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },
}));
