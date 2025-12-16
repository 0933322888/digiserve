import { NextResponse } from 'next/server'
import { getTenantFromRequest } from '@/lib/tenant-service'
import { headers } from 'next/headers'
import { getSetting } from '@/lib/app-settings-service'

/**
 * GET /api/modules/status
 * Returns the enabled/disabled status of all modules for the current tenant
 */
export async function GET(request) {
  try {
    const headersList = await headers()
    const host = headersList.get('host')
    const tenantIdHeader = headersList.get('x-tenant-id')
    const { getTenantFromHost, getTenantConfig } = await import('@/lib/tenant-service')

    // Determine canonical barId. tenantIdHeader may be a barId OR a subdomain slug.
    let barId = null

    if (tenantIdHeader) {
      // Try to treat header as a barId first
      const candidate = await getTenantConfig(tenantIdHeader)
      if (candidate) {
        barId = tenantIdHeader
      } else {
        // header might be a subdomain slug; fall back to host-based resolution
        barId = await getTenantFromHost(host)
      }
    } else {
      barId = await getTenantFromHost(host)
    }

    if (!barId) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      )
    }

    // Get tenant configuration
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
