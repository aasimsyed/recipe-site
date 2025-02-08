import { Navigation } from '@/components/ui/navigation'
import { NavigationError } from '@/components/ui/NavigationError'
import { NavigationProvider } from '@/components/providers/NavigationProvider'
import SessionProvider from '@/components/providers/SessionProvider'
import { EnvironmentCheck } from '@/components/debug/EnvironmentCheck'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SessionProvider>
      <NavigationProvider>
        <EnvironmentCheck />
        <NavigationError>
          <Navigation />
        </NavigationError>
        <main className="min-h-screen">{children}</main>
      </NavigationProvider>
    </SessionProvider>
  )
} 