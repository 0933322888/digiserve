'use client'

/**
 * Hero Section Component
 * Displays main banner with CTA buttons
*/

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Calendar, Utensils, Gift } from 'lucide-react'
import { cn } from '@/lib/utils'
import { siteConfig } from '@/config/siteConfig'

/**
 * Hero Section Component
 * Displays main banner with CTA buttons
 * Supports variants: 'centered', 'split', 'minimal'
 */
export default function Hero({
  title,
  tagline,
  description,
  backgroundImage,
  variant = 'centered',
  reservationsEnabled = false,
  giftCardsEnabled = false,
  primaryColor // optional override
}) {

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
    ...(giftCardsEnabled
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

  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8 } }
  }

  // --- Variant: Centered (Default) ---
  if (variant === 'centered') {
    return (
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: backgroundImage ? `url('${backgroundImage}')` : "url('/images/trio_main.png')",
          }}
        >
          <div className="absolute inset-0 bg-black/40 dark:bg-gray-900/60" />
        </div>

        {/* Content */}
        <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-cream mb-4 drop-shadow-lg">
              {title}
            </h1>
            {tagline && (
              <p className="text-xl md:text-2xl text-gold mb-8 font-serif italic drop-shadow-md">
                {tagline}
              </p>
            )}
            {description && (
              <p className="text-lg md:text-xl text-cream/90 mb-12 max-w-2xl mx-auto drop-shadow-sm">
                {description}
              </p>
            )}

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
                        className={cn(
                          "inline-flex items-center space-x-2 px-8 py-4 rounded-lg font-semibold transition-all duration-300",
                          button.primary
                            ? 'bg-gold text-primary hover:bg-gold-light'
                            : 'bg-black/40 text-cream border-2 border-cream hover:bg-cream hover:text-primary backdrop-blur-sm'
                        )}
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

  // --- Variant: Split (Text Left, Image Right) ---
  if (variant === 'split') {
    return (
      <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-cream dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <motion.div
            className="text-left z-10 order-2 md:order-1"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-primary dark:text-gold mb-6">
              {title}
            </h1>
            <p className="text-xl text-gray-700 dark:text-cream/90 mb-8 font-light leading-relaxed">
              {description || tagline}
            </p>
            {ctaButtons.length > 0 && (
              <div className="flex flex-wrap gap-4">
                {ctaButtons.map(button => {
                  const Icon = button.icon
                  return (
                    <Link
                      key={button.href}
                      href={button.href}
                      className={cn(
                        "inline-flex items-center space-x-2 px-8 py-4 rounded-none font-semibold transition-all duration-300 uppercase tracking-widest text-sm",
                        button.primary
                          ? 'bg-primary text-cream hover:bg-primary/90'
                          : 'border border-primary text-primary hover:bg-primary hover:text-cream'
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{button.label}</span>
                    </Link>
                  )
                })}
              </div>
            )}
          </motion.div>

          {/* Image Content */}
          <div className="relative h-[50vh] md:h-[80vh] w-full order-1 md:order-2">
            <div
              className="absolute inset-0 bg-cover bg-center rounded-lg shadow-2xl"
              style={{
                backgroundImage: backgroundImage ? `url('${backgroundImage}')` : "url('/images/trio_main.png')",
              }}
            />
          </div>
        </div>
      </section>
    )
  }

  // --- Variant: Minimal (Text Only / Simple) ---
  if (variant === 'minimal') {
    return (
      <section className="relative min-h-[70vh] flex items-center justify-center bg-transparent pt-20">
        <div className="text-center max-w-4xl mx-auto px-4">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <span className="text-gold uppercase tracking-[0.2em] mb-4 block">{tagline}</span>
            <h1 className="text-6xl md:text-8xl font-serif font-medium text-primary dark:text-cream mb-8">
              {title}
            </h1>
            <div className="w-24 h-1 bg-gold mx-auto mb-10" />

            {ctaButtons.length > 0 && (
              <div className="flex flex-wrap justify-center gap-6">
                {ctaButtons.map(button => (
                  <Link
                    key={button.href}
                    href={button.href}
                    className="text-lg font-serif italic text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-gold transition-colors underline decoration-1 underline-offset-4"
                  >
                    {button.label}
                  </Link>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </section>
    )
  }

  return null
}
