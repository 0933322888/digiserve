import { NextResponse } from 'next/server'
import { getShiftRequests, createShiftRequest } from '@/lib/staff-service'

export const dynamic = 'force-dynamic'

export async function GET(request) {
  try {
    const barId = request.headers.get('x-tenant-id')

    if (!barId) {
      return NextResponse.json({ error: 'Tenant ID is required' }, { status: 400 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const requests = await getShiftRequests(barId, status)
    return NextResponse.json({ requests })
  } catch (error) {
    console.error('Get shift requests error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get shift requests' },
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
    const requestData = body

    if (!requestData.employeeId || !requestData.type) {
      return NextResponse.json(
        { error: 'Employee ID and request type are required' },
        { status: 400 }
      )
    }

    const request = await createShiftRequest({ ...requestData, barId })
    return NextResponse.json({ success: true, request })
  } catch (error) {
    console.error('Create shift request error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create shift request' },
      { status: 500 }
    )
  }
}
