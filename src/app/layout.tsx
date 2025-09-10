import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { RootLayout } from '../components/layout'
import { siteConfig } from '@/lib/config'

const inter = Inter({ subsets: ['latin'] })

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    'yapay zeka',
    'artificial intelligence',
    'machine learning',
    'deep learning',
    'akademik',
    'academic',
    'research',
    'araştırma',
    'DeepMind',
    'AI research',
    'neural networks',
    'sürdürülebilir AI',
    'sustainable AI'
  ],
  authors: [
    {
      name: siteConfig.author.name,
      url: siteConfig.url,
    },
  ],
  creator: siteConfig.author.name,
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.name,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
    creator: siteConfig.author.twitter,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
}

export default function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        <link
          rel="alternate"
          type="application/rss+xml"
          title="ErenAILab RSS Feed"
          href="/feed.xml"
        />
      </head>
      <body className={inter.className}>
        <RootLayout>
          {children}
        </RootLayout>
      </body>
    </html>
  )
}