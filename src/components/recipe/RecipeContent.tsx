import { JSONContent } from '@tiptap/core'

export function RecipeContent({ content }: { content: JSONContent }) {
  return (
    <div className="prose">
      {content.content?.map((node, index) => {
        if (node.type === 'paragraph') {
          return <p key={index}>{node.content?.[0].text}</p>
        }
        return null
      })}
    </div>
  )
} 