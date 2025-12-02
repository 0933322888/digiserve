# Configuration Pattern Examples

## Current Pattern: DB-First with siteConfig Fallback

Here are practical examples of how the current pattern works and how to extend it.

## Example 1: Feature Toggle (Already Implemented)

### Implementation
```typescript
// lib/module-settings-service.js
export async function isModuleEnabled(moduleKey) {
  // 1. Check database first
  const dbKey = `MODULE_${moduleKey.toUpperCase()}_ENABLED`
  const dbValue = await getSetting(dbKey)
  
  if (dbValue !== null) {
    return dbValue === true || dbValue === 'true'
  }
  
  // 2. Fallback to siteConfig
  const path = 'features.events' // example
  const pathParts = path.split('.')
  let value = siteConfig
  for (const part of pathParts) {
    value = value?.[part]
  }
  
  return value === true
}
```

### Usage
```typescript
// In server components
if (await isModuleEnabled('events')) {
  // Show events section
}

// In API routes
const enabled = await isModuleEnabled('ordering')
```

## Example 2: Restaurant Info Service (New)

### Create: `lib/restaurant-config-service.js`

```typescript
import { getSetting } from './app-settings-service'
import { siteConfig } from '@/config/siteConfig'

/**
 * Get restaurant name (DB-first, fallback to siteConfig)
 */
export async function getRestaurantName() {
  const dbName = await getSetting('RESTAURANT_NAME')
  return dbName ?? siteConfig.restaurant.name
}

/**
 * Get restaurant contact info
 */
export async function getRestaurantContact() {
  const phone = await getSetting('RESTAURANT_PHONE') ?? siteConfig.restaurant.phone
  const email = await getSetting('RESTAURANT_EMAIL') ?? siteConfig.restaurant.email
  
  return { phone, email }
}

/**
 * Get restaurant address (supports multiple locations)
 */
export async function getRestaurantAddress(locationId = 'default') {
  if (locationId === 'default') {
    const dbAddress = await getSetting('RESTAURANT_ADDRESS')
    if (dbAddress) return dbAddress
    
    // Fallback to siteConfig
    return siteConfig.restaurant.address
  }
  
  // For multi-location support
  const dbAddress = await getSetting(`RESTAURANT_ADDRESS_${locationId}`)
  return dbAddress ?? siteConfig.restaurant.address
}

/**
 * Get all restaurant config (merged from DB and siteConfig)
 */
export async function getRestaurantConfig() {
  return {
    name: await getRestaurantName(),
    tagline: await getSetting('RESTAURANT_TAGLINE') ?? siteConfig.restaurant.tagline,
    description: await getSetting('RESTAURANT_DESCRIPTION') ?? siteConfig.restaurant.description,
    address: await getRestaurantAddress(),
    phone: await getSetting('RESTAURANT_PHONE') ?? siteConfig.restaurant.phone,
    email: await getSetting('RESTAURANT_EMAIL') ?? siteConfig.restaurant.email,
  }
}
```

### Usage
```typescript
// app/layout.js (server component)
import { getRestaurantConfig } from '@/lib/restaurant-config-service'

export default async function Layout() {
  const restaurant = await getRestaurantConfig()
  
  return (
    <html>
      <head>
        <title>{restaurant.name}</title>
      </head>
      <body>
        <Navbar restaurantName={restaurant.name} />
        {/* ... */}
      </body>
    </html>
  )
}
```

## Example 3: SEO Configuration Service (New)

### Create: `lib/seo-config-service.js`

```typescript
import { getSetting } from './app-settings-service'
import { siteConfig } from '@/config/siteConfig'

/**
 * Get SEO configuration (DB-first, fallback to siteConfig)
 */
export async function getSEOConfig() {
  return {
    siteName: await getSetting('SEO_SITE_NAME') ?? siteConfig.seo.siteName,
    defaultTitle: await getSetting('SEO_DEFAULT_TITLE') ?? siteConfig.seo.defaultTitle,
    defaultDescription: await getSetting('SEO_DEFAULT_DESCRIPTION') ?? siteConfig.seo.defaultDescription,
    defaultImage: await getSetting('SEO_DEFAULT_IMAGE') ?? siteConfig.seo.defaultImage,
    twitterHandle: await getSetting('SEO_TWITTER_HANDLE') ?? siteConfig.seo.twitterHandle,
    facebookUrl: await getSetting('SEO_FACEBOOK_URL') ?? siteConfig.seo.facebookUrl,
    instagramUrl: await getSetting('SEO_INSTAGRAM_URL') ?? siteConfig.seo.instagramUrl,
  }
}

/**
 * Get SEO metadata for a page
 */
export async function getPageSEO(overrides = {}) {
  const seo = await getSEOConfig()
  
  return {
    title: overrides.title ?? seo.defaultTitle,
    description: overrides.description ?? seo.defaultDescription,
    image: overrides.image ?? seo.defaultImage,
    ...overrides,
  }
}
```

### Usage
```typescript
// app/about/page.js
import { getPageSEO } from '@/lib/seo-config-service'

export async function generateMetadata() {
  const seo = await getPageSEO({
    title: 'About Us',
    description: 'Learn about our restaurant...',
  })
  
  return {
    title: seo.title,
    description: seo.description,
    openGraph: {
      title: seo.title,
      description: seo.description,
      images: [seo.image],
    },
  }
}
```

## Example 4: Cached Configuration Service (Performance)

### Create: `lib/cached-config-service.js`

```typescript
import { getSetting, getSettingsByCategory } from './app-settings-service'
import { siteConfig } from '@/config/siteConfig'

// Simple in-memory cache with TTL
const cache = new Map()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

interface CacheEntry {
  value: any
  timestamp: number
}

function getCached(key: string): any | null {
  const entry = cache.get(key) as CacheEntry | undefined
  if (!entry) return null
  
  const age = Date.now() - entry.timestamp
  if (age > CACHE_TTL) {
    cache.delete(key)
    return null
  }
  
  return entry.value
}

function setCached(key: string, value: any): void {
  cache.set(key, {
    value,
    timestamp: Date.now(),
  })
}

/**
 * Get setting with caching (DB-first, fallback to siteConfig)
 */
export async function getSettingCached(key: string, defaultValue: any = null) {
  // Check cache first
  const cached = getCached(key)
  if (cached !== null) return cached
  
  // Check database
  const dbValue = await getSetting(key)
  if (dbValue !== null) {
    setCached(key, dbValue)
    return dbValue
  }
  
  // Fallback to defaultValue or siteConfig
  const finalValue = defaultValue ?? getNestedValue(siteConfig, key)
  if (finalValue !== null) {
    setCached(key, finalValue)
  }
  
  return finalValue
}

/**
 * Invalidate cache for a setting
 */
export function invalidateCache(key: string) {
  cache.delete(key)
}

/**
 * Clear all cached settings
 */
export function clearCache() {
  cache.clear()
}

// Helper to get nested value from object using dot notation
function getNestedValue(obj: any, path: string): any {
  const parts = path.split('.')
  let value = obj
  for (const part of parts) {
    if (value === null || value === undefined) return null
    value = value[part]
  }
  return value
}
```

### Usage
```typescript
// Fast repeated access (cached)
const restaurantName = await getSettingCached('RESTAURANT_NAME', siteConfig.restaurant.name)

// Invalidate after update
await setSetting('RESTAURANT_NAME', 'New Name')
invalidateCache('RESTAURANT_NAME')
```

## Example 5: Admin API Route Pattern

### Pattern for updating settings

```typescript
// app/api/admin/settings/restaurant/route.js
import { NextResponse } from 'next/server'
import { getSetting, setSetting } from '@/lib/app-settings-service'
import { siteConfig } from '@/config/siteConfig'
import { invalidateCache } from '@/lib/cached-config-service'

/**
 * GET - Get restaurant settings (DB-first with siteConfig fallback)
 */
export async function GET() {
  try {
    const restaurant = {
      name: await getSetting('RESTAURANT_NAME') ?? siteConfig.restaurant.name,
      tagline: await getSetting('RESTAURANT_TAGLINE') ?? siteConfig.restaurant.tagline,
      description: await getSetting('RESTAURANT_DESCRIPTION') ?? siteConfig.restaurant.description,
      phone: await getSetting('RESTAURANT_PHONE') ?? siteConfig.restaurant.phone,
      email: await getSetting('RESTAURANT_EMAIL') ?? siteConfig.restaurant.email,
      address: await getSetting('RESTAURANT_ADDRESS') ?? siteConfig.restaurant.address,
    }
    
    return NextResponse.json({ success: true, restaurant })
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

/**
 * PUT - Update restaurant settings
 */
export async function PUT(request) {
  try {
    const body = await request.json()
    const { name, tagline, description, phone, email, address } = body
    
    // Update each setting
    if (name !== undefined) {
      await setSetting('RESTAURANT_NAME', name, 'Restaurant name', 'restaurant')
      invalidateCache('RESTAURANT_NAME')
    }
    
    if (tagline !== undefined) {
      await setSetting('RESTAURANT_TAGLINE', tagline, 'Restaurant tagline', 'restaurant')
      invalidateCache('RESTAURANT_TAGLINE')
    }
    
    // ... etc
    
    return NextResponse.json({
      success: true,
      message: 'Restaurant settings updated successfully',
    })
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
```

## Example 6: Initialization Script

### Populate DB from siteConfig.ts on first run

```typescript
// scripts/initialize-settings.ts
import { db } from '@/lib/db'
import { siteConfig } from '@/config/siteConfig'

/**
 * Initialize database settings from siteConfig.ts
 * Run this once when setting up a new installation
 */
export async function initializeSettingsFromConfig() {
  const settings = [
    // Restaurant info
    { key: 'RESTAURANT_NAME', value: siteConfig.restaurant.name, category: 'restaurant' },
    { key: 'RESTAURANT_TAGLINE', value: siteConfig.restaurant.tagline, category: 'restaurant' },
    { key: 'RESTAURANT_DESCRIPTION', value: siteConfig.restaurant.description, category: 'restaurant' },
    { key: 'RESTAURANT_PHONE', value: siteConfig.restaurant.phone, category: 'restaurant' },
    { key: 'RESTAURANT_EMAIL', value: siteConfig.restaurant.email, category: 'restaurant' },
    
    // Features
    { key: 'MODULE_EVENTS_ENABLED', value: siteConfig.features.events, category: 'modules' },
    { key: 'MODULE_GALLERY_ENABLED', value: siteConfig.features.gallery, category: 'modules' },
    { key: 'MODULE_RESERVATIONS_ENABLED', value: siteConfig.features.reservations, category: 'modules' },
    
    // Ordering
    { key: 'ORDERING_TAX_RATE', value: siteConfig.ordering?.taxRate ?? 0.13, category: 'ordering' },
    
    // Reservations
    { key: 'RESERVATIONS_MAX_SEATS', value: siteConfig.reservations?.maxSeatsPerSlot ?? 40, category: 'reservations' },
    
    // SEO
    { key: 'SEO_SITE_NAME', value: siteConfig.seo.siteName, category: 'seo' },
    { key: 'SEO_DEFAULT_TITLE', value: siteConfig.seo.defaultTitle, category: 'seo' },
  ]
  
  for (const setting of settings) {
    const existing = await db.collection('appSettings').findOne({ key: setting.key })
    
    if (!existing) {
      await db.collection('appSettings').insertOne({
        ...setting,
        description: `Initialized from siteConfig.ts`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      console.log(`✅ Initialized: ${setting.key}`)
    } else {
      console.log(`⏭️  Skipped (exists): ${setting.key}`)
    }
  }
  
  console.log('✅ Settings initialization complete!')
}

// Run if called directly
if (require.main === module) {
  initializeSettingsFromConfig()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('❌ Error:', error)
      process.exit(1)
    })
}
```

## Summary

The pattern is:
1. **Check DB first** - Admin-editable, can change without rebuild
2. **Fallback to siteConfig.ts** - Defaults for new installations
3. **Cache for performance** - Settings don't change frequently
4. **Type safety** - Keep TypeScript interfaces in siteConfig.ts
5. **Initialize from defaults** - Script to populate DB from siteConfig.ts

This gives you:
- ✅ Flexibility (admin can change settings)
- ✅ Reliability (always has defaults)
- ✅ Performance (cached reads)
- ✅ Type safety (TypeScript)
- ✅ No rebuilds needed (for settings changes)

