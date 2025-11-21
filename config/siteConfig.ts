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
    description: string
    address: {
      street: string
      city: string
      state: string
      zip: string
      country: string
    }
    phone: string
    email: string
    hours: {
      [key: string]: string // e.g., "Monday": "11:00 AM - 10:00 PM"
    }
  }

  // Feature Toggles
  features: {
    events: boolean
    gallery: boolean
    reservations: boolean
    giftCards: boolean
    foodMenu: boolean
    drinkMenu: boolean
    onlineOrdering: boolean
  }

  // Online Ordering Configuration
  ordering?: {
    enabled: boolean
    pickup: boolean
    delivery: boolean
    deliverySettings?: {
      baseFee: number
      freeDeliveryFrom: number | null
      deliveryZones: Array<{
        postal: string
        fee: number
      }>
    }
    businessHours: {
      [key: string]: {
        open: string // "11:00"
        close: string // "23:00"
        closed?: boolean
      }
    }
    taxRate: number // e.g., 0.13 for 13%
    useDatabase: boolean // Use DynamoDB for order storage
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
}

export const siteConfig: SiteConfig = {
  restaurant: {
    name: 'TRIO BISTRO AND LOUNGE',
    tagline: 'Vintage Elegance, Modern Flavor',
    description:
      'Experience the perfect blend of vintage charm and contemporary cuisine at TRIO BISTRO AND LOUNGE. A sophisticated dining destination where classic elegance meets modern culinary innovation.',
    address: {
      street: '307D Richmond Road',
      city: 'Ottawa',
      state: 'ON',
      zip: 'K1Z 6X1',
      country: 'Canada',
    },
    phone: '+1 (613) 722-3887',
    email: 'info@triowestboro.com',
    hours: {
      Monday: '04:00 PM - 12:00 AM',
      Tuesday: '04:00 PM - 12:00 AM',
      Wednesday: '04:00 PM - 12:00 AM',
      Thursday: '11:00 AM - 11:00 PM',
      Friday: '4:00 PM - 02:00 AM',
      Saturday: '04:00 PM - 02:00 AM',
      Sunday: '04:00 PM - 12:00 AM',
    },
  },

  features: {
    events: true,
    gallery: true,
    reservations: true,
    giftCards: true,
    foodMenu: true,
    drinkMenu: true,
    onlineOrdering: true,
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
    deliverySettings: {
      baseFee: 5.0,
      freeDeliveryFrom: 50.0,
      deliveryZones: [
        { postal: 'K1Z', fee: 5.0 },
        { postal: 'K1Y', fee: 6.0 },
        { postal: 'K2P', fee: 7.0 },
      ],
    },
    businessHours: {
      Monday: { open: '16:00', close: '00:00' },
      Tuesday: { open: '16:00', close: '00:00' },
      Wednesday: { open: '16:00', close: '00:00' },
      Thursday: { open: '11:00', close: '23:00' },
      Friday: { open: '16:00', close: '02:00' },
      Saturday: { open: '16:00', close: '02:00' },
      Sunday: { open: '16:00', close: '00:00' },
    },
    taxRate: 0.13, // 13% tax
    useDatabase: false, // Set to true if using DynamoDB
  },
}

