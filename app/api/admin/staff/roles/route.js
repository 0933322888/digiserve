import { NextResponse } from 'next/server'
import { getAllRoles, createRole } from '@/lib/staff-service'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const roles = await getAllRoles()
    return NextResponse.json({ roles })
  } catch (error) {
    console.error('Get roles error:', error)
    return NextResponse.json({ error: error.message || 'Failed to get roles' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()

    if (!body.name) {
      return NextResponse.json({ error: 'Role name is required' }, { status: 400 })
    }

    const role = await createRole(body)
    return NextResponse.json({ success: true, role })
  } catch (error) {
    console.error('Create role error:', error)
    return NextResponse.json({ error: error.message || 'Failed to create role' }, { status: 500 })
  }
}
