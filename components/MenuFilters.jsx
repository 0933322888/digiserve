'use client'

import { useState } from 'react'
import { Filter } from 'lucide-react'

/**
 * Menu Filters Component
 * Provides quick filters for dietary preferences
 */
export default function MenuFilters({ onFilterChange }) {
  const [dietaryFilters, setDietaryFilters] = useState({
    vegetarian: false,
    'gluten-free': false,
  })

  const toggleDietaryFilter = filter => {
    const newFilters = {
      ...dietaryFilters,
      [filter]: !dietaryFilters[filter],
    }
    setDietaryFilters(newFilters)
    onFilterChange(newFilters)
  }

  return (
    <div className="mb-8 flex flex-wrap gap-3 justify-center items-center">
      <div className="flex items-center gap-2 text-sm font-medium text-[var(--secondary-light-text)] dark:text-[var(--secondary-dark-text)]">
        <Filter className="w-4 h-4" />
        <span>Quick Filters:</span>
      </div>
      <button
        onClick={() => toggleDietaryFilter('vegetarian')}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
          dietaryFilters.vegetarian
            ? 'bg-green-600 text-white'
            : 'bg-[var(--secondary-light-bg)] dark:bg-[var(--secondary-dark-bg)] text-[var(--secondary-light-text)] dark:text-[var(--secondary-dark-text)] hover:bg-[var(--primary-light-bg)]/10 dark:hover:bg-[var(--primary-dark-bg)]/10'
        }`}
      >
        Vegetarian
      </button>
      <button
        onClick={() => toggleDietaryFilter('gluten-free')}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
          dietaryFilters['gluten-free']
            ? 'bg-green-600 text-white'
            : 'bg-[var(--secondary-light-bg)] dark:bg-[var(--secondary-dark-bg)] text-[var(--secondary-light-text)] dark:text-[var(--secondary-dark-text)] hover:bg-[var(--primary-light-bg)]/10 dark:hover:bg-[var(--primary-dark-bg)]/10'
        }`}
      >
        Gluten-Free
      </button>
      {(dietaryFilters.vegetarian || dietaryFilters['gluten-free']) && (
        <button
          onClick={() => {
            const clearedFilters = { vegetarian: false, 'gluten-free': false }
            setDietaryFilters(clearedFilters)
            onFilterChange(clearedFilters)
          }}
          className="px-4 py-2 rounded-lg text-sm font-medium text-[var(--secondary-light-text)] dark:text-[var(--secondary-dark-text)] hover:text-[var(--primary-light-text)] dark:hover:text-[var(--primary-dark-text)] underline"
        >
          Clear Filters
        </button>
      )}
    </div>
  )
}
