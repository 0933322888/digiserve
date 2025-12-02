/**
 * Unified Configuration Service
 * 
 * Provides a single interface to access all configuration settings
 * with DB-first pattern and siteConfig fallback, with caching.
 */

import { getRestaurantConfig } from './restaurant-config-service'
import { getSEOConfig } from './seo-config-service'
import { isModuleEnabled } from './module-settings-service'
import { getSettingCached } from './cached-config-service'
import { siteConfig } from '@/config/siteConfig'

/**
 * Get all site configuration in a single call
 * Combines restaurant, SEO, features, and other settings
 * @returns {Promise<Object>} Complete site configuration
 */
export async function getSiteConfig() {
  const [restaurant, seo, features, ordering, reservations] = await Promise.all([
    getRestaurantConfig(),
    getSEOConfig(),
    getFeaturesConfig(),
    getOrderingConfig(),
    getReservationsConfig(),
  ])

  return {
    restaurant,
    seo,
    features,
    ordering,
    reservations,
  }
}

/**
 * Get features configuration
 * @returns {Promise<Object>} Features configuration
 */
export async function getFeaturesConfig() {
  const [events, gallery, reservations, giftCards] = await Promise.all([
    isModuleEnabled('events'),
    isModuleEnabled('gallery'),
    isModuleEnabled('reservations'),
    isModuleEnabled('giftCards'),
  ])

  return {
    events,
    gallery,
    reservations,
    giftCards,
  }
}

/**
 * Get ordering configuration
 * @returns {Promise<Object>} Ordering configuration
 */
export async function getOrderingConfig() {
  const [enabled, pickup, delivery, dineIn, taxRate, deliverySettings] = await Promise.all([
    isModuleEnabled('ordering'),
    isModuleEnabled('orderingPickup'),
    isModuleEnabled('orderingDelivery'),
    isModuleEnabled('orderingDineIn'),
    getSettingCached('ORDERING_TAX_RATE', siteConfig.ordering?.taxRate ?? 0.13),
    getSettingCached('ORDERING_DELIVERY_SETTINGS', siteConfig.ordering?.deliverySettings),
  ])

  return {
    enabled,
    pickup,
    delivery,
    dineIn,
    taxRate,
    deliverySettings,
  }
}

/**
 * Get reservations configuration
 * @returns {Promise<Object>} Reservations configuration
 */
export async function getReservationsConfig() {
  const [maxSeatsPerSlot, slotDurationMinutes] = await Promise.all([
    getSettingCached(
      'RESERVATIONS_MAX_SEATS_PER_SLOT',
      siteConfig.reservations?.maxSeatsPerSlot ?? 40
    ),
    getSettingCached(
      'RESERVATIONS_SLOT_DURATION_MINUTES',
      siteConfig.reservations?.slotDurationMinutes ?? 120
    ),
  ])

  return {
    maxSeatsPerSlot,
    slotDurationMinutes,
  }
}

/**
 * Get API configuration (from env vars and DB)
 * Note: Sensitive keys should remain in environment variables
 * @returns {Promise<Object>} API configuration
 */
export async function getAPIConfig() {
  const [enableEmail, enableStripe] = await Promise.all([
    isModuleEnabled('email'),
    isModuleEnabled('stripe'),
  ])

  return {
    enableEmail,
    enableStripe,
    stripePublicKey: process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY || '',
    stripeSecretKey: process.env.STRIPE_SECRET_KEY || '',
  }
}

