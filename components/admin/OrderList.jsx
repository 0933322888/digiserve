'use client'

import { useState } from 'react'
import {
  Clock,
  CheckCircle,
  ChefHat,
  Package,
  XCircle,
  MapPin,
  Calendar,
  Phone,
  Mail,
  DollarSign,
} from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function OrderList({ orders, barId, onStatusUpdate }) {
  const [expandedOrderId, setExpandedOrderId] = useState(null)

  const getStatusBadge = status => {
    const badges = {
      pending: {
        bg: 'bg-yellow-100 dark:bg-yellow-900',
        text: 'text-yellow-800 dark:text-yellow-200',
        icon: Clock,
        label: 'Pending',
      },
      confirmed: {
        bg: 'bg-blue-100 dark:bg-blue-900',
        text: 'text-blue-800 dark:text-blue-200',
        icon: CheckCircle,
        label: 'Confirmed',
      },
      preparing: {
        bg: 'bg-purple-100 dark:bg-purple-900',
        text: 'text-purple-800 dark:text-purple-200',
        icon: ChefHat,
        label: 'Preparing',
      },
      ready: {
        bg: 'bg-green-100 dark:bg-green-900',
        text: 'text-green-800 dark:text-green-200',
        icon: Package,
        label: 'Ready',
      },
      completed: {
        bg: 'bg-gray-100 dark:bg-gray-700',
        text: 'text-gray-800 dark:text-gray-200',
        icon: CheckCircle,
        label: 'Completed',
      },
      cancelled: {
        bg: 'bg-red-100 dark:bg-red-900',
        text: 'text-red-800 dark:text-red-200',
        icon: XCircle,
        label: 'Cancelled',
      },
    }
    const badge = badges[status] || badges.pending
    const Icon = badge.icon
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}
      >
        <Icon className="w-3 h-3" />
        {badge.label}
      </span>
    )
  }

  const formatDateTime = dateString => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleString()
  }

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          barId,
          status: newStatus,
          adminId: 'admin_1', // In production, get from auth
          adminName: 'Admin',
        }),
      })

      const data = await response.json()
      if (data.success) {
        // Dispatch event to update badge in admin layout
        window.dispatchEvent(new CustomEvent('order-updated'))
        if (onStatusUpdate) onStatusUpdate()
      } else {
        toast.error('Failed to update status: ' + (data.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Status update error:', error)
      toast.error('Failed to update status: ' + error.message)
    }
  }

  const getNextStatus = currentStatus => {
    const statusFlow = {
      pending: 'confirmed',
      confirmed: 'preparing',
      preparing: 'ready',
      ready: 'completed',
    }
    return statusFlow[currentStatus] || null
  }

  if (orders.length === 0) {
    return <div className="text-center py-12 text-gray-500 dark:text-gray-400">No orders found</div>
  }

  return (
    <div className="space-y-4">
      {orders.map(order => (
        <div
          key={order.id}
          className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden"
        >
          <div className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Order #{order.id}</h3>
                  {getStatusBadge(order.status)}
                  <span
                    className={`text-sm px-2 py-1 rounded ${
                      order.orderType === 'pickup'
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                        : order.orderType === 'delivery'
                          ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                          : 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200'
                    }`}
                  >
                    {order.orderType === 'pickup'
                      ? 'Pickup'
                      : order.orderType === 'delivery'
                        ? 'Delivery'
                        : 'Dine In'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDateTime(order.createdAt)}</span>
                  </div>
                  {order.pickupTime && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>Pickup: {formatDateTime(order.pickupTime)}</span>
                    </div>
                  )}
                  {order.dineInTime && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>Dine-In: {formatDateTime(order.dineInTime)}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{order.customerInfo.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    <span>{order.customerInfo.phone}</span>
                  </div>
                  {order.customerInfo.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      <span>{order.customerInfo.email}</span>
                    </div>
                  )}
                  {order.deliveryAddress && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>
                        {order.deliveryAddress.street}, {order.deliveryAddress.city},{' '}
                        {order.deliveryAddress.zip}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-3 flex items-center gap-4">
                  <div className="flex items-center gap-2 text-lg font-bold text-primary dark:text-gold">
                    <DollarSign className="w-5 h-5" />
                    {formatPrice(order.totals?.total || 0)}
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2 ml-4">
                {order.status !== 'completed' && order.status !== 'cancelled' && (
                  <>
                    {getNextStatus(order.status) && (
                      <button
                        onClick={() => handleStatusChange(order.id, getNextStatus(order.status))}
                        className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark text-sm whitespace-nowrap"
                      >
                        Mark as{' '}
                        {getNextStatus(order.status).charAt(0).toUpperCase() +
                          getNextStatus(order.status).slice(1)}
                      </button>
                    )}
                    {order.status !== 'ready' && (
                      <button
                        onClick={() => {
                          if (confirm('Mark this order as ready for pickup/delivery?')) {
                            handleStatusChange(order.id, 'ready')
                          }
                        }}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm whitespace-nowrap"
                      >
                        Mark Ready
                      </button>
                    )}
                    {order.status !== 'cancelled' && (
                      <button
                        onClick={() => {
                          const reason = prompt('Cancellation reason (optional):')
                          if (reason !== null) {
                            handleStatusChange(order.id, 'cancelled')
                          }
                        }}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm whitespace-nowrap"
                      >
                        Cancel
                      </button>
                    )}
                  </>
                )}
                <button
                  onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 text-sm"
                >
                  {expandedOrderId === order.id ? 'Hide' : 'View'} Details
                </button>
              </div>
            </div>

            {expandedOrderId === order.id && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Order Items</h4>
                <div className="space-y-2 mb-4">
                  {order.items?.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-900 rounded"
                    >
                      <div>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {item.name}
                        </span>
                        {item.quantity > 1 && (
                          <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                            x{item.quantity}
                          </span>
                        )}
                      </div>
                      <span className="text-gray-700 dark:text-gray-300">
                        {formatPrice((item.price || 0) * (item.quantity || 1))}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                    <span className="text-gray-900 dark:text-white">
                      {formatPrice(order.totals?.subtotal || 0)}
                    </span>
                  </div>
                  {order.totals?.tax > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Tax:</span>
                      <span className="text-gray-900 dark:text-white">
                        {formatPrice(order.totals.tax || 0)}
                      </span>
                    </div>
                  )}
                  {order.totals?.delivery > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Delivery:</span>
                      <span className="text-gray-900 dark:text-white">
                        {formatPrice(order.totals.delivery || 0)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700 font-bold">
                    <span className="text-gray-900 dark:text-white">Total:</span>
                    <span className="text-primary dark:text-gold">
                      {formatPrice(order.totals?.total || 0)}
                    </span>
                  </div>
                </div>

                {order.notes && (
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-1">
                      Customer Notes:
                    </p>
                    <p className="text-sm text-blue-800 dark:text-blue-300">{order.notes}</p>
                  </div>
                )}

                {order.adminNotes && (
                  <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-900 rounded">
                    <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                      Admin Notes:
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{order.adminNotes}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
