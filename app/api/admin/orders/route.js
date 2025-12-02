import { NextResponse } from 'next/server'
import { getOrders, getOrderStats } from '@/lib/order-service'

/**
 * GET /api/admin/orders
 * Get all orders with optional filters
 */
export async function GET(request) {
  try {
    const barId = request.headers.get('x-tenant-id')

    if (!barId) {
      return NextResponse.json({ error: 'Tenant ID is required' }, { status: 400 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const orderType = searchParams.get('orderType')
    const date = searchParams.get('date')
    const statsOnly = searchParams.get('stats') === 'true'

    if (statsOnly) {
      const stats = await getOrderStats(barId)
      return NextResponse.json({ stats })
    }

    const filters = { barId }
    if (status) filters.status = status
    if (orderType) filters.orderType = orderType
    if (date) filters.date = date

    const orders = await getOrders(filters)

    return NextResponse.json({ orders })
  } catch (error) {
    console.error('Get orders error:', error)
    return NextResponse.json({ error: error.message || 'Failed to get orders' }, { status: 500 })
  }
}
