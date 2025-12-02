'use client'

import { useState, useEffect } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { siteConfig } from '@/config/siteConfig'

// Initialize Stripe
const stripePromise = loadStripe(
  siteConfig.api.stripePublicKey || process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY || ''
)

/**
 * Payment Form Component with Stripe Elements
 */
function PaymentFormInner({ amount, onSuccess, isSubmitting }) {
  const stripe = useStripe()
  const elements = useElements()
  const [error, setError] = useState(null)
  const [processing, setProcessing] = useState(false)

  const handleSubmit = async e => {
    e.preventDefault()

    // If Stripe is not configured, skip payment and proceed with order
    if (!siteConfig.api.enableStripe || !siteConfig.api.stripePublicKey) {
      const mockPaymentIntent = {
        id: `pi_mock_${Date.now()}`,
        status: 'succeeded',
      }
      const success = await onSuccess(mockPaymentIntent)
      return
    }

    if (!stripe || !elements) {
      setError('Payment system is not ready. Please try again.')
      return
    }

    setProcessing(true)
    setError(null)

    try {
      // Create payment intent
      const response = await fetch('/api/order/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: Math.round(amount * 100) }), // Convert to cents
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create payment intent')
      }

      const data = await response.json()

      if (!data.clientSecret) {
        throw new Error('No client secret received from server')
      }

      const { clientSecret } = data

      // Confirm payment
      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      })

      if (confirmError) {
        setError(confirmError.message)
        setProcessing(false)
        return
      }

      if (paymentIntent.status === 'succeeded') {
        const success = await onSuccess(paymentIntent)
        if (!success) {
          setProcessing(false)
        }
      }
    } catch (err) {
      setError(err.message || 'Payment failed. Please try again.')
      setProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
              invalid: {
                color: '#9e2146',
              },
            },
          }}
        />
      </div>
      {error && (
        <div className="text-red-600 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
          {error}
        </div>
      )}
      <button
        type="submit"
        disabled={!stripe || processing || isSubmitting}
        className="w-full bg-primary dark:bg-gold text-cream dark:text-primary px-6 py-3 rounded-lg font-semibold hover:bg-primary-dark dark:hover:bg-gold-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {processing || isSubmitting ? 'Processing...' : `Pay $${amount.toFixed(2)}`}
      </button>
    </form>
  )
}

/**
 * Payment Form Wrapper
 */
export default function PaymentForm({ amount, onSuccess, isSubmitting }) {
  // If Stripe is not configured, show a simple button to proceed without payment
  if (!siteConfig.api.enableStripe || !siteConfig.api.stripePublicKey) {
    return (
      <div className="space-y-4">
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-800 dark:text-blue-200 text-sm">
          <p className="font-semibold mb-1">Test Mode</p>
          <p>
            Stripe is not configured. Orders will be processed without payment for testing purposes.
          </p>
        </div>
        <button
          type="button"
          onClick={async () => {
            const mockPaymentIntent = {
              id: `pi_mock_${Date.now()}`,
              status: 'succeeded',
            }
            await onSuccess(mockPaymentIntent)
          }}
          disabled={isSubmitting}
          className="w-full bg-primary dark:bg-gold text-cream dark:text-primary px-6 py-3 rounded-lg font-semibold hover:bg-primary-dark dark:hover:bg-gold-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Processing...' : `Complete Order ($${amount.toFixed(2)})`}
        </button>
      </div>
    )
  }

  return (
    <Elements stripe={stripePromise}>
      <PaymentFormInner amount={amount} onSuccess={onSuccess} isSubmitting={isSubmitting} />
    </Elements>
  )
}
