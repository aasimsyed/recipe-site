'use client'

import { useState } from 'react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'

interface CommentsProps {
  recipeId: string
  className?: string
}

interface CommentType {
  id: string
  content: string
  recipeId: string
  author: { name: string; image?: string }
  createdAt: string
}

function UserAvatar({ user }: { user: { name: string; image?: string } }) {
  return (
    <Avatar>
      <AvatarImage src={user.image} alt={user.name} />
      <AvatarFallback>{user.name[0]}</AvatarFallback>
    </Avatar>
  )
}

export function Comments({ recipeId, className }: CommentsProps) {
  const [comment, setComment] = useState('')
  const [comments, setComments] = useState<CommentType[]>([])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!comment.trim()) return
    
    // Add API call here
    const newComment = {
      id: Date.now().toString(),
      content: comment,
      recipeId,
      author: { name: 'User', image: '' },
      createdAt: new Date().toISOString()
    }
    
    setComments([...comments, newComment])
    setComment('')
  }

  return (
    <div className={`border-t pt-8 ${className}`}>
      <h3 className="text-2xl font-bold mb-6">Comments ({comments.length})</h3>
      
      <form onSubmit={handleSubmit} className="mb-8">
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full p-4 border rounded-lg mb-2"
          placeholder="Write a comment..."
          rows={3}
        />
        <button
          type="submit"
          className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
        >
          Post Comment
        </button>
      </form>

      <div className="space-y-6">
        {comments.map((comment) => (
          <div key={comment.id} className="border-b pb-6">
            <div className="flex items-start gap-4 mb-2">
              <UserAvatar user={comment.author} />
              <div>
                <h4 className="font-semibold">{comment.author.name}</h4>
                <p className="text-sm text-gray-600">
                  {new Date(comment.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <p className="text-gray-800">{comment.content}</p>
          </div>
        ))}
      </div>
    </div>
  )
} 