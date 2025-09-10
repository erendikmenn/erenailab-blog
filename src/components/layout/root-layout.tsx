'use client'

import { useState, useEffect } from 'react'
import { SessionProvider } from 'next-auth/react'
import { Header } from './header'
import { Footer } from './footer'

interface RootLayoutProps {
  children: React.ReactNode
  session?: any
}

export function RootLayout({ children, session }: RootLayoutProps) {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    // Load theme preference
    const savedTheme = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDark(true)
      document.documentElement.classList.add('dark')
    } else {
      setIsDark(false)
      document.documentElement.classList.remove('dark')
    }
  }, [])

  const toggleTheme = () => {
    const newTheme = !isDark
    setIsDark(newTheme)
    
    if (newTheme) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }

  return (
    <SessionProvider session={session}>
      <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950">
        <Header 
          isDark={isDark}
          onThemeToggle={toggleTheme}
        />
        
        <main className="flex-1">
          {children}
        </main>
        
        <Footer />
      </div>
    </SessionProvider>
  )
}