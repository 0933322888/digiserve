'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ShoppingCart, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useCart } from '@/providers/CartProvider'
import { formatPrice } from '@/lib/utils'

/**
 * Cart Drawer Component
 * Sliding panel showing quick cart view
 */
export default function CartDrawer() {
  const [isOpen, setIsOpen] = useState(false)
  const { cartItems, removeItem, updateQuantity, cartTotals, itemCount } = useCart()

  return (
    <>
      {/* Cart Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="relative p-2 rounded-lg hover:bg-[var(--primary-light-bg)]/10 dark:hover:bg-[var(--primary-dark-bg)]/10 transition-colors"
        aria-label="Open cart"
      >
        <ShoppingCart className="w-6 h-6 text-[var(--secondary-light-text)] dark:text-[var(--secondary-dark-text)]" />
        {itemCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-[var(--primary-light-bg)] dark:bg-[var(--primary-dark-bg)] text-[var(--primary-light-text)] dark:text-[var(--primary-dark-text)] text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {itemCount}
          </span>
        )}
      </button>

      {/* Drawer Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 z-40"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-screen w-full max-w-2xl bg-[var(--secondary-light-bg)] dark:bg-[var(--secondary-dark-bg)] z-50 shadow-2xl flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-[var(--primary-light-bg)]/20 dark:border-[var(--primary-dark-bg)]/20 flex-shrink-0">
                <h2 className="text-2xl font-serif font-bold text-[var(--primary-light-text)] dark:text-[var(--primary-dark-text)]">
                  Your Cart
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg hover:bg-[var(--primary-light-bg)]/10 dark:hover:bg-[var(--primary-dark-bg)]/10 transition-colors"
                  aria-label="Close cart"
                >
                  <X className="w-6 h-6 text-[var(--secondary-light-text)] dark:text-[var(--secondary-dark-text)]" />
                </button>
              </div>

              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto p-6 min-h-0">
                {cartItems.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingCart className="w-16 h-16 text-[var(--secondary-light-text)]/40 dark:text-[var(--secondary-dark-text)]/40 mx-auto mb-4" />
                    <p className="text-[var(--secondary-light-text)]/60 dark:text-[var(--secondary-dark-text)]/60">Your cart is empty</p>
                  </div>
                ) : (
                  <div className="space-y-4 h-full">
                    {cartItems.map(item => (
                      <div
                        key={item.id}
                        className="bg-[var(--secondary-light-bg)] dark:bg-[var(--secondary-dark-bg)] p-5 rounded-lg shadow-sm border border-[var(--primary-light-bg)]/10 dark:border-[var(--primary-dark-bg)]/10"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1 pr-4">
                            <h4 className="text-lg font-semibold text-[var(--secondary-light-text)] dark:text-[var(--secondary-dark-text)] mb-1">
                              {item.name}
                            </h4>
                            {item.description && (
                              <p className="text-sm text-[var(--secondary-light-text)]/60 dark:text-[var(--secondary-dark-text)]/60 mb-2">
                                {item.description}
                              </p>
                            )}
                            <p className="text-sm text-[var(--secondary-light-text)]/60 dark:text-[var(--secondary-dark-text)]/60">
                              {formatPrice(item.price)} each
                            </p>
                          </div>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex-shrink-0"
                            aria-label="Remove item"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                        <div className="flex items-center justify-between pt-3 border-t border-[var(--primary-light-bg)]/20 dark:border-[var(--primary-dark-bg)]/20">
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-10 h-10 rounded-lg border-2 border-[var(--primary-light-bg)]/30 dark:border-[var(--primary-dark-bg)]/30 flex items-center justify-center hover:bg-[var(--primary-light-bg)]/10 dark:hover:bg-[var(--primary-dark-bg)]/10 transition-colors font-semibold text-[var(--secondary-light-text)] dark:text-[var(--secondary-dark-text)]"
                            >
                              -
                            </button>
                            <span className="w-12 text-center font-semibold text-lg text-[var(--secondary-light-text)] dark:text-[var(--secondary-dark-text)]">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-10 h-10 rounded-lg border-2 border-[var(--primary-light-bg)]/30 dark:border-[var(--primary-dark-bg)]/30 flex items-center justify-center hover:bg-[var(--primary-light-bg)]/10 dark:hover:bg-[var(--primary-dark-bg)]/10 transition-colors font-semibold text-[var(--secondary-light-text)] dark:text-[var(--secondary-dark-text)]"
                            >
                              +
                            </button>
                          </div>
                          <span className="font-bold text-lg text-[var(--primary-light-text)] dark:text-[var(--primary-dark-text)]">
                            {formatPrice(item.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              {cartItems.length > 0 && (
                <div className="border-t border-[var(--primary-light-bg)]/20 dark:border-[var(--primary-dark-bg)]/20 p-6 space-y-4 bg-[var(--secondary-light-bg)] dark:bg-[var(--secondary-dark-bg)] flex-shrink-0">
                  <div className="flex justify-between text-xl font-semibold">
                    <span className="text-[var(--secondary-light-text)] dark:text-[var(--secondary-dark-text)]">Subtotal:</span>
                    <span className="text-[var(--primary-light-text)] dark:text-[var(--primary-dark-text)]">
                      {formatPrice(cartTotals.subtotal)}
                    </span>
                  </div>
                  <Link
                    href="/order/cart"
                    onClick={() => setIsOpen(false)}
                    className="block w-full bg-[var(--primary-light-bg)] dark:bg-[var(--primary-dark-bg)] text-[var(--primary-light-text)] dark:text-[var(--primary-dark-text)] px-6 py-4 rounded-lg font-semibold text-center hover:bg-[var(--primary-light-bg)]/90 dark:hover:bg-[var(--primary-dark-bg)]/90 transition-colors text-lg"
                  >
                    View Cart & Checkout
                  </Link>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
