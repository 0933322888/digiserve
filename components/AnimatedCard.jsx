'use client'

import { motion } from 'framer-motion'

/**
 * Animated Card Component with Framer Motion
 * @param {React.ReactNode} children - Card content
 * @param {string} className - Additional CSS classes
 * @param {number} delay - Animation delay in seconds
 */
export default function AnimatedCard({ children, className = '', delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
