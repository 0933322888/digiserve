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
      <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
        <Filter className="w-4 h-4" />
        <span>Quick Filters:</span>
      </div>
      <button
        onClick={() => toggleDietaryFilter('vegetarian')}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
          dietaryFilters.vegetarian
            ? 'bg-green-600 text-white'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
        }`}
      >
        Vegetarian
      </button>
      <button
        onClick={() => toggleDietaryFilter('gluten-free')}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
          dietaryFilters['gluten-free']
            ? 'bg-green-600 text-white'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
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
          className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 underline"
        >
          Clear Filters
        </button>
      )}
    </div>
  )
}
