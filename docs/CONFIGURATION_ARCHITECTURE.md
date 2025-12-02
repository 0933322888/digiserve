# Site Configuration Architecture Recommendation

## Current State Analysis

Your application currently uses a **hybrid approach**:

1. **Static Configuration (`siteConfig.ts`):**
   - Restaurant information (name, address, contact)
   - Feature toggles (events, gallery, reservations, giftCards)
   - Ordering configuration (pickup, delivery, dineIn, taxRate, delivery zones)
   - Reservation settings (maxSeatsPerSlot, slotDurationMinutes)
   - SEO metadata
   - API configuration (Stripe keys, email settings)
   - Module settings (social posting)

2. **Database Configuration (`appSettings` collection):**
   - Module enable/disable flags (with fallback to siteConfig)
   - Ordering business hours and tax rate (with fallback)
   - Reservation configuration (with fallback)
   - Social posting API keys (encrypted)

3. **Pattern Used:**
   - **DB-first with siteConfig fallback** - Check database first, use siteConfig if not found
   - Implemented in: `module-settings-service.js`, `ordering-config/route.js`, etc.

## Recommended Architecture

### **Hybrid Approach (Recommended) ✅**

Keep both, but with clear separation of concerns:

#### **Keep in `siteConfig.ts` (Static/Build-time):**

1. **Type Definitions** (always keep)
   - TypeScript interfaces for type safety
   - Schema definitions

2. **Default/Initial Values** (always keep)
   - Fallback values if DB is empty
   - Development/testing defaults
   - New installations get these values

3. **Build-time Constants** (static files)
   - Restaurant basic info (rarely changes)
   - SEO default values
   - Static feature flags (for initial setup)

4. **Environment Variables** (already using)
   - API keys (Stripe, OpenAI)
   - Sensitive credentials

#### **Move to Database (Dynamic/Runtime):**

1. **Frequently Changed Settings**
   - ✅ Business hours (already moved)
   - ✅ Tax rates (already moved)
   - ✅ Delivery zones and fees
   - ✅ Reservation capacity and slot duration
   - ✅ Feature toggles (enable/disable modules)

2. **Multi-restaurant Settings** (if needed)
   - Restaurant-specific configurations
   - Per-location settings

3. **User-customizable Content**
   - SEO metadata (title, description)
   - Social media links
   - Contact information (if multiple locations)

4. **Operational Settings**
   - Order minimums
   - Delivery fees
   - Special hours/holidays

## Implementation Strategy

### Phase 1: Maintain Current Hybrid (Low Risk)

**Status:** You're already here! Just needs refinement.

**Actions:**
1. ✅ Keep siteConfig.ts as the source of truth for defaults
2. ✅ Keep DB-first pattern for admin-editable settings
3. ✅ Add clear documentation in siteConfig.ts about which settings are editable via admin UI

### Phase 2: Migrate More Settings to DB (Medium Priority)

**Candidates for migration:**

```typescript
// Move to DB:
- features.* (events, gallery, reservations, giftCards)
- ordering.deliverySettings (delivery zones, fees)
- reservations.* (all reservation config)
- seo.* (most SEO settings can be admin-editable)
- restaurant.address (if multiple locations)
- restaurant.phone/email (if they change)
```

**Keep in siteConfig.ts:**
```typescript
- restaurant.name (rarely changes, part of branding)
- restaurant.tagline (rarely changes)
- Type definitions
- Default values for migrations
```

### Phase 3: Create Unified Configuration Service (Long-term)

Create a single service that:
1. Reads from DB (cached)
2. Falls back to siteConfig.ts
3. Provides type-safe access
4. Handles migrations/initialization

## Best Practices

### ✅ DO:

1. **Use siteConfig.ts for:**
   - Type definitions
   - Default values
   - Build-time constants
   - Development defaults

2. **Use Database for:**
   - Admin-editable settings
   - Frequently changed values
   - Per-environment differences
   - Multi-tenant configurations

3. **Always provide fallbacks:**
   ```typescript
   const value = await getSetting('KEY') ?? siteConfig.defaultValue
   ```

4. **Cache database reads:**
   - Settings don't change often
   - Add caching layer (Redis/memory cache)

5. **Type safety:**
   - Keep TypeScript interfaces in siteConfig.ts
   - Use runtime validation for DB values

### ❌ DON'T:

1. **Don't duplicate data:**
   - Don't store same value in both places
   - Use DB-first pattern with siteConfig fallback

2. **Don't store secrets in siteConfig.ts:**
   - Use environment variables
   - Store encrypted in DB if needed

3. **Don't require rebuilds for settings changes:**
   - Admin-editable settings should be in DB
   - Only rebuild for code changes

4. **Don't lose defaults:**
   - Always provide siteConfig fallback
   - Initialize DB with siteConfig values on first run

## Migration Plan Example

### Example: Moving `features.events` to DB

**Before:**
```typescript
// siteConfig.ts
features: {
  events: true, // Static
}

// Usage
if (siteConfig.features.events) { ... }
```

**After:**
```typescript
// siteConfig.ts (keep as default)
features: {
  events: true, // Default for new installations
}

// lib/feature-service.js
export async function isFeatureEnabled(featureKey) {
  const dbValue = await getSetting(`FEATURE_${featureKey.toUpperCase()}_ENABLED`)
  if (dbValue !== null) return dbValue === true
  
  // Fallback to siteConfig
  const path = `features.${featureKey}`
  return getNestedValue(siteConfig, path) ?? false
}

// Usage
if (await isFeatureEnabled('events')) { ... }
```

## Performance Considerations

1. **Caching:**
   ```typescript
   // Cache settings for 5 minutes
   const cache = new Map()
   const TTL = 5 * 60 * 1000
   
   async function getSettingCached(key) {
     const cached = cache.get(key)
     if (cached && Date.now() - cached.timestamp < TTL) {
       return cached.value
     }
     const value = await getSetting(key)
     cache.set(key, { value, timestamp: Date.now() })
     return value
   }
   ```

2. **Build-time vs Runtime:**
   - Static values in siteConfig.ts = no runtime DB query
   - Dynamic values in DB = one query (cached)

## Recommendation Summary

**For Your Current Use Case:**

✅ **Keep the hybrid approach** you're already using:
- siteConfig.ts for defaults and type safety
- Database for admin-editable settings
- DB-first pattern with siteConfig fallback

**Gradual Migration:**
1. Keep current structure (it's working well!)
2. As you add admin UI for new settings, move them to DB
3. Keep siteConfig.ts as the default/fallback source
4. Consider adding a settings migration script to initialize DB from siteConfig.ts

**Special Cases:**
- **Restaurant name/address:** Keep in siteConfig.ts (rarely changes, part of branding)
- **Business hours:** ✅ Already in DB (good!)
- **Feature toggles:** ✅ Already hybrid (good!)
- **SEO metadata:** Could move to DB if admins need to edit frequently
- **API keys:** ✅ Already using env vars (best practice!)

## Next Steps

1. **Short-term:** Document which settings are DB vs file-based
2. **Medium-term:** Add admin UI for settings currently only in siteConfig.ts
3. **Long-term:** Create unified config service with caching

