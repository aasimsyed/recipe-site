import { Metadata } from "next";
import { geistMono, montserrat, openSans } from '@/lib/fonts'
import "./globals.css";
import { NavigationProvider } from '@/components/providers/NavigationProvider'
import { Navigation } from '@/components/ui/navigation'
import { AuthProvider } from '@/components/providers/AuthProvider'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Providers } from './providers'
import { PerformanceMonitor } from '@/components/performance/PerformanceMonitor'
import { RoutePrefetcher } from '@/components/navigation/RoutePrefetcher'

const siteMetadata = {
  title: "Saleha's Kitchen",
  description: "A collection of delicious recipes",
} as const

export const metadata: Metadata = siteMetadata

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)
  
  return (
    <html lang="en" className={`${montserrat.variable} ${openSans.variable} ${geistMono.variable}`}>
      <head>
        {/* Add preconnect for external resources */}
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        <Providers>
          <AuthProvider session={session}>
            <NavigationProvider>
              <Navigation />
              {children}
              <PerformanceMonitor />
              <RoutePrefetcher />
            </NavigationProvider>
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
