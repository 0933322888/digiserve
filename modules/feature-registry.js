import { siteConfig } from '@/config/siteConfig'
import { getSetting } from '@/lib/app-settings-service'

export const MODULE_DEFINITIONS = [
  {
    key: 'socialPosting',
    name: 'Social Media Posting',
    description: 'Create, schedule, and manage social media posts for Facebook and Instagram',
    category: 'modules',
    path: 'modules.socialPosting.enabled',
    configPath: 'modules.socialPosting.enabled',
    dbKey: 'MODULE_SOCIALPOSTING_ENABLED',
    legacyKeys: ['social'],
  },
  {
    key: 'events',
    name: 'Events',
    description: 'Display and manage restaurant events',
    category: 'features',
    path: 'features.events',
    configPath: 'features.events',
    dbKey: 'MODULE_EVENTS_ENABLED',
    legacyKeys: ['events'],
  },
  {
    key: 'gallery',
    name: 'Gallery',
    description: 'Showcase restaurant photos and images',
    category: 'features',
    path: 'features.gallery',
    configPath: 'features.gallery',
    dbKey: 'MODULE_GALLERY_ENABLED',
    legacyKeys: ['gallery'],
  },
  {
    key: 'reservations',
    name: 'Reservations',
    description: 'Allow customers to make table reservations',
    category: 'features',
    path: 'features.reservations',
    configPath: 'features.reservations',
    dbKey: 'MODULE_RESERVATIONS_ENABLED',
    legacyKeys: ['reservations'],
  },
  {
    key: 'giftCards',
    name: 'Gift Cards',
    description: 'Enable gift card purchases and management',
    category: 'features',
    path: 'features.giftCards',
    configPath: 'features.giftCards',
    dbKey: 'MODULE_GIFTCARDS_ENABLED',
    legacyKeys: ['giftCards', 'gift-cards'],
  },
  {
    key: 'ordering',
    name: 'Ordering System',
    description: 'Enable the ordering system',
    category: 'ordering',
    path: 'ordering.enabled',
    configPath: 'ordering.enabled',
    dbKey: 'MODULE_ORDERING_ENABLED',
    legacyKeys: ['ordering'],
  },
  {
    key: 'email',
    name: 'Email Notifications',
    description: 'Send email notifications for orders, reservations, etc.',
    category: 'api',
    path: 'api.enableEmail',
    configPath: 'api.enableEmail',
    dbKey: 'MODULE_EMAIL_ENABLED',
    legacyKeys: ['email'],
  },
  {
    key: 'stripe',
    name: 'Stripe Payments',
    description: 'Enable Stripe payment processing',
    category: 'api',
    path: 'api.enableStripe',
    configPath: 'api.enableStripe',
    dbKey: 'MODULE_STRIPE_ENABLED',
    legacyKeys: ['stripe'],
  },
]

export const MODULE_STATUS_KEYS = {
  ordering: 'ordering',
  reservations: 'reservations',
  events: 'events',
  gallery: 'gallery',
  giftCards: 'giftCards',
  social: 'socialPosting',
}

export function getModuleDefinition(moduleKey) {
  return MODULE_DEFINITIONS.find((module) => module.key === moduleKey) || null
}

export function getModuleConfigValue(config, configPath) {
  if (!config || !configPath) {
    return undefined
  }

  return configPath.split('.').reduce((value, part) => value?.[part], config)
}

export function getModuleStatusSync(moduleKey) {
  const definition = getModuleDefinition(moduleKey)
  if (!definition) {
    return false
  }

  return getModuleConfigValue(siteConfig, definition.configPath) === true
}

export async function resolveModuleStatus(barId, moduleKey) {
  const definition = getModuleDefinition(moduleKey)
  if (!definition) {
    return false
  }

  if (barId) {
    const dbValue = await getSetting(barId, definition.dbKey)
    if (dbValue !== null) {
      return dbValue === true || dbValue === 'true'
    }

    const tenantConfig = await import('@/lib/tenant-service').then(({ getTenantConfig }) => getTenantConfig(barId))
    if (tenantConfig?.modules) {
      const moduleMatches = [moduleKey, ...(definition.legacyKeys || [])]
      if (tenantConfig.modules.some((value) => moduleMatches.includes(value))) {
        return true
      }
    }
  }

  return getModuleStatusSync(moduleKey)
}
