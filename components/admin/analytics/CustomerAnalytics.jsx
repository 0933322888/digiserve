'use client'

import { useState, useEffect } from 'react'
import { Calendar, Users, DollarSign, ShoppingCart, TrendingUp } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function CustomerAnalytics({ barId }) {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(false)
  const [startDate, setStartDate] = useState(() => {
    // Default to include sample data (Nov 20, 2024)
    return '2024-11-20'
  })
  const [endDate, setEndDate] = useState(() => {
    // Default to include sample data (Dec 7, 2024)
    return '2024-12-07'
  })

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const response = await fetch(
        `/api/admin/analytics/customers?barId=${barId}&startDate=${startDate}&endDate=${endDate}`
      )
      const data = await response.json()
      if (data.analytics) {
        setAnalytics(data.analytics)
      }
    } catch (error) {
      console.error('Failed to fetch customer analytics:', error)
      toast.error('Failed to fetch customer analytics: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (barId) {
      fetchAnalytics()
    }
  }, [barId])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Customer Analytics</h3>
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
            onClick={fetchAnalytics}
            disabled={loading}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark dark:bg-gold dark:text-gray-900 dark:hover:bg-gold-light flex items-center gap-2 disabled:opacity-50"
          >
            <Users className="w-4 h-4" />
            {loading ? 'Loading...' : 'Analyze'}
          </button>
        </div>
      </div>

      {analytics && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="rounded-md p-3 bg-blue-500">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="ml-5">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Total Customers
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">
                    {analytics.totalCustomers}
                  </dd>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="rounded-md p-3 bg-green-500">
                    <DollarSign className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="ml-5">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Avg Order Value
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">
                    {formatPrice(analytics.averageOrderValue)}
                  </dd>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="rounded-md p-3 bg-purple-500">
                    <ShoppingCart className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="ml-5">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Total Orders
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">
                    {analytics.customers.reduce((sum, c) => sum + c.totalOrders, 0)}
                  </dd>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="rounded-md p-3 bg-orange-500">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="ml-5">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Total Revenue
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">
                    {formatPrice(analytics.customers.reduce((sum, c) => sum + c.totalSpent, 0))}
                  </dd>
                </div>
              </div>
            </div>
          </div>

          {/* Top Customers */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Top Customers
            </h4>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Total Orders
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Total Spent
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Avg Order Value
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Lifetime Value
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {analytics.topCustomers.map((customer, index) => (
                    <tr key={customer.customerId}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            #{index + 1}
                          </span>
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {customer.customerName}
                            </div>
                            {customer.email && (
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {customer.email}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {customer.totalOrders}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {formatPrice(customer.totalSpent)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {formatPrice(customer.averageOrderValue)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">
                        {formatPrice(customer.lifetimeValue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {!analytics && !loading && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          Select a date range and click "Analyze" to view customer analytics.
        </div>
      )}
    </div>
  )
}
