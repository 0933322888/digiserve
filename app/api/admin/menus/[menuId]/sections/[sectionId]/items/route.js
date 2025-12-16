import { NextResponse } from 'next/server'
import {
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleMenuItemUnavailable,
} from '@/lib/menu-service'

/**
 * POST /api/admin/menus/[menuId]/sections/[sectionId]/items
 * Create a new menu item
 */
export async function POST(request, { params }) {
  try {
    const { menuId, sectionId } = params
    const body = await request.json()

    if (!body.name || body.price === undefined) {
      return NextResponse.json({ error: 'Name and price are required' }, { status: 400 })
    }

    const item = await createMenuItem(menuId, sectionId, body)
    console.log(`[API] POST item created: ${item.id} in section ${sectionId}`)
    return NextResponse.json({ success: true, item })
  } catch (error) {
    console.error('Create menu item error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create menu item' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/admin/menus/[menuId]/sections/[sectionId]/items
 * Update a menu item
 */
export async function PUT(request, { params }) {
  try {
    const { menuId, sectionId } = params
    const body = await request.json()
    const { itemId, ...updates } = body

    if (!itemId) {
      return NextResponse.json({ error: 'itemId is required' }, { status: 400 })
    }

    const item = await updateMenuItem(menuId, sectionId, itemId, updates)
    console.log(`[API] PUT item updated: ${itemId}`)
    return NextResponse.json({ success: true, item })
  } catch (error) {
    console.error('Update menu item error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update menu item' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/menus/[menuId]/sections/[sectionId]/items
 * Delete a menu item
 */
export async function DELETE(request, { params }) {
  try {
    const { menuId, sectionId } = params
    const { searchParams } = new URL(request.url)
    const itemId = searchParams.get('itemId')

    if (!itemId) {
      return NextResponse.json({ error: 'itemId is required' }, { status: 400 })
    }

    await deleteMenuItem(menuId, sectionId, itemId)
    console.log(`[API] DELETE item deleted: ${itemId}`)
    return NextResponse.json({ success: true, message: 'Menu item deleted successfully' })
  } catch (error) {
    console.error('Delete menu item error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete menu item' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/admin/menus/[menuId]/sections/[sectionId]/items
 * Toggle unavailable status
 */
export async function PATCH(request, { params }) {
  try {
    const { menuId, sectionId } = params
    const body = await request.json()
    const { itemId } = body

    if (!itemId) {
      return NextResponse.json({ error: 'itemId is required' }, { status: 400 })
    }

    const item = await toggleMenuItemUnavailable(menuId, sectionId, itemId)
    return NextResponse.json({ success: true, item })
  } catch (error) {
    console.error('Toggle unavailable error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to toggle unavailable status' },
      { status: 500 }
    )
  }
}
