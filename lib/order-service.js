import { db } from './db'

/**
 * Create a new order
 */
export async function createOrder(orderData) {
  if (!orderData.barId) {
    throw new Error('barId is required for creating an order')
  }

  const order = {
    id: orderData.id || `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    barId: orderData.barId,
    customerInfo: orderData.customerInfo,
    orderType: orderData.orderType, // 'pickup' | 'delivery'
    items: orderData.items || [],
    totals: orderData.totals || {
      subtotal: 0,
      tax: 0,
      delivery: 0,
      total: 0,
    },
    paymentIntentId: orderData.paymentIntentId || null,
    status: orderData.status || 'pending', // 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled'
    pickupTime: orderData.pickupTime || null,
    dineInTime: orderData.dineInTime || null,
    deliveryAddress: orderData.deliveryAddress || null,
    notes: orderData.notes || null,
    adminNotes: orderData.adminNotes || null,
    confirmedAt: null,
    completedAt: null,
    cancelledAt: null,
    cancelledBy: null,
    cancelledReason: null,
    createdAt: orderData.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  await db.collection('orders').insertOne(order)
  return order
}

/**
 * Get all orders
 */
export async function getOrders(filters = {}) {
  if (!filters.barId) {
    throw new Error('barId is required for querying orders')
  }

  // Build database query
  const query = { barId: filters.barId }

  if (filters.status) {
    query.status = filters.status
  }

  if (filters.orderType) {
    query.orderType = filters.orderType
  }

  if (filters.startDate || filters.endDate) {
    query.createdAt = {}
    if (filters.startDate) {
      query.createdAt.$gte = filters.startDate
    }
    if (filters.endDate) {
      query.createdAt.$lte = filters.endDate
    }
  }

  const orders = await db.collection('orders').find(query)
  // Sort by created date (newest first)
  return orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

/**
 * Get a specific order by ID
 */
export async function getOrder(orderId, barId = null) {
  const query = { id: orderId }
  if (barId) {
    query.barId = barId
  }
  return await db.collection('orders').findOne(query)
}

/**
 * Update order status
 */
export async function updateOrderStatus(orderId, barId, status, adminId = null, adminName = null) {
  const order = await getOrder(orderId, barId)

  if (!order) {
    throw new Error('Order not found')
  }

  const updates = {
    status,
    updatedAt: new Date().toISOString(),
  }

  // Set timestamps based on status
  if (status === 'confirmed' && order.status !== 'confirmed') {
    updates.confirmedAt = new Date().toISOString()
  }
  if (status === 'completed' && order.status !== 'completed') {
    updates.completedAt = new Date().toISOString()
  }
  if (status === 'cancelled' && order.status !== 'cancelled') {
    updates.cancelledAt = new Date().toISOString()
    updates.cancelledBy = adminId
    updates.cancelledByAdminName = adminName
  }

  // Only update the fields that changed, not the entire order
  await db.collection('orders').updateOne({ id: orderId }, updates)

  // Fetch the updated order to return
  const updatedOrder = await getOrder(orderId, barId)
  return updatedOrder
}

/**
 * Update order (general update)
 */
export async function updateOrder(orderId, barId, updates) {
  const order = await getOrder(orderId, barId)

  if (!order) {
    throw new Error('Order not found')
  }

  // Only update the fields provided, plus updatedAt
  const finalUpdates = {
    ...updates,
    updatedAt: new Date().toISOString(),
  }

  // Only update the fields that changed, not the entire order
  await db.collection('orders').updateOne({ id: orderId }, finalUpdates)

  // Fetch the updated order to return
  const updatedOrder = await getOrder(orderId, barId)
  return updatedOrder
}

/**
 * Get order statistics
 */
export async function getOrderStats(barId = null) {
  const query = {}
  if (barId) {
    query.barId = barId
  }
  const filteredOrders = await db.collection('orders').find(query)

  const stats = {
    total: filteredOrders.length,
    pending: filteredOrders.filter(o => o.status === 'pending').length,
    confirmed: filteredOrders.filter(o => o.status === 'confirmed').length,
    preparing: filteredOrders.filter(o => o.status === 'preparing').length,
    ready: filteredOrders.filter(o => o.status === 'ready').length,
    completed: filteredOrders.filter(o => o.status === 'completed').length,
    cancelled: filteredOrders.filter(o => o.status === 'cancelled').length,
    totalRevenue: filteredOrders
      .filter(o => o.status !== 'cancelled')
      .reduce((sum, o) => sum + (o.totals?.total || 0), 0),
    todayOrders: filteredOrders.filter(o => {
      const today = new Date().toISOString().split('T')[0]
      const orderDate = o.createdAt instanceof Date
        ? o.createdAt.toISOString().split('T')[0]
        : (typeof o.createdAt === 'string' ? o.createdAt.split('T')[0] : '')
      return orderDate === today
    }).length,
    todayRevenue: filteredOrders
      .filter(o => {
        const today = new Date().toISOString().split('T')[0]
        const orderDate = o.createdAt instanceof Date
          ? o.createdAt.toISOString().split('T')[0]
          : (typeof o.createdAt === 'string' ? o.createdAt.split('T')[0] : '')
        return orderDate === today && o.status !== 'cancelled'
      })
      .reduce((sum, o) => sum + (o.totals?.total || 0), 0),
  }

  return stats
}

/**
 * Cancel an order
 */
export async function cancelOrder(orderId, barId, reason, adminId, adminName) {
  return await updateOrderStatus(orderId, barId, 'cancelled', adminId, adminName)
}
