import { NextResponse } from 'next/server'
import { getTenantFromRequest } from '@/lib/tenant-service'
import { MODULE_STATUS_KEYS, resolveModuleStatus } from '@/modules'

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

    const statusEntries = await Promise.all(
      Object.entries(MODULE_STATUS_KEYS).map(async ([outputKey, moduleKey]) => {
        const enabled = await resolveModuleStatus(barId, moduleKey)

        if (!enabled && tenantConfig.modules) {
          const legacyKeys = moduleKey === 'giftCards'
            ? ['giftCards', 'gift-cards']
            : moduleKey === 'socialPosting'
              ? ['socialPosting', 'social']
              : [moduleKey]

          return [outputKey, tenantConfig.modules.some((value) => legacyKeys.includes(value))]
        }

        return [outputKey, enabled]
      })
    )

    const modules = Object.fromEntries(statusEntries)

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
