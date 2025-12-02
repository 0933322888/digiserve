import { getSetting } from './app-settings-service'
import { siteConfig } from '@/config/siteConfig'

// Simple in-memory cache with TTL
const cache = new Map()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

/**
 * Cache entry structure
 * @typedef {Object} CacheEntry
 * @property {any} value - Cached value
 * @property {number} timestamp - When the value was cached
 */

/**
 * Get a cached value if it exists and is still valid
 * @param {string} key - Cache key
 * @returns {any|null} Cached value or null if not found/expired
 */
function getCached(key) {
  const entry = cache.get(key)
  if (!entry) return null

  const age = Date.now() - entry.timestamp
  if (age > CACHE_TTL) {
    cache.delete(key)
    return null
  }

  return entry.value
}

/**
 * Set a value in the cache
 * @param {string} key - Cache key
 * @param {any} value - Value to cache
 */
function setCached(key, value) {
  cache.set(key, {
    value,
    timestamp: Date.now(),
  })
}

/**
 * Get nested value from object using dot notation path
 * @param {Object} obj - Object to get value from
 * @param {string} path - Dot notation path (e.g., 'features.events')
 * @returns {any|null} Value or null if not found
 */
function getNestedValue(obj, path) {
  if (!path) return null
  const parts = path.split('.')
  let value = obj
  for (const part of parts) {
    if (value === null || value === undefined) return null
    value = value[part]
  }
  return value
}

/**
 * Get setting with caching (DB-first, fallback to siteConfig)
 * @param {string} key - Setting key (e.g., 'RESTAURANT_NAME')
 * @param {any} defaultValue - Default value if not found in DB or siteConfig
 * @param {string} siteConfigPath - Optional path in siteConfig (e.g., 'restaurant.name')
 * @returns {Promise<any>} Setting value
 */
export async function getSettingCached(key, defaultValue = null, siteConfigPath = null) {
  // Check cache first
  const cached = getCached(key)
  if (cached !== null) return cached

  // Check database
  const dbValue = await getSetting(key)
  if (dbValue !== null) {
    setCached(key, dbValue)
    return dbValue
  }

  // Fallback to siteConfig if path provided
  let finalValue = defaultValue
  if (siteConfigPath) {
    const siteConfigValue = getNestedValue(siteConfig, siteConfigPath)
    if (siteConfigValue !== null && siteConfigValue !== undefined) {
      finalValue = siteConfigValue
    }
  }

  // Cache the final value (even if it's the default)
  if (finalValue !== null && finalValue !== undefined) {
    setCached(key, finalValue)
  }

  return finalValue
}

/**
 * Invalidate cache for a specific setting
 * @param {string} key - Setting key to invalidate
 */
export function invalidateCache(key) {
  cache.delete(key)
}

/**
 * Clear all cached settings
 */
export function clearCache() {
  cache.clear()
}

/**
 * Get multiple settings with caching
 * @param {Array<{key: string, defaultValue?: any, siteConfigPath?: string}>} settings - Array of setting definitions
 * @returns {Promise<Object>} Object with setting keys and values
 */
export async function getMultipleSettingsCached(settings) {
  const result = {}
  await Promise.all(
    settings.map(async ({ key, defaultValue, siteConfigPath }) => {
      result[key] = await getSettingCached(key, defaultValue, siteConfigPath)
    })
  )
  return result
}

