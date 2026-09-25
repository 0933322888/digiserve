'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Gift, CheckCircle, AlertCircle } from 'lucide-react'
import { siteConfig } from '@/config/siteConfig'
import { useSearchParams, useRouter } from 'next/navigation'

/**
 * Gift Card Form Component
 * Supports optional Stripe integration
 */
export default function GiftCardForm() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [formData, setFormData] = useState({
    recipientName: '',
    recipientEmail: '',
    senderName: '',
    senderEmail: '',
    amount: '50',
    message: '',
  })
  const [status, setStatus] = useState({
    type: null,
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const verifyPayment = async () => {
      const sessionId = searchParams.get('session_id')
      if (searchParams.get('success') && sessionId) {
        setStatus({
          type: 'info',
          message: 'Processing your gift card...',
        })

        try {
          const res = await fetch(`/api/gift-cards/verify-payment?session_id=${sessionId}`)
          const data = await res.json()

          if (data.success) {
            setStatus({
              type: 'success',
              message: `Payment successful! Your Gift Card Code is: ${data.code}. We have also emailed it to you.`,
            })
          } else {
            setStatus({
              type: 'error',
              message: data.error || 'Payment verification failed.',
            })
          }
        } catch (err) {
          setStatus({
            type: 'error',
            message: 'Failed to verify payment. Please contact support.',
          })
        }

        // Clean up URL
        router.replace('/gift-cards')
      }
      if (searchParams.get('canceled')) {
        setStatus({
          type: 'error',
          message: 'Payment was canceled. Please try again.',
        })
        router.replace('/gift-cards')
      }
    }

    verifyPayment()
  }, [searchParams, router])

  const handleChange = e => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setIsSubmitting(true)
    setStatus({ type: null, message: '' })

    try {
      const response = await fetch('/api/gift-cards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        if (data.url) {
          // Redirect to Stripe Checkout
          window.location.href = data.url
          return
        }

        setStatus({
          type: 'success',
          message: data.message || 'Gift card request submitted! We will process it shortly.',
        })
        setFormData({
          recipientName: '',
          recipientEmail: '',
          senderName: '',
          senderEmail: '',
          amount: '50',
          message: '',
        })
      } else {
        setStatus({
          type: 'error',
          message: data.error || 'Something went wrong. Please try again.',
        })
      }
    } catch (error) {
      setStatus({
        type: 'error',
        message: 'Network error. Please check your connection and try again.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      onSubmit={handleSubmit}
      className="max-w-2xl mx-auto bg-secondary dark:bg-[var(--secondary-dark-bg)] p-8 rounded-lg shadow-lg"
    >
      <div className="mb-6">
        <h3 className="text-xl font-serif font-semibold text-primary dark:text-gold mb-4">
          Recipient Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="recipientName"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Recipient Name *
            </label>
            <input
              type="text"
              id="recipientName"
              name="recipientName"
              required
              value={formData.recipientName}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-gold focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
          <div>
            <label
              htmlFor="recipientEmail"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Recipient Email *
            </label>
            <input
              type="email"
              id="recipientEmail"
              name="recipientEmail"
              required
              value={formData.recipientEmail}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-gold focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-xl font-serif font-semibold text-primary dark:text-gold mb-4">
          Your Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="senderName"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Your Name *
            </label>
            <input
              type="text"
              id="senderName"
              name="senderName"
              required
              value={formData.senderName}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-gold focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
          <div>
            <label
              htmlFor="senderEmail"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Your Email *
            </label>
            <input
              type="email"
              id="senderEmail"
              name="senderEmail"
              required
              value={formData.senderEmail}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-gold focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
        </div>
      </div>

      <div className="mb-6">
        <label
          htmlFor="amount"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Gift Card Amount *
        </label>
        <select
          id="amount"
          name="amount"
          required
          value={formData.amount}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-gold focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        >
          <option value="25">$25</option>
          <option value="50">$50</option>
          <option value="100">$100</option>
          <option value="150">$150</option>
          <option value="200">$200</option>
          <option value="custom">Custom Amount</option>
        </select>
      </div>

      <div className="mb-6">
        <label
          htmlFor="message"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Personal Message
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          value={formData.message}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-gold focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-none"
          placeholder="Add a personal message to your gift card..."
        />
      </div>

      {siteConfig.api.enableStripe && (
        <div className="mb-6 p-4 bg-gold/20 dark:bg-gold/10 rounded-lg">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Secure payment processing via Stripe will be available after form submission.
          </p>
        </div>
      )}

      {status.type && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-6 p-4 rounded-lg flex items-center space-x-2 ${status.type === 'success'
              ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
              : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
            }`}
        >
          {status.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span>{status.message}</span>
        </motion.div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-primary dark:bg-gold text-white dark:text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-primary-dark dark:hover:bg-gold-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
      >
        {isSubmitting ? (
          <>
            <div className="w-5 h-5 border-2 border-cream dark:border-primary border-t-transparent rounded-full animate-spin" />
            <span>Processing...</span>
          </>
        ) : (
          <>
            <Gift className="w-5 h-5" />
            <span>Request Gift Card</span>
          </>
        )}
      </button>
    </motion.form>
  )
}
