import { NextResponse } from 'next/server'
import { toggleMenuItemArchive } from '@/lib/menu-service'

/**
 * POST /api/admin/menu/[menuType]/sections/[sectionId]/items/[itemId]/archive
 * Toggle archive status of a menu item
 */
export async function POST(request, { params }) {
  try {
    const { menuType, sectionId, itemId } = params

    if (!['food', 'drinks'].includes(menuType)) {
      return NextResponse.json(
        { error: 'Invalid menu type. Must be "food" or "drinks"' },
        { status: 400 }
      )
    }

    if (!itemId) {
      return NextResponse.json({ error: 'itemId is required' }, { status: 400 })
    }

    const item = await toggleMenuItemArchive(menuType, sectionId, itemId)
    return NextResponse.json({ success: true, item })
  } catch (error) {
    console.error('Toggle archive error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to toggle archive status' },
      { status: 500 }
    )
  }
}
