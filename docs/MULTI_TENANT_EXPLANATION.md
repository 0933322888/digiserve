# Multi-Tenant vs Single-Tenant Explained

## Simple Analogy

Think of an apartment building:

- **Single-Tenant**: One person owns the entire building. Everything belongs to them.
- **Multi-Tenant**: Multiple people rent apartments. Each person has their own space, but they share the building infrastructure (elevators, hallways, etc.).

## In Your Restaurant Platform

### Single-Tenant (Current State)

```
┌─────────────────────────────────────┐
│   Your Application                  │
│                                     │
│   ┌─────────────────────────────┐  │
│   │  TRIO BISTRO                │  │
│   │  - All Orders               │  │
│   │  - All Reservations         │  │
│   │  - All Events               │  │
│   │  - All Settings             │  │
│   └─────────────────────────────┘  │
│                                     │
└─────────────────────────────────────┘
```

**Characteristics:**
- ✅ Simple - everything belongs to one restaurant
- ✅ No need to filter data by restaurant
- ✅ Global settings apply to everyone
- ❌ Can't support multiple restaurants

### Multi-Tenant (Analytics Currently)

```
┌─────────────────────────────────────┐
│   Your Application                  │
│                                     │
│   ┌─────────────┐  ┌─────────────┐ │
│   │ Restaurant A│  │ Restaurant B│ │
│   │             │  │             │ │
│   │ Analytics:  │  │ Analytics:  │ │
│   │ - 1,000     │  │ - 500       │ │
│   │   pageviews │  │   pageviews │ │
│   │ - 200       │  │ - 150       │ │
│   │   visitors  │  │   visitors  │ │
│   └─────────────┘  └─────────────┘ │
│                                     │
│   ┌─────────────┐                   │
│   │ Restaurant C│                   │
│   │             │                   │
│   │ Analytics:  │                   │
│   │ - 2,000     │                   │
│   │   pageviews │                   │
│   └─────────────┘                   │
└─────────────────────────────────────┘
```

**Characteristics:**
- ✅ Each restaurant sees only their own data
- ✅ Can support unlimited restaurants
- ✅ Data is isolated and secure
- ❌ More complex queries (need to filter by restaurantId)

## Current Implementation in Your Code

### Single-Tenant Models

These models don't have `restaurantId` - they assume one restaurant:

```javascript
// Event Schema - SINGLE-TENANT
Event: {
  id: "event-123",
  title: "Live Music Night",
  date: "2024-01-15"
  // ❌ No restaurantId - assumes only one restaurant
}

// Reservation Schema - SINGLE-TENANT  
Reservation: {
  id: "res-456",
  name: "John Doe",
  date: "2024-01-20"
  // ❌ No restaurantId - assumes only one restaurant
}

// AppSettings - SINGLE-TENANT
AppSettings: {
  key: "MODULE_EVENTS_ENABLED",
  value: true
  // ❌ Global setting for all restaurants
}
```

### Multi-Tenant Models

These models have `restaurantId` - they support multiple restaurants:

```javascript
// Restaurant Schema - MULTI-TENANT
Restaurant: {
  _id: ObjectId("..."),
  name: "TRIO BISTRO",
  slug: "triobistro",
  features: {
    analytics: true
  }
}

// AnalyticsEvent Schema - MULTI-TENANT
AnalyticsEvent: {
  restaurantId: ObjectId("..."), // ✅ Which restaurant this belongs to
  url: "/menu",
  timestamp: Date
  // ✅ Can have multiple restaurants' data in same database
}

// Orders (already has barId - partially multi-tenant ready)
Order: {
  barId: "bar_1", // ✅ Could be multi-tenant if you add restaurantId
  items: [...]
}
```

## Why Analytics is Multi-Tenant

Analytics was designed from the start to be multi-tenant because:

1. **Analytics services typically serve multiple customers**
   - Like Google Analytics, Plausible, etc.
   - Each customer has separate tracking

2. **Data isolation is critical**
   - Restaurant A shouldn't see Restaurant B's visitor data
   - Each restaurant needs its own dashboard

3. **Scalability**
   - Can easily add new restaurants without changing code
   - Each restaurant gets isolated tracking

## How It Works

### Creating a Restaurant

```javascript
// Create restaurant record
const restaurant = await Restaurant.create({
  name: "TRIO BISTRO",
  slug: "triobistro",
  features: {
    analytics: true
  }
})
// restaurant._id = ObjectId("507f1f77bcf86cd799439011")
```

### Tracking Analytics

```javascript
// Tracking script sends restaurantId
{
  restaurantId: "507f1f77bcf86cd799439011",
  url: "/menu",
  event: "pageview"
}

// Event is stored with restaurantId
AnalyticsEvent: {
  restaurantId: ObjectId("507f1f77bcf86cd799439011"),
  url: "/menu",
  timestamp: Date.now()
}
```

### Querying Analytics

```javascript
// Get analytics ONLY for this restaurant
const events = await AnalyticsEvent.find({
  restaurantId: restaurant._id
})

// Restaurant A only sees Restaurant A's data
// Restaurant B only sees Restaurant B's data
```

## When to Use Each

### Use Single-Tenant When:
- ✅ You only have one restaurant
- ✅ Settings apply globally to everyone
- ✅ Simpler code (no filtering needed)
- ✅ Faster queries (no restaurantId filtering)

### Use Multi-Tenant When:
- ✅ You want to support multiple restaurants
- ✅ Each restaurant needs separate data
- ✅ Data isolation and security is important
- ✅ You're building a SaaS platform

## Migration Path

If you want to make other features multi-tenant later:

1. **Add `restaurantId` to models**
   ```javascript
   EventSchema.add({ restaurantId: ObjectId })
   ```

2. **Update queries to filter by restaurantId**
   ```javascript
   // Before (single-tenant)
   const events = await Event.find({})
   
   // After (multi-tenant)
   const events = await Event.find({ restaurantId: currentRestaurant._id })
   ```

3. **Move settings to Restaurant model**
   ```javascript
   // Before: Global AppSettings
   MODULE_EVENTS_ENABLED: true
   
   // After: Per-restaurant
   Restaurant.features.events: true
   ```

## Summary

- **Multi-tenant** = Multiple restaurants, each with isolated data
- **Single-tenant** = One restaurant, all data is shared
- **Your analytics** = Multi-tenant (ready for multiple restaurants)
- **Your other features** = Single-tenant (assumes one restaurant)
- **This is fine** for now - you can migrate later if needed!

