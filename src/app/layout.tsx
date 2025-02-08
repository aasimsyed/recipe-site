import { Metadata } from "next";
import { geistMono, montserrat, openSans } from '@/lib/fonts'
import "./globals.css";
import SessionProvider from '@/components/providers/SessionProvider'
import { NavigationProvider } from '@/components/providers/NavigationProvider'
import { Navigation } from '@/components/ui/navigation'
import { Toaster } from 'sonner'

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
        <SessionProvider>
          <NavigationProvider>
            <Navigation />
            <main className="min-h-[calc(100vh-8rem)]">
              {children}
            </main>
            <footer className="bg-white border-t border-neutral-200 mt-8 py-6 md:py-8">
              <div className="container mx-auto px-4 text-center text-sm text-neutral-500">
                © {new Date().getFullYear()} Recipe Site. All rights reserved.
              </div>
            </footer>
          </NavigationProvider>
        </SessionProvider>
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
