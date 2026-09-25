'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Minus } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { useCart } from '@/providers/CartProvider'
import Image from 'next/image'

/**
 * Reusable Menu Section Component
 * @param {Object} section - Menu section data
 * @param {number} index - Section index for animation delay
 * @param {boolean} showOrdering - Whether ordering is enabled (passed from parent)
 */
/**
 * Reusable Menu Section Component
 * @param {Object} section - Menu section data
 * @param {number} index - Section index for animation delay
 * @param {boolean} showOrdering - Whether ordering is enabled (passed from parent)
 * @param {string} variant - Layout variant: 'grid', 'list'
 */
export default function MenuSection({ section, index = 0, showOrdering = false, variant = 'grid' }) {
  const { addItem } = useCart()
  const [quantities, setQuantities] = useState({})

  const handleQuantityChange = (itemId, change) => {
    setQuantities(prev => ({
      ...prev,
      [itemId]: Math.max(1, (prev[itemId] || 1) + change),
    }))
  }

  const handleAddToCart = item => {
    const quantity = quantities[item.id] || 1
    for (let i = 0; i < quantity; i++) {
      addItem(item, { category: section.name })
    }
    setQuantities(prev => ({ ...prev, [item.id]: 1 }))
  }

  // Render logic based on variant
  const containerClass = variant === 'list'
    ? "flex flex-col space-y-6"
    : "grid grid-cols-1 md:grid-cols-2 gap-6"

  const cardClass = variant === 'list'
    ? "bg-[var(--secondary-dark-bg)] p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row gap-6 border-b border-[var(--primary-dark-bg)]/20"
    : "bg-[var(--secondary-dark-bg)] p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow flex flex-col h-full"

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="mb-16"
    >
      <div className="mb-8">
        <h3 className="text-3xl font-serif font-bold text-[var(--primary-dark-text)] mb-2">
          {section.name}
        </h3>
        {section.description && (
          <p className="text-primary-text italic">{section.description}</p>
        )}
      </div>

      <div className={containerClass}>
        {section.items
          .filter(item => !item.archived)
          .map(item => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className={`${cardClass} ${item.unavailable ? 'opacity-60' : ''}`}
              itemScope
              itemType="https://schema.org/MenuItem"
            >
              {item.image && (
                <div className={`
                    rounded-lg overflow-hidden relative shrink-0
                    ${variant === 'list' ? 'w-full md:w-48 aspect-video md:aspect-square mb-4 md:mb-0' : 'mb-4 aspect-video'}
                `}>
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
              )}
              <div className="flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h4
                      className="text-xl font-serif font-semibold text-[var(--primary-dark-text)]"
                      itemProp="name"
                    >
                      {item.name}
                    </h4>
                    {item.unavailable && (
                      <span className="inline-block mt-1 px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 text-xs rounded">
                        Temporarily Unavailable
                      </span>
                    )}
                  </div>

                  {/* Only show main price if ordering is enabled OR item has no size variants */}
                  {showOrdering || !item.options || item.options.length === 0 ? (
                    <span
                      className="text-lg font-bold text-[var(--primary-dark-text)] ml-4"
                      itemProp="offers"
                      itemScope
                      itemType="https://schema.org/Offer"
                    >
                      <span itemProp="price" content={item.price} />
                      <span itemProp="priceCurrency" content="USD" />
                      {formatPrice(item.price)}
                    </span>
                  ) : null}
                </div>
                <p className="text-primary-text mb-2" itemProp="description">
                  {item.description}
                </p>
                {/* Show all size variants when ordering is disabled and item has options */}
                {!showOrdering && item.options && item.options.length > 0 && (
                  <div className="mt-3 mb-2">
                    <div className="space-y-2">
                      {item.options.map((option, idx) => (
                        <div
                          key={idx}
                          className="flex justify-between items-center text-sm"
                        >
                          <span className="text-primary-text">{option.name}</span>
                          <span className="font-semibold text-[var(--primary-dark-text)]">
                            {formatPrice(option.price)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {item.dietary && item.dietary.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {item.dietary.map(diet => (
                      <span
                        key={diet}
                        className="text-xs px-2 py-1 bg-[var(--gold)]/20 text-[var(--primary-dark-text)] rounded"
                      >
                        {diet}
                      </span>
                    ))}
                  </div>
                )}
                {item.serves && (
                  <p className="text-sm text-primary-text/70 mt-2">
                    Serves {item.serves}
                  </p>
                )}
                {item.size && (
                  <p className="text-sm text-primary-text/70 mt-2">{item.size}</p>
                )}
              </div>
              {showOrdering && (
                <div className={`flex items-center justify-between pt-4 border-t border-[var(--primary-dark-bg)]/20 ${variant === 'list' ? 'mt-4 md:mt-0 md:ml-6 md:flex-col md:border-t-0 md:border-l md:pl-6 bg-transparent' : 'mt-auto'}`}>
                  {item.unavailable ? (
                    <div className="w-full text-center py-2 text-sm text-primary-text/60 italic">
                      This item is temporarily unavailable
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center space-x-3 mb-0 md:mb-4">
                        <button
                          onClick={() => handleQuantityChange(item.id, -1)}
                          className="p-1 rounded-lg hover:bg-[var(--primary-dark-bg)]/10 transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-4 h-4 text-[var(--primary-dark-text)]" />
                        </button>
                        <span className="text-lg font-semibold w-8 text-center text-primary-text">
                          {quantities[item.id] || 1}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(item.id, 1)}
                          className="p-1 rounded-lg hover:bg-[var(--primary-dark-bg)]/10 transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-4 h-4 text-[var(--primary-dark-text)]" />
                        </button>
                      </div>
                      <button
                        onClick={() => handleAddToCart(item)}
                        className="bg-[var(--primary-dark-bg)] text-[var(--primary-dark-text)] px-4 py-2 rounded-lg font-semibold hover:bg-[var(--primary-dark-bg)]/90 transition-colors text-sm whitespace-nowrap"
                      >
                        Add to Cart
                      </button>
                    </>
                  )}
                </div>
              )}
            </motion.div>
          ))}
      </div>
    </motion.section>
  )
}
