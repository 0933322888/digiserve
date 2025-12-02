import { getSettingCached, invalidateCache } from './cached-config-service'
import { siteConfig } from '@/config/siteConfig'
import { setSetting } from './app-settings-service'

/**
 * Get SEO configuration (DB-first, fallback to siteConfig)
 * @returns {Promise<Object>} SEO configuration object
 */
export async function getSEOConfig() {
  const [
    siteName,
    defaultTitle,
    defaultDescription,
    defaultImage,
    twitterHandle,
    facebookUrl,
    instagramUrl,
  ] = await Promise.all([
    getSettingCached('SEO_SITE_NAME', siteConfig.seo.siteName, 'seo.siteName'),
    getSettingCached('SEO_DEFAULT_TITLE', siteConfig.seo.defaultTitle, 'seo.defaultTitle'),
    getSettingCached(
      'SEO_DEFAULT_DESCRIPTION',
      siteConfig.seo.defaultDescription,
      'seo.defaultDescription'
    ),
    getSettingCached('SEO_DEFAULT_IMAGE', siteConfig.seo.defaultImage, 'seo.defaultImage'),
    getSettingCached('SEO_TWITTER_HANDLE', siteConfig.seo.twitterHandle, 'seo.twitterHandle'),
    getSettingCached('SEO_FACEBOOK_URL', siteConfig.seo.facebookUrl, 'seo.facebookUrl'),
    getSettingCached('SEO_INSTAGRAM_URL', siteConfig.seo.instagramUrl, 'seo.instagramUrl'),
  ])

  return {
    siteName,
    defaultTitle,
    defaultDescription,
    defaultImage,
    twitterHandle,
    facebookUrl,
    instagramUrl,
  }
}

/**
 * Get SEO metadata for a page with optional overrides
 * @param {Object} overrides - Optional overrides for specific fields
 * @returns {Promise<Object>} SEO metadata object
 */
export async function getPageSEO(overrides = {}) {
  const seo = await getSEOConfig()

  return {
    title: overrides.title ?? seo.defaultTitle,
    description: overrides.description ?? seo.defaultDescription,
    image: overrides.image ?? seo.defaultImage,
    siteName: seo.siteName,
    twitterHandle: seo.twitterHandle,
    facebookUrl: seo.facebookUrl,
    instagramUrl: seo.instagramUrl,
    ...overrides,
  }
}

/**
 * Update SEO site name
 * @param {string} siteName - New site name
 * @param {string} updatedBy - User who made the update
 * @returns {Promise<Object>} Updated setting
 */
export async function updateSEOSiteName(siteName, updatedBy = null) {
  invalidateCache('SEO_SITE_NAME')
  return await setSetting('SEO_SITE_NAME', siteName, 'SEO site name', 'seo', updatedBy)
}

/**
 * Update SEO default title
 * @param {string} defaultTitle - New default title
 * @param {string} updatedBy - User who made the update
 * @returns {Promise<Object>} Updated setting
 */
export async function updateSEODefaultTitle(defaultTitle, updatedBy = null) {
  invalidateCache('SEO_DEFAULT_TITLE')
  return await setSetting(
    'SEO_DEFAULT_TITLE',
    defaultTitle,
    'SEO default title',
    'seo',
    updatedBy
  )
}

/**
 * Update SEO default description
 * @param {string} defaultDescription - New default description
 * @param {string} updatedBy - User who made the update
 * @returns {Promise<Object>} Updated setting
 */
export async function updateSEODefaultDescription(defaultDescription, updatedBy = null) {
  invalidateCache('SEO_DEFAULT_DESCRIPTION')
  return await setSetting(
    'SEO_DEFAULT_DESCRIPTION',
    defaultDescription,
    'SEO default description',
    'seo',
    updatedBy
  )
}

/**
 * Update SEO default image
 * @param {string} defaultImage - New default image URL
 * @param {string} updatedBy - User who made the update
 * @returns {Promise<Object>} Updated setting
 */
export async function updateSEODefaultImage(defaultImage, updatedBy = null) {
  invalidateCache('SEO_DEFAULT_IMAGE')
  return await setSetting('SEO_DEFAULT_IMAGE', defaultImage, 'SEO default image', 'seo', updatedBy)
}

/**
 * Update SEO social media links
 * @param {Object} social - Social media configuration
 * @param {string} updatedBy - User who made the update
 * @returns {Promise<Object>} Updated settings
 */
export async function updateSEOSocial(social, updatedBy = null) {
  const updates = []

  if (social.twitterHandle !== undefined) {
    invalidateCache('SEO_TWITTER_HANDLE')
    updates.push(
      setSetting('SEO_TWITTER_HANDLE', social.twitterHandle, 'Twitter handle', 'seo', updatedBy)
    )
  }
  if (social.facebookUrl !== undefined) {
    invalidateCache('SEO_FACEBOOK_URL')
    updates.push(
      setSetting('SEO_FACEBOOK_URL', social.facebookUrl, 'Facebook URL', 'seo', updatedBy)
    )
  }
  if (social.instagramUrl !== undefined) {
    invalidateCache('SEO_INSTAGRAM_URL')
    updates.push(
      setSetting('SEO_INSTAGRAM_URL', social.instagramUrl, 'Instagram URL', 'seo', updatedBy)
    )
  }

  await Promise.all(updates)
  return await getSEOConfig()
}

/**
 * Update all SEO configuration at once
 * @param {Object} config - SEO configuration object
 * @param {string} updatedBy - User who made the update
 * @returns {Promise<Object>} Updated SEO configuration
 */
export async function updateSEOConfig(config, updatedBy = null) {
  const updates = []

  if (config.siteName !== undefined) {
    updates.push(updateSEOSiteName(config.siteName, updatedBy))
  }
  if (config.defaultTitle !== undefined) {
    updates.push(updateSEODefaultTitle(config.defaultTitle, updatedBy))
  }
  if (config.defaultDescription !== undefined) {
    updates.push(updateSEODefaultDescription(config.defaultDescription, updatedBy))
  }
  if (config.defaultImage !== undefined) {
    updates.push(updateSEODefaultImage(config.defaultImage, updatedBy))
  }

  if (config.twitterHandle !== undefined || config.facebookUrl !== undefined || config.instagramUrl !== undefined) {
    updates.push(
      updateSEOSocial(
        {
          twitterHandle: config.twitterHandle,
          facebookUrl: config.facebookUrl,
          instagramUrl: config.instagramUrl,
        },
        updatedBy
      )
    )
  }

  await Promise.all(updates)
  return await getSEOConfig()
}

