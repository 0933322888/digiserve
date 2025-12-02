import { NextResponse } from 'next/server'
import { getTimeEntries, clockIn, clockOut, startBreak, endBreak } from '@/lib/staff-service'

export const dynamic = 'force-dynamic'

export async function GET(request) {
  try {
    const barId = request.headers.get('x-tenant-id')

    if (!barId) {
      return NextResponse.json({ error: 'Tenant ID is required' }, { status: 400 })
    }

    const { searchParams } = new URL(request.url)
    const employeeId = searchParams.get('employeeId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const entries = await getTimeEntries(barId, employeeId, startDate, endDate)
    return NextResponse.json({ entries })
  } catch (error) {
    console.error('Get time entries error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get time entries' },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const barId = request.headers.get('x-tenant-id')

    if (!barId) {
      return NextResponse.json({ error: 'Tenant ID is required' }, { status: 400 })
    }

    const body = await request.json()
    const { action, employeeId, shiftId } = body

    if (!action || !employeeId) {
      return NextResponse.json({ error: 'Action and employee ID are required' }, { status: 400 })
    }

    let result
    switch (action) {
      case 'clock_in':
        result = await clockIn(employeeId, barId, shiftId)
        break
      case 'clock_out':
        result = await clockOut(employeeId)
        break
      case 'break_start':
        result = await startBreak(employeeId)
        break
      case 'break_end':
        result = await endBreak(employeeId)
        break
      default:
        return NextResponse.json(
          { error: 'Invalid action. Must be: clock_in, clock_out, break_start, break_end' },
          { status: 400 }
        )
    }

    return NextResponse.json({ success: true, entry: result })
  } catch (error) {
    console.error('Time entry action error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to perform time entry action' },
      { status: 500 }
    )
  }
}
