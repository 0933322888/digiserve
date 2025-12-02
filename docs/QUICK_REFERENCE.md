# Configuration Services Quick Reference

## Quick Start

```bash
# Initialize database settings from siteConfig.ts
npm run init-settings
```

## Import Statements

```typescript
// Restaurant settings
import { getRestaurantConfig, getRestaurantName } from '@/lib/restaurant-config-service'

// SEO settings
import { getSEOConfig, getPageSEO } from '@/lib/seo-config-service'

// Unified config (everything)
import { getSiteConfig } from '@/lib/unified-config-service'

// Feature toggles
import { isModuleEnabled } from '@/lib/module-settings-service'

// Caching (if needed)
import { getSettingCached, invalidateCache } from '@/lib/cached-config-service'
```

## Common Patterns

### Server Component
```typescript
import { getRestaurantConfig } from '@/lib/restaurant-config-service'

export default async function Page() {
  const restaurant = await getRestaurantConfig()
  return <div>{restaurant.name}</div>
}
```

### API Route
```typescript
import { getRestaurantConfig } from '@/lib/restaurant-config-service'

export async function GET() {
  const restaurant = await getRestaurantConfig()
  return Response.json({ restaurant })
}
```

### Client Component
```typescript
'use client'
import { useEffect, useState } from 'react'

export default function Component() {
  const [restaurant, setRestaurant] = useState(null)
  
  useEffect(() => {
    fetch('/api/admin/settings/restaurant')
      .then(res => res.json())
      .then(data => data.success && setRestaurant(data.restaurant))
  }, [])
  
  return restaurant ? <div>{restaurant.name}</div> : null
}
```

## Available Services

| Service | Purpose | Key Functions |
|---------|---------|---------------|
| `restaurant-config-service` | Restaurant info | `getRestaurantConfig()`, `getRestaurantName()`, etc. |
| `seo-config-service` | SEO settings | `getSEOConfig()`, `getPageSEO()` |
| `unified-config-service` | All settings | `getSiteConfig()`, `getFeaturesConfig()`, etc. |
| `module-settings-service` | Feature toggles | `isModuleEnabled('events')` |
| `cached-config-service` | Caching layer | `getSettingCached()`, `invalidateCache()` |

## API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/admin/settings/restaurant` | GET | Get restaurant settings |
| `/api/admin/settings/restaurant` | PUT | Update restaurant settings |
| `/api/admin/settings/seo` | GET | Get SEO settings |
| `/api/admin/settings/seo` | PUT | Update SEO settings |

## See Also

- `docs/CONFIGURATION_ARCHITECTURE.md` - Architecture overview
- `docs/CONFIG_EXAMPLE.md` - Code examples
- `docs/MIGRATION_GUIDE.md` - Migration instructions
- `docs/IMPLEMENTATION_SUMMARY.md` - Complete implementation details

