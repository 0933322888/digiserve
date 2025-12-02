'use client'

import { useState, useEffect } from 'react'
import { Calendar, TrendingUp, Download } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function RevenueTrends({ barId }) {
  const [trends, setTrends] = useState([])
  const [loading, setLoading] = useState(false)
  const [groupBy, setGroupBy] = useState('day') // 'day', 'week', 'month', 'hour'
  const [startDate, setStartDate] = useState(() => {
    // Default to include sample data (Nov 20, 2024)
    return '2024-11-20'
  })
  const [endDate, setEndDate] = useState(() => {
    // Default to include sample data (Dec 7, 2024)
    return '2024-12-07'
  })

  const fetchTrends = async () => {
    setLoading(true)
    try {
      const response = await fetch(
        `/api/admin/analytics/revenue-trends?barId=${barId}&startDate=${startDate}&endDate=${endDate}&groupBy=${groupBy}`
      )
      const data = await response.json()
      if (data.trends) {
        setTrends(data.trends)
      }
    } catch (error) {
      console.error('Failed to fetch revenue trends:', error)
      toast.error('Failed to fetch revenue trends: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (barId) {
      fetchTrends()
    }
  }, [groupBy, barId])

  const maxRevenue = trends.length > 0 ? Math.max(...trends.map(t => t.revenue)) : 1
  const totalRevenue = trends.reduce((sum, t) => sum + t.revenue, 0)
  const averageRevenue = trends.length > 0 ? totalRevenue / trends.length : 0

  const formatPeriod = period => {
    if (groupBy === 'hour') {
      return period.split(' ')[1] || period
    } else if (groupBy === 'month') {
      const [year, month] = period.split('-')
      return new Date(year, parseInt(month) - 1).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      })
    } else if (groupBy === 'week') {
      return new Date(period).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    } else {
      return new Date(period).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Revenue Trends</h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-white dark:bg-gray-800 p-2 rounded-md border border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setGroupBy('day')}
              className={`px-3 py-1 text-xs rounded ${groupBy === 'day' ? 'bg-primary text-white dark:bg-gold dark:text-primary' : 'text-gray-600 dark:text-gray-400'}`}
            >
              Daily
            </button>
            <button
              onClick={() => setGroupBy('week')}
              className={`px-3 py-1 text-xs rounded ${groupBy === 'week' ? 'bg-primary text-white dark:bg-gold dark:text-primary' : 'text-gray-600 dark:text-gray-400'}`}
            >
              Weekly
            </button>
            <button
              onClick={() => setGroupBy('month')}
              className={`px-3 py-1 text-xs rounded ${groupBy === 'month' ? 'bg-primary text-white dark:bg-gold dark:text-primary' : 'text-gray-600 dark:text-gray-400'}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setGroupBy('hour')}
              className={`px-3 py-1 text-xs rounded ${groupBy === 'hour' ? 'bg-primary text-white dark:bg-gold dark:text-primary' : 'text-gray-600 dark:text-gray-400'}`}
            >
              Hourly
            </button>
          </div>
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
            onClick={fetchTrends}
            disabled={loading}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark dark:bg-gold dark:text-primary dark:hover:bg-gold-light flex items-center gap-2 disabled:opacity-50"
          >
            <TrendingUp className="w-4 h-4" />
            {loading ? 'Loading...' : 'Analyze'}
          </button>
        </div>
      </div>

      {/* Summary */}
      {trends.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow border border-gray-200 dark:border-gray-700">
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Revenue</dt>
            <dd className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {formatPrice(totalRevenue)}
            </dd>
          </div>
          <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow border border-gray-200 dark:border-gray-700">
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Average per Period
            </dt>
            <dd className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {formatPrice(averageRevenue)}
            </dd>
          </div>
          <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow border border-gray-200 dark:border-gray-700">
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Periods</dt>
            <dd className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {trends.length}
            </dd>
          </div>
        </div>
      )}

      {/* Chart */}
      {trends.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Revenue Trend
          </h4>
          <div className="space-y-4">
            {trends.map((trend, index) => {
              const revenuePercent = (trend.revenue / maxRevenue) * 100
              return (
                <div key={index} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400 font-medium">
                      {formatPeriod(trend.period)}
                    </span>
                    <div className="flex items-center gap-4">
                      <span className="text-gray-500 dark:text-gray-400">
                        {trend.orders} orders
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-white w-24 text-right">
                        {formatPrice(trend.revenue)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-6 relative">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-green-500 h-6 rounded-full flex items-center justify-end pr-2"
                        style={{ width: `${revenuePercent}%` }}
                      >
                        {revenuePercent > 10 && (
                          <span className="text-xs font-medium text-white">
                            {formatPrice(trend.revenue)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {trends.length === 0 && !loading && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          Select a date range and click "Analyze" to view revenue trends.
        </div>
      )}
    </div>
  )
}
