'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, Home, Receipt } from 'lucide-react'
import Link from 'next/link'
import { siteConfig } from '@/config/siteConfig'

/**
 * Order Success Page
 * Displays order confirmation and receipt
 */
export default function OrderSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const orderId = searchParams.get('orderId')
  const [order, setOrder] = useState(null)

  useEffect(() => {
    if (orderId) {
      // Fetch order details
      fetch(`/api/order/${orderId}`)
        .then(res => res.json())
        .then(data => setOrder(data))
        .catch(err => console.error('Error fetching order:', err))
    }
  }, [orderId])

  if (!orderId) {
    router.push('/order')
    return null
  }

  const orderSchema = {
    '@context': 'https://schema.org',
    '@type': 'Order',
    orderNumber: orderId,
    orderStatus: 'https://schema.org/OrderProcessing',
    merchant: {
      '@type': 'Restaurant',
      name: siteConfig.restaurant.name,
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orderSchema) }}
      />
      <div className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', duration: 0.5 }}
          >
            <CheckCircle className="w-24 h-24 text-green-500 mx-auto mb-6" />
          </motion.div>
          <h1 className="text-4xl font-serif font-bold text-primary dark:text-gold mb-4">
            Order Confirmed!
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            Thank you for your order. We&apos;ll send you a confirmation email shortly.
          </p>

          {order && (
            <div className="bg-secondary dark:bg-gray-800 p-8 rounded-lg shadow-md mb-8 text-left">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-serif font-bold text-primary dark:text-gold flex items-center">
                  <Receipt className="w-6 h-6 mr-2" />
                  Order Receipt
                </h2>
                <span className="text-sm text-gray-600 dark:text-gray-400">Order #{orderId}</span>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Order Details
                  </h3>
                  <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                    <p>
                      <strong>Name:</strong> {order.customerInfo?.name}
                    </p>
                    <p>
                      <strong>Email:</strong> {order.customerInfo?.email}
                    </p>
                    <p>
                      <strong>Phone:</strong> {order.customerInfo?.phone}
                    </p>
                    <p>
                      <strong>Type:</strong> {order.orderType === 'pickup' ? 'Pickup' : 'Delivery'}
                    </p>
                  </div>
                </div>

                {order.items && (
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Items</h3>
                    <div className="space-y-2">
                      {order.items.map((item, index) => (
                        <div
                          key={index}
                          className="flex justify-between text-sm text-gray-700 dark:text-gray-300"
                        >
                          <span>
                            {item.quantity}x {item.name}
                          </span>
                          <span>${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {order.totals && (
                  <div className="border-t border-gray-300 dark:border-gray-600 pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal:</span>
                      <span>${order.totals.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Tax:</span>
                      <span>${order.totals.tax.toFixed(2)}</span>
                    </div>
                    {order.totals.delivery > 0 && (
                      <div className="flex justify-between text-sm">
                        <span>Delivery:</span>
                        <span>${order.totals.delivery.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-lg font-bold text-primary dark:text-gold pt-2 border-t border-gray-300 dark:border-gray-600">
                      <span>Total:</span>
                      <span>${order.totals.total.toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center space-x-2 bg-primary dark:bg-gold text-white dark:text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-primary-dark dark:hover:bg-gold-light transition-colors"
            >
              <Home className="w-5 h-5" />
              <span>Return Home</span>
            </Link>
            <Link
              href="/order"
              className="inline-flex items-center space-x-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              <span>Order Again</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
