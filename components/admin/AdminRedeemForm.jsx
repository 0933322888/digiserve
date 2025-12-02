'use client'

import { useState } from 'react'
import { Search, DollarSign } from 'lucide-react'

export default function AdminRedeemForm() {
  const [code, setCode] = useState('')
  const [amount, setAmount] = useState('')
  const [status, setStatus] = useState({ type: null, message: '' })
  const [loading, setLoading] = useState(false)

  const handleRedeem = async e => {
    e.preventDefault()
    setLoading(true)
    setStatus({ type: null, message: '' })

    try {
      const res = await fetch('/api/gift-cards/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, amount }),
      })
      const data = await res.json()

      if (res.ok) {
        setStatus({
          type: 'success',
          message: `Redeemed $${amount}. New Balance: $${data.balance}`,
        })
        setAmount('')
        window.location.reload()
      } else {
        setStatus({ type: 'error', message: data.error || 'Redemption failed' })
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'Network error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="space-y-6" onSubmit={handleRedeem}>
      <div>
        <label
          htmlFor="code"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Gift Card Code
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            id="code"
            required
            className="focus:ring-primary focus:border-primary block w-full pl-10 sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2"
            placeholder="TRIO-XXXXXXX"
            value={code}
            onChange={e => setCode(e.target.value)}
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="amount"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Amount to Redeem
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <DollarSign className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="number"
            id="amount"
            required
            min="0.01"
            step="0.01"
            className="focus:ring-primary focus:border-primary block w-full pl-10 sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2"
            placeholder="0.00"
            value={amount}
            onChange={e => setAmount(e.target.value)}
          />
        </div>
      </div>

      {status.message && (
        <div
          className={`rounded-md p-4 ${status.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}
        >
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm font-medium">{status.message}</p>
            </div>
          </div>
        </div>
      )}

      <div>
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Redeem Amount'}
        </button>
      </div>
    </form>
  )
}
