import { NextResponse } from 'next/server'
import { getAllEmployees, createEmployee } from '@/lib/staff-service'

export const dynamic = 'force-dynamic'

export async function GET(request) {
  try {
    const barId = request.headers.get('x-tenant-id')

    if (!barId) {
      return NextResponse.json({ error: 'Tenant ID is required' }, { status: 400 })
    }

    const employees = await getAllEmployees(barId)
    return NextResponse.json({ employees })
  } catch (error) {
    console.error('Get employees error:', error)
    return NextResponse.json({ error: error.message || 'Failed to get employees' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const barId = request.headers.get('x-tenant-id')

    if (!barId) {
      return NextResponse.json({ error: 'Tenant ID is required' }, { status: 400 })
    }

    const body = await request.json()
    const employeeData = body

    if (!employeeData.firstName || !employeeData.lastName || !employeeData.email) {
      return NextResponse.json(
        { error: 'First name, last name, and email are required' },
        { status: 400 }
      )
    }

    const employee = await createEmployee({ ...employeeData, barId })
    return NextResponse.json({ success: true, employee })
  } catch (error) {
    console.error('Create employee error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create employee' },
      { status: 500 }
    )
  }
}
