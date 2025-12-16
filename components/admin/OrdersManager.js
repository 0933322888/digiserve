'use client'

import { useState, useEffect } from 'react'
import OrderList from '@/components/admin/OrderList'
import OrderStats from '@/components/admin/OrderStats'
import CreateOrderModal from '@/components/admin/CreateOrderModal'

export default function OrdersManager({ barId }) {
    const [orders, setOrders] = useState([])
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)
    const [filterStatus, setFilterStatus] = useState('all')
    const [filterType, setFilterType] = useState('all')
    const [showCreateModal, setShowCreateModal] = useState(false)

    const fetchOrders = async () => {
        try {
            const params = new URLSearchParams({ barId })
            if (filterStatus !== 'all') params.append('status', filterStatus)
            if (filterType !== 'all') params.append('orderType', filterType)

            const response = await fetch(`/api/admin/orders?${params}`)
            const data = await response.json()
            if (data.orders) {
                setOrders(data.orders)
            }
        } catch (error) {
            console.error('Failed to fetch orders:', error)
        } finally {
            setLoading(false)
        }
    }

    const fetchStats = async () => {
        try {
            const response = await fetch(`/api/admin/orders?barId=${barId}&stats=true`)
            const data = await response.json()
            if (data.stats) {
                setStats(data.stats)
            }
        } catch (error) {
            console.error('Failed to fetch stats:', error)
        }
    }

    useEffect(() => {
        if (barId) {
            fetchOrders()
            fetchStats()
        }
    }, [filterStatus, filterType, barId])

    const handleStatusUpdate = () => {
        fetchOrders()
        fetchStats()
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Orders</h2>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        View and manage all orders including Dine-in, Pickup, and Delivery.
                    </p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                    Create Order
                </button>
            </div>

            <CreateOrderModal
                barId={barId}
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onOrderCreated={handleStatusUpdate}
            />

            {/* Stats */}
            {stats && <OrderStats stats={stats} />}

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
                <div className="flex flex-wrap gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Status
                        </label>
                        <select
                            value={filterStatus}
                            onChange={e => setFilterStatus(e.target.value)}
                            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                        >
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="preparing">Preparing</option>
                            <option value="ready">Ready</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Type
                        </label>
                        <select
                            value={filterType}
                            onChange={e => setFilterType(e.target.value)}
                            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                        >
                            <option value="all">All Types</option>
                            <option value="pickup">Pickup</option>
                            <option value="delivery">Delivery</option>
                            <option value="dineIn">Dine In</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Orders List */}
            {loading ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">Loading orders...</div>
            ) : (
                <OrderList orders={orders} barId={barId} onStatusUpdate={handleStatusUpdate} />
            )}
        </div>
    )
}
