import { NextResponse } from 'next/server'
import { getSetting, setSetting } from '@/lib/app-settings-service'
import { getTenantFromRequest } from '@/lib/tenant-service'
import { getTenantAddonModel } from '@/lib/db/models'
import { MODULE_PRICES } from '@/lib/stripe'
import { MODULE_DEFINITIONS, getModuleDefinition, getModuleStatusSync } from '@/modules'

/**
 * GET /api/admin/settings/modules
 * Get all configurable modules and their enabled status
 */
export async function GET(request) {
  try {
    const barId = await getTenantFromRequest(request)

    // Get enabled status from database (with fallback to siteConfig) and check subscription for paid modules
    const TenantAddon = getTenantAddonModel()
    // Fetch all active addons for this tenant
    const activeAddons = await TenantAddon.find({
      barId,
      status: { $in: ['active', 'trialing'] }
    })
    const activeAddonKeys = new Set(activeAddons.map(a => a.addonKey))
    const paidModuleKeys = Object.keys(MODULE_PRICES)

    const modules = await Promise.all(
      MODULE_DEFINITIONS.map(async module => {
        // Check database first for the setting
        const dbValue = await getSetting(barId, module.dbKey)

        // Fallback to siteConfig if not in database
        let enabled = false
        if (dbValue !== null) {
          enabled = dbValue === true || dbValue === 'true'
        } else {
          enabled = getModuleStatusSync(module.key)
        }

        // CRITICAL: If it is a paid module, we MUST verify the subscription is active.
        // If subscription is NOT active, force enabled = false, regardless of the setting.
        // This ensures UI shows "Activate" if subscription is canceled/expired.
        if (paidModuleKeys.includes(module.key) && !activeAddonKeys.has(module.key)) {
          enabled = false
        }

        return {
          ...module,
          enabled,
        }
      })
    )

    return NextResponse.json({
      success: true,
      modules,
    })
  } catch (error) {
    console.error('Get modules error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get module settings' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/admin/settings/modules
 * Update a module's enabled status
 */
export async function PUT(request) {
  try {
    const barId = await getTenantFromRequest(request)
    const body = await request.json()
    const { moduleKey, enabled } = body

    if (!moduleKey) {
      return NextResponse.json({ error: 'moduleKey is required' }, { status: 400 })
    }

    const moduleDefinition = getModuleDefinition(moduleKey)
    if (!moduleDefinition) {
      return NextResponse.json({ error: 'Invalid module key' }, { status: 400 })
    }

    // Save to database
    await setSetting(
      barId,
      moduleDefinition.dbKey,
      enabled,
      `${moduleDefinition.name} module enabled/disabled`,
      'modules',
      'admin'
    )

    return NextResponse.json({
      success: true,
      module: {
        key: moduleKey,
        name: moduleDefinition.name,
        enabled,
      },
    })
  } catch (error) {
    console.error('Update module error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update module setting' },
      { status: 500 }
    )
  }
}

