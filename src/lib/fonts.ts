import { GeistSans, GeistMono } from 'geist/font'
import { Montserrat, Open_Sans } from 'next/font/google'

export const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
})

export const openSans = Open_Sans({
  subsets: ['latin'],
  variable: '--font-opensans',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
})

export const geistSans = GeistSans
export const geistMono = GeistMono

// Font CSS variables
export const fontVariables = {
  geistSans: geistSans.variable,
  geistMono: geistMono.variable,
  montserrat: montserrat.variable,
  openSans: openSans.variable,
} as const 