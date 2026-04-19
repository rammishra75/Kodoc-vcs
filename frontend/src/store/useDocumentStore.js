import { create } from "zustand";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

export const useDocumentStore = create((set, get) => ({
  // State
  documents: [],
  currentDocumentId: null,
  loading: false,
  error: null,
  saving: false,

  // Initialize from localStorage
  initialize: () => {
    const savedDocuments = localStorage.getItem('documents');
    if (savedDocuments) {
      const docs = JSON.parse(savedDocuments);
      set({ documents: docs });
      if (docs.length > 0) {
        set({ currentDocumentId: docs[0].id });
      }
    }
  },

  // Actions
  setCurrentDocument: (documentId) => {
    set({ currentDocumentId: documentId });
  },

  createDocument: async (name) => {
    try {
      set({ loading: true, error: null });

      const newDoc = {
        id: Date.now().toString(),
        name: name.trim(),
        content: '<p>New document</p>',
        created: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        versions: [
          {
            id: `${Date.now()}-v`,
            content: '<p>New document</p>',
            savedAt: new Date().toISOString(),
            label: 'Initial version',
          },
        ],
      };

      // Try to save to backend first
      try {
        const token = localStorage.getItem("token");
        if (token && API_BASE_URL) {
          const res = await axios.post(`${API_BASE_URL}/api/documents`, newDoc, {
            headers: { Authorization: `Bearer ${token}` }
          });
          newDoc.id = res.data.id; // Use backend ID if available
        }
      } catch (backendError) {
        console.warn('Backend not available, using local storage:', backendError.message);
      }

      // Update local state
      set((state) => ({
        documents: [...state.documents, newDoc],
        currentDocumentId: newDoc.id,
        loading: false,
      }));

      // Save to localStorage
      const { documents } = get();
      localStorage.setItem('documents', JSON.stringify(documents));

      return newDoc;
    } catch (err) {
      set({
        error: err.message || "Failed to create document",
        loading: false,
      });
      throw err;
    }
  },

  updateDocumentContent: async (documentId, content) => {
    set((state) => ({
      documents: state.documents.map(doc =>
        doc.id === documentId
          ? { ...doc, content, lastModified: new Date().toISOString() }
          : doc
      ),
    }));

    localStorage.setItem('documents', JSON.stringify(get().documents));
  },

  saveDocument: async (documentId, content) => {
    try {
      set({ saving: true, error: null });

      const versionEntry = {
        id: `${Date.now()}-v`,
        content,
        savedAt: new Date().toISOString(),
        label: 'Saved version',
      };

      const updatedDoc = {
        content,
        lastModified: new Date().toISOString(),
      };

      // Try to save to backend first
      try {
        const token = localStorage.getItem("token");
        if (token && API_BASE_URL) {
          await axios.put(`${API_BASE_URL}/api/documents/${documentId}`, {
            ...updatedDoc,
            versions: (get().documents.find(doc => doc.id === documentId)?.versions || []).concat(versionEntry),
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });
        }
      } catch (backendError) {
        console.warn('Backend not available, using local storage:', backendError.message);
      }

      // Update local state
      set((state) => ({
        documents: state.documents.map(doc =>
          doc.id === documentId
            ? {
              ...doc,
              ...updatedDoc,
              versions: [versionEntry].concat(doc.versions || []),
            }
            : doc
        ),
        saving: false,
      }));

      // Save to localStorage
      const { documents } = get();
      localStorage.setItem('documents', JSON.stringify(documents));

    } catch (err) {
      set({
        error: err.message || "Failed to save document",
        saving: false,
      });
      throw err;
    }
  },

  rollbackDocumentVersion: async (documentId, versionId) => {
    try {
      set({ loading: true, error: null });

      const currentDoc = get().documents.find(doc => doc.id === documentId);
      if (!currentDoc) {
        throw new Error('Document not found');
      }

      const version = (currentDoc.versions || []).find(v => v.id === versionId);
      if (!version) {
        throw new Error('Version not found');
      }

      const rollbackSnapshot = {
        id: `${Date.now()}-v`,
        content: currentDoc.content,
        savedAt: new Date().toISOString(),
        label: 'Snapshot before rollback',
      };

      const updatedDoc = {
        content: version.content,
        lastModified: new Date().toISOString(),
      };

      // Try to save to backend first
      try {
        const token = localStorage.getItem("token");
        if (token && API_BASE_URL) {
          await axios.put(`${API_BASE_URL}/api/documents/${documentId}`, {
            ...updatedDoc,
            versions: [rollbackSnapshot].concat(currentDoc.versions || []),
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });
        }
      } catch (backendError) {
        console.warn('Backend not available, using local storage:', backendError.message);
      }

      set((state) => ({
        documents: state.documents.map(doc =>
          doc.id === documentId
            ? {
              ...doc,
              ...updatedDoc,
              versions: [rollbackSnapshot].concat(doc.versions || []),
            }
            : doc
        ),
        loading: false,
      }));

      const { documents } = get();
      localStorage.setItem('documents', JSON.stringify(documents));
    } catch (err) {
      set({
        error: err.message || "Failed to rollback version",
        loading: false,
      });
      throw err;
    }
  },

  deleteDocument: async (documentId) => {
    try {
      set({ loading: true, error: null });

      // Try to delete from backend first
      try {
        const token = localStorage.getItem("token");
        if (token && API_BASE_URL) {
          await axios.delete(`${API_BASE_URL}/api/documents/${documentId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
        }
      } catch (backendError) {
        console.warn('Backend not available, using local storage:', backendError.message);
      }

      // Update local state
      set((state) => {
        const updatedDocs = state.documents.filter(doc => doc.id !== documentId);
        let newCurrentId = state.currentDocumentId;

        if (documentId === state.currentDocumentId) {
          newCurrentId = updatedDocs.length > 0 ? updatedDocs[0].id : null;
        }

        return {
          documents: updatedDocs,
          currentDocumentId: newCurrentId,
          loading: false,
        };
      });

      // Save to localStorage
      const { documents } = get();
      localStorage.setItem('documents', JSON.stringify(documents));

    } catch (err) {
      set({
        error: err.message || "Failed to delete document",
        loading: false,
      });
      throw err;
    }
  },

  loadDocuments: async () => {
    try {
      set({ loading: true, error: null });

      // Try to load from backend first
      try {
        const token = localStorage.getItem("token");
        if (token && API_BASE_URL) {
          const res = await axios.get(`${API_BASE_URL}/api/documents`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const backendDocs = res.data;

          // Merge with local storage
          const localDocs = JSON.parse(localStorage.getItem('documents') || '[]');
          const mergedDocs = [...backendDocs];

          // Add any local docs that aren't in backend
          localDocs.forEach(localDoc => {
            if (!mergedDocs.find(doc => doc.id === localDoc.id)) {
              mergedDocs.push(localDoc);
            }
          });

          set({
            documents: mergedDocs,
            currentDocumentId: mergedDocs.length > 0 ? mergedDocs[0].id : null,
            loading: false,
          });

          // Update localStorage
          localStorage.setItem('documents', JSON.stringify(mergedDocs));
          return;
        }
      } catch (backendError) {
        console.warn('Backend not available, using local storage:', backendError.message);
      }

      // Fallback to localStorage
      const savedDocuments = localStorage.getItem('documents');
      if (savedDocuments) {
        const docs = JSON.parse(savedDocuments);
        set({
          documents: docs,
          currentDocumentId: docs.length > 0 ? docs[0].id : null,
          loading: false,
        });
      } else {
        set({ loading: false });
      }

    } catch (err) {
      set({
        error: err.message || "Failed to load documents",
        loading: false,
      });
    }
  },

  // Getters
  getCurrentDocument: () => {
    const { documents, currentDocumentId } = get();
    return documents.find(doc => doc.id === currentDocumentId) || null;
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },
}));