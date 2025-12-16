import { NextResponse } from 'next/server'
import { getAllSettings, getSetting, setSetting } from '@/lib/app-settings-service'
import { siteConfig } from '@/config/siteConfig'

import { getTenantFromRequest } from '@/lib/tenant-service'
import { getTenantAddonModel } from '@/lib/db/models'
import { MODULE_PRICES } from '@/lib/stripe'

/**
 * GET /api/admin/settings/modules
 * Get all configurable modules and their enabled status
 */
export async function GET(request) {
  try {
    const barId = await getTenantFromRequest(request)

    // Define all configurable modules
    const moduleDefinitions = [
      {
        key: 'socialPosting',
        name: 'Social Media Posting',
        description: 'Create, schedule, and manage social media posts for Facebook and Instagram',
        category: 'modules',
        path: 'modules.socialPosting.enabled',
      },
      {
        key: 'events',
        name: 'Events',
        description: 'Display and manage restaurant events',
        category: 'features',
        path: 'features.events',
      },
      {
        key: 'gallery',
        name: 'Gallery',
        description: 'Showcase restaurant photos and images',
        category: 'features',
        path: 'features.gallery',
      },
      {
        key: 'reservations',
        name: 'Reservations',
        description: 'Allow customers to make table reservations',
        category: 'features',
        path: 'features.reservations',
      },
      {
        key: 'giftCards',
        name: 'Gift Cards',
        description: 'Enable gift card purchases and management',
        category: 'features',
        path: 'features.giftCards',
      },
      {
        key: 'ordering',
        name: 'Ordering System',
        description: 'Enable the ordering system',
        category: 'ordering',
        path: 'ordering.enabled',
      },
      {
        key: 'email',
        name: 'Email Notifications',
        description: 'Send email notifications for orders, reservations, etc.',
        category: 'api',
        path: 'api.enableEmail',
      },
      {
        key: 'stripe',
        name: 'Stripe Payments',
        description: 'Enable Stripe payment processing',
        category: 'api',
        path: 'api.enableStripe',
      },
    ]

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
      moduleDefinitions.map(async module => {
        // Check database first for the setting
        const dbKey = `MODULE_${module.key.toUpperCase()}_ENABLED`
        const dbValue = await getSetting(barId, dbKey)

        // Fallback to siteConfig if not in database
        let enabled = false
        if (dbValue !== null) {
          enabled = dbValue === true || dbValue === 'true'
        } else {
          // Get from siteConfig
          const pathParts = module.path.split('.')
          let value = siteConfig
          for (const part of pathParts) {
            value = value?.[part]
          }
          enabled = value === true
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

    // Find module definition
    const moduleDefinitions = {
      socialPosting: {
        name: 'Social Media Posting',
        path: 'modules.socialPosting.enabled',
      },
      events: {
        name: 'Events',
        path: 'features.events',
      },
      gallery: {
        name: 'Gallery',
        path: 'features.gallery',
      },
      reservations: {
        name: 'Reservations',
        path: 'features.reservations',
      },
      giftCards: {
        name: 'Gift Cards',
        path: 'features.giftCards',
      },
      ordering: {
        name: 'Ordering System',
        path: 'ordering.enabled',
      },
      email: {
        name: 'Email Notifications',
        path: 'api.enableEmail',
      },
      stripe: {
        name: 'Stripe Payments',
        path: 'api.enableStripe',
      },
    }

    const module = moduleDefinitions[moduleKey]
    if (!module) {
      return NextResponse.json({ error: 'Invalid module key' }, { status: 400 })
    }

    // Save to database
    const dbKey = `MODULE_${moduleKey.toUpperCase()}_ENABLED`
    await setSetting(
      barId,
      dbKey,
      enabled,
      `${module.name} module enabled/disabled`,
      'modules',
      'admin'
    )

    return NextResponse.json({
      success: true,
      module: {
        key: moduleKey,
        name: module.name,
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

