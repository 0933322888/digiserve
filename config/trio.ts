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
    name: 'TRIO BISTRO AND LOUNGE',
    restaurantId: 'triobistro',
    tagline: 'Vintage Elegance, Modern Flavor',
    description:
      'Experience the perfect blend of vintage charm and contemporary cuisine at TRIO BISTRO AND LOUNGE. A sophisticated dining destination where classic elegance meets modern culinary innovation.',
    address: {
      street: '307D Richmond Road',
      city: 'Ottawa',
      state: 'ON',
      zip: 'K1Z 6X1',
      country: 'Canada',
      coordinates: {
        lat: 45.392856,
        lon: -75.752723,
      },
    },
    phone: '+1 (613) 722-3887',
    email: 'info@triowestboro.com',
  },

  features: {
    events: true,
    gallery: true,
    reservations: true,
    giftCards: false,
  },

  seo: {
    siteName: 'TRIO BISTRO AND LOUNGE',
    defaultTitle: 'TRIO BISTRO AND LOUNGE | Vintage Elegance, Modern Flavor',
    defaultDescription:
      'Experience the perfect blend of vintage charm and contemporary cuisine at TRIO BISTRO AND LOUNGE. A sophisticated dining destination in New York.',
    defaultImage: '/images/interior.jpeg',
    twitterHandle: '@triobistro',
    facebookUrl: 'https://www.facebook.com/Triowestboro',
    instagramUrl: 'https://instagram.com/triobistro',
  },

  api: {
    enableEmail: true,
    enableStripe: true,
    stripePublicKey: process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY || '',
    stripeSecretKey: process.env.STRIPE_SECRET_KEY || '',
  },

  ordering: {
    enabled: true,
    pickup: true,
    delivery: true,
    dineIn: true,
    deliverySettings: {
      baseFee: 5.0,
      freeDeliveryFrom: 50.0,
      deliveryZones: [
        { postal: 'K1Z', fee: 5.0 },
        { postal: 'K1Y', fee: 6.0 },
        { postal: 'K2P', fee: 7.0 },
      ],
    },
    taxRate: 0.13, // 13% tax
  },

  // Business Hours (used for ordering, reservations, and display)
  businessHours: {
    Monday: { open: '16:00', close: '00:00' },
    Tuesday: { open: '16:00', close: '00:00' },
    Wednesday: { open: '16:00', close: '00:00' },
    Thursday: { open: '11:00', close: '23:00' },
    Friday: { open: '16:00', close: '02:00' },
    Saturday: { open: '16:00', close: '02:00' },
    Sunday: { open: '16:00', close: '00:00' },
  },

  reservations: {
    maxSeatsPerSlot: 40,
    slotDurationMinutes: 120, // 2 hours
  },

  modules: {
    socialPosting: {
      enabled: true,
      openAIApiKey: process.env.OPENAI_API_KEY || '',
    },
  }
}
