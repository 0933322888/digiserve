import { NextResponse } from 'next/server'
import { getShift, updateShift, deleteShift } from '@/lib/staff-service'

export const dynamic = 'force-dynamic'

export async function GET(request, { params }) {
  try {
    const { id } = params
    const shift = await getShift(id)

    if (!shift) {
      return NextResponse.json({ error: 'Shift not found' }, { status: 404 })
    }

    return NextResponse.json({ shift })
  } catch (error) {
    console.error('Get shift error:', error)
    return NextResponse.json({ error: error.message || 'Failed to get shift' }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params
    const body = await request.json()

    const shift = await updateShift(id, body)
    return NextResponse.json({ success: true, shift })
  } catch (error) {
    console.error('Update shift error:', error)
    return NextResponse.json({ error: error.message || 'Failed to update shift' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params
    await deleteShift(id)
    return NextResponse.json({ success: true, message: 'Shift deleted successfully' })
  } catch (error) {
    console.error('Delete shift error:', error)
    return NextResponse.json({ error: error.message || 'Failed to delete shift' }, { status: 500 })
  }
}
