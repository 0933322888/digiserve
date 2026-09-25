'use client'

import { useState, useEffect } from 'react'
import { Calendar, Clock, TrendingUp, TrendingDown } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function PeakHours({ barId }) {
  const [peakAnalysis, setPeakAnalysis] = useState(null)
  const [loading, setLoading] = useState(false)
  const [startDate, setStartDate] = useState(() => {
    // Default to include sample data (Nov 20, 2024)
    return '2024-11-20'
  })
  const [endDate, setEndDate] = useState(() => {
    // Default to include sample data (Dec 7, 2024)
    return '2024-12-07'
  })

  const fetchPeakAnalysis = async () => {
    setLoading(true)
    try {
      const response = await fetch(
        `/api/admin/analytics/order-patterns?barId=${barId}&startDate=${startDate}&endDate=${endDate}&analysis=peak`
      )
      const data = await response.json()
      if (data.peakAnalysis) {
        setPeakAnalysis(data.peakAnalysis)
      }
    } catch (error) {
      console.error('Failed to fetch peak hours analysis:', error)
      toast.error('Failed to fetch peak hours analysis: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (barId) {
      fetchPeakAnalysis()
    }
  }, [barId])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Peak Hours Analysis</h3>
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
            onClick={fetchPeakAnalysis}
            disabled={loading}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark dark:bg-gold dark:text-gray-900 dark:hover:bg-gold-light flex items-center gap-2 disabled:opacity-50"
          >
            <Clock className="w-4 h-4" />
            {loading ? 'Loading...' : 'Analyze'}
          </button>
        </div>
      </div>

      {peakAnalysis && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Peak Hours */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Peak Hours</h4>
            </div>
            <div className="space-y-3">
              {peakAnalysis.peakHours.map((hour, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400 w-6">
                      #{index + 1}
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {hour.hourLabel}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">
                      {hour.orders} orders
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {formatPrice(hour.revenue)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Slowest Hours */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Slowest Hours</h4>
            </div>
            <div className="space-y-3">
              {peakAnalysis.slowestHours.map((hour, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400 w-6">
                      #{index + 1}
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {hour.hourLabel}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">
                      {hour.orders} orders
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {formatPrice(hour.revenue)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Peak Days */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Peak Days</h4>
            </div>
            <div className="space-y-3">
              {peakAnalysis.peakDays.map((day, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400 w-6">
                      #{index + 1}
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">{day.day}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">
                      {day.orders} orders
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {formatPrice(day.revenue)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Slowest Days */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Slowest Days</h4>
            </div>
            <div className="space-y-3">
              {peakAnalysis.slowestDays.map((day, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400 w-6">
                      #{index + 1}
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">{day.day}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">
                      {day.orders} orders
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {formatPrice(day.revenue)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {peakAnalysis && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Average Orders per Hour
          </h4>
          <p className="text-2xl font-bold text-primary-text ">
            {peakAnalysis.averageOrdersPerHour.toFixed(1)}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Based on analysis of {startDate} to {endDate}
          </p>
        </div>
      )}

      {!peakAnalysis && !loading && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          Select a date range and click "Analyze" to view peak hours analysis.
        </div>
      )}
    </div>
  )
}
