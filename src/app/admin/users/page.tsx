'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function AdminUsersPage() {
  const [email, setEmail] = useState('')
  const [currentAdmins, setCurrentAdmins] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const { data: session } = useSession()
  const router = useRouter()

  // Fetch current admin emails on mount
  useEffect(() => {
    fetch('/api/admin/users')
      .then(res => res.json())
      .then(data => setCurrentAdmins(data.admins))
  }, [])

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      if (!res.ok) throw new Error('Failed to add admin')
      
      const { admins } = await res.json()
      setCurrentAdmins(admins)
      setEmail('')
    } catch (err) {
      setError('Failed to add admin')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveAdmin = async (emailToRemove: string) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailToRemove })
      })

      if (!res.ok) throw new Error('Failed to remove admin')
      
      const { admins } = await res.json()
      setCurrentAdmins(admins)
    } catch (err) {
      setError('Failed to remove admin')
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Manage Admin Users</h1>
      
      <form onSubmit={handleAddAdmin} className="mb-8">
        <div className="flex gap-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email to add admin"
            className="flex-1 p-2 border rounded"
            required
          />
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Adding...' : 'Add Admin'}
          </button>
        </div>
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </form>

      <div>
        <h2 className="text-xl font-semibold mb-4">Current Admins</h2>
        <ul className="space-y-2">
          {currentAdmins.map(adminEmail => (
            <li key={adminEmail} className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <span>{adminEmail}</span>
              {adminEmail !== session?.user?.email && (
                <button
                  onClick={() => handleRemoveAdmin(adminEmail)}
                  className="text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
} 