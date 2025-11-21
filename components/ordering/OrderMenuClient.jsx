'use client'

import { useState } from 'react'
import MenuItemCard from './MenuItemCard'

/**
 * Client Component for Order Menu with Category Filtering
 */
export default function OrderMenuClient({ sections }) {
  const [selectedCategory, setSelectedCategory] = useState('All')

  // Get all categories
  const categories = ['All', ...new Set(sections.map((section) => section.name))]

  // Filter sections based on selected category
  const filteredSections =
    selectedCategory === 'All'
      ? sections
      : sections.filter((section) => section.name === selectedCategory)

  return (
    <>
      {/* Category Filter */}
      <div className="mb-8 flex flex-wrap gap-4 justify-center">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
              selectedCategory === category
                ? 'bg-primary dark:bg-gold text-cream dark:text-primary'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Menu Sections */}
      <div className="space-y-12">
        {filteredSections.map((section) => (
          <div key={section.id}>
            <h3 className="text-3xl font-serif font-bold text-primary dark:text-gold mb-6">
              {section.name}
            </h3>
            {section.description && (
              <p className="text-gray-600 dark:text-gray-400 mb-6 italic">
                {section.description}
              </p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {section.items.map((item) => (
                <MenuItemCard key={item.id} item={item} category={section.name} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

