import { siteConfig } from '@/config/siteConfig'

/**
 * Dynamic Sitemap Generation
 * Automatically generates sitemap based on enabled features
 */
export default function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL

  const routes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ]

  // Add feature routes if enabled
  if (siteConfig.features.reservations) {
    routes.push({
      url: `${baseUrl}/reservations`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    })
  }

  if (siteConfig.features.giftCards) {
    routes.push({
      url: `${baseUrl}/gift-cards`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    })
  }

  if (siteConfig.features.gallery) {
    routes.push({
      url: `${baseUrl}/gallery`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    })
  }

  if (siteConfig.features.events) {
    routes.push({
      url: `${baseUrl}/events`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    })
  }

  // Add ordering routes if enabled
  if (siteConfig.ordering?.enabled) {
    routes.push({
      url: `${baseUrl}/order`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    })
  }

  return routes
}
