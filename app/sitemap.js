import { siteConfig } from '@/config/siteConfig'

/**
 * Dynamic Sitemap Generation
 * Automatically generates sitemap based on enabled features
 */
export default function sitemap() {
  const baseUrl = 'https://triobistro.com' // Update with your domain

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

  // Add menu routes if enabled
  if (siteConfig.features.foodMenu || siteConfig.features.drinkMenu) {
    if (siteConfig.features.foodMenu && siteConfig.features.drinkMenu) {
      routes.push({
        url: `${baseUrl}/menu`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.9,
      })
    }
    if (siteConfig.features.foodMenu) {
      routes.push({
        url: `${baseUrl}/menu/food`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.9,
      })
    }
    if (siteConfig.features.drinkMenu) {
      routes.push({
        url: `${baseUrl}/menu/drinks`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.9,
      })
    }
  }

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
  if (siteConfig.features.onlineOrdering && siteConfig.ordering?.enabled) {
    routes.push({
      url: `${baseUrl}/order`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    })
  }

  return routes
}

