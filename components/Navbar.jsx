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
export default function Navbar({ templateId = 'bar' }) {
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
    <nav className={cn(
      'fixed left-0 right-0 top-0 z-50 transition-colors duration-300',
      templateId === 'bar' && 'border-b border-white/15 bg-[var(--primary-dark-bg)] text-[var(--navbar-footer-text)]',
      templateId === 'sushi' && 'border-b border-black/10 bg-[var(--primary-light-bg)]',
      templateId === 'restaurant' && 'border-b-2 border-double border-[var(--gold)]/50 bg-[var(--primary-light-bg)]'
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={cn('flex items-center', templateId === 'sushi' ? 'h-auto flex-col py-3 md:grid md:h-[5.5rem] md:grid-cols-[1fr_auto_1fr] md:py-0' : 'h-20 justify-between')}>
          {templateId === 'sushi' && (
            <div className="hidden w-full justify-start md:flex">
              <div className="flex items-center gap-5">
                {navLinks.slice(0, 4).map(link => <Link key={link.href} href={link.href} className={cn('text-xs transition-colors', isActive(link.href) ? 'text-[var(--gold)]' : 'text-[var(--navbar-footer-text)] hover:text-[var(--gold)]')}>{link.label}</Link>)}
              </div>
            </div>
          )}

          {templateId !== 'sushi' && (
            <Link href="/" className="flex items-center">
              <span className={cn('font-serif font-bold transition-colors', templateId === 'bar' ? 'text-xl uppercase tracking-wider text-white' : 'text-2xl text-[var(--navbar-footer-text)]')}>
                {siteConfig.restaurant.name}
              </span>
            </Link>
          )}

          {templateId === 'sushi' && <Link href="/" className="font-serif text-xl text-[var(--navbar-footer-text)] md:text-center">{siteConfig.restaurant.name}</Link>}

          <div className={cn('hidden items-center md:flex', templateId === 'sushi' ? 'justify-end gap-5' : 'space-x-6')}>
            {(templateId === 'sushi' ? navLinks.slice(4) : navLinks).map(link => (
              <Link key={link.href} href={link.href} className={cn(
                'transition-colors',
                templateId === 'bar' ? 'text-xs uppercase tracking-wider' : 'text-sm',
                isActive(link.href) ? 'text-[var(--gold)]' : cn(templateId === 'bar' ? 'text-[var(--navbar-footer-text)]/80 hover:text-[var(--navbar-footer-text)]' : 'text-[var(--navbar-footer-text)] hover:text-[var(--gold)]')
              )}>
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
              className={cn('p-2 transition-colors', templateId !== 'bar' && 'rounded-lg', templateId === 'bar' ? 'text-[var(--navbar-footer-text)] hover:bg-white/10' : 'text-[var(--navbar-footer-text)] hover:bg-[var(--gold)]/20')}
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
            className={cn('md:hidden border-t', templateId === 'bar' ? 'border-white/15 bg-[var(--primary-dark-bg)] text-[var(--navbar-footer-text)]' : templateId === 'sushi' ? 'border-black/10 bg-[var(--primary-light-bg)]' : 'border-[var(--gold)]/40 bg-[var(--primary-light-bg)]')}
          >
            <div className="px-4 py-4 space-y-3">
              {navLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                    className={cn(
                    'block py-1 text-base font-medium transition-colors',
                    isActive(link.href)
                      ? 'text-[var(--gold)]'
                      : templateId === 'bar' ? 'text-[var(--navbar-footer-text)]/80 hover:text-[var(--navbar-footer-text)]' : 'text-[var(--navbar-footer-text)] hover:text-[var(--gold)]'
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
