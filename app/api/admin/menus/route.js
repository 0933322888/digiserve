import { NextResponse } from 'next/server'
import { getAllMenus, createMenu } from '@/lib/menu-service'

/**
 * GET /api/admin/menus
 * Get all menus
 */
export async function GET(request) {
  try {
    const barId = request.headers.get('x-tenant-id')
    if (!barId) {
      return NextResponse.json({ error: 'Tenant ID is required' }, { status: 400 })
    }
    const { menus } = await getAllMenus(barId)
    return NextResponse.json({ menus })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

/**
 * POST /api/admin/menus
 * Create a new menu
 */
export async function POST(request) {
  try {
    const barId = request.headers.get('x-tenant-id')
    if (!barId) {
      return NextResponse.json({ error: 'Tenant ID is required' }, { status: 400 })
    }
    const data = await request.json()
    const newMenu = await createMenu(barId, data)
    return NextResponse.json({ success: true, menu: newMenu })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
