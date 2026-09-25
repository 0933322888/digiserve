'use client'

import { useRouter } from 'next/navigation'
import { siteConfig } from '@/config/siteConfig'
import { motion } from 'framer-motion'
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react'
import Link from 'next/link'
import { useCart } from '@/providers/CartProvider'
import { formatPrice } from '@/lib/utils'

/**
 * Cart Page
 * Displays cart items with quantity controls and checkout button
 */
export default function CartPage() {
  const router = useRouter()
  const { cartItems, removeItem, updateQuantity, cartTotals, clearCart } = useCart()

  const taxRate = siteConfig.ordering?.taxRate || 0.13
  const tax = cartTotals.subtotal * taxRate
  const total = cartTotals.subtotal + tax

  if (cartItems.length === 0) {
    return (
      <div className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <ShoppingBag className="w-24 h-24 text-gray-400 mx-auto mb-6" />
          <h2 className="text-3xl font-serif font-bold text-primary-text  mb-4">
            Your Cart is Empty
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Add some delicious items to get started!
          </p>
          <Link
            href="/order"
            className="inline-block bg-primary dark:bg-gold text-white dark:text-gray-900 px-8 py-3 rounded-lg font-semibold hover:bg-primary-dark dark:hover:bg-gold-light transition-colors"
          >
            Browse Menu
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-serif font-bold text-primary-text  mb-8">
          Your Cart
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map(item => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[var(--primary-light-bg)] p-6 rounded-lg shadow-md"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-serif font-semibold text-[var(--navbar-footer-text)] mb-1">
                      {item.name}
                    </h3>
                    {item.description && (
                      <p className="text-sm text-[var(--navbar-footer-text)]">{item.description}</p>
                    )}
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-2 text-red-600 hover:text-red-700 transition-colors bg-[var(--primary-dark-bg)] rounded-lg flex-shrink-0 "
                    aria-label="Remove item"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-10 h-10 rounded-full border-2 border-primary border-gold flex items-center justify-center hover:bg-primary/10 dark:hover:bg-gold/10 transition-colors"
                    >
                      <Minus className="w-4 h-4 text-[var(--navbar-footer-text)]" />
                    </button>
                    <span className="text-lg font-semibold w-8 text-center text-[var(--navbar-footer-text)]">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-10 h-10 rounded-full border-2 border-primary border-gold flex items-center justify-center hover:bg-primary/10 dark:hover:bg-gold/10 transition-colors"
                    >
                      <Plus className="w-4 h-4 text-[var(--navbar-footer-text)] " />
                    </button>
                  </div>
                  <span className="text-xl font-bold text-[var(--navbar-footer-text)]">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-[var(--primary-light-bg)] p-6 rounded-lg shadow-md sticky top-24">
              <h2 className="text-2xl font-serif font-bold text-[var(--navbar-footer-text)] mb-6">
                Order Summary
              </h2>
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-[var(--navbar-footer-text)]">
                  <span>Subtotal:</span>
                  <span>{formatPrice(cartTotals.subtotal)}</span>
                </div>
                <div className="flex justify-between text-[var(--navbar-footer-text)]">
                  <span>Tax:</span>
                  <span>{formatPrice(tax)}</span>
                </div>
                <div className="border-t border-gray-300 dark:border-gray-600 pt-4 flex justify-between text-xl font-bold text-[var(--navbar-footer-text)] ">
                  <span>Total:</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>
              <button
                onClick={() => router.push('/order/checkout')}
                className="w-full bg-[var(--secondary-dark-bg)] text-white dark:text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-primary-dark dark:hover:bg-gold-light transition-colors"
              >
                Proceed to Checkout
              </button>
              <button
                onClick={clearCart}
                className="w-full mt-3 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors text-sm"
              >
                Clear Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
