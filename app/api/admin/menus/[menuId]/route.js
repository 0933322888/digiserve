import { NextResponse } from 'next/server'
import { getMenu, updateMenu, deleteMenu } from '@/lib/menu-service'

/**
 * GET /api/admin/menus/[menuId]
 * Get a specific menu
 */
export async function GET(request, { params }) {
  try {
    const barId = request.headers.get('x-tenant-id')
    if (!barId) {
      return NextResponse.json({ error: 'Tenant ID is required' }, { status: 400 })
    }
    const menu = await getMenu(barId, params.menuId)
    console.log(`[API] GET /api/admin/menus/${params.menuId} result:`, menu ? 'Found' : 'Not Found')
    return NextResponse.json({ menu })
  } catch (error) {
    console.error('Get menu error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

/**
 * PUT /api/admin/menus/[menuId]
 * Update a menu
 */
export async function PUT(request, { params }) {
  try {
    const barId = request.headers.get('x-tenant-id')
    if (!barId) {
      return NextResponse.json({ error: 'Tenant ID is required' }, { status: 400 })
    }
    const updates = await request.json()

    // The original validation for 'name' is removed as per the instruction's provided code snippet.
    // If specific field validation is needed, it should be re-added here.

    const updatedMenu = await updateMenu(barId, params.menuId, updates)
    console.log(`[API] PUT /api/admin/menus/${params.menuId} updated`)
    return NextResponse.json({ success: true, menu: updatedMenu })
  } catch (error) {
    console.error('Update menu error:', error)
    return NextResponse.json({ error: error.message || 'Failed to update menu' }, { status: 500 })
  }
}

/**
 * DELETE /api/admin/menus/[menuId]
 * Delete a menu
 */
export async function DELETE(request, { params }) {
  try {
    const { menuId } = params
    await deleteMenu(menuId)
    console.log(`[API] DELETE /api/admin/menus/${menuId} success`)
    return NextResponse.json({ success: true, message: 'Menu deleted successfully' })
  } catch (error) {
    console.error('Delete menu error:', error)
    return NextResponse.json({ error: error.message || 'Failed to delete menu' }, { status: 500 })
  }
}
