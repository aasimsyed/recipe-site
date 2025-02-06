'use client'

import * as AvatarPrimitive from '@radix-ui/react-avatar'

export function UserAvatar({ user }: { user: { image?: string } }) {
  return (
    <AvatarPrimitive.Root className="h-10 w-10 rounded-full bg-gray-100">
      <AvatarPrimitive.Image
        src={user?.image}
        alt="User avatar"
        className="rounded-full"
      />
      <AvatarPrimitive.Fallback delayMs={600}>
        <div className="h-full w-full bg-gray-200 animate-pulse" />
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  )
} 