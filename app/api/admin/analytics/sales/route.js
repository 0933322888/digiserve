import { NextResponse } from 'next/server'
import { getSalesReport } from '@/lib/analytics-service'

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

    const report = getSalesReport(barId, startDate, endDate)
    return NextResponse.json({ report })
  } catch (error) {
    console.error('Get sales report error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get sales report' },
      { status: 500 }
    )
  }
}
