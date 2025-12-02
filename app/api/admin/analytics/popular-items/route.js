import { NextResponse } from 'next/server'
import { getPopularItems, getItemsByCategory } from '@/lib/analytics-service'

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
    const limit = parseInt(searchParams.get('limit')) || 10
    const groupBy = searchParams.get('groupBy') || 'items' // 'items' or 'category'

    if (!startDate || !endDate) {
      return NextResponse.json({ error: 'Start date and end date are required' }, { status: 400 })
    }

    if (groupBy === 'category') {
      const categoryStats = getItemsByCategory(barId, startDate, endDate)
      return NextResponse.json({ items: categoryStats, groupBy: 'category' })
    } else {
      const items = getPopularItems(barId, startDate, endDate, limit)
      return NextResponse.json({ items, groupBy: 'items' })
    }
  } catch (error) {
    console.error('Get popular items error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get popular items' },
      { status: 500 }
    )
  }
}
