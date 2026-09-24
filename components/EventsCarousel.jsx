'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Clock, ChevronLeft, ChevronRight } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

/**
 * Events Carousel Component
 * Displays multiple upcoming events in a carousel
 * @param {Array} events - Array of event objects
 */
export default function EventsCarousel({ events = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0)

  if (!events || events.length === 0) {
    return null
  }

  const nextEvent = () => {
    setCurrentIndex((prev) => (prev + 1) % events.length)
  }

  const prevEvent = () => {
    setCurrentIndex((prev) => (prev - 1 + events.length) % events.length)
  }

  const goToEvent = (index) => {
    setCurrentIndex(index)
  }

  const currentEvent = events[currentIndex]

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <div className="bg-[var(--secondary-light-bg)] dark:bg-[var(--secondary-dark-bg)] rounded-lg overflow-hidden shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
              {/* Event Image */}
              <div className="relative h-64 md:h-auto">
                <Image
                  src={currentEvent.image || '/images/trio_main.png'}
                  alt={currentEvent.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                {currentEvent.featured && (
                  <div className="absolute top-4 right-4 bg-gold text-[var(--primary-light-bg)] px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                    Featured
                  </div>
                )}
              </div>

              {/* Event Details */}
              <div className="p-8 flex flex-col justify-center">
                <h3 className="text-3xl font-serif font-bold text-[var(--primary-light-text)] dark:text-[var(--primary-dark-text)] mb-4">
                  {currentEvent.title}
                </h3>
                <div className="flex items-center space-x-6 mb-4 text-[var(--secondary-light-text)] dark:text-[var(--secondary-dark-text)]">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-[var(--primary-light-text)] dark:text-[var(--primary-dark-text)]" />
                    <span className="font-medium">{formatDate(currentEvent.date)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-5 h-5 text-[var(--primary-light-text)] dark:text-[var(--primary-dark-text)]" />
                    <span className="font-medium">{currentEvent.time}</span>
                  </div>
                </div>
                <p className="text-[var(--secondary-light-text)] dark:text-[var(--secondary-dark-text)] mb-6 text-lg leading-relaxed">
                  {currentEvent.description}
                </p>
                <Link
                  href="/events"
                  className="inline-flex items-center gap-2 bg-[var(--primary-light-bg)] dark:bg-gold text-[var(--primary-light-text)] dark:text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-[var(--primary-dark-bg)] dark:hover:bg-gold-light transition-colors w-fit group"
                >
                  View All Events
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Controls */}
      {events.length > 1 && (
        <>
          {/* Previous Button */}
          <button
            onClick={prevEvent}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-800 text-primary dark:text-gold p-3 rounded-full shadow-lg transition-all hover:scale-110 z-10"
            aria-label="Previous event"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Next Button */}
          <button
            onClick={nextEvent}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-800 text-primary dark:text-gold p-3 rounded-full shadow-lg transition-all hover:scale-110 z-10"
            aria-label="Next event"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mt-6">
            {events.map((_, index) => (
              <button
                key={index}
                onClick={() => goToEvent(index)}
                className={`h-2 rounded-full transition-all ${index === currentIndex
                    ? 'bg-primary dark:bg-gold w-8'
                    : 'bg-gray-300 dark:bg-gray-600 w-2 hover:bg-gray-400 dark:hover:bg-gray-500'
                  }`}
                aria-label={`Go to event ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

