import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { useEffect, useState } from 'react'
import { Trash2, Plus, Save, FileText } from 'lucide-react'
import { useDocumentStore } from '../store/useDocumentStore'

const TextEditor = () => {
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState(null)
  const [activeStates, setActiveStates] = useState({
    bold: false,
    italic: false,
    strike: false,
    paragraph: false,
    heading1: false,
    heading2: false,
    bulletList: false,
    orderedList: false,
  })

  // Document management state from Zustand store
  const {
    documents,
    currentDocumentId,
    loading,
    saving,
    error: storeError,
    initialize,
    setCurrentDocument,
    createDocument,
    saveDocument,
    updateDocumentContent,
    rollbackDocumentVersion,
    deleteDocument,
    loadDocuments,
    clearError,
  } = useDocumentStore()

  const currentDocument = documents.find(doc => doc.id === currentDocumentId) || null

  // Local UI state
  const [newDocumentName, setNewDocumentName] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [documentToDelete, setDocumentToDelete] = useState(null)

  // Initialize documents on mount
  useEffect(() => {
    initialize()
  }, [initialize])

  const updateActiveStates = (editor) => {
    if (!editor) return

    const { state } = editor
    const { selection } = state
    const { $from } = selection

    // Check if we're in a list by traversing up the node tree
    let isInBulletList = false
    let isInOrderedList = false

    state.doc.nodesBetween($from.pos, $from.pos, (node) => {
      if (node.type.name === 'bulletList') {
        isInBulletList = true
      } else if (node.type.name === 'orderedList') {
        isInOrderedList = true
      }
    })

    // Also check direct isActive calls
    const directBulletList = editor.isActive('bulletList')
    const directOrderedList = editor.isActive('orderedList')

    const states = {
      bold: editor.isActive('bold'),
      italic: editor.isActive('italic'),
      strike: editor.isActive('strike'),
      paragraph: editor.isActive('paragraph'),
      heading1: editor.isActive('heading', { level: 1 }),
      heading2: editor.isActive('heading', { level: 2 }),
      bulletList: directBulletList || isInBulletList,
      orderedList: directOrderedList || isInOrderedList,
    }

    console.log('Updating active states:', states, 'Direct checks:', { directBulletList, directOrderedList }, 'Node traversal:', { isInBulletList, isInOrderedList })
    setActiveStates(states)
  }

  const editor = useEditor({
    extensions: [
      StarterKit,
    ],
    content: currentDocument?.content || '<p>Hello World! 🌍️</p>',
    onCreate: ({ editor }) => {
      console.log('Editor created successfully')
      setIsReady(true)
      updateActiveStates(editor)
    },
    onUpdate: ({ editor }) => {
      console.log('Editor updated:', editor.getHTML())
      updateActiveStates(editor)

      // Keep the document content current while editing.
      if (currentDocumentId) {
        updateDocumentContent(currentDocumentId, editor.getHTML()).catch(err => {
          console.error('Auto-save failed:', err)
        })
      }
    },
    onSelectionUpdate: ({ editor }) => {
      updateActiveStates(editor)
    },
    onError: (error) => {
      console.error('Editor error:', error)
      setError(error)
    },
  })

  // Update editor content when current document changes
  useEffect(() => {
    if (editor && currentDocumentId) {
      const currentDoc = documents.find(doc => doc.id === currentDocumentId)
      if (currentDoc) {
        editor.commands.setContent(currentDoc.content)
      }
    }
  }, [currentDocumentId, editor])

  useEffect(() => {
    console.log('TextEditor component mounted')
    return () => {
      console.log('TextEditor component unmounted')
    }
  }, [])

  useEffect(() => {
    if (editor) {
      console.log('Editor instance available')
      updateActiveStates(editor)
    }
  }, [editor])

  const handleCreateDocument = async () => {
    if (!newDocumentName.trim()) return

    try {
      const newDoc = await createDocument(newDocumentName.trim())
      setNewDocumentName('')
      setShowCreateForm(false)

      if (editor) {
        editor.commands.setContent(newDoc.content)
      }
    } catch (err) {
      console.error('Failed to create document:', err)
      // Error is handled by the store
    }
  }

  const handleSaveDocument = async () => {
    if (!currentDocumentId || !editor) return

    try {
      await saveDocument(currentDocumentId, editor.getHTML())
      alert('Document saved successfully!')
    } catch (err) {
      console.error('Failed to save document:', err)
      // Error is handled by the store
    }
  }

  const handleRollbackVersion = async (versionId) => {
    if (!currentDocumentId || !editor) return

    const version = currentDocument?.versions?.find(v => v.id === versionId)
    if (!version) return

    try {
      await rollbackDocumentVersion(currentDocumentId, versionId)
      editor.commands.setContent(version.content)
    } catch (err) {
      console.error('Failed to rollback version:', err)
      // Error is handled by the store
    }
  }

  const handleDeleteDocument = async (docId) => {
    try {
      await deleteDocument(docId)

      if (docId === currentDocumentId) {
        const remainingDocs = documents.filter(doc => doc.id !== docId)
        if (remainingDocs.length === 0 && editor) {
          editor.commands.setContent('<p>No documents. Create a new one to get started!</p>')
        }
      }

      setShowDeleteConfirm(false)
      setDocumentToDelete(null)
    } catch (err) {
      console.error('Failed to delete document:', err)
      // Error is handled by the store
    }
  }

  const confirmDelete = (doc) => {
    setDocumentToDelete(doc)
    setShowDeleteConfirm(true)
  }

  if (error || storeError) {
    return <div className="p-4 border rounded-lg text-red-500">
      Error: {error?.message || storeError}
      <Button onClick={clearError} className="ml-2">Dismiss</Button>
    </div>
  }

  if (!editor) {
    return <div className="p-4 border rounded-lg">
      {loading ? 'Loading documents...' : 'Initializing editor...'}
    </div>
  }

  if (!isReady) {
    return <div className="p-4 border rounded-lg">Loading editor...</div>
  }

  return (
    <div className="min-h-screen">
      <div className="grid min-h-[calc(100vh-4rem)] gap-6 lg:grid-cols-[320px_1fr]">
        <aside className="flex flex-col gap-5 rounded-[2rem] border border-slate-200/80 bg-white/95 p-5 shadow-[0_25px_65px_-45px_rgba(15,23,42,0.18)]">
          <div className="space-y-3">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Documents</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950">Document library</h2>
            </div>
            <p className="text-sm leading-6 text-slate-600">
              Select a document from the sidebar, or create and delete files instantly.
            </p>
          </div>

          <div className="rounded-[1.75rem] border border-slate-200/80 bg-slate-50 p-4 shadow-sm">
            <div className="flex flex-col gap-3">
              <Button
                variant="outline"
                size="sm"
                className="justify-center rounded-full border-slate-300 bg-white text-slate-900 shadow-sm transition duration-200 hover:bg-slate-100"
                onClick={() => setShowCreateForm((prev) => !prev)}
              >
                <Plus className="w-4 h-4 mr-2" />
                {showCreateForm ? 'Hide create' : 'New document'}
              </Button>
              {showCreateForm && (
                <div className="space-y-3">
                  <Input
                    placeholder="Document name"
                    value={newDocumentName}
                    onChange={(e) => setNewDocumentName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleCreateDocument()}
                    className="w-full rounded-2xl border-slate-200 bg-white px-4 py-3 text-sm shadow-sm"
                  />
                  <Button
                    size="sm"
                    className="rounded-full px-4 text-sm shadow-sm"
                    onClick={handleCreateDocument}
                    disabled={!newDocumentName.trim()}
                  >
                    Create document
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-slate-200/80 bg-slate-50 p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-600">My files</h3>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                {documents.length}
              </span>
            </div>
            <div className="space-y-2">
              {documents.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-200/80 bg-white p-4 text-sm text-slate-500">
                  No documents yet. Create one to start.
                </div>
              ) : (
                documents.map((doc) => (
                  <div
                    key={doc.id}
                    className={`group flex items-center justify-between gap-3 rounded-3xl border px-4 py-3 transition duration-200 ${doc.id === currentDocumentId ? 'border-slate-900/15 bg-slate-100' : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'}`}
                  >
                    <button
                      type="button"
                      className="text-left"
                      onClick={() => setCurrentDocument(doc.id)}
                    >
                      <p className="text-sm font-semibold text-slate-900">{doc.name}</p>
                      <p className="mt-1 text-xs text-slate-500">{new Date(doc.lastModified).toLocaleDateString()}</p>
                    </button>
                    <button
                      type="button"
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-red-200 bg-red-50 text-red-600 transition duration-200 hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-200"
                      onClick={() => handleDeleteDocument(doc.id)}
                      disabled={loading}
                      title="Delete document"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </aside>

        <main className="flex min-h-[calc(100vh-4rem)] flex-col gap-6">
          <div className="rounded-[2rem] border border-slate-200/80 bg-white/95 p-6 shadow-[0_25px_75px_-45px_rgba(15,23,42,0.18)]">
            <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Editor</p>
                <h2 className="mt-2 text-3xl font-semibold text-slate-950">Write and save documents</h2>
                <p className="mt-2 text-sm text-slate-600">Save a version manually, then rollback to any saved snapshot below.</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  size="sm"
                  className="rounded-full px-4 text-sm shadow-sm"
                  onClick={handleSaveDocument}
                  disabled={!currentDocumentId || saving}
                >
                  <Save className="mr-2 h-4 w-4" />
                  Save version
                </Button>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                  {currentDocument?.versions?.length ?? 0} versions
                </span>
              </div>
            </div>

            <div className="grid gap-3 border-b border-slate-200/80 pb-4 sm:grid-cols-[repeat(auto-fit,minmax(120px,1fr))]">
              <Button
                onClick={() => editor.chain().focus().toggleBold().run()}
                variant={activeStates.bold ? 'default' : 'outline'}
                size="sm"
                className="rounded-full py-3 text-sm font-semibold transition duration-200 hover:bg-slate-100"
              >
                Bold
              </Button>
              <Button
                onClick={() => editor.chain().focus().toggleItalic().run()}
                variant={activeStates.italic ? 'default' : 'outline'}
                size="sm"
                className="rounded-full py-3 text-sm font-semibold transition duration-200 hover:bg-slate-100"
              >
                Italic
              </Button>
              <Button
                onClick={() => editor.chain().focus().toggleStrike().run()}
                variant={activeStates.strike ? 'default' : 'outline'}
                size="sm"
                className="rounded-full py-3 text-sm font-semibold transition duration-200 hover:bg-slate-100"
              >
                Strike
              </Button>
              <Button
                onClick={() => editor.chain().focus().setParagraph().run()}
                variant={activeStates.paragraph ? 'default' : 'outline'}
                size="sm"
                className="rounded-full py-3 text-sm font-semibold transition duration-200 hover:bg-slate-100"
              >
                Paragraph
              </Button>
              <Button
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                variant={activeStates.heading1 ? 'default' : 'outline'}
                size="sm"
                className="rounded-full py-3 text-sm font-semibold transition duration-200 hover:bg-slate-100"
              >
                H1
              </Button>
              <Button
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                variant={activeStates.heading2 ? 'default' : 'outline'}
                size="sm"
                className="rounded-full py-3 text-sm font-semibold transition duration-200 hover:bg-slate-100"
              >
                H2
              </Button>
              <Button
                onClick={() => {
                  if (activeStates.bulletList) {
                    editor.chain().focus().liftListItem('listItem').run()
                  } else {
                    editor.chain().focus().toggleBulletList().run()
                  }
                }}
                variant={activeStates.bulletList ? 'default' : 'outline'}
                size="sm"
                className="rounded-full py-3 text-sm font-semibold transition duration-200 hover:bg-slate-100"
              >
                Bullet List
              </Button>
              <Button
                onClick={() => {
                  if (activeStates.orderedList) {
                    editor.chain().focus().liftListItem('listItem').run()
                  } else {
                    editor.chain().focus().toggleOrderedList().run()
                  }
                }}
                variant={activeStates.orderedList ? 'default' : 'outline'}
                size="sm"
                className="rounded-full py-3 text-sm font-semibold transition duration-200 hover:bg-slate-100"
              >
                Ordered List
              </Button>
            </div>

            <div className="mt-6 rounded-[1.75rem] border border-slate-200/80 bg-slate-50 p-6 shadow-sm">
              <EditorContent editor={editor} className="min-h-80 focus:outline-none" />
            </div>

            <div className="mt-6 rounded-[2rem] border border-slate-200/80 bg-white/95 p-6 shadow-[0_25px_75px_-45px_rgba(15,23,42,0.18)]">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-xl font-semibold text-slate-900">Version history</h3>
                  <p className="mt-1 text-sm text-slate-600">Choose a saved snapshot to rollback the editor content.</p>
                </div>
                <span className="text-sm text-slate-500">{currentDocument?.versions?.length ?? 0} saved versions</span>
              </div>

              {currentDocument?.versions?.length ? (
                <div className="space-y-3">
                  {currentDocument.versions.map((version) => (
                    <div key={version.id} className="flex flex-col gap-3 rounded-[1.5rem] border border-slate-200/80 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-semibold text-slate-900">{version.label}</p>
                        <p className="text-sm text-slate-500">{new Date(version.savedAt).toLocaleString()}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-full px-4 text-sm"
                        onClick={() => handleRollbackVersion(version.id)}
                      >
                        Rollback
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-[1.5rem] border border-dashed border-slate-200/80 bg-slate-50 p-4 text-sm text-slate-500">
                  No saved versions yet. Click Save version to create one.
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default TextEditor