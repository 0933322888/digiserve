'use client'

import { formatDate } from '@/lib/utils'
import { CreditCard, Calendar, AlertCircle, CheckCircle, XCircle, ShoppingCart } from 'lucide-react'

export default function RecentActivityList({ events }) {
  const getIcon = type => {
    switch (type) {
      case 'GIFT_CARD':
        return <CreditCard className="h-5 w-5 text-blue-500" />
      case 'RESERVATION':
        return <Calendar className="h-5 w-5 text-purple-500" />
      case 'ORDER':
        return <ShoppingCart className="h-5 w-5 text-green-500" />
      case 'SYSTEM':
        return <AlertCircle className="h-5 w-5 text-gray-500" />
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusIcon = status => {
    switch (status) {
      case 'SUCCESS':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'FAILED':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Recent Activity</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Type
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Description
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Status
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Time
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {events.map(event => (
              <tr key={event.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {getIcon(event.type)}
                    <span className="ml-2 text-sm text-gray-500 dark:text-gray-400 font-medium">
                      {event.type}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {event.description}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {getStatusIcon(event.status)}
                    <span
                      className={`ml-1.5 text-xs font-medium ${
                        event.status === 'SUCCESS'
                          ? 'text-green-600 dark:text-green-400'
                          : event.status === 'FAILED'
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-gray-500'
                      }`}
                    >
                      {event.status}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {formatDate(event.timestamp)}
                </td>
              </tr>
            ))}
            {events.length === 0 && (
              <tr>
                <td
                  colSpan="4"
                  className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400"
                >
                  No recent activity.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
