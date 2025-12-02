import { NextResponse } from 'next/server'
import { getTenantFromRequest } from '@/lib/tenant-service'
import { headers } from 'next/headers'

/**
 * GET /api/modules/status
 * Returns the enabled/disabled status of all modules for the current tenant
 */
export async function GET(request) {
  try {
    const headersList = await headers()
    const host = headersList.get('host')
    const { getTenantFromHost, getTenantConfig } = await import('@/lib/tenant-service')

    // Get tenant ID from host
    const barId = await getTenantFromHost(host)

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

    // Convert modules array to status object
    const modules = {
      ordering: tenantConfig.modules?.includes('ordering') || false,
      reservations: tenantConfig.modules?.includes('reservations') || false,
      events: tenantConfig.modules?.includes('events') || false,
      gallery: tenantConfig.modules?.includes('gallery') || false,
      giftCards: tenantConfig.modules?.includes('gift-cards') || false,
      social: tenantConfig.modules?.includes('social') || false,
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
