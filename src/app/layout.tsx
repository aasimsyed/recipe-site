import { Metadata } from "next";
import { geistMono, montserrat, openSans } from '@/lib/fonts'
import "./globals.css";
import SessionProvider from '@/components/providers/SessionProvider'
import { NavigationProvider } from '@/components/providers/NavigationProvider'
import { Navigation } from '@/components/ui/navigation'
import { Toaster } from 'sonner'
import { Providers } from './providers'

const siteMetadata = {
  title: "Recipe Site",
  description: "A collection of delicious recipes",
} as const

export const metadata: Metadata = siteMetadata

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${openSans.variable} ${montserrat.variable} ${geistMono.variable}`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body className="font-sans antialiased text-neutral-700 bg-neutral-50">
        <Providers>
          <SessionProvider>
            <NavigationProvider>
              <Navigation />
              <main className="min-h-[calc(100vh-8rem)]">
                {children}
              </main>
            </NavigationProvider>
          </SessionProvider>
        </Providers>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
