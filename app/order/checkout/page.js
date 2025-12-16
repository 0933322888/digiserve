'use client'

import { useEffect, useState } from 'react'
import CheckoutClient from '@/components/ordering/CheckoutClient'
import { Loader2 } from 'lucide-react'

/**
 * Checkout Page (Client Component)
 * Fetches tenant configuration and renders the checkout client
 */
export default function CheckoutPage() {
  const [config, setConfig] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchConfig() {
      try {
        const res = await fetch('/api/order/config')
        if (res.ok) {
          const data = await res.json()
          setConfig(data)
        }
      } catch (error) {
        console.error('Failed to fetch checkout config:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchConfig()
  }, [])

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary dark:text-gold" />
      </div>
    )
  }

  if (!config) {
    return null // Or error state
  }

  return (
    <CheckoutClient
      stripeEnabled={config.stripeEnabled}
      orderingSettings={config.orderingSettings}
    />
  )
}
