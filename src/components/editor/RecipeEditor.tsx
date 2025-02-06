import { useEditor, EditorContent, JSONContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import YouTube from '@tiptap/extension-youtube'

export default function RecipeEditor({ 
  content, 
  onChange 
}: { 
  content: JSONContent
  onChange: (content: JSONContent) => void 
}) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({ HTMLAttributes: { class: 'rounded-lg' } }),
      YouTube.configure({ controls: false })
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON())
    }
  })

  return (
    <div className="prose max-w-none">
      <EditorContent editor={editor} />
    </div>
  )
} 