import { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'

export function useKDS(barId) {
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const fetchOrders = useCallback(async () => {
        if (!barId) return

        try {
            // Fetch 'pending' and 'preparing' orders
            // Note: The API currently filters by a single status string. 
            // If we need multiple, we might need to fetch twice or update API.
            // For now, let's assume we want to show 'pending' and 'preparing'.
            // We'll fetch all and filter client side for simplicity if API doesn't support 'active'.

            const response = await fetch('/api/admin/orders', {
                headers: {
                    'x-tenant-id': barId
                }
            })

            if (!response.ok) throw new Error('Failed to fetch orders')

            const data = await response.json()

            // Filter for active kitchen orders (pending, preparing)
            // Exclude 'completed', 'cancelled'
            const activeOrders = data.orders.filter(order =>
                ['pending', 'preparing'].includes(order.status)
            ).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)) // Oldest first

            setOrders(activeOrders)
            setError(null)
        } catch (err) {
            console.error('KDS Polling Error:', err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }, [barId])

    // Initial fetch
    useEffect(() => {
        fetchOrders()
    }, [fetchOrders])

    // Polling interval (15 seconds)
    useEffect(() => {
        const intervalId = setInterval(fetchOrders, 15000)
        return () => clearInterval(intervalId)
    }, [fetchOrders])

    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            const response = await fetch(`/api/admin/orders/${orderId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'x-tenant-id': barId
                },
                body: JSON.stringify({ status: newStatus })
            })

            if (!response.ok) throw new Error('Failed to update status')

            toast.success(`Order updated to ${newStatus}`)

            // Optimistic update or refetch
            fetchOrders()
        } catch (err) {
            console.error('Order Update Error:', err)
            toast.error('Failed to update order status')
        }
    }

    return { orders, loading, error, refresh: fetchOrders, updateOrderStatus }
}
