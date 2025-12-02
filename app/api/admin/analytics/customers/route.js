import { NextResponse } from 'next/server'
import { getCustomerAnalytics } from '@/lib/analytics-service'

export const dynamic = 'force-dynamic'

export async function GET(request) {
  try {
    const barId = request.headers.get('x-tenant-id')

    if (!barId) {
      return NextResponse.json({ error: 'Tenant ID is required' }, { status: 400 })
    }

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    if (!startDate || !endDate) {
      return NextResponse.json({ error: 'Start date and end date are required' }, { status: 400 })
    }

    const analytics = getCustomerAnalytics(barId, startDate, endDate)
    return NextResponse.json({ analytics })
  } catch (error) {
    console.error('Get customer analytics error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get customer analytics' },
      { status: 500 }
    )
  }
}
