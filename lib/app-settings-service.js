import { db } from './db'
import { siteConfig } from '@/config/siteConfig'

/**
 * Get a setting value by key
 */
/**
 * Get a setting value by key for a specific tenant
 */
export async function getSetting(barId, key) {
  if (!barId) return null
  const setting = await db.collection('appSettings').findOne({ barId, key })
  return setting ? setting.value : null
}

/**
 * Get all settings for a category for a specific tenant
 */
export async function getSettingsByCategory(barId, category) {
  if (!barId) return {}
  const settings = await db.collection('appSettings').find({ barId, category }).toArray()
  const result = {}
  settings.forEach(setting => {
    result[setting.key] = setting.value
  })
  return result
}

/**
 * Get all settings for a specific tenant
 */
export async function getAllSettings(barId) {
  if (!barId) return []
  return await db.collection('appSettings').find({ barId }).toArray()
}

/**
 * Set or update a setting for a specific tenant
 */
export async function setSetting(barId, key, value, description = null, category = 'general', updatedBy = null) {
  if (!barId) throw new Error('barId is required')

  const existing = await db.collection('appSettings').findOne({ barId, key })

  const settingData = {
    barId,
    key,
    value,
    description: description || existing?.description || null,
    category,
    updatedAt: new Date().toISOString(),
    updatedBy: updatedBy || null,
  }

  if (existing) {
    await db.collection('appSettings').updateOne({ barId, key }, { $set: settingData })
    return { ...existing, ...settingData }
  } else {
    await db.collection('appSettings').insertOne(settingData)
    return settingData
  }
}

/**
 * Delete a setting for a specific tenant
 */
export async function deleteSetting(barId, key) {
  if (!barId) return false
  const result = await db.collection('appSettings').deleteOne({ barId, key })
  return result.deletedCount > 0
}

/**
 * Get global business hours for a tenant
 */
export async function getBusinessHours(barId) {
  if (!barId) return siteConfig.businessHours

  // First try to get from Restaurant config
  const restaurant = await db.collection('restaurants').findOne({ barId })
  if (restaurant && restaurant.businessHours) {
    // Convert Map to Object if needed (Mongoose Maps are objects in plain JSON)
    return restaurant.businessHours
  }

  // Fallback to AppSettings (legacy/override)
  const dbValue = await getSetting(barId, 'ORDERING_BUSINESS_HOURS')
  if (dbValue && typeof dbValue === 'object') {
    return dbValue
  }

  return siteConfig.businessHours
}

/**
 * Get Facebook app credentials for a tenant
 */
export async function getFacebookAppCredentials(barId) {
  const appId = await getSetting(barId, 'FACEBOOK_APP_ID')
  const appSecret = await getSetting(barId, 'FACEBOOK_APP_SECRET')

  // Fallback to siteConfig if not in DB (for backward compatibility/single tenant)
  if (!appId && !appSecret && siteConfig.modules?.socialPosting) {
    return {
      facebookAppId: siteConfig.modules.socialPosting.facebookAppId,
      facebookAppSecret: siteConfig.modules.socialPosting.facebookAppSecret
    }
  }

  return {
    facebookAppId: appId,
    facebookAppSecret: appSecret,
  }
}

/**
 * Set Facebook app credentials for a tenant
 */
export async function setFacebookAppCredentials(barId, appId, appSecret, updatedBy = null) {
  await setSetting(barId, 'FACEBOOK_APP_ID', appId, 'Facebook App ID', 'social', updatedBy)
  await setSetting(barId, 'FACEBOOK_APP_SECRET', appSecret, 'Facebook App Secret', 'social', updatedBy)
  return {
    facebookAppId: appId,
    facebookAppSecret: appSecret,
  }
}

