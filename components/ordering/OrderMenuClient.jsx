'use client'

import { useState, useEffect } from 'react'
import MenuItemCard from './MenuItemCard'
import { Filter } from 'lucide-react'

/**
 * Client Component for Order Menu with Category Filtering
 */
/**
 * Client Component for Order Menu with Category Filtering
 */
export default function OrderMenuClient({ sections, variant = 'grid' }) {
  const [selectedCategory, setSelectedCategory] = useState('All')
  // ... (state logic same)
  const [dietaryFilters, setDietaryFilters] = useState({
    vegetarian: false,
    'gluten-free': false,
  })
  const [showOrdering, setShowOrdering] = useState(false)

  // ... (effects and filter logic same)
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

  // Layout classes
  const gridClass = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
  const listClass = "flex flex-col space-y-4"

  const getContainerClass = () => variant === 'list' ? listClass : gridClass

  return (
    <>
      {/* Filters UI (kept same) */}
      <div className="mb-6 flex flex-wrap gap-3 justify-center items-center">
        <div className="flex items-center gap-2 text-sm font-medium text-primary-text">
          <Filter className="w-4 h-4" />
          <span>Quick Filters:</span>
        </div>
        <button
          onClick={() => toggleDietaryFilter('vegetarian')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${dietaryFilters.vegetarian
            ? 'bg-[var(--primary-light-bg)] text-white'
            : 'bg-[var(--secondary-light-bg)] text-primary-text hover:bg-[var(--primary-dark-bg)]'
            }`}
        >
          Vegetarian
        </button>
        <button
          onClick={() => toggleDietaryFilter('gluten-free')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${dietaryFilters['gluten-free']
            ? 'bg-[var(--primary-light-bg)] text-white'
            : 'bg-[var(--secondary-light-bg)] text-primary-text hover:bg-[var(--primary-dark-bg)]'
            }`}
        >
          Gluten-Free
        </button>
       
      </div>

      <div className="mb-8 flex flex-wrap gap-4 justify-center">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-6 py-2 rounded-lg font-semibold transition-colors ${selectedCategory === category
              ? 'bg-[var(--primary-light-bg)] text-white'
              : 'bg-[var(--secondary-light-bg)] text-primary-text hover:bg-[var(--primary-dark-bg)]'
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
            <h3 className="text-3xl font-serif font-bold text-primary-text  mb-6">
              {section.name}
            </h3>
            {section.description && (
              <p className="text-secondary-text mb-6 italic">{section.description}</p>
            )}
            <div className={getContainerClass()}>
              {section.items.map(item => (
                <MenuItemCard
                  key={item.id}
                  item={item}
                  category={section.name}
                  showOrdering={showOrdering}
                  variant={variant}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
