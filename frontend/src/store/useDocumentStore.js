import { create } from "zustand";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export const useDocumentStore = create((set) => ({
  documents: [],
  loading: false,
  error: null,

  loadDocuments: async () => {
    try {
      set({ loading: true, error: null });
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await axios.get(`${API_BASE_URL}/api/documents`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      set({
        documents: res.data,
        loading: false,
      });
    } catch (err) {
      set({
        error: err.response?.data?.message || err.message || "Failed to load documents",
        loading: false,
      });
    }
  },

  createDocument: async (title) => {
    try {
      set({ loading: true, error: null });
      const token = localStorage.getItem("token");
      
      const res = await axios.post(`${API_BASE_URL}/api/documents`, { title }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const newDoc = res.data.document || res.data;

      set((state) => ({
        documents: [newDoc, ...state.documents],
        loading: false,
      }));

      return newDoc;
    } catch (err) {
      set({
        error: err.response?.data?.message || err.message || "Failed to create document",
        loading: false,
      });
      throw err;
    }
  },

  deleteDocument: async (documentId) => {
    try {
      set({ loading: true, error: null });
      const token = localStorage.getItem("token");

      await axios.delete(`${API_BASE_URL}/api/documents/${documentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      set((state) => ({
        documents: state.documents.filter(doc => doc._id !== documentId && doc.id !== documentId),
        loading: false,
      }));
    } catch (err) {
      set({
        error: err.response?.data?.message || err.message || "Failed to delete document",
        loading: false,
      });
      throw err;
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));