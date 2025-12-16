'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Minus } from 'lucide-react'
import { useCart } from '@/providers/CartProvider'
import { formatPrice } from '@/lib/utils'
import Image from 'next/image'

/**
 * Menu Item Card Component for Ordering
 * Displays menu item with add to cart functionality
 * @param {Object} item - Menu item data
 * @param {string} category - Category name
 * @param {boolean} showOrdering - Whether ordering is enabled (passed from parent)
 */
export default function MenuItemCard({ item, category, showOrdering = false, variant = 'grid' }) {
  const { addItem } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [selectedOption, setSelectedOption] = useState(
    item.options && item.options.length > 0 ? item.options[0] : null
  )

  const currentPrice = selectedOption ? selectedOption.price : item.price

  const handleAddToCart = () => {
    const itemToAdd = selectedOption
      ? {
        ...item,
        id: `${item.id}-${selectedOption.name}`,
        name: `${item.name} (${selectedOption.name})`,
        price: selectedOption.price,
      }
      : item

    for (let i = 0; i < quantity; i++) {
      addItem(itemToAdd, { category })
    }
    setQuantity(1)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className={`bg-secondary dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow flex ${variant === 'list' ? 'flex-col md:flex-row gap-6' : 'flex-col h-full'
        } ${item.unavailable ? 'opacity-60' : ''}`}
    >
      {item.image && (
        <div className={`rounded-lg overflow-hidden relative shrink-0 ${variant === 'list' ? 'w-full md:w-48 aspect-video md:aspect-square mb-4 md:mb-0' : 'mb-4 aspect-video'
          }`}>
          <Image
            src={item.image}
            alt={item.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </div>
      )}
      <div className="flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1">
            <h4 className="text-xl font-serif font-semibold text-primary dark:text-gold">
              {item.name}
            </h4>
            {item.unavailable && (
              <span className="inline-block mt-1 px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 text-xs rounded">
                Temporarily Unavailable
              </span>
            )}
          </div>
          {/* Only show main price if ordering is enabled OR item has no size variants */}
          {(showOrdering || !item.options || item.options.length === 0) && (
            <span className="text-lg font-bold text-primary dark:text-gold ml-4">
              {formatPrice(currentPrice)}
            </span>
          )}
        </div>
        {item.description && (
          <p className="text-secondary-text dark:text-gray-300 mb-4 text-sm">{item.description}</p>
        )}

        {/* Show size dropdown only when ordering is enabled */}
        {showOrdering && item.options && item.options.length > 0 && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-secondary-text dark:text-gray-300 mb-1">
              Select Size
            </label>
            <select
              value={selectedOption ? selectedOption.name : ''}
              onChange={e => {
                const option = item.options.find(o => o.name === e.target.value)
                setSelectedOption(option)
              }}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm focus:ring-primary focus:border-primary"
            >
              {item.options.map(opt => (
                <option key={opt.name} value={opt.name}>
                  {opt.name} - {formatPrice(opt.price)}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Show all options with prices when ordering is disabled and item has options */}
        {!showOrdering && item.options && item.options.length > 0 && (
          <div className="mb-4">
            <div className="space-y-2">
              {item.options.map((option, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center text-sm"
                >
                  <span className="text-secondary-text dark:text-gray-300">{option.name}</span>
                  <span className="font-semibold text-primary dark:text-gold">
                    {formatPrice(option.price)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {item.dietary && item.dietary.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {item.dietary.map(diet => (
              <span
                key={diet}
                className="text-xs px-2 py-1 bg-gold/20 text-primary dark:text-gold rounded"
              >
                {diet}
              </span>
            ))}
          </div>
        )}
      </div>

      {showOrdering && (
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
          {item.unavailable ? (
            <div className="w-full text-center py-2 text-sm text-gray-500 dark:text-gray-400 italic">
              This item is temporarily unavailable
            </div>
          ) : (
            <>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-1 rounded-full hover:bg-primary/10 dark:hover:bg-gold/10 transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4 text-primary dark:text-gold" />
                </button>
                <span className="text-lg font-semibold w-8 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-1 rounded-full hover:bg-primary/10 dark:hover:bg-gold/10 transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4 text-primary dark:text-gold" />
                </button>
              </div>
              <button
                onClick={handleAddToCart}
                className="bg-primary dark:bg-gold text-white dark:text-gray-900 px-6 py-2 rounded-lg font-semibold hover:bg-primary-dark dark:hover:bg-gold-light transition-colors"
              >
                Add to Cart
              </button>
            </>
          )}
        </div>
      )}
    </motion.div>
  )
}
