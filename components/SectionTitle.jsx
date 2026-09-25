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
      <h2 className="inline-block text-4xl md:text-5xl font-serif font-bold text-primary-text bg-accent/90 rounded-md px-4 py-2 mb-4">
        {title}
      </h2>
      {subtitle && (
        <p className="w-fit text-lg text-primary-text bg-primary/90 rounded-md px-3 py-1 max-w-2xl mx-auto">{subtitle}</p>
      )}
    </motion.div>
  )
}
