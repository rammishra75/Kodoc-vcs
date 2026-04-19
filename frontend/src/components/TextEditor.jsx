import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Button } from './ui/button'
import { useEffect, useState } from 'react'

const TextEditor = ({ initialContent, onChange, readOnly = false }) => {
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

  const updateActiveStates = (editor) => {
    if (!editor) return

    const { state } = editor
    const { selection } = state
    const { $from } = selection

    let isInBulletList = false
    let isInOrderedList = false

    state.doc.nodesBetween($from.pos, $from.pos, (node) => {
      if (node.type.name === 'bulletList') {
        isInBulletList = true
      } else if (node.type.name === 'orderedList') {
        isInOrderedList = true
      }
    })

    const directBulletList = editor.isActive('bulletList')
    const directOrderedList = editor.isActive('orderedList')

    setActiveStates({
      bold: editor.isActive('bold'),
      italic: editor.isActive('italic'),
      strike: editor.isActive('strike'),
      paragraph: editor.isActive('paragraph'),
      heading1: editor.isActive('heading', { level: 1 }),
      heading2: editor.isActive('heading', { level: 2 }),
      bulletList: directBulletList || isInBulletList,
      orderedList: directOrderedList || isInOrderedList,
    })
  }

  const editor = useEditor({
    extensions: [StarterKit],
    content: initialContent || '<p></p>',
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      updateActiveStates(editor)
      if (onChange) onChange(editor.getHTML())
    },
    onSelectionUpdate: ({ editor }) => {
      updateActiveStates(editor)
    },
  })

  // Update content if initialContent changes (e.g., restoring a version)
  useEffect(() => {
    if (editor && initialContent !== undefined && initialContent !== editor.getHTML()) {
      editor.commands.setContent(initialContent)
    }
  }, [initialContent, editor])

  // Update readOnly state dynamically
  useEffect(() => {
    if (editor) {
      editor.setEditable(!readOnly)
    }
  }, [readOnly, editor])

  if (!editor) {
    return <div className="p-4">Initializing editor...</div>
  }

  return (
    <div className="flex flex-col h-full bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
      {/* Toolbar */}
      {!readOnly && (
        <div className="flex flex-wrap items-center gap-1 p-2 border-b border-slate-200 bg-slate-50">
          <Button
            onClick={() => editor.chain().focus().toggleBold().run()}
            variant={activeStates.bold ? 'default' : 'ghost'}
            size="sm"
            className="h-8 px-2 text-xs font-semibold"
          >
            Bold
          </Button>
          <Button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            variant={activeStates.italic ? 'default' : 'ghost'}
            size="sm"
            className="h-8 px-2 text-xs font-semibold"
          >
            Italic
          </Button>
          <Button
            onClick={() => editor.chain().focus().toggleStrike().run()}
            variant={activeStates.strike ? 'default' : 'ghost'}
            size="sm"
            className="h-8 px-2 text-xs font-semibold"
          >
            Strike
          </Button>
          <div className="w-px h-6 bg-slate-300 mx-1"></div>
          <Button
            onClick={() => editor.chain().focus().setParagraph().run()}
            variant={activeStates.paragraph ? 'default' : 'ghost'}
            size="sm"
            className="h-8 px-2 text-xs font-semibold"
          >
            Paragraph
          </Button>
          <Button
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            variant={activeStates.heading1 ? 'default' : 'ghost'}
            size="sm"
            className="h-8 px-2 text-xs font-semibold"
          >
            H1
          </Button>
          <Button
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            variant={activeStates.heading2 ? 'default' : 'ghost'}
            size="sm"
            className="h-8 px-2 text-xs font-semibold"
          >
            H2
          </Button>
          <div className="w-px h-6 bg-slate-300 mx-1"></div>
          <Button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            variant={activeStates.bulletList ? 'default' : 'ghost'}
            size="sm"
            className="h-8 px-2 text-xs font-semibold"
          >
            Bullet List
          </Button>
          <Button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            variant={activeStates.orderedList ? 'default' : 'ghost'}
            size="sm"
            className="h-8 px-2 text-xs font-semibold"
          >
            Ordered List
          </Button>
        </div>
      )}

      {/* Editor Content */}
      <div className="flex-1 overflow-y-auto p-8 cursor-text bg-white">
        <EditorContent editor={editor} className="min-h-[500px] outline-none max-w-3xl mx-auto prose prose-slate" />
      </div>
    </div>
  )
}

export default TextEditor