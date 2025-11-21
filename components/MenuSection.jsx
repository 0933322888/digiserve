'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Minus } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { useCart } from '@/providers/CartProvider'
import { siteConfig } from '@/config/siteConfig'

/**
 * Reusable Menu Section Component
 * @param {Object} section - Menu section data
 * @param {number} index - Section index for animation delay
 */
export default function MenuSection({ section, index = 0 }) {
  const { addItem } = useCart()
  const [quantities, setQuantities] = useState({})
  const showOrdering = siteConfig.features.onlineOrdering && siteConfig.ordering?.enabled

  const handleQuantityChange = (itemId, change) => {
    setQuantities((prev) => ({
      ...prev,
      [itemId]: Math.max(1, (prev[itemId] || 1) + change),
    }))
  }

  const handleAddToCart = (item) => {
    const quantity = quantities[item.id] || 1
    for (let i = 0; i < quantity; i++) {
      addItem(item, { category: section.name })
    }
    setQuantities((prev) => ({ ...prev, [item.id]: 1 }))
  }
  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="mb-16"
    >
      <div className="mb-8">
        <h3 className="text-3xl font-serif font-bold text-primary dark:text-gold mb-2">
          {section.name}
        </h3>
        {section.description && (
          <p className="text-gray-600 dark:text-gray-400 italic">
            {section.description}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {section.items.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="bg-cream dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
            itemScope
            itemType="https://schema.org/MenuItem"
          >
            <div className="flex justify-between items-start mb-2">
              <h4
                className="text-xl font-serif font-semibold text-primary dark:text-gold"
                itemProp="name"
              >
                {item.name}
              </h4>
              <span
                className="text-lg font-bold text-primary dark:text-gold ml-4"
                itemProp="offers"
                itemScope
                itemType="https://schema.org/Offer"
              >
                <span itemProp="price" content={item.price} />
                <span itemProp="priceCurrency" content="USD" />
                {formatPrice(item.price)}
              </span>
            </div>
            <p
              className="text-gray-700 dark:text-gray-300 mb-2"
              itemProp="description"
            >
              {item.description}
            </p>
            {item.dietary && item.dietary.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {item.dietary.map((diet) => (
                  <span
                    key={diet}
                    className="text-xs px-2 py-1 bg-gold/20 text-primary dark:text-gold rounded"
                  >
                    {diet}
                  </span>
                ))}
              </div>
            )}
            {item.serves && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Serves {item.serves}
              </p>
            )}
            {item.size && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                {item.size}
              </p>
            )}
            {showOrdering && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleQuantityChange(item.id, -1)}
                    className="p-1 rounded-lg hover:bg-primary/10 dark:hover:bg-gold/10 transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4 text-primary dark:text-gold" />
                  </button>
                  <span className="text-lg font-semibold w-8 text-center">
                    {quantities[item.id] || 1}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(item.id, 1)}
                    className="p-1 rounded-lg hover:bg-primary/10 dark:hover:bg-gold/10 transition-colors"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4 h-4 text-primary dark:text-gold" />
                  </button>
                </div>
                <button
                  onClick={() => handleAddToCart(item)}
                  className="bg-primary dark:bg-gold text-cream dark:text-primary px-4 py-2 rounded-lg font-semibold hover:bg-primary-dark dark:hover:bg-gold-light transition-colors text-sm"
                >
                  Add to Cart
                </button>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </motion.section>
  )
}

