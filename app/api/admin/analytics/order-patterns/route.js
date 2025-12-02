import { NextResponse } from 'next/server'
import { getOrderPatterns, getPeakHoursAnalysis } from '@/lib/analytics-service'

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
    const analysis = searchParams.get('analysis') // 'patterns' or 'peak'

    if (!startDate || !endDate) {
      return NextResponse.json({ error: 'Start date and end date are required' }, { status: 400 })
    }

    if (analysis === 'peak') {
      const peakAnalysis = getPeakHoursAnalysis(barId, startDate, endDate)
      return NextResponse.json({ peakAnalysis })
    } else {
      const patterns = getOrderPatterns(barId, startDate, endDate)
      return NextResponse.json({ patterns })
    }
  } catch (error) {
    console.error('Get order patterns error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get order patterns' },
      { status: 500 }
    )
  }
}
