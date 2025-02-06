import { Navigation } from '@/components/ui/navigation'
import { NavigationError } from '@/components/ui/NavigationError'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <NavigationError>
        <Navigation />
      </NavigationError>
      <main className="min-h-screen">{children}</main>
    </>
  )
} 