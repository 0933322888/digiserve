/**
 * Site Configuration
 *
 * This file controls which features are enabled/disabled for the restaurant website.
 * Modify these settings to customize the site for different restaurants.
 */

export interface SiteConfig {
  // Restaurant Information
  restaurant: {
    name: string
    tagline: string
    restaurantId: string
    description: string
    address: {
      street: string
      city: string
      state: string
      zip: string
      country: string
      coordinates?: {
        lat: number
        lon: number
      }
    }
    phone: string
    email: string
  }

  // Feature Toggles
  features: {
    events: boolean
    gallery: boolean
    reservations: boolean
    giftCards: boolean
  }

  // Online Ordering Configuration
  ordering?: {
    enabled: boolean
    pickup: boolean
    delivery: boolean
    dineIn: boolean
    deliverySettings?: {
      baseFee: number
      freeDeliveryFrom: number | null
      deliveryZones: Array<{
        postal: string
        fee: number
      }>
    }
    taxRate: number // e.g., 0.13 for 13%
  }

  // Business Hours Configuration
  businessHours?: {
    [day: string]: {
      open: string // Format: 'HH:mm' (e.g., '09:00')
      close: string // Format: 'HH:mm' (e.g., '22:00')
      closed?: boolean // Optional: set to true if restaurant is closed on this day
    }
  }

  // Reservation Configuration
  reservations?: {
    maxSeatsPerSlot: number
    slotDurationMinutes: number
  }

  // SEO Configuration
  seo: {
    siteName: string
    defaultTitle: string
    defaultDescription: string
    defaultImage: string
    twitterHandle?: string
    facebookUrl?: string
    instagramUrl?: string
  }

  // API Configuration
  api: {
    enableEmail: boolean
    enableStripe: boolean
    stripePublicKey?: string
    stripeSecretKey?: string
  }

  // Modules Configuration
  modules?: {
    socialPosting?: {
      enabled: boolean
      openAIApiKey?: string
      facebookAppId?: string
      facebookAppSecret?: string
    }
  }
}

export const siteConfig: SiteConfig = {
  restaurant: {
    name: 'Your Bar',
    restaurantId: 'default',
    tagline: 'Your Tagline',
    description: 'Restaurant description goes here.',
    address: {
      street: '123 Main St',
      city: 'City',
      state: 'State',
      zip: '12345',
      country: 'Country',
      coordinates: {
        lat: 0,
        lon: 0,
      },
    },
    phone: '+1 (555) 123-4567',
    email: 'info@example.com',
  },

  features: {
    events: true,
    gallery: true,
    reservations: true,
    giftCards: false,
  },

  seo: {
    siteName: 'Restaurant Name',
    defaultTitle: 'Restaurant Name | Tagline',
    defaultDescription: 'Restaurant description.',
    defaultImage: '/images/default-og.jpg',
  },

  api: {
    enableEmail: false,
    enableStripe: false,
    stripePublicKey: '',
    stripeSecretKey: '',
  },

  ordering: {
    enabled: true,
    pickup: true,
    delivery: true,
    dineIn: true,
    deliverySettings: {
      baseFee: 5.0,
      freeDeliveryFrom: 50.0,
      deliveryZones: [],
    },
    taxRate: 0.13,
  },

  businessHours: {
    Monday: { open: '09:00', close: '22:00' },
    Tuesday: { open: '09:00', close: '22:00' },
    Wednesday: { open: '09:00', close: '22:00' },
    Thursday: { open: '09:00', close: '22:00' },
    Friday: { open: '09:00', close: '23:00' },
    Saturday: { open: '10:00', close: '23:00' },
    Sunday: { open: '10:00', close: '22:00' },
  },

  reservations: {
    maxSeatsPerSlot: 40,
    slotDurationMinutes: 90,
  },

  modules: {
    socialPosting: {
      enabled: false,
    },
  }
}
