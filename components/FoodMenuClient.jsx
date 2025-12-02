'use client'

import { useState, useEffect } from 'react'
import MenuSection from './MenuSection'
import MenuFilters from './MenuFilters'

/**
 * Client Component for Food Menu with Dietary Filtering
 */
export default function MenuClient({ sections }) {
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

  // Apply dietary filters
  const activeDietaryFilters = Object.entries(dietaryFilters)
    .filter(([_, active]) => active)
    .map(([filter]) => filter.toLowerCase())

  let filteredSections = sections

  // Filter out archived items first
  filteredSections = sections
    .map(section => ({
      ...section,
      items: section.items.filter(item => !item.archived),
    }))
    .filter(section => section.items.length > 0)

  // Apply dietary filters if any are active
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
      <MenuFilters onFilterChange={setDietaryFilters} />

      {filteredSections.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            No items match the selected filters.
          </p>
        </div>
      ) : (
        filteredSections.map((section, index) => (
          <MenuSection 
            key={section.id} 
            section={section} 
            index={index} 
            showOrdering={showOrdering}
          />
        ))
      )}
    </>
  )
}
