import { NextResponse } from 'next/server'
import { getRole, updateRole, deleteRole } from '@/lib/staff-service'

export const dynamic = 'force-dynamic'

export async function GET(request, { params }) {
  try {
    const { id } = params
    const role = await getRole(id)

    if (!role) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 })
    }

    return NextResponse.json({ role })
  } catch (error) {
    console.error('Get role error:', error)
    return NextResponse.json({ error: error.message || 'Failed to get role' }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params
    const body = await request.json()

    const role = await updateRole(id, body)
    return NextResponse.json({ success: true, role })
  } catch (error) {
    console.error('Update role error:', error)
    return NextResponse.json({ error: error.message || 'Failed to update role' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params
    await deleteRole(id)
    return NextResponse.json({ success: true, message: 'Role deleted successfully' })
  } catch (error) {
    console.error('Delete role error:', error)
    return NextResponse.json({ error: error.message || 'Failed to delete role' }, { status: 500 })
  }
}
