import { getSetting } from './app-settings-service'
import { siteConfig } from '@/config/siteConfig'

/**
 * Check if a module is enabled
 * Checks database first, then falls back to siteConfig
 */
export async function isModuleEnabled(moduleKey) {
  try {
    // Check database first
    const dbKey = `MODULE_${moduleKey.toUpperCase()}_ENABLED`
    const dbValue = await getSetting(dbKey)

    if (dbValue !== null) {
      return dbValue === true || dbValue === 'true'
    }

    // Fallback to siteConfig
    const modulePaths = {
      socialPosting: 'modules.socialPosting.enabled',
      events: 'features.events',
      gallery: 'features.gallery',
      reservations: 'features.reservations',
      giftCards: 'features.giftCards',
      ordering: 'ordering.enabled',
      orderingPickup: 'ordering.pickup',
      orderingDelivery: 'ordering.delivery',
      orderingDineIn: 'ordering.dineIn',
      email: 'api.enableEmail',
      stripe: 'api.enableStripe',
    }

    const path = modulePaths[moduleKey]
    if (!path) {
      return false
    }

    const pathParts = path.split('.')
    let value = siteConfig
    for (const part of pathParts) {
      value = value?.[part]
    }

    return value === true
  } catch (error) {
    console.error(`Error checking module ${moduleKey}:`, error)
    // Fallback to siteConfig on error
    return false
  }
}

/**
 * Get all module enabled statuses (synchronous version using siteConfig only)
 * Use this for client-side checks where async isn't possible
 */
export function getModuleStatusSync(moduleKey) {
  const modulePaths = {
      socialPosting: 'modules.socialPosting.enabled',
      events: 'features.events',
      gallery: 'features.gallery',
      reservations: 'features.reservations',
      giftCards: 'features.giftCards',
      ordering: 'ordering.enabled',
      orderingPickup: 'ordering.pickup',
      orderingDelivery: 'ordering.delivery',
      orderingDineIn: 'ordering.dineIn',
      email: 'api.enableEmail',
      stripe: 'api.enableStripe',
    }

  const path = modulePaths[moduleKey]
  if (!path) {
    return false
  }

  const pathParts = path.split('.')
  let value = siteConfig
  for (const part of pathParts) {
    value = value?.[part]
  }

  return value === true
}

