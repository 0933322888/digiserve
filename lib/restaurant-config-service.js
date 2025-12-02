import { getSettingCached, invalidateCache } from './cached-config-service'
import { siteConfig } from '@/config/siteConfig'
import { setSetting } from './app-settings-service'

/**
 * Get restaurant name (DB-first, fallback to siteConfig)
 * @returns {Promise<string>} Restaurant name
 */
export async function getRestaurantName() {
  return await getSettingCached(
    'RESTAURANT_NAME',
    siteConfig.restaurant.name,
    'restaurant.name'
  )
}

/**
 * Get restaurant tagline (DB-first, fallback to siteConfig)
 * @returns {Promise<string>} Restaurant tagline
 */
export async function getRestaurantTagline() {
  return await getSettingCached(
    'RESTAURANT_TAGLINE',
    siteConfig.restaurant.tagline,
    'restaurant.tagline'
  )
}

/**
 * Get restaurant description (DB-first, fallback to siteConfig)
 * @returns {Promise<string>} Restaurant description
 */
export async function getRestaurantDescription() {
  return await getSettingCached(
    'RESTAURANT_DESCRIPTION',
    siteConfig.restaurant.description,
    'restaurant.description'
  )
}

/**
 * Get restaurant phone (DB-first, fallback to siteConfig)
 * @returns {Promise<string>} Restaurant phone
 */
export async function getRestaurantPhone() {
  return await getSettingCached(
    'RESTAURANT_PHONE',
    siteConfig.restaurant.phone,
    'restaurant.phone'
  )
}

/**
 * Get restaurant email (DB-first, fallback to siteConfig)
 * @returns {Promise<string>} Restaurant email
 */
export async function getRestaurantEmail() {
  return await getSettingCached(
    'RESTAURANT_EMAIL',
    siteConfig.restaurant.email,
    'restaurant.email'
  )
}

/**
 * Get restaurant address (DB-first, fallback to siteConfig)
 * @param {string} locationId - Optional location ID for multi-location support (default: 'default')
 * @returns {Promise<Object>} Restaurant address object
 */
export async function getRestaurantAddress(locationId = 'default') {
  const key = locationId === 'default' ? 'RESTAURANT_ADDRESS' : `RESTAURANT_ADDRESS_${locationId}`
  
  const dbAddress = await getSettingCached(key, null)
  if (dbAddress) return dbAddress

  // Fallback to siteConfig
  return siteConfig.restaurant.address
}

/**
 * Get all restaurant configuration (merged from DB and siteConfig)
 * @returns {Promise<Object>} Complete restaurant configuration
 */
export async function getRestaurantConfig() {
  const [name, tagline, description, phone, email, address] = await Promise.all([
    getRestaurantName(),
    getRestaurantTagline(),
    getRestaurantDescription(),
    getRestaurantPhone(),
    getRestaurantEmail(),
    getRestaurantAddress(),
  ])

  return {
    name,
    tagline,
    description,
    address,
    phone,
    email,
  }
}

/**
 * Update restaurant name
 * @param {string} name - New restaurant name
 * @param {string} updatedBy - User who made the update
 * @returns {Promise<Object>} Updated setting
 */
export async function updateRestaurantName(name, updatedBy = null) {
  invalidateCache('RESTAURANT_NAME')
  return await setSetting(
    'RESTAURANT_NAME',
    name,
    'Restaurant name',
    'restaurant',
    updatedBy
  )
}

/**
 * Update restaurant tagline
 * @param {string} tagline - New restaurant tagline
 * @param {string} updatedBy - User who made the update
 * @returns {Promise<Object>} Updated setting
 */
export async function updateRestaurantTagline(tagline, updatedBy = null) {
  invalidateCache('RESTAURANT_TAGLINE')
  return await setSetting(
    'RESTAURANT_TAGLINE',
    tagline,
    'Restaurant tagline',
    'restaurant',
    updatedBy
  )
}

/**
 * Update restaurant description
 * @param {string} description - New restaurant description
 * @param {string} updatedBy - User who made the update
 * @returns {Promise<Object>} Updated setting
 */
export async function updateRestaurantDescription(description, updatedBy = null) {
  invalidateCache('RESTAURANT_DESCRIPTION')
  return await setSetting(
    'RESTAURANT_DESCRIPTION',
    description,
    'Restaurant description',
    'restaurant',
    updatedBy
  )
}

/**
 * Update restaurant phone
 * @param {string} phone - New restaurant phone
 * @param {string} updatedBy - User who made the update
 * @returns {Promise<Object>} Updated setting
 */
export async function updateRestaurantPhone(phone, updatedBy = null) {
  invalidateCache('RESTAURANT_PHONE')
  return await setSetting(
    'RESTAURANT_PHONE',
    phone,
    'Restaurant phone number',
    'restaurant',
    updatedBy
  )
}

/**
 * Update restaurant email
 * @param {string} email - New restaurant email
 * @param {string} updatedBy - User who made the update
 * @returns {Promise<Object>} Updated setting
 */
export async function updateRestaurantEmail(email, updatedBy = null) {
  invalidateCache('RESTAURANT_EMAIL')
  return await setSetting(
    'RESTAURANT_EMAIL',
    email,
    'Restaurant email address',
    'restaurant',
    updatedBy
  )
}

/**
 * Update restaurant address
 * @param {Object} address - New restaurant address object
 * @param {string} updatedBy - User who made the update
 * @param {string} locationId - Optional location ID (default: 'default')
 * @returns {Promise<Object>} Updated setting
 */
export async function updateRestaurantAddress(address, updatedBy = null, locationId = 'default') {
  const key = locationId === 'default' ? 'RESTAURANT_ADDRESS' : `RESTAURANT_ADDRESS_${locationId}`
  invalidateCache(key)
  return await setSetting(
    key,
    address,
    'Restaurant address',
    'restaurant',
    updatedBy
  )
}

/**
 * Update all restaurant configuration at once
 * @param {Object} config - Restaurant configuration object
 * @param {string} updatedBy - User who made the update
 * @returns {Promise<Object>} Updated configuration
 */
export async function updateRestaurantConfig(config, updatedBy = null) {
  const updates = []
  
  if (config.name !== undefined) {
    updates.push(updateRestaurantName(config.name, updatedBy))
  }
  if (config.tagline !== undefined) {
    updates.push(updateRestaurantTagline(config.tagline, updatedBy))
  }
  if (config.description !== undefined) {
    updates.push(updateRestaurantDescription(config.description, updatedBy))
  }
  if (config.phone !== undefined) {
    updates.push(updateRestaurantPhone(config.phone, updatedBy))
  }
  if (config.email !== undefined) {
    updates.push(updateRestaurantEmail(config.email, updatedBy))
  }
  if (config.address !== undefined) {
    updates.push(updateRestaurantAddress(config.address, updatedBy))
  }

  await Promise.all(updates)
  return await getRestaurantConfig()
}

