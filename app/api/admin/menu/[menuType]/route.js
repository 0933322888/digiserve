import { NextResponse } from 'next/server'
import { getMenu, getSections } from '@/lib/menu-service'

/**
 * GET /api/admin/menu/[menuType]
 * Get all menu data for a specific menu type
 */
export async function GET(request, { params }) {
  try {
    const { menuType } = params

    if (!['food', 'drinks'].includes(menuType)) {
      return NextResponse.json(
        { error: 'Invalid menu type. Must be "food" or "drinks"' },
        { status: 400 }
      )
    }

    const menu = await getMenu(menuType)
    return NextResponse.json({ menu })
  } catch (error) {
    console.error('Get menu error:', error)
    return NextResponse.json({ error: error.message || 'Failed to get menu' }, { status: 500 })
  }
}
