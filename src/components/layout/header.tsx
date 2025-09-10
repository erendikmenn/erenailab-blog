'use client'

import { useState, useCallback, memo } from 'react'
import Link from 'next/link'
import { useSession, signIn, signOut } from 'next-auth/react'
import { Button, Avatar, AvatarFallback, AvatarImage } from '@/components/ui'
import { siteConfig, navigation } from '@/lib/config'
import { 
  Menu, 
  X, 
  Moon, 
  Sun, 
  User,
  LogOut,
  Settings
} from 'lucide-react'

interface HeaderProps {
  isDark: boolean
  onThemeToggle: () => void
}

function HeaderComponent({ isDark, onThemeToggle }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const { data: session, status } = useSession()

  // Memoize event handlers to prevent child re-renders
  const toggleMenu = useCallback(() => setIsMenuOpen(!isMenuOpen), [isMenuOpen])
  const closeMenu = useCallback(() => setIsMenuOpen(false), [])
  const toggleUserMenu = useCallback(() => setIsUserMenuOpen(!isUserMenuOpen), [isUserMenuOpen])
  const closeUserMenu = useCallback(() => setIsUserMenuOpen(false), [])
  
  const handleSignIn = useCallback(() => {
    window.location.href = '/auth/signin'
  }, [])
  const handleSignOut = useCallback(() => {
    signOut()
    setIsUserMenuOpen(false)
  }, [])

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:border-gray-800 dark:bg-gray-950/95 dark:supports-[backdrop-filter]:bg-gray-950/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary-600 to-accent-500 flex items-center justify-center">
                <span className="text-white font-bold text-sm">E</span>
              </div>
              <span className="hidden sm:block text-xl font-bold text-gray-900 dark:text-white">
                {siteConfig.name}
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-gray-700 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400 transition-colors"
              >
                {item.title}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <Button variant="ghost" size="icon" onClick={onThemeToggle}>
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              <span className="sr-only">Toggle theme</span>
            </Button>

            {/* User Menu */}
            {status === 'loading' ? (
              <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse dark:bg-gray-700" />
            ) : session ? (
              <div className="relative">
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
                  onClick={toggleUserMenu}
                  aria-label="Kullanıcı menüsü"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={session.user.image || ''} alt={session.user.name || ''} />
                    <AvatarFallback>
                      {session.user.name?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-md border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                    <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                      <div className="font-medium">{session.user.name}</div>
                      <div className="text-gray-500 dark:text-gray-400">{session.user.email}</div>
                    </div>
                    <div className="border-t border-gray-100 dark:border-gray-700">
                      <Link
                        href="/profile"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                        onClick={closeUserMenu}
                      >
                        <User className="mr-2 h-4 w-4" />
                        Profil
                      </Link>
                      {session.user.role === 'ADMIN' && (
                        <Link
                          href="/admin"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                          onClick={closeUserMenu}
                        >
                          <Settings className="mr-2 h-4 w-4" />
                          Admin Panel
                        </Link>
                      )}
                      <button
                        onClick={handleSignOut}
                        className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Çıkış Yap
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Button onClick={handleSignIn} variant="outline" size="sm">
                Giriş Yap
              </Button>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={toggleMenu}
              aria-label="Mobil menü"
            >
              {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-700">
            <div className="px-2 py-3 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-primary-400 dark:hover:bg-gray-800 rounded-md"
                  onClick={closeMenu}
                >
                  {item.title}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

// Memoize the Header component
export const Header = memo(HeaderComponent)