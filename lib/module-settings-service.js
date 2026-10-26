import {
  getModuleStatusSync,
  resolveModuleStatus,
} from '@/modules'

/**
 * Check if a module is enabled
 * Checks database first, then falls back to siteConfig
 */
export async function isModuleEnabled(moduleKey, barId = null) {
  try {
    return await resolveModuleStatus(barId, moduleKey)
  } catch (error) {
    console.error(`Error checking module ${moduleKey}:`, error)
    return false
  }
}

/**
 * Get all module enabled statuses (synchronous version using siteConfig only)
 * Use this for client-side checks where async isn't possible
 */
export { getModuleStatusSync }

