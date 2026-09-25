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
  giftCardsEnabled = false
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

  // --- Variant: Centered / Hero Slider (Default) ---
  if (variant === 'centered' || variant === 'hero-slider') {
    return (
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image - Todo: Implement actual slider for 'hero-slider' */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: backgroundImage?.includes('gradient')
              ? backgroundImage
              : (backgroundImage ? `url('${backgroundImage}')` : "url('/images/trio_main.png')"),
          }}
        >
          {!backgroundImage?.includes('gradient') && (
            <div className="absolute inset-0 bg-black/40" />
          )}
        </div>

        {/* Content */}
        <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <h1 className="text-9xl md:text-9xl font-serif font-bold text-primary-text mb-4 drop-shadow-lg">
              {title}
            </h1>
            {tagline && (
              <h2 className="text-5xl md:text-5xl text-gold mb-8 font-serif italic drop-shadow-md">
                {tagline}
              </h2>
            )}
            {description && (
              <p className="text-lg md:text-xl text-primary-text mb-12 max-w-2xl mx-auto drop-shadow-sm">
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
                            ? 'bg-gold text-gold-text hover:bg-gold/90 hover:text-[var(--accent-text)]'
                            : 'bg-black/40 text-primary-text border-2 border-primary-text hover:bg-[var(--secondary-dark-bg)] hover:text-[var(--accent-text)] backdrop-blur-sm'
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

  // --- Variant: Split / Hero Static (Text Left, Image Right) ---
  if (variant === 'split' || variant === 'hero-static') {
    return (
      <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-[var(--secondary-dark-bg)]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <motion.div
            className="text-left z-10 order-2 md:order-1"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-primary-text mb-6">
              {title}
            </h1>
            <p className="text-xl text-primary-text mb-8 font-light leading-relaxed">
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
                          ? 'bg-[var(--primary-dark-bg)] text-primary-text hover:bg-[var(--primary-dark-bg)]/90 hover:text-[var(--accent-text)]'
                          : 'border border-primary-text text-primary-text hover:bg-[var(--primary-dark-bg)] hover:text-[var(--accent-text)]'
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

  // --- Variant: Minimal / Hero Video (Text Only / Simple) ---
  if (variant === 'minimal' || variant === 'hero-video') {
    return (
      <section className="relative min-h-[70vh] flex items-center justify-center bg-transparent pt-20">
        <div className="text-center max-w-4xl mx-auto px-4">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <span className="text-primary-text uppercase tracking-[0.2em] mb-4 block">{tagline}</span>
            <h1 className="text-6xl md:text-8xl font-serif font-medium text-primary-text mb-8">
              {title}
            </h1>
            <div className="w-24 h-1 bg-gold mx-auto mb-10" />

            {ctaButtons.length > 0 && (
              <div className="flex flex-wrap justify-center gap-6">
                {ctaButtons.map(button => (
                  <Link
                    key={button.href}
                    href={button.href}
                    className="text-lg font-serif italic text-primary-text hover:text-[var(--accent-text)] transition-colors underline decoration-1 underline-offset-4"
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
