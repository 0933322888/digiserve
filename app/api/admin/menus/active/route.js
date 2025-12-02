import { NextResponse } from 'next/server'
import { getActiveMenu } from '@/lib/menu-service'

/**
 * GET /api/admin/menus/active
 * Get the active menu
 */
export async function GET() {
  try {
    const menu = await getActiveMenu()
    if (!menu) {
      return NextResponse.json({ error: 'No active menu found' }, { status: 404 })
    }
    return NextResponse.json({ menu })
  } catch (error) {
    console.error('Get active menu error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get active menu' },
      { status: 500 }
    )
  }
}
