import type { Metadata } from "next";
import { GeistSans, GeistMono } from 'geist/font'
import "./globals.css";
import Link from 'next/link'
import { Navigation } from '@/components/ui/navigation'
import { SessionProvider } from '@/components/providers/SessionProvider'
import { montserrat, openSans } from '@/lib/fonts'
import { headers } from 'next/headers'

export const metadata: Metadata = {
  title: "Recipe Site",
  description: "A collection of delicious recipes",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Force dynamic rendering for the entire app
  headers();
  
  return (
    <html 
      lang="en" 
      className={`${GeistSans.variable} ${GeistMono.variable} ${montserrat.variable} ${openSans.variable}`}
    >
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body className={`${openSans.variable} font-sans text-neutral-700 bg-neutral-50`}>
        <SessionProvider>
          <Navigation />
          <main className="min-h-[calc(100vh-8rem)]">
            {children}
          </main>

          <footer className="bg-white border-t border-neutral-200 mt-8 py-6 md:py-8">
            <div className="container mx-auto px-4 text-center text-sm text-neutral-500">
              © 2024 Recipe Site. All rights reserved.
            </div>
          </footer>
        </SessionProvider>
      </body>
    </html>
  );
}
