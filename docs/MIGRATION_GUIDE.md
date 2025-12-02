# Migration Guide: Using New Configuration Services

This guide shows how to migrate from direct `siteConfig` usage to the new configuration services.

## Overview

The new configuration services provide:
- ✅ DB-first pattern with `siteConfig.ts` fallback
- ✅ Caching for performance
- ✅ Admin-editable settings
- ✅ Type-safe access

## Quick Migration Examples

### Before (Direct siteConfig)

```typescript
import { siteConfig } from '@/config/siteConfig'

// In component
const restaurantName = siteConfig.restaurant.name
const phone = siteConfig.restaurant.phone
```

### After (Using Services)

```typescript
import { getRestaurantConfig } from '@/lib/restaurant-config-service'

// In server component or API route
const restaurant = await getRestaurantConfig()
const restaurantName = restaurant.name
const phone = restaurant.phone
```

## Detailed Migration Examples

### 1. Restaurant Information

**Before:**
```typescript
import { siteConfig } from '@/config/siteConfig'

export default function ContactPage() {
  const restaurant = siteConfig.restaurant
  
  return (
    <div>
      <h1>{restaurant.name}</h1>
      <p>{restaurant.phone}</p>
    </div>
  )
}
```

**After (Server Component):**
```typescript
import { getRestaurantConfig } from '@/lib/restaurant-config-service'

export default async function ContactPage() {
  const restaurant = await getRestaurantConfig()
  
  return (
    <div>
      <h1>{restaurant.name}</h1>
      <p>{restaurant.phone}</p>
    </div>
  )
}
```

**After (Client Component):**
```typescript
'use client'

import { useEffect, useState } from 'react'

export default function ContactPage() {
  const [restaurant, setRestaurant] = useState(null)
  
  useEffect(() => {
    fetch('/api/admin/settings/restaurant')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setRestaurant(data.restaurant)
        }
      })
  }, [])
  
  if (!restaurant) return <div>Loading...</div>
  
  return (
    <div>
      <h1>{restaurant.name}</h1>
      <p>{restaurant.phone}</p>
    </div>
  )
}
```

### 2. SEO Configuration

**Before:**
```typescript
import { siteConfig } from '@/config/siteConfig'

export const metadata = {
  title: siteConfig.seo.defaultTitle,
  description: siteConfig.seo.defaultDescription,
}
```

**After:**
```typescript
import { getSEOConfig } from '@/lib/seo-config-service'

export async function generateMetadata() {
  const seo = await getSEOConfig()
  
  return {
    title: seo.defaultTitle,
    description: seo.defaultDescription,
  }
}
```

### 3. Feature Toggles

**Before:**
```typescript
import { siteConfig } from '@/config/siteConfig'

if (siteConfig.features.events) {
  // Show events
}
```

**After:**
```typescript
import { isModuleEnabled } from '@/lib/module-settings-service'

if (await isModuleEnabled('events')) {
  // Show events
}
```

### 4. Ordering Configuration

**Before:**
```typescript
import { siteConfig } from '@/config/siteConfig'

const taxRate = siteConfig.ordering?.taxRate ?? 0.13
```

**After:**
```typescript
import { getOrderingConfig } from '@/lib/unified-config-service'

const ordering = await getOrderingConfig()
const taxRate = ordering.taxRate
```

## Service Reference

### Restaurant Configuration

```typescript
import { 
  getRestaurantConfig,
  getRestaurantName,
  getRestaurantPhone,
  getRestaurantEmail,
  getRestaurantAddress,
  // ... etc
} from '@/lib/restaurant-config-service'

// Get all restaurant config
const restaurant = await getRestaurantConfig()

// Get individual values
const name = await getRestaurantName()
const phone = await getRestaurantPhone()
```

### SEO Configuration

```typescript
import { 
  getSEOConfig,
  getPageSEO,
} from '@/lib/seo-config-service'

// Get all SEO config
const seo = await getSEOConfig()

// Get SEO for a specific page with overrides
const pageSEO = await getPageSEO({
  title: 'About Us',
  description: 'Learn about our restaurant...',
})
```

### Unified Configuration

```typescript
import { 
  getSiteConfig,
  getFeaturesConfig,
  getOrderingConfig,
  getReservationsConfig,
} from '@/lib/unified-config-service'

// Get everything at once
const config = await getSiteConfig()

// Get specific sections
const features = await getFeaturesConfig()
const ordering = await getOrderingConfig()
```

## When to Use Which Service

1. **Restaurant Info** → `restaurant-config-service.js`
   - Name, address, phone, email, tagline, description

2. **SEO** → `seo-config-service.js`
   - Site name, titles, descriptions, social media links

3. **Features/Modules** → `module-settings-service.js` (existing)
   - Feature toggles, module enable/disable

4. **Everything** → `unified-config-service.js`
   - When you need multiple config sections at once

## Performance Notes

- All services use **caching** (5-minute TTL)
- Cache is automatically invalidated on updates
- First read hits DB, subsequent reads use cache
- No performance impact for static content

## Gradual Migration Strategy

1. **Phase 1**: Keep existing `siteConfig` usage (still works as fallback)
2. **Phase 2**: Migrate new code to use services
3. **Phase 3**: Gradually migrate existing code
4. **Phase 4**: Eventually, `siteConfig.ts` becomes defaults-only

## Common Patterns

### Server Component Pattern
```typescript
// app/contact/page.js
import { getRestaurantConfig } from '@/lib/restaurant-config-service'

export default async function ContactPage() {
  const restaurant = await getRestaurantConfig()
  // Use restaurant data
}
```

### API Route Pattern
```typescript
// app/api/contact/route.js
import { getRestaurantConfig } from '@/lib/restaurant-config-service'

export async function POST(request) {
  const restaurant = await getRestaurantConfig()
  // Use restaurant data
}
```

### Client Component Pattern
```typescript
// components/ContactInfo.jsx
'use client'

import { useEffect, useState } from 'react'

export default function ContactInfo() {
  const [restaurant, setRestaurant] = useState(null)
  
  useEffect(() => {
    fetch('/api/admin/settings/restaurant')
      .then(res => res.json())
      .then(data => data.success && setRestaurant(data.restaurant))
  }, [])
  
  return restaurant ? <div>{restaurant.phone}</div> : null
}
```

## Admin API Endpoints

New endpoints for managing settings:

- `GET /api/admin/settings/restaurant` - Get restaurant settings
- `PUT /api/admin/settings/restaurant` - Update restaurant settings
- `GET /api/admin/settings/seo` - Get SEO settings
- `PUT /api/admin/settings/seo` - Update SEO settings

## Questions?

- Check `docs/CONFIGURATION_ARCHITECTURE.md` for architecture details
- Check `docs/CONFIG_EXAMPLE.md` for code examples
- All services have JSDoc comments for IntelliSense support

