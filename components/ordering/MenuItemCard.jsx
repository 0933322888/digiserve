'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Minus } from 'lucide-react'
import { useCart } from '@/providers/CartProvider'
import { formatPrice } from '@/lib/utils'
import { siteConfig } from '@/config/siteConfig'

/**
 * Menu Item Card Component for Ordering
 * Displays menu item with add to cart functionality
 */
export default function MenuItemCard({ item, category }) {
  const { addItem } = useCart()
  const [quantity, setQuantity] = useState(1)

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem(item, { category })
    }
    setQuantity(1)
  }
  const showOrdering = siteConfig.features.onlineOrdering && siteConfig.ordering?.enabled

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="bg-cream dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="text-xl font-serif font-semibold text-primary dark:text-gold">
          {item.name}
        </h4>
        <span className="text-lg font-bold text-primary dark:text-gold ml-4">
          {formatPrice(item.price)}
        </span>
      </div>
      {item.description && (
        <p className="text-gray-700 dark:text-gray-300 mb-4 text-sm">
          {item.description}
        </p>
      )}
      {item.dietary && item.dietary.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
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

      {showOrdering && (
        <div className="flex items-center justify-between mt-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="p-1 rounded-full hover:bg-primary/10 dark:hover:bg-gold/10 transition-colors"
            aria-label="Decrease quantity"
          >
            <Minus className="w-4 h-4 text-primary dark:text-gold" />
          </button>
          <span className="text-lg font-semibold w-8 text-center">
            {quantity}
          </span>
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
          className="bg-primary dark:bg-gold text-cream dark:text-primary px-6 py-2 rounded-lg font-semibold hover:bg-primary-dark dark:hover:bg-gold-light transition-colors"
        >
          Add to Cart
        </button>
      </div>
      )}
    </motion.div>
  )
}

