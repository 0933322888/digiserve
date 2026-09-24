'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Moon, Sun } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { siteConfig } from '@/config/siteConfig'
import { cn } from '@/lib/utils'
import CartDrawer from '@/components/ordering/CartDrawer'
import { useTheme } from '@/components/ThemeProvider'

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
  const { theme } = useTheme()

  const isRestaurantTemplate = theme?.templateId === 'restaurant'

  console.log('DEBUG: Navbar', {
    templateId: theme?.templateId,
    isRestaurantTemplate,
    primaryColor: theme?.primaryColor
  })

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

  // Hide on print routes
  if (pathname?.startsWith('/print')) return null

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

  // Helper to convert hex to rgba
  const hexToRgba = (hex, alpha) => {
    if (!hex) return ''
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-colors duration-300",
        isRestaurantTemplate
          ? "border-[var(--primary-light-bg)]/20"
          : "bg-[var(--secondary-light-bg)] dark:bg-[var(--secondary-dark-bg)] border-[var(--primary-light-bg)]/20 dark:border-[var(--primary-dark-bg)]/20"
      )}
      style={{
        backgroundColor: isRestaurantTemplate
          ? 'var(--primary-light-bg)'
          : undefined
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className={cn(
              "text-2xl font-serif font-bold transition-colors",
              isRestaurantTemplate 
                ? "text-white" 
                : "text-[var(--primary-light-text)] dark:text-[var(--primary-dark-text)]"
            )}>
              {siteConfig.restaurant.name}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'text-sm font-medium transition-colors',
                  isRestaurantTemplate
                    ? (isActive(link.href) ? 'text-white border-b-2 border-white' : 'text-white/90 hover:text-white')
                    : (isActive(link.href) 
                        ? 'text-[var(--primary-light-text)] dark:text-[var(--primary-dark-text)] border-b-2 border-[var(--primary-light-text)] dark:border-[var(--primary-dark-text)]' 
                        : 'text-[var(--secondary-light-text)] dark:text-[var(--secondary-dark-text)] hover:text-[var(--primary-light-text)] dark:hover:text-[var(--primary-dark-text)]')
                )}
              >
                {link.label}
              </Link>
            ))}
            {showOrdering && <CartDrawer />}
            <button
              onClick={toggleDarkMode}
              className={cn(
                "p-2 rounded-lg transition-colors",
                isRestaurantTemplate 
                  ? "hover:bg-white/20 text-white" 
                  : "hover:bg-primary/10 dark:hover:bg-gray-800 text-[var(--secondary-light-text)] dark:text-[var(--secondary-dark-text)]"
              )}
              aria-label="Toggle dark mode"
            >
              {isDark ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-4">
            {showOrdering && <CartDrawer />}
            <button
              onClick={toggleDarkMode}
              className={cn(
                "p-2 rounded-lg transition-colors",
                isRestaurantTemplate 
                  ? "hover:bg-white/20 text-white" 
                  : "hover:bg-primary/10 text-[var(--secondary-light-text)] dark:text-[var(--secondary-dark-text)]"
              )}
              aria-label="Toggle dark mode"
            >
              {isDark ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={cn(
                "p-2 rounded-lg transition-colors",
                isRestaurantTemplate 
                  ? "hover:bg-white/20 text-white" 
                  : "hover:bg-primary/10 text-[var(--secondary-light-text)] dark:text-[var(--secondary-dark-text)]"
              )}
              aria-label="Toggle menu"
            >
              {isOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
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
            className="md:hidden bg-[var(--secondary-light-bg)] dark:bg-[var(--secondary-dark-bg)] border-t border-[var(--primary-light-bg)]/20 dark:border-[var(--primary-dark-bg)]/20"
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
                      ? 'text-[var(--primary-light-text)] dark:text-[var(--primary-dark-text)]'
                      : 'text-[var(--secondary-light-text)] dark:text-[var(--secondary-dark-text)] hover:text-[var(--primary-light-text)] dark:hover:text-[var(--primary-dark-text)]'
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
