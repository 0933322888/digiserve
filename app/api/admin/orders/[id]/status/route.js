import { NextResponse } from 'next/server'
import { updateOrderStatus, cancelOrder, getOrder } from '@/lib/order-service'
import { logEvent } from '@/lib/event-service'

/**
 * POST /api/admin/orders/[id]/status
 * Update order status
 */
export async function POST(request, context) {
  try {
    const { id } = await context.params
    const body = await request.json()
    const { barId, status, adminId, adminName, reason } = body

    if (!barId || !status) {
      return NextResponse.json({ error: 'barId and status are required' }, { status: 400 })
    }

    if (
      !['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'].includes(status)
    ) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    // Get order before update for logging
    const orderBefore = await getOrder(id, barId)
    if (!orderBefore) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    let order

    if (status === 'cancelled') {
      order = await cancelOrder(
        id,
        barId,
        reason || 'Cancelled by admin',
        adminId || 'admin_1',
        adminName || 'Admin'
      )
      await logEvent('ORDER', `Order cancelled: ${id}`, 'SUCCESS', {
        orderId: id,
        cancelledBy: adminName || 'Admin',
        reason: reason || 'Cancelled by admin',
        previousStatus: orderBefore.status,
      })
    } else {
      order = await updateOrderStatus(id, barId, status, adminId || 'admin_1', adminName || 'Admin')
      await logEvent(
        'ORDER',
        `Order status updated: ${id} - ${orderBefore.status} → ${status}`,
        'SUCCESS',
        {
          orderId: id,
          previousStatus: orderBefore.status,
          newStatus: status,
          updatedBy: adminName || 'Admin',
        }
      )
    }

    return NextResponse.json({
      success: true,
      order,
    })
  } catch (error) {
    console.error('Update order status error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update order status' },
      { status: 500 }
    )
  }
}
