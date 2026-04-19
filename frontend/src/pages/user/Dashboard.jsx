import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Plus, LogOut, File } from 'lucide-react';
import { useDocumentStore } from '@/store/useDocumentStore';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/button';

const Dashboard = () => {
  const { documents, loading, loadDocuments, createDocument, deleteDocument } = useDocumentStore();
  const { logout, user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  const handleCreateNew = async () => {
    try {
      const newDoc = await createDocument('Untitled Document');
      navigate(`/editor/${newDoc._id}`);
    } catch (error) {
      console.error('Failed to create document:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/signin');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Top Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center text-white font-bold">
            K
          </div>
          <span className="text-xl font-semibold tracking-tight text-slate-800">Kodoc</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-slate-600">Welcome, {user?.username || 'User'}</span>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-slate-600 hover:text-slate-900">
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </Button>
        </div>
      </nav>

      {/* Start a new document section */}
      <div className="bg-slate-100 py-8 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-base font-medium text-slate-700 mb-4">Start a new document</h2>
          <div className="flex gap-4">
            <div 
              className="w-40 h-52 bg-white border border-slate-300 rounded hover:border-blue-500 hover:cursor-pointer transition-colors flex flex-col items-center justify-center group"
              onClick={handleCreateNew}
            >
              <div className="w-12 h-12 rounded-full flex items-center justify-center mb-2">
                <Plus className="w-8 h-8 text-blue-500" />
              </div>
            </div>
          </div>
          <p className="text-sm text-slate-700 font-medium mt-3">Blank</p>
        </div>
      </div>

      {/* Recent Documents Section */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <h2 className="text-base font-medium text-slate-800 mb-6">Recent documents</h2>
        
        {loading ? (
          <p className="text-slate-500">Loading documents...</p>
        ) : documents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <FileText className="w-16 h-16 mb-4 text-slate-300" />
            <p>No text documents yet</p>
            <Button variant="link" onClick={handleCreateNew} className="text-blue-600 mt-2">
              Create your first document
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {documents.map((doc) => (
              <div 
                key={doc._id} 
                className="group flex flex-col w-full h-64 border border-slate-200 rounded bg-white hover:border-blue-500 hover:shadow-md cursor-pointer transition-all"
                onClick={() => navigate(`/editor/${doc._id}`)}
              >
                {/* Document preview (mockup) */}
                <div className="flex-1 bg-slate-50 border-b border-slate-100 p-4 overflow-hidden relative">
                   <div className="w-full h-full bg-white shadow-sm border border-slate-200 p-2 opacity-50 flex items-start justify-center">
                     <File className="w-8 h-8 text-blue-300 mt-4" />
                   </div>
                </div>
                
                {/* Document Info */}
                <div className="p-3 bg-white">
                  <h3 className="text-sm font-semibold text-slate-800 truncate mb-1">{doc.title}</h3>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <FileText className="w-3 h-3 text-blue-500" /> Opened {new Date(doc.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;