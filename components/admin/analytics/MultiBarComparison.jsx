'use client'

import { useState, useEffect } from 'react'
import { Calendar, TrendingUp, Building2 } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function MultiBarComparison() {
  const [comparison, setComparison] = useState([])
  const [loading, setLoading] = useState(false)
  const [startDate, setStartDate] = useState(() => {
    // Default to include sample data (Nov 20, 2024)
    return '2024-11-20'
  })
  const [endDate, setEndDate] = useState(() => {
    // Default to include sample data (Dec 7, 2024)
    return '2024-12-07'
  })

  const fetchComparison = async () => {
    setLoading(true)
    try {
      const response = await fetch(
        `/api/admin/analytics/multi-bar?startDate=${startDate}&endDate=${endDate}`
      )
      const data = await response.json()
      if (data.comparison) {
        setComparison(data.comparison)
      }
    } catch (error) {
      console.error('Failed to fetch multi-bar comparison:', error)
      toast.error('Failed to fetch comparison: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchComparison()
  }, [])

  const maxRevenue = comparison.length > 0 ? Math.max(...comparison.map(b => b.totalRevenue)) : 1

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Multi-Bar Comparison</h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white text-sm"
            />
            <span className="text-gray-600 dark:text-gray-400">to</span>
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white text-sm"
            />
          </div>
          <button
            onClick={fetchComparison}
            disabled={loading}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark dark:bg-gold dark:text-gray-900 dark:hover:bg-gold-light flex items-center gap-2 disabled:opacity-50"
          >
            <Building2 className="w-4 h-4" />
            {loading ? 'Loading...' : 'Compare'}
          </button>
        </div>
      </div>

      {comparison.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Performance Comparison
          </h4>
          <div className="space-y-4">
            {comparison.map((bar, index) => {
              const revenuePercent = (bar.totalRevenue / maxRevenue) * 100
              const isTopPerformer = index === 0

              return (
                <div
                  key={bar.barId}
                  className={`p-4 rounded-lg border-2 ${
                    isTopPerformer
                      ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700'
                      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {isTopPerformer && (
                        <span className="px-2 py-1 bg-green-500 text-white text-xs font-semibold rounded">
                          TOP
                        </span>
                      )}
                      <Building2 className="w-5 h-5 text-gray-400" />
                      <div>
                        <h5 className="font-semibold text-gray-900 dark:text-white">
                          {bar.barName}
                        </h5>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{bar.barId}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900 dark:text-white">
                        {formatPrice(bar.totalRevenue)}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {bar.totalOrders} orders
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Revenue</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {formatPrice(bar.totalRevenue)}
                      </span>
                    </div>
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full ${
                          isTopPerformer ? 'bg-green-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${revenuePercent}%` }}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Avg Order</div>
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">
                          {formatPrice(bar.averageOrderValue)}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Pickup</div>
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">
                          {bar.ordersByType.pickup}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Delivery</div>
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">
                          {bar.ordersByType.delivery}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {comparison.length === 0 && !loading && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          Select a date range and click "Compare" to view multi-bar comparison.
        </div>
      )}
    </div>
  )
}
