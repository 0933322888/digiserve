import { NextResponse } from 'next/server'
import { getEmployee, updateEmployee, deleteEmployee } from '@/lib/staff-service'

export const dynamic = 'force-dynamic'

export async function GET(request, context) {
  try {
    const { id } = await context.params
    const employee = await getEmployee(id)

    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 })
    }

    return NextResponse.json({ employee })
  } catch (error) {
    console.error('Get employee error:', error)
    return NextResponse.json({ error: error.message || 'Failed to get employee' }, { status: 500 })
  }
}

export async function PUT(request, context) {
  try {
    const { id } = await context.params
    const body = await request.json()

    const employee = await updateEmployee(id, body)
    return NextResponse.json({ success: true, employee })
  } catch (error) {
    console.error('Update employee error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update employee' },
      { status: 500 }
    )
  }
}

export async function DELETE(request, context) {
  try {
    const { id } = await context.params
    await deleteEmployee(id)
    return NextResponse.json({ success: true, message: 'Employee deleted successfully' })
  } catch (error) {
    console.error('Delete employee error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete employee' },
      { status: 500 }
    )
  }
}
