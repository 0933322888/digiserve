import { NextResponse } from 'next/server'
import { getOrder, updateOrder } from '@/lib/order-service'

/**
 * GET /api/admin/orders/[id]
 * Get a specific order
 */
export async function GET(request, { params }) {
  try {
    const { id } = params
    const barId = request.headers.get('x-tenant-id')

    if (!barId) {
      return NextResponse.json({ error: 'Tenant ID is required' }, { status: 400 })
    }

    const order = await getOrder(id, barId)

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json({ order })
  } catch (error) {
    console.error('Get order error:', error)
    return NextResponse.json({ error: error.message || 'Failed to get order' }, { status: 500 })
  }
}

/**
 * PUT /api/admin/orders/[id]
 * Update an order
 */
export async function PUT(request, { params }) {
  try {
    const { id } = params
    const barId = request.headers.get('x-tenant-id')

    if (!barId) {
      return NextResponse.json({ error: 'Tenant ID is required' }, { status: 400 })
    }

    const body = await request.json()
    const updates = body

    const order = await updateOrder(id, barId, updates)

    return NextResponse.json({
      success: true,
      order,
    })
  } catch (error) {
    console.error('Update order error:', error)
    return NextResponse.json({ error: error.message || 'Failed to update order' }, { status: 500 })
  }
}
