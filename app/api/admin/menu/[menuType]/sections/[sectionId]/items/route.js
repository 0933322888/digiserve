import { NextResponse } from 'next/server'
import {
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleMenuItemUnavailable,
  toggleMenuItemArchive,
} from '@/lib/menu-service'

/**
 * POST /api/admin/menu/[menuType]/sections/[sectionId]/items
 * Create a new menu item
 */
export async function POST(request, { params }) {
  try {
    const { menuType, sectionId } = params
    const body = await request.json()

    if (!['food', 'drinks'].includes(menuType)) {
      return NextResponse.json(
        { error: 'Invalid menu type. Must be "food" or "drinks"' },
        { status: 400 }
      )
    }

    if (!body.name || body.price === undefined) {
      return NextResponse.json({ error: 'Name and price are required' }, { status: 400 })
    }

    const item = await createMenuItem(menuType, sectionId, body)
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
 * PUT /api/admin/menu/[menuType]/sections/[sectionId]/items
 * Update a menu item
 */
export async function PUT(request, { params }) {
  try {
    const { menuType, sectionId } = params
    const body = await request.json()
    const { itemId, ...updates } = body

    if (!['food', 'drinks'].includes(menuType)) {
      return NextResponse.json(
        { error: 'Invalid menu type. Must be "food" or "drinks"' },
        { status: 400 }
      )
    }

    if (!itemId) {
      return NextResponse.json({ error: 'itemId is required' }, { status: 400 })
    }

    const item = await updateMenuItem(menuType, sectionId, itemId, updates)
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
 * DELETE /api/admin/menu/[menuType]/sections/[sectionId]/items
 * Delete a menu item
 */
export async function DELETE(request, { params }) {
  try {
    const { menuType, sectionId } = params
    const { searchParams } = new URL(request.url)
    const itemId = searchParams.get('itemId')

    if (!['food', 'drinks'].includes(menuType)) {
      return NextResponse.json(
        { error: 'Invalid menu type. Must be "food" or "drinks"' },
        { status: 400 }
      )
    }

    if (!itemId) {
      return NextResponse.json({ error: 'itemId is required' }, { status: 400 })
    }

    await deleteMenuItem(menuType, sectionId, itemId)
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
 * PATCH /api/admin/menu/[menuType]/sections/[sectionId]/items
 * Toggle unavailable status
 */
export async function PATCH(request, { params }) {
  try {
    const { menuType, sectionId } = params
    const body = await request.json()
    const { itemId } = body

    if (!['food', 'drinks'].includes(menuType)) {
      return NextResponse.json(
        { error: 'Invalid menu type. Must be "food" or "drinks"' },
        { status: 400 }
      )
    }

    if (!itemId) {
      return NextResponse.json({ error: 'itemId is required' }, { status: 400 })
    }

    const item = await toggleMenuItemUnavailable(menuType, sectionId, itemId)
    return NextResponse.json({ success: true, item })
  } catch (error) {
    console.error('Toggle unavailable error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to toggle unavailable status' },
      { status: 500 }
    )
  }
}
