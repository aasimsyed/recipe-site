'use client'

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { PencilIcon } from "lucide-react"

interface AdminActionsProps {
  slug: string
}

export function AdminActions({ slug }: AdminActionsProps) {
  const router = useRouter()

  return (
    <div className="flex gap-2">
      <Button
        onClick={() => router.push(`/admin/categories/${slug}/edit`)}
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
      >
        <PencilIcon className="w-4 h-4" />
        Edit
      </Button>
    </div>
  )
} 