import { NextResponse } from 'next/server'
import { getReservationStats } from '@/lib/reservation-service'
import { getGiftCardStats } from '@/lib/gift-card-service'
import { getOrderStats } from '@/lib/order-service'

export const dynamic = 'force-dynamic'

export async function GET(request) {
  try {
    const barId = request.headers.get('x-tenant-id')
    if (!barId) {
      return NextResponse.json({ error: 'Tenant ID is required' }, { status: 400 })
    }

    const reservationStats = await getReservationStats() // TODO: Update this service to accept barId
    const giftCardStats = await getGiftCardStats() // TODO: Update this service to accept barId
    const orderStats = await getOrderStats(barId)

    return NextResponse.json({
      reservations: {
        pending: reservationStats.pending,
        confirmed: reservationStats.confirmed,
        total: reservationStats.total,
      },
      giftCards: giftCardStats,
      orders: {
        pending: orderStats.pending,
      },
    })
  } catch (error) {
    console.error('Stats API error:', error)
    return NextResponse.json({ error: 'Failed to fetch stats', details: error.message }, { status: 500 })
  }
}
