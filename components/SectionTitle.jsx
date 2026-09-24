'use client'

import { motion } from 'framer-motion'

/**
 * Reusable Section Title Component
 * @param {string} title - Section title
 * @param {string} subtitle - Optional subtitle
 * @param {string} className - Additional CSS classes
 */
export default function SectionTitle({ title, subtitle, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className={`text-center mb-12 ${className}`}
    >
      <h2 className="text-4xl md:text-5xl font-serif font-bold text-[var(--primary-light-text)] dark:text-[var(--primary-dark-text)] mb-4">
        {title}
      </h2>
      {subtitle && (
        <p className="text-lg text-[var(--secondary-light-text)] dark:text-[var(--secondary-dark-text)] max-w-2xl mx-auto">{subtitle}</p>
      )}
    </motion.div>
  )
}
