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
      <div className="flex items-center gap-2 text-sm font-medium text-primary-text">
        <Filter className="w-4 h-4" />
        <span>Quick Filters:</span>
      </div>
      <button
        onClick={() => toggleDietaryFilter('vegetarian')}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
          dietaryFilters.vegetarian
            ? 'bg-green-600 text-white'
            : 'bg-[var(--secondary-light-bg)] text-primary-text hover:bg-[var(--primary-dark-bg)]'
        }`}
      >
        Vegetarian
      </button>
      <button
        onClick={() => toggleDietaryFilter('gluten-free')}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
          dietaryFilters['gluten-free']
            ? 'bg-green-600 text-white'
            : 'bg-[var(--secondary-light-bg)] text-primary-text hover:bg-[var(--primary-dark-bg)]'
        }`}
      >
        Gluten-Free
      </button>
    </div>
  )
}
