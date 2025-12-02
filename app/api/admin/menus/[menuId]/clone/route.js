import { NextResponse } from 'next/server'
import { cloneMenu } from '@/lib/menu-service'

/**
 * POST /api/admin/menus/[menuId]/clone
 * Clone a menu
 */
export async function POST(request, { params }) {
  try {
    const barId = request.headers.get('x-tenant-id')
    if (!barId) {
      return NextResponse.json({ error: 'Tenant ID is required' }, { status: 400 })
    }
    const body = await request.json()
    const { name } = body

    const clonedMenu = await cloneMenu(barId, params.menuId, name)
    return NextResponse.json({ success: true, menu: clonedMenu })
  } catch (error) {
    console.error('Clone menu error:', error)
    return NextResponse.json({ error: error.message || 'Failed to clone menu' }, { status: 500 })
  }
}
