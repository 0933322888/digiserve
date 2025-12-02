import { NextResponse } from 'next/server'
import { getShifts, createShift } from '@/lib/staff-service'

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

    const shifts = await getShifts(barId, startDate, endDate)
    return NextResponse.json({ shifts })
  } catch (error) {
    console.error('Get shifts error:', error)
    return NextResponse.json({ error: error.message || 'Failed to get shifts' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const barId = request.headers.get('x-tenant-id')

    if (!barId) {
      return NextResponse.json({ error: 'Tenant ID is required' }, { status: 400 })
    }

    const body = await request.json()
    const { createdBy = 'admin', ...shiftData } = body

    if (!shiftData.employeeId || !shiftData.startTime || !shiftData.endTime) {
      return NextResponse.json(
        { error: 'Employee ID, start time, and end time are required' },
        { status: 400 }
      )
    }

    const shift = await createShift({ ...shiftData, barId, createdBy })
    return NextResponse.json({ success: true, shift })
  } catch (error) {
    console.error('Create shift error:', error)
    return NextResponse.json({ error: error.message || 'Failed to create shift' }, { status: 500 })
  }
}
