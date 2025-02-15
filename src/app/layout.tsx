import { Metadata } from "next";
import { geistMono, montserrat, openSans } from '@/lib/fonts'
import "./globals.css";
import { NavigationProvider } from '@/components/providers/NavigationProvider'
import { Navigation } from '@/components/ui/navigation'
import { AuthProvider } from '@/components/providers/AuthProvider'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Providers } from './providers'

const siteMetadata = {
  title: "Recipe Site",
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
      <body className="min-h-screen bg-background font-sans antialiased">
        <Providers>
          <AuthProvider session={session}>
            <NavigationProvider>
              <Navigation />
              {children}
            </NavigationProvider>
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
