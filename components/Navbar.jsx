'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
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
  const [moduleStatus, setModuleStatus] = useState({
    events: siteConfig.features.events,
    gallery: siteConfig.features.gallery,
    reservations: siteConfig.features.reservations,
    giftCards: siteConfig.features.giftCards,
    ordering: siteConfig.ordering?.enabled,
  })
  const pathname = usePathname()
  useEffect(() => {
    // Apply dark mode by default for all templates
    document.documentElement.classList.add('dark')
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
        "fixed top-0 left-0 right-0 z-50 transition-colors duration-300 bg-[var(--primary-light-bg)] border-b border-[var(--gold)]/30"
      )}
      style={{
        backgroundColor: 'var(--primary-light-bg)'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className={cn(
              "text-2xl font-serif font-bold transition-colors",
              "text-[var(--navbar-footer-text)]"
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
                    isActive(link.href)
                      ? 'text-[var(--gold)] border-b-2 border-[var(--gold)]'
                      : 'text-[var(--navbar-footer-text)] hover:text-[var(--gold)]'
                )}
              >
                {link.label}
              </Link>
            ))}
            {showOrdering && <CartDrawer />}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-4">
            {showOrdering && <CartDrawer />}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={cn(
                "p-2 rounded-lg transition-colors",
                "hover:bg-[var(--gold)]/20 text-[var(--navbar-footer-text)]"
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
            className={cn(
              "md:hidden bg-[var(--primary-light-bg)] border-t border-[var(--gold)]/30"
            )}
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
                      ? 'text-[var(--gold)]'
                      : 'text-[var(--navbar-footer-text)] hover:text-[var(--gold)]'
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
