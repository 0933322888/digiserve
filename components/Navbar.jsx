'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Moon, Sun } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { siteConfig } from '@/config/siteConfig'
import { cn } from '@/lib/utils'
import CartDrawer from '@/components/ordering/CartDrawer'

/**
 * Main Navigation Component
 * Automatically generates navigation links based on enabled features
 */
export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isDark, setIsDark] = useState(false)
  const [moduleStatus, setModuleStatus] = useState({
    events: siteConfig.features.events,
    gallery: siteConfig.features.gallery,
    reservations: siteConfig.features.reservations,
    giftCards: siteConfig.features.giftCards,
    ordering: siteConfig.ordering?.enabled,
  })
  const pathname = usePathname()

  useEffect(() => {
    // Check for saved theme preference or default to light mode
    const savedTheme = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const shouldBeDark = savedTheme === 'dark' || (!savedTheme && prefersDark)

    setIsDark(shouldBeDark)
    if (shouldBeDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [])

  useEffect(() => {
    // Fetch module status from API
    fetch('/api/modules/status')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.modules) {
          setModuleStatus(data.modules)
        }
      })
      .catch(error => {
        console.error('Failed to fetch module status:', error)
        // Keep default values from siteConfig
      })
  }, [])

  const toggleDarkMode = () => {
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

  // Build navigation links based on enabled features from DB
  const navLinks = [
    { href: '/', label: 'Home' },
    {
      href: '/menu',
      label: 'Menu',
    },
    { href: '/about', label: 'About' },
    ...(moduleStatus.events ? [{ href: '/events', label: 'Events' }] : []),
    ...(moduleStatus.gallery ? [{ href: '/gallery', label: 'Gallery' }] : []),
    ...(moduleStatus.reservations ? [{ href: '/reservations', label: 'Reservations' }] : []),
    ...(moduleStatus.giftCards ? [{ href: '/gift-cards', label: 'Gift Cards' }] : []),
    { href: '/contact', label: 'Contact' },
  ]

  const isActive = href => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  const showOrdering = moduleStatus.ordering

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-cream/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-primary/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-serif font-bold text-primary dark:text-gold">
              {siteConfig.restaurant.name.split(' ')[0]}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'text-sm font-medium transition-colors hover:text-primary dark:hover:text-gold',
                  isActive(link.href)
                    ? 'text-primary dark:text-gold border-b-2 border-primary dark:border-gold'
                    : 'text-gray-700 dark:text-gray-300'
                )}
              >
                {link.label}
              </Link>
            ))}
            {showOrdering && <CartDrawer />}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg hover:bg-primary/10 dark:hover:bg-gold/10 transition-colors"
              aria-label="Toggle dark mode"
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              ) : (
                <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              )}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-4">
            {showOrdering && <CartDrawer />}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg hover:bg-primary/10 transition-colors"
              aria-label="Toggle dark mode"
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              ) : (
                <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              )}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg hover:bg-primary/10 transition-colors"
              aria-label="Toggle menu"
            >
              {isOpen ? (
                <X className="w-6 h-6 text-gray-700 dark:text-gray-300" />
              ) : (
                <Menu className="w-6 h-6 text-gray-700 dark:text-gray-300" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-cream dark:bg-gray-900 border-t border-primary/20"
          >
            <div className="px-4 py-4 space-y-3">
              {navLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    'block text-base font-medium transition-colors',
                    isActive(link.href)
                      ? 'text-primary dark:text-gold'
                      : 'text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-gold'
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
