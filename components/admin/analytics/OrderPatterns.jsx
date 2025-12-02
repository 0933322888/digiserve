'use client'

import { useState, useEffect } from 'react'
import { Calendar, Clock } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function OrderPatterns({ barId }) {
  const [patterns, setPatterns] = useState(null)
  const [loading, setLoading] = useState(false)
  const [startDate, setStartDate] = useState(() => {
    // Default to include sample data (Nov 20, 2024)
    return '2024-11-20'
  })
  const [endDate, setEndDate] = useState(() => {
    // Default to include sample data (Dec 7, 2024)
    return '2024-12-07'
  })

  const fetchPatterns = async () => {
    setLoading(true)
    try {
      const response = await fetch(
        `/api/admin/analytics/order-patterns?barId=${barId}&startDate=${startDate}&endDate=${endDate}&analysis=patterns`
      )
      const data = await response.json()
      if (data.patterns) {
        setPatterns(data.patterns)
      }
    } catch (error) {
      console.error('Failed to fetch order patterns:', error)
      toast.error('Failed to fetch order patterns: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (barId) {
      fetchPatterns()
    }
  }, [barId])

  const maxOrders =
    patterns?.byTimeOfDay.length > 0 ? Math.max(...patterns.byTimeOfDay.map(p => p.orders)) : 1

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Order Patterns</h3>
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
            onClick={fetchPatterns}
            disabled={loading}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark dark:bg-gold dark:text-primary dark:hover:bg-gold-light flex items-center gap-2 disabled:opacity-50"
          >
            <Clock className="w-4 h-4" />
            {loading ? 'Loading...' : 'Analyze'}
          </button>
        </div>
      </div>

      {patterns && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* By Time of Day */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              By Time of Day
            </h4>
            <div className="space-y-3">
              {patterns.byTimeOfDay.map((period, index) => {
                const percent = (period.orders / maxOrders) * 100
                return (
                  <div key={index} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">{period.period}</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {period.orders} orders
                      </span>
                    </div>
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                      <div
                        className="bg-blue-500 h-3 rounded-full"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Revenue: {formatPrice(period.revenue)}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* By Day of Week */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              By Day of Week
            </h4>
            <div className="space-y-3">
              {patterns.byDayOfWeek.map((day, index) => {
                const percent = (day.orders / maxOrders) * 100
                return (
                  <div key={index} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">{day.day}</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {day.orders} orders
                      </span>
                    </div>
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                      <div
                        className="bg-green-500 h-3 rounded-full"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Revenue: {formatPrice(day.revenue)}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* By Order Type */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              By Order Type
            </h4>
            <div className="space-y-3">
              {Object.entries(patterns.byOrderType).map(([type, count]) => {
                const total = Object.values(patterns.byOrderType).reduce((a, b) => a + b, 0)
                const percent = total > 0 ? (count / total) * 100 : 0
                return (
                  <div key={type} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400 capitalize">{type}</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {count} orders ({percent.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                      <div
                        className="bg-purple-500 h-3 rounded-full"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* By Hour */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">By Hour</h4>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {patterns.byHour.map((hour, index) => {
                const maxHourOrders = Math.max(...patterns.byHour.map(h => h.orders))
                const percent = maxHourOrders > 0 ? (hour.orders / maxHourOrders) * 100 : 0
                return (
                  <div key={index} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600 dark:text-gray-400 w-16">{hour.hour}:00</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {hour.orders} orders
                      </span>
                    </div>
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-orange-500 h-2 rounded-full"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {!patterns && !loading && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          Select a date range and click "Analyze" to view order patterns.
        </div>
      )}
    </div>
  )
}
