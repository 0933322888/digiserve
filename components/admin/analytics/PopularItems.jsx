'use client'

import { useState, useEffect } from 'react'
import { Calendar, TrendingUp, Download } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function PopularItems({ barId }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [groupBy, setGroupBy] = useState('items') // 'items' or 'category'
  const [startDate, setStartDate] = useState(() => {
    // Default to include sample data (Nov 20, 2024)
    return '2024-11-20'
  })
  const [endDate, setEndDate] = useState(() => {
    // Default to include sample data (Dec 7, 2024)
    return '2024-12-07'
  })

  const fetchItems = async () => {
    setLoading(true)
    try {
      const response = await fetch(
        `/api/admin/analytics/popular-items?barId=${barId}&startDate=${startDate}&endDate=${endDate}&groupBy=${groupBy}`
      )
      const data = await response.json()
      if (data.items) {
        setItems(data.items)
      }
    } catch (error) {
      console.error('Failed to fetch popular items:', error)
      toast.error('Failed to fetch popular items: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (barId) {
      fetchItems()
    }
  }, [groupBy, barId])

  const maxQuantity = items.length > 0 ? Math.max(...items.map(i => i.quantity)) : 1
  const maxRevenue = items.length > 0 ? Math.max(...items.map(i => i.revenue)) : 1

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Popular Items Analysis
        </h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-white dark:bg-gray-800 p-2 rounded-md border border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setGroupBy('items')}
              className={`px-3 py-1 text-xs rounded ${groupBy === 'items' ? 'bg-primary text-white dark:bg-gold dark:text-primary' : 'text-gray-600 dark:text-gray-400'}`}
            >
              By Items
            </button>
            <button
              onClick={() => setGroupBy('category')}
              className={`px-3 py-1 text-xs rounded ${groupBy === 'category' ? 'bg-primary text-white dark:bg-gold dark:text-primary' : 'text-gray-600 dark:text-gray-400'}`}
            >
              By Category
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
            onClick={fetchItems}
            disabled={loading}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark dark:bg-gold dark:text-primary dark:hover:bg-gold-light flex items-center gap-2 disabled:opacity-50"
          >
            <Calendar className="w-4 h-4" />
            {loading ? 'Loading...' : 'Analyze'}
          </button>
        </div>
      </div>

      {items.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {groupBy === 'items' ? 'Top Selling Items' : 'Performance by Category'}
          </h4>
          <div className="space-y-4">
            {items.map((item, index) => {
              const quantityPercent = (item.quantity / maxQuantity) * 100
              const revenuePercent = (item.revenue / maxRevenue) * 100

              return (
                <div key={item.id || item.category || index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400 w-6">
                          #{index + 1}
                        </span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {item.name || item.category}
                        </span>
                        {item.category && groupBy === 'items' && (
                          <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                            {item.category}
                          </span>
                        )}
                      </div>
                      {item.description && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 ml-8 mt-1">
                          {item.description}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">
                        {formatPrice(item.revenue)}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {item.quantity} sold
                      </div>
                    </div>
                  </div>
                  <div className="ml-8 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400 w-16">
                        Quantity:
                      </span>
                      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${quantityPercent}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300 w-12 text-right">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400 w-16">
                        Revenue:
                      </span>
                      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${revenuePercent}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300 w-20 text-right">
                        {formatPrice(item.revenue)}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {items.length === 0 && !loading && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          Select a date range and click "Analyze" to view popular items.
        </div>
      )}
    </div>
  )
}
