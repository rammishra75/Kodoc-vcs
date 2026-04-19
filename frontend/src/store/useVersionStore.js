import { create } from "zustand";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export const useVersionStore = create((set) => ({
  versions: [],
  currentDocument: null,
  currentContent: "",
  previewVersionId: null,
  loading: false,
  saving: false,
  error: null,

  loadDocumentAndVersions: async (docId) => {
    try {
      set({ loading: true, error: null });
      const token = localStorage.getItem("token");

      // 1. Fetch document and current content
      const docRes = await axios.get(`${API_BASE_URL}/api/documents/${docId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // 2. Fetch all versions
      const versionsRes = await axios.get(`${API_BASE_URL}/api/documents/${docId}/versions`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      set({
        currentDocument: docRes.data.document,
        currentContent: docRes.data.content,
        previewVersionId: null,
        versions: versionsRes.data,
        loading: false,
      });
    } catch (err) {
      set({
        error: err.response?.data?.message || err.message || "Failed to load document",
        loading: false,
      });
    }
  },

  saveNewVersion: async (docId, content) => {
    try {
      set({ saving: true, error: null });
      const token = localStorage.getItem("token");

      const res = await axios.post(`${API_BASE_URL}/api/documents/${docId}/versions`, { content }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const newVersion = res.data;

      set((state) => ({
        versions: [newVersion, ...state.versions], // Backend sorts newest first, we add to top
        currentContent: content,
        previewVersionId: null,
        currentDocument: { ...state.currentDocument, currentVersion: newVersion.versionNumber },
        saving: false,
      }));
    } catch (err) {
      set({
        error: err.response?.data?.message || err.message || "Failed to save version",
        saving: false,
      });
      throw err;
    }
  },

  restoreVersion: async (docId, versionId) => {
    try {
      set({ saving: true, error: null });
      const token = localStorage.getItem("token");

      const res = await axios.post(`${API_BASE_URL}/api/documents/${docId}/versions/${versionId}/restore`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const restoredVersion = res.data;

      set((state) => ({
        versions: [restoredVersion, ...state.versions],
        currentContent: restoredVersion.content,
        previewVersionId: null,
        currentDocument: { ...state.currentDocument, currentVersion: restoredVersion.versionNumber },
        saving: false,
      }));
    } catch (err) {
      set({
        error: err.response?.data?.message || err.message || "Failed to restore version",
        saving: false,
      });
      throw err;
    }
  },

  setPreviewVersion: (versionId, content) => {
    set({ previewVersionId: versionId, currentContent: content });
  },

  renameDocument: async (docId, newTitle) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API_BASE_URL}/api/documents/${docId}`, { title: newTitle }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      set((state) => ({
        currentDocument: { ...state.currentDocument, title: newTitle }
      }));
    } catch (err) {
      console.error("Failed to rename document", err);
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));
