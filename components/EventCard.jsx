'use client'

import { motion } from 'framer-motion'
import { Calendar, Clock } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import Image from 'next/image'

/**
 * Event Card Component
 * @param {Object} event - Event data
 * @param {number} index - Card index for animation delay
 */
export default function EventCard({ event, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="bg-cream dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow"
    >
      <div className="relative h-48 w-full">
        <Image
          src={event.image || '/images/placeholder-event.jpg'}
          alt={event.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {event.featured && (
          <div className="absolute top-4 right-4 bg-gold text-primary px-3 py-1 rounded-full text-sm font-semibold">
            Featured
          </div>
        )}
      </div>
      <div className="p-6">
        <h3 className="text-2xl font-serif font-bold text-primary dark:text-gold mb-3">
          {event.title}
        </h3>
        <div className="flex items-center space-x-4 mb-3 text-gray-600 dark:text-gray-400">
          <div className="flex items-center space-x-1">
            <Calendar className="w-4 h-4" />
            <span className="text-sm">{formatDate(event.date)}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="w-4 h-4" />
            <span className="text-sm">{event.time}</span>
          </div>
        </div>
        <p className="text-gray-700 dark:text-gray-300">{event.description}</p>
      </div>
    </motion.div>
  )
}

