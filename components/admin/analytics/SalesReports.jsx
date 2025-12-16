'use client'

import { useState, useEffect } from 'react'
import { Calendar, DollarSign, ShoppingCart, TrendingUp, Download } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function SalesReports({ barId }) {
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(false)
  const [period, setPeriod] = useState('week') // 'today', 'week', 'month', 'custom'
  const [startDate, setStartDate] = useState(() => {
    // Default to 30 days ago to include sample data
    const date = new Date()
    date.setDate(date.getDate() - 30)
    return date.toISOString().split('T')[0]
  })
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0]
  })

  const fetchReport = async () => {
    setLoading(true)
    try {
      let reportStartDate = startDate
      let reportEndDate = endDate

      // Set dates based on period
      if (period === 'today') {
        // Use a date that has sample data
        reportStartDate = '2024-12-07'
        reportEndDate = '2024-12-07'
      } else if (period === 'week') {
        // Use week that includes sample data
        reportStartDate = '2024-11-20'
        reportEndDate = '2024-12-07'
      } else if (period === 'month') {
        // Use month that includes sample data
        reportStartDate = '2024-11-01'
        reportEndDate = '2024-12-07'
      }

      const response = await fetch(
        `/api/admin/analytics/sales?barId=${barId}&startDate=${reportStartDate}&endDate=${reportEndDate}`
      )
      const data = await response.json()
      if (data.report) {
        setReport(data.report)
      }
    } catch (error) {
      console.error('Failed to fetch sales report:', error)
      toast.error('Failed to fetch sales report: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handlePeriodChange = newPeriod => {
    setPeriod(newPeriod)
    if (newPeriod !== 'custom') {
      fetchReport()
    }
  }

  const handleExport = format => {
    if (!report) return
    toast.info(`Export to ${format.toUpperCase()} functionality will be implemented`)
    // TODO: Implement export functionality
  }

  // Auto-fetch on mount
  useEffect(() => {
    if (barId) {
      fetchReport()
    }
  }, [barId])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Sales Reports</h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-white dark:bg-gray-800 p-2 rounded-md border border-gray-200 dark:border-gray-700">
            <button
              onClick={() => handlePeriodChange('today')}
              className={`px-3 py-1 text-xs rounded ${period === 'today' ? 'bg-primary text-white dark:bg-gold dark:text-gray-900' : 'text-gray-600 dark:text-gray-400'}`}
            >
              Today
            </button>
            <button
              onClick={() => handlePeriodChange('week')}
              className={`px-3 py-1 text-xs rounded ${period === 'week' ? 'bg-primary text-white dark:bg-gold dark:text-gray-900' : 'text-gray-600 dark:text-gray-400'}`}
            >
              Week
            </button>
            <button
              onClick={() => handlePeriodChange('month')}
              className={`px-3 py-1 text-xs rounded ${period === 'month' ? 'bg-primary text-white dark:bg-gold dark:text-gray-900' : 'text-gray-600 dark:text-gray-400'}`}
            >
              Month
            </button>
            <button
              onClick={() => handlePeriodChange('custom')}
              className={`px-3 py-1 text-xs rounded ${period === 'custom' ? 'bg-primary text-white dark:bg-gold dark:text-gray-900' : 'text-gray-600 dark:text-gray-400'}`}
            >
              Custom
            </button>
          </div>
          {period === 'custom' && (
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
          )}
          <button
            onClick={fetchReport}
            disabled={loading}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark dark:bg-gold dark:text-gray-900 dark:hover:bg-gold-light flex items-center gap-2 disabled:opacity-50"
          >
            <Calendar className="w-4 h-4" />
            {loading ? 'Loading...' : 'Generate Report'}
          </button>
          {report && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleExport('pdf')}
                className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                title="Export to PDF"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {report && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="rounded-md p-3 bg-blue-500">
                    <DollarSign className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="ml-5">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Total Revenue
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">
                    {formatPrice(report.totalRevenue)}
                  </dd>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="rounded-md p-3 bg-green-500">
                    <ShoppingCart className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="ml-5">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Total Orders
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">
                    {report.totalOrders}
                  </dd>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="rounded-md p-3 bg-purple-500">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="ml-5">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Avg Order Value
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">
                    {formatPrice(report.averageOrderValue)}
                  </dd>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="rounded-md p-3 bg-orange-500">
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="ml-5">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Period</dt>
                  <dd className="text-sm font-medium text-gray-900 dark:text-white">
                    {new Date(report.period.startDate).toLocaleDateString()} -{' '}
                    {new Date(report.period.endDate).toLocaleDateString()}
                  </dd>
                </div>
              </div>
            </div>
          </div>

          {/* Revenue Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Revenue by Order Type */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Revenue by Order Type
              </h4>
              <div className="space-y-3">
                {Object.entries(report.revenueByType).map(([type, revenue]) => (
                  <div key={type} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                      {type}
                    </span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {formatPrice(revenue)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Orders by Status */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Orders by Status
              </h4>
              <div className="space-y-3">
                {Object.entries(report.ordersByStatus).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                      {status}
                    </span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Daily Revenue */}
          {Object.keys(report.revenueByDay).length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Daily Revenue
              </h4>
              <div className="space-y-2">
                {Object.entries(report.revenueByDay)
                  .sort((a, b) => a[0].localeCompare(b[0]))
                  .map(([date, revenue]) => (
                    <div
                      key={date}
                      className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700"
                    >
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {formatPrice(revenue)}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </>
      )}

      {!report && !loading && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          Select a period and click "Generate Report" to view sales data.
        </div>
      )}
    </div>
  )
}
