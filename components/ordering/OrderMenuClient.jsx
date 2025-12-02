'use client'

import { useState, useEffect } from 'react'
import MenuItemCard from './MenuItemCard'
import { Filter } from 'lucide-react'

/**
 * Client Component for Order Menu with Category Filtering
 */
export default function OrderMenuClient({ sections }) {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [dietaryFilters, setDietaryFilters] = useState({
    vegetarian: false,
    'gluten-free': false,
  })
  const [showOrdering, setShowOrdering] = useState(false)

  // Fetch module status once at the parent level
  useEffect(() => {
    fetch('/api/modules/status')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.modules) {
          setShowOrdering(data.modules.ordering || false)
        }
      })
      .catch(error => {
        console.error('Failed to fetch module status:', error)
        setShowOrdering(false)
      })
  }, [])

  // Get all categories
  const categories = ['All', ...new Set(sections.map(section => section.name))]

  // Toggle dietary filter
  const toggleDietaryFilter = filter => {
    setDietaryFilters(prev => ({
      ...prev,
      [filter]: !prev[filter],
    }))
  }

  // Filter out archived items first
  let filteredSections = sections
    .map(section => ({
      ...section,
      items: section.items.filter(item => !item.archived),
    }))
    .filter(section => section.items.length > 0)

  // Filter sections based on selected category
  filteredSections =
    selectedCategory === 'All'
      ? filteredSections
      : filteredSections.filter(section => section.name === selectedCategory)

  // Apply dietary filters
  const activeDietaryFilters = Object.entries(dietaryFilters)
    .filter(([_, active]) => active)
    .map(([filter]) => filter.toLowerCase())

  if (activeDietaryFilters.length > 0) {
    filteredSections = filteredSections
      .map(section => ({
        ...section,
        items: section.items.filter(item =>
          item.dietary?.some(diet =>
            activeDietaryFilters.some(filter => diet.toLowerCase().includes(filter))
          )
        ),
      }))
      .filter(section => section.items.length > 0)
  }

  return (
    <>
      {/* Dietary Filters */}
      <div className="mb-6 flex flex-wrap gap-3 justify-center items-center">
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
            onClick={() => setDietaryFilters({ vegetarian: false, 'gluten-free': false })}
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 underline"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Category Filter */}
      <div className="mb-8 flex flex-wrap gap-4 justify-center">
        {categories.map(category => (
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
        {filteredSections.map(section => (
          <div key={section.id}>
            <h3 className="text-3xl font-serif font-bold text-primary dark:text-gold mb-6">
              {section.name}
            </h3>
            {section.description && (
              <p className="text-gray-600 dark:text-gray-400 mb-6 italic">{section.description}</p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {section.items.map(item => (
                <MenuItemCard 
                  key={item.id} 
                  item={item} 
                  category={section.name} 
                  showOrdering={showOrdering}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
