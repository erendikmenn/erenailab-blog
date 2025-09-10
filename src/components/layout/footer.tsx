'use client'

import { memo, useMemo } from 'react'
import Link from 'next/link'
import { siteConfig } from '@/lib/config'
import { Github, Twitter, Linkedin, Youtube, Mail, Rss } from 'lucide-react'
import { NewsletterForm } from '@/components/newsletter'

const footerSections = {
  navigation: {
    title: 'Navigasyon',
    links: [
      { name: 'Ana Sayfa', href: '/' },
      { name: 'Blog', href: '/blog' },
      { name: 'Kategoriler', href: '/categories' },
      { name: 'Hakkında', href: '/about' },
      { name: 'İletişim', href: '/contact' },
    ]
  },
  categories: {
    title: 'Kategoriler',
    links: [
      { name: 'Teorik AI', href: '/categories/theoretical-ai' },
      { name: 'Makine Öğrenmesi', href: '/categories/machine-learning' },
      { name: 'Araştırma İncelemeleri', href: '/categories/research-reviews' },
      { name: 'Enerji & Sürdürülebilirlik', href: '/categories/energy-sustainability' },
    ]
  },
  legal: {
    title: 'Hukuki',
    links: [
      { name: 'Gizlilik Politikası', href: '/privacy' },
      { name: 'Kullanım Şartları', href: '/terms' },
      { name: 'Çerez Politikası', href: '/cookies' },
    ]
  },
  newsletter: {
    title: 'Newsletter',
    description: 'Yapay zeka alanındaki son gelişmeleri kaçırmayın.',
    placeholder: 'E-posta adresiniz',
    button: 'Abone Ol'
  }
}

function FooterComponent() {
  // Memoize the current year calculation
  const currentYear = useMemo(() => new Date().getFullYear(), [])

  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary-600 to-accent-500 flex items-center justify-center">
                <span className="text-white font-bold text-sm">E</span>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                {siteConfig.name}
              </span>
            </Link>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              Yapay zeka alanında derinlemesine akademik araştırmalar ve profesyonel içerikler.
            </p>
            
            {/* Social Links */}
            <div className="flex space-x-4">
              <Link 
                href={`https://twitter.com/${siteConfig.author.twitter.replace('@', '')}`}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter&apos;da takip edin"
              >
                <Twitter className="h-5 w-5" />
              </Link>
              <Link 
                href={`https://github.com/${siteConfig.author.github}`}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub&apos;da görüntüleyin"
              >
                <Github className="h-5 w-5" />
              </Link>
              <Link 
                href={`https://linkedin.com/in/${siteConfig.author.linkedin}`}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn&apos;de bağlantı kurun"
              >
                <Linkedin className="h-5 w-5" />
              </Link>
              <Link 
                href="/rss"
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                aria-label='RSS beslemesine abone olun'
              >
                <Rss className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white tracking-wider uppercase mb-4">
              {footerSections.navigation.title}
            </h3>
            <ul className="space-y-3">
              {footerSections.navigation.links.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href}
                    className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white tracking-wider uppercase mb-4">
              {footerSections.categories.title}
            </h3>
            <ul className="space-y-3">
              {footerSections.categories.links.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href}
                    className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <NewsletterForm 
              source="footer"
              className="space-y-4"
            />
          </div>
        </div>

        {/* Legal Links */}
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex space-x-6 mb-4 md:mb-0">
              {footerSections.legal.links.map((link) => (
                <Link 
                  key={link.href}
                  href={link.href}
                  className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white text-sm"
                >
                  {link.name}
                </Link>
              ))}
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              © {currentYear} {siteConfig.name}. Tüm hakları saklıdır.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

// Memoize the Footer component to prevent unnecessary re-renders
export const Footer = memo(FooterComponent)