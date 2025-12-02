import { NextResponse } from 'next/server'
import { getSetting, setSetting } from '@/lib/app-settings-service'
import { siteConfig } from '@/config/siteConfig'

/**
 * GET /api/admin/settings/ordering
 * Get ordering configuration
 */
export async function GET() {
  try {
    // Get settings from database with fallback to siteConfig
    const getSettingValue = async (key, defaultValue) => {
      const dbValue = await getSetting(key)
      return dbValue !== null ? dbValue : defaultValue
    }

    const ordering = {
      enabled: await getSettingValue('ORDERING_ENABLED', siteConfig.ordering?.enabled ?? true),
      pickup: await getSettingValue('ORDERING_PICKUP', siteConfig.ordering?.pickup ?? true),
      delivery: await getSettingValue('ORDERING_DELIVERY', siteConfig.ordering?.delivery ?? true),
      dineIn: await getSettingValue('ORDERING_DINEIN', siteConfig.ordering?.dineIn ?? true),
    }

    return NextResponse.json({
      success: true,
      ordering,
    })
  } catch (error) {
    console.error('Get ordering settings error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get ordering settings' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/admin/settings/ordering
 * Update ordering configuration
 */
export async function PUT(request) {
  try {
    const body = await request.json()
    const { enabled, pickup, delivery, dineIn } = body

    // Update each setting
    if (enabled !== undefined) {
      await setSetting('ORDERING_ENABLED', enabled, 'Ordering system enabled/disabled', 'ordering', 'admin')
    }
    if (pickup !== undefined) {
      await setSetting('ORDERING_PICKUP', pickup, 'Pickup ordering enabled/disabled', 'ordering', 'admin')
    }
    if (delivery !== undefined) {
      await setSetting('ORDERING_DELIVERY', delivery, 'Delivery ordering enabled/disabled', 'ordering', 'admin')
    }
    if (dineIn !== undefined) {
      await setSetting('ORDERING_DINEIN', dineIn, 'Dine-in ordering enabled/disabled', 'ordering', 'admin')
    }

    return NextResponse.json({
      success: true,
      message: 'Ordering settings updated successfully',
    })
  } catch (error) {
    console.error('Update ordering settings error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update ordering settings' },
      { status: 500 }
    )
  }
}

