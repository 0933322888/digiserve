export const MOCK_STRIPE = true // Set to false to use real Stripe

import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock', {
    apiVersion: '2023-10-16',
    typescript: false,
})

export const MODULE_PRICES = {
    ordering: process.env.STRIPE_PRICE_ORDERING || 'price_ordering',
    reservations: process.env.STRIPE_PRICE_RESERVATIONS || 'price_reservations',
    events: process.env.STRIPE_PRICE_EVENTS || 'price_events',
    gallery: process.env.STRIPE_PRICE_GALLERY || 'price_gallery',
    giftCards: process.env.STRIPE_PRICE_GIFT_CARDS || 'price_giftCards',
    socialPosting: process.env.STRIPE_PRICE_SOCIAL_POSTING || 'price_socialPosting',
    loyalty: process.env.STRIPE_PRICE_LOYALTY || 'price_loyalty',
}

export const MODULE_NAMES = {
    ordering: 'Ordering System',
    reservations: 'Reservations',
    events: 'Events & Tickets',
    gallery: 'Photo Gallery',
    giftCards: 'Gift Cards',
    socialPosting: 'Social Media Posting',
    loyalty: 'Loyalty Program',
}
