import { NextResponse } from 'next/server'
import { getTenantFromRequest } from '@/lib/tenant-service'
import { getSetting } from '@/lib/app-settings-service'

/**
 * GET /api/modules/status
 * Returns the enabled/disabled status of all modules for the current tenant
 */
export async function GET(request) {
  try {
    // Resolve slugs and bar IDs to the canonical database barId used by settings.
    const barId = await getTenantFromRequest(request)

    if (!barId) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      )
    }

    // Get tenant configuration
    const { getTenantConfig } = await import('@/lib/tenant-service')
    const tenantConfig = await getTenantConfig(barId)

    if (!tenantConfig) {
      return NextResponse.json(
        { error: 'Tenant configuration not found' },
        { status: 404 }
      )
    }

    // Helper to check module status (DB -> Tenant Config -> Default)
    const checkModule = async (key, configKey) => {
      // Check AppSetting first (user toggle)
      const dbKey = `MODULE_${key.toUpperCase()}_ENABLED`
      const dbValue = await getSetting(barId, dbKey)

      if (dbValue !== null) {
        return dbValue === true || dbValue === 'true'
      }

      // Fallback to tenant config (provisioned modules)
      return tenantConfig.modules?.includes(configKey) || false
    }

    const [
      ordering,
      reservations,
      events,
      gallery,
      giftCards,
      socialPosting
    ] = await Promise.all([
      checkModule('ordering', 'ordering'),
      checkModule('reservations', 'reservations'),
      checkModule('events', 'events'),
      checkModule('gallery', 'gallery'),
      checkModule('giftCards', 'gift-cards'),
      checkModule('socialPosting', 'social')
    ])

    // Convert modules array to status object
    const modules = {
      ordering,
      reservations,
      events,
      gallery,
      giftCards,
      social: socialPosting,
    }

    return NextResponse.json({
      success: true,
      modules
    })
  } catch (error) {
    console.error('Error fetching module status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
