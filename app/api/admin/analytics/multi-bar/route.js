import { NextResponse } from 'next/server'
import { getMultiBarComparison } from '@/lib/analytics-service'

export const dynamic = 'force-dynamic'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    if (!startDate || !endDate) {
      return NextResponse.json({ error: 'Start date and end date are required' }, { status: 400 })
    }

    const comparison = getMultiBarComparison(startDate, endDate)
    return NextResponse.json({ comparison })
  } catch (error) {
    console.error('Get multi-bar comparison error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get multi-bar comparison' },
      { status: 500 }
    )
  }
}
