'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Calendar, Utensils, Gift } from 'lucide-react'
import { siteConfig } from '@/config/siteConfig'

/**
 * Hero Section Component
 * Displays main banner with CTA buttons
 */
export default function Hero({ reservationsEnabled = false }) {
  const { restaurant, features } = siteConfig

  const ctaButtons = [
    ...(reservationsEnabled
      ? [
          {
            href: '/reservations',
            label: 'Reservations',
            icon: Calendar,
            primary: true,
          },
        ]
      : []),
    ...(features.giftCards
      ? [
          {
            href: '/gift-cards',
            label: 'Gift Cards',
            icon: Gift,
            primary: false,
          },
        ]
      : []),
  ]

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/images/trio_main.png')",
        }}
      >
        <div className="absolute inset-0 bg-primary/10 dark:bg-gray-900/80" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-cream mb-4">
            {restaurant.name}
          </h1>
          <p className="text-xl md:text-2xl text-gold mb-8 font-serif italic">
            {restaurant.tagline}
          </p>
          <p className="text-lg md:text-xl text-cream/90 mb-12 max-w-2xl mx-auto">
            {restaurant.description}
          </p>

          {/* CTA Buttons */}
          {ctaButtons.length > 0 && (
            <div className="flex flex-wrap justify-center gap-4">
              {ctaButtons.map(button => {
                const Icon = button.icon
                return (
                  <motion.div
                    key={button.href}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      href={button.href}
                      className={`
                        inline-flex items-center space-x-2 px-8 py-4 rounded-lg font-semibold
                        transition-all duration-300
                        ${
                          button.primary
                            ? 'bg-gold text-primary hover:bg-gold-light'
                            : 'bg-cream/20 text-cream border-2 border-cream hover:bg-cream hover:text-primary'
                        }
                      `}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{button.label}</span>
                    </Link>
                  </motion.div>
                )
              })}
            </div>
          )}
        </motion.div>
      </div>
      
    </section>
  )
}
