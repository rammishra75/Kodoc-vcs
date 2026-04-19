import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useVersionStore } from '@/store/useVersionStore';
import { useAuthStore } from '@/store/useAuthStore';
import VersionSidebar from '@/components/VersionSidebar';
import TextEditor from '@/components/TextEditor';
import { Button } from '@/components/ui/button';
import { LogOut, ChevronLeft, Save } from 'lucide-react';

const EditorPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { 
    currentDocument, 
    currentContent, 
    loadDocumentAndVersions, 
    saveNewVersion, 
    previewVersionId,
    versions,
    loading,
    saving,
    renameDocument
  } = useVersionStore();

  const [localContent, setLocalContent] = useState("");
  const [localTitle, setLocalTitle] = useState("");

  useEffect(() => {
    if (id) {
      loadDocumentAndVersions(id);
    }
  }, [id, loadDocumentAndVersions]);

  useEffect(() => {
    // When currentContent from store changes (e.g. from loading or selecting a version in sidebar),
    // update our local state to pass to the editor
    setLocalContent(currentContent);
  }, [currentContent]);

  useEffect(() => {
    if (currentDocument) {
      setLocalTitle(currentDocument.title);
    }
  }, [currentDocument]);

  const handleLogout = () => {
    logout();
    navigate('/signin');
  };

  const handleSave = async () => {
    try {
      await saveNewVersion(id, localContent);
      alert("Version saved successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to save version.");
    }
  };

  const handleTitleChange = (e) => {
    setLocalTitle(e.target.value);
  };

  const handleTitleSave = async () => {
    if (localTitle.trim() !== currentDocument.title) {
      await renameDocument(id, localTitle.trim() || "Untitled Document");
    }
  };

  if (loading || !currentDocument) {
    return <div className="flex items-center justify-center min-h-screen">Loading document...</div>;
  }

  // Check if we are viewing an old version
  const isPreviewingOldVersion = previewVersionId !== null;

  return (
    <div className="flex flex-col h-screen bg-slate-100 font-sans overflow-hidden">
      {/* Top Navbar */}
      <nav className="flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center text-white font-bold cursor-pointer" onClick={() => navigate('/dashboard')}>
            K
          </div>
          
          <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')} className="text-slate-600 hover:text-slate-900 -ml-2">
            <ChevronLeft className="w-4 h-4 mr-1" /> My Documents
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-slate-600 hidden sm:inline-block">
            Welcome, {user?.username || 'User'}
          </span>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-slate-600 hover:text-slate-900">
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </Button>
        </div>
      </nav>

      {/* Main Layout Area */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Left Sidebar: Version History */}
        <VersionSidebar documentId={id} />

        {/* Right Area: Editor */}
        <div className="flex-1 flex flex-col p-4 sm:p-6 overflow-hidden">
          
          {/* Editor Header: Title and Save Action */}
          <div className="flex items-center justify-between mb-4 shrink-0">
            <div>
              <input 
                type="text" 
                value={localTitle}
                onChange={handleTitleChange}
                onBlur={handleTitleSave}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.currentTarget.blur();
                  }
                }}
                className="text-2xl font-bold text-slate-800 bg-transparent border-none outline-none focus:ring-2 focus:ring-blue-100 rounded px-1 -ml-1 transition-all hover:bg-slate-200/50"
                placeholder="Untitled Document"
              />
              {isPreviewingOldVersion && (
                <div className="mt-1">
                  <span className="inline-block text-xs font-semibold text-amber-600 bg-amber-100 px-2 py-1 rounded">
                    Viewing Old Version (Read Only)
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              {!isPreviewingOldVersion && (
                <Button 
                  onClick={handleSave} 
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Saving...' : 'Save New Version'}
                </Button>
              )}
            </div>
          </div>

          {/* Tiptap Editor */}
          <div className="flex-1 overflow-hidden rounded-lg shadow-sm">
             <TextEditor 
               initialContent={localContent}
               onChange={(html) => setLocalContent(html)}
               readOnly={isPreviewingOldVersion}
             />
          </div>

        </div>
      </div>
    </div>
  );
};

export default EditorPage;
