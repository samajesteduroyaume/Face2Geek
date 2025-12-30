import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { SessionProvider } from 'next-auth/react'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/sonner' // Utilisation constante de Sonner pour les toasts
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'Face2Geek - Le réseau social des développeurs',
    template: '%s | Face2Geek'
  },
  description: 'Connecte-toi, partage tes snippets de code et collabore avec des geeks du monde entier.',
  keywords: ['code', 'snippets', 'social network', 'developers', 'geeks', 'sharing'],
  openGraph: {
    title: 'Face2Geek - Social Network for Developers',
    description: 'Connect and share code with developers worldwide.',
    url: 'https://face2geek.com',
    siteName: 'Face2Geek',
    images: [
      {
        url: 'https://face2geek.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Face2Geek Preview',
      },
    ],
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Face2Geek',
    description: 'Le réseau social ultime pour les passionnés de code.',
    creator: '@face2geek',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className={`${inter.className} min-h-screen bg-[#020617] antialiased text-slate-200`}>
        <SessionProvider>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
            {children}
            <Toaster richColors position="top-right" />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
