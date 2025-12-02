import { NextResponse } from 'next/server'
import { getRevenueTrends } from '@/lib/analytics-service'

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
    const groupBy = searchParams.get('groupBy') || 'day' // 'day', 'week', 'month', 'hour'

    if (!startDate || !endDate) {
      return NextResponse.json({ error: 'Start date and end date are required' }, { status: 400 })
    }

    const trends = getRevenueTrends(barId, startDate, endDate, groupBy)
    return NextResponse.json({ trends })
  } catch (error) {
    console.error('Get revenue trends error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get revenue trends' },
      { status: 500 }
    )
  }
}
