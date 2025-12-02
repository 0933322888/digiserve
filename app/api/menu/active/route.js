import { NextResponse } from 'next/server'
import { getActiveMenu } from '@/lib/menu-service'
import { getTenantFromRequest } from '@/lib/tenant-service'

/**
 * GET /api/menu/active
 * Get the active menu for public display
 */
export const dynamic = 'force-dynamic'

export async function GET(request) {
  try {
    const barId = await getTenantFromRequest(request)

    if (!barId) {
      return NextResponse.json({ error: 'Invalid tenant or domain' }, { status: 400 })
    }

    const menu = await getActiveMenu(barId)
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
