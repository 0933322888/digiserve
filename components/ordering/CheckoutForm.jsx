'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar, MapPin, Clock, UtensilsCrossed } from 'lucide-react'
import { siteConfig } from '@/config/siteConfig'
import PaymentForm from './PaymentForm'

/**
 * Checkout Form Component
 * Handles customer info, pickup/delivery selection, and payment
 */
export default function CheckoutForm({ cartItems, cartTotals, onSuccess, stripeEnabled, orderingSettings }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    orderType: 'pickup', // 'pickup', 'delivery', or 'dineIn'
    pickupTime: '',
    dineInTime: '',
    deliveryAddress: {
      street: '',
      city: '',
      state: '',
      zip: '',
    },
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Use props or fallback to siteConfig if somehow props are missing (though they shouldn't be)
  const ordering = orderingSettings || siteConfig.ordering
  const taxRate = ordering?.taxRate || 0.13
  const tax = cartTotals.subtotal * taxRate
  const deliveryFee =
    formData.orderType === 'delivery' && ordering?.deliverySettings
      ? ordering.deliverySettings.baseFee
      : 0
  // Dine-in orders have no delivery fee
  const total = cartTotals.subtotal + tax + deliveryFee

  const handleChange = e => {
    const { name, value } = e.target
    if (name.startsWith('deliveryAddress.')) {
      const field = name.split('.')[1]
      setFormData({
        ...formData,
        deliveryAddress: {
          ...formData.deliveryAddress,
          [field]: value,
        },
      })
    } else {
      setFormData({ ...formData, [name]: value })
    }
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' })
    }
  }

  // Ensure valid order type is selected when constraints change
  useEffect(() => {
    const isPickupAvailable = ordering?.pickup
    const isDeliveryAvailable = ordering?.delivery && stripeEnabled
    const isDineInAvailable = ordering?.dineIn

    const currentTypeValid =
      (formData.orderType === 'pickup' && isPickupAvailable) ||
      (formData.orderType === 'delivery' && isDeliveryAvailable) ||
      (formData.orderType === 'dineIn' && isDineInAvailable)

    if (!currentTypeValid) {
      if (isPickupAvailable) setFormData(prev => ({ ...prev, orderType: 'pickup' }))
      else if (isDineInAvailable) setFormData(prev => ({ ...prev, orderType: 'dineIn' }))
      else if (isDeliveryAvailable) setFormData(prev => ({ ...prev, orderType: 'delivery' }))
    }
  }, [ordering, stripeEnabled, formData.orderType])

  const validateForm = () => {
    const newErrors = {}
    if (!formData.name.trim()) newErrors.name = 'Name is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required'
    if (formData.orderType === 'pickup' && !formData.pickupTime) {
      newErrors.pickupTime = 'Pickup time is required'
    }
    if (formData.orderType === 'dineIn' && !formData.dineInTime) {
      newErrors.dineInTime = 'Dine-in time is required'
    }
    if (formData.orderType === 'delivery') {
      if (!formData.deliveryAddress.street.trim())
        newErrors['deliveryAddress.street'] = 'Street address is required'
      if (!formData.deliveryAddress.city.trim())
        newErrors['deliveryAddress.city'] = 'City is required'
      if (!formData.deliveryAddress.zip.trim())
        newErrors['deliveryAddress.zip'] = 'ZIP code is required'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async paymentIntent => {
    if (!validateForm()) return false

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/order/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cartItems,
          customerInfo: {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
          },
          orderType: formData.orderType,
          pickupTime: formData.pickupTime,
          dineInTime: formData.dineInTime,
          deliveryAddress: formData.deliveryAddress,
          totals: {
            subtotal: cartTotals.subtotal,
            tax,
            delivery: deliveryFee,
            total,
          },
          paymentIntentId: paymentIntent.id,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create order')
      }

      const order = await response.json()
      onSuccess(order)
      return true
    } catch (error) {
      console.error('Order creation error:', error)
      alert(error.message || 'Failed to create order. Please try again.')
      return false
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-[var(--primary-light-bg)] p-6 rounded-lg shadow-md">
        {/* Customer Information */}
        <div className="space-y-6">
          <h2 className="text-2xl font-serif font-bold text-[var(--navbar-footer-text)] ">
            Customer Information
          </h2>

          <div>
            <label className="block text-sm font-medium text-[var(--navbar-footer-text)]  mb-2">
              Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-gold focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
            {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--navbar-footer-text)] mb-2">
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-gold focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
            {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--navbar-footer-text)] mb-2">
              Phone *
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-gold focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
            {errors.phone && <p className="text-red-600 text-sm mt-1">{errors.phone}</p>}
          </div>

          {/* Order Type Selection */}
          <div>
            <label className="block text-sm font-medium text-[var(--navbar-footer-text)]  mb-4">
              Order Type *
            </label>
            <div
              className={`grid gap-4 ${ordering?.dineIn && ordering?.pickup && ordering?.delivery && stripeEnabled ? 'grid-cols-3' : 'grid-cols-2'}`}
            >
              {ordering?.pickup && (
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, orderType: 'pickup' })}
                  className={`p-4 rounded-lg border-2 transition-colors ${formData.orderType === 'pickup'
                    ? 'border-primary bg-[var(--secondary-light-bg)] '
                    : 'border-gray-300 bg-[var(--primary-light-bg)]'
                    }`}
                >
                  <Calendar className="w-6 h-6 mx-auto mb-2 text-[var(--navbar-footer-text)] " />
                  <span className="font-semibold text-[var(--navbar-footer-text)]">Pickup</span>
                </button>
              )}
              {ordering?.delivery && stripeEnabled && (
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, orderType: 'delivery' })}
                  className={`p-4 rounded-lg border-2 transition-colors ${formData.orderType === 'delivery'
                    ? 'border-primary bg-[var(--secondary-light-bg)]'
                    : 'border-gray-300 bg-[var(--primary-light-bg)]'
                    }`}
                >
                  <MapPin className="w-6 h-6 mx-auto mb-2 text-[var(--navbar-footer-text)] " />
                  <span className="font-semibold text-[var(--navbar-footer-text)]">Delivery</span>
                </button>
              )}
              {ordering?.dineIn && (
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, orderType: 'dineIn' })}
                  className={`p-4 rounded-lg border-2 transition-colors ${formData.orderType === 'dineIn'
                    ? 'border-primary bg-[var(--secondary-light-bg)]'
                    : 'border-gray-300 bg-[var(--primary-light-bg)]'
                    }`}
                >
                  <UtensilsCrossed className="w-6 h-6 mx-auto mb-2 text-[var(--navbar-footer-text)] " />
                  <span className="font-semibold text-[var(--navbar-footer-text)]">Dine In</span>
                </button>
              )}
            </div>
          </div>

          {/* Pickup Time */}
          {formData.orderType === 'pickup' && ordering?.pickup && (
            <div>
              <label className="block text-sm font-medium text-[var(--navbar-footer-text)]  mb-2">
                <Clock className="w-4 h-4 inline mr-2" />
                Pickup Time *
              </label>
              <input
                type="datetime-local"
                name="pickupTime"
                value={formData.pickupTime}
                onChange={handleChange}
                min={new Date().toISOString().slice(0, 16)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900"
              />
              {errors.pickupTime && (
                <p className="text-red-600 text-sm mt-1">{errors.pickupTime}</p>
              )}
            </div>
          )}

          {/* Dine-In Time */}
          {formData.orderType === 'dineIn' && ordering?.dineIn && (
            <div>
              <label className="block text-sm font-medium text-[var(--navbar-footer-text)]  mb-2">
                <Clock className="w-4 h-4 inline mr-2" />
                Preferred Dine-In Time *
              </label>
              <input
                type="datetime-local"
                name="dineInTime"
                value={formData.dineInTime}
                onChange={handleChange}
                min={new Date().toISOString().slice(0, 16)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-gold focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
              {errors.dineInTime && (
                <p className="text-red-600 text-sm mt-1">{errors.dineInTime}</p>
              )}
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                We'll prepare your order for this time. Please arrive on time.
              </p>
            </div>
          )}

          {/* Delivery Address */}
          {formData.orderType === 'delivery' && ordering?.delivery && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[var(--navbar-footer-text)] ">
                Delivery Address
              </h3>
              <div>
                <label className="block text-sm font-medium text-[var(--navbar-footer-text)]  mb-2">
                  Street Address *
                </label>
                <input
                  type="text"
                  name="deliveryAddress.street"
                  value={formData.deliveryAddress.street}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-gold focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
                {errors['deliveryAddress.street'] && (
                  <p className="text-red-600 text-sm mt-1">{errors['deliveryAddress.street']}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--navbar-footer-text)]  mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    name="deliveryAddress.city"
                    value={formData.deliveryAddress.city}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-gold focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                  {errors['deliveryAddress.city'] && (
                    <p className="text-red-600 text-sm mt-1">{errors['deliveryAddress.city']}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--navbar-footer-text)]  mb-2">
                    ZIP Code *
                  </label>
                  <input
                    type="text"
                    name="deliveryAddress.zip"
                    value={formData.deliveryAddress.zip}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-gold focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                  {errors['deliveryAddress.zip'] && (
                    <p className="text-red-600 text-sm mt-1">{errors['deliveryAddress.zip']}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary & Payment */}
        <div>
          <div className="bg-[var(--primary-dark-bg)] p-6 rounded-lg shadow-md sticky top-24">
            <h2 className="text-2xl font-serif font-bold text-[var(--navbar-footer-text)]  mb-6">
              Order Summary
            </h2>
            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-[var(--navbar-footer-text)] ">
                <span>Subtotal:</span>
                <span>${cartTotals.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[var(--navbar-footer-text)] ">
                <span>Tax:</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              {deliveryFee > 0 && (
                <div className="flex justify-between text-[var(--navbar-footer-text)] ">
                  <span>Delivery:</span>
                  <span>${deliveryFee.toFixed(2)}</span>
                </div>
              )}
              <div className="border-t border-gray-300 pt-4 flex justify-between text-xl font-bold text-[var(--navbar-footer-text)] ">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <PaymentForm
              amount={total}
              onSuccess={handleSubmit}
              isSubmitting={isSubmitting}
              stripeEnabled={stripeEnabled}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
