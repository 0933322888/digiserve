import { NextResponse } from 'next/server'
import { updateShiftRequest } from '@/lib/staff-service'

export const dynamic = 'force-dynamic'

export async function PUT(request, { params }) {
  try {
    const { id } = params
    const body = await request.json()
    const { reviewedBy = 'admin', ...updates } = body

    const request = await updateShiftRequest(id, { ...updates, reviewedBy })
    return NextResponse.json({ success: true, request })
  } catch (error) {
    console.error('Update shift request error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update shift request' },
      { status: 500 }
    )
  }
}
