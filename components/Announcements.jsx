'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * Announcements Component
 * Minimalistic carousel for active announcements
 */
export default function Announcements() {
  const [announcements, setAnnouncements] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    fetch('/api/announcements')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.announcements) {
          setAnnouncements(data.announcements)
        }
      })
      .catch(error => {
        console.error('Failed to fetch announcements:', error)
      })
  }, [])

  // Auto-rotate through announcements if there are multiple
  useEffect(() => {
    if (announcements.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % announcements.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [announcements.length])

  if (announcements.length === 0) {
    return null
  }

  const getBorderColor = type => {
    const colors = {
      info: 'border-blue-500',
      warning: 'border-yellow-500',
      success: 'border-green-500',
      error: 'border-red-500',
    }
    return colors[type] || colors.info
  }

  const getBackgroundColor = type => {
    const colors = {
      info: 'bg-blue-50 dark:bg-blue-950/80',
      warning: 'bg-yellow-50 dark:bg-yellow-950/80',
      success: 'bg-green-50 dark:bg-green-950/80',
      error: 'bg-red-50 dark:bg-red-950/80',
    }
    return colors[type] || colors.info
  }

  const nextAnnouncement = () => {
    setCurrentIndex((prev) => (prev + 1) % announcements.length)
  }

  const prevAnnouncement = () => {
    setCurrentIndex((prev) => (prev - 1 + announcements.length) % announcements.length)
  }

  const goToAnnouncement = (index) => {
    setCurrentIndex(index)
  }

  const currentAnnouncement = announcements[currentIndex]

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentAnnouncement.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className={`border-l-4 ${getBorderColor(currentAnnouncement.type)} ${getBackgroundColor(currentAnnouncement.type)}`}
        >
          <div className="flex items-center gap-2 py-1.5 px-3">
            <div className="flex-1 min-w-0">
              <span className="text-lg font-medium text-gray-900 dark:text-gray-100">
                {currentAnnouncement.title}
              </span>
              {currentAnnouncement.message && (
                <span className="text-lg text-gray-600 dark:text-gray-400 ml-2">
                  {currentAnnouncement.message}
                </span>
              )}
            </div>
            {announcements.length > 1 && (
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={prevAnnouncement}
                  className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                  aria-label="Previous"
                >
                  <ChevronLeft className="w-3 h-3" />
                </button>
                <div className="flex gap-1">
                  {announcements.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToAnnouncement(index)}
                      className={`h-1 rounded-full transition-all ${
                        index === currentIndex
                          ? 'w-2 bg-gray-700 dark:bg-gray-300'
                          : 'w-1 bg-gray-300 dark:bg-gray-600'
                      }`}
                      aria-label={`Go to ${index + 1}`}
                    />
                  ))}
                </div>
                <button
                  onClick={nextAnnouncement}
                  className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                  aria-label="Next"
                >
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

