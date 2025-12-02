import { NextResponse } from 'next/server'
import { activateMenu } from '@/lib/menu-service'

/**
 * POST /api/admin/menus/[menuId]/activate
 * Activate a menu (deactivates all others)
 */
export async function POST(request, { params }) {
  try {
    const barId = request.headers.get('x-tenant-id')
    if (!barId) {
      return NextResponse.json({ error: 'Tenant ID is required' }, { status: 400 })
    }
    const menu = await activateMenu(barId, params.menuId)
    return NextResponse.json({ success: true, menu })
  } catch (error) {
    console.error('Activate menu error:', error)
    return NextResponse.json({ error: error.message || 'Failed to activate menu' }, { status: 500 })
  }
}
