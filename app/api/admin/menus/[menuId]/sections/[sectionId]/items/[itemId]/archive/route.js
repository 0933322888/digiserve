import { NextResponse } from 'next/server'
import { toggleMenuItemArchive } from '@/lib/menu-service'

/**
 * POST /api/admin/menus/[menuId]/sections/[sectionId]/items/[itemId]/archive
 * Toggle archive status of a menu item
 */
export async function POST(request, context) {
  try {
    const { menuId, sectionId, itemId } = await context.params

    if (!itemId) {
      return NextResponse.json({ error: 'itemId is required' }, { status: 400 })
    }

    const item = await toggleMenuItemArchive(menuId, sectionId, itemId)
    return NextResponse.json({ success: true, item })
  } catch (error) {
    console.error('Toggle archive error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to toggle archive status' },
      { status: 500 }
    )
  }
}
