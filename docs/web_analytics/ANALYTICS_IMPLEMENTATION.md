# Analytics Module Implementation Summary

This document summarizes the complete analytics module implementation for the restaurant SaaS platform.

## Files Created

### 1. Database Models
- **File**: `lib/db/models.js` (updated)
  - Added `RestaurantSchema` - Multi-tenant restaurant model with feature toggles
  - Added `AnalyticsEventSchema` - Event tracking model with indexes
  - Exported `getRestaurantModel()` and `getAnalyticsEventModel()` functions

### 2. Tracking Script
- **File**: `analytics/tracker.js`
  - Client-side tracking script (cookie-free)
  - Generates anonymized fingerprints
  - Detects device type, country, UTM parameters
  - Sends events via sendBeacon API
  - SPA-friendly (tracks hash changes)

### 3. Tracking Script Route Handler
- **File**: `app/analytics/tracker.js/route.js`
  - Serves the tracking script with proper headers
  - CORS-enabled for cross-domain embedding
  - Cache control headers

### 4. Analytics Service Library
- **File**: `lib/analytics.js`
  - Aggregation pipeline functions:
    - `getTotalVisits()` - Total pageviews
    - `getUniqueVisitors()` - Unique visitor count
    - `getTopPages()` - Most visited pages
    - `getReferrers()` - Traffic sources
    - `getDeviceStats()` - Device breakdown
    - `getCountryStats()` - Country distribution
    - `getTimeseries()` - Pageviews over time
    - `getUTMStats()` - UTM campaign stats
    - `getRestaurant()` - Find restaurant by ID/slug/barId
    - `isAnalyticsEnabled()` - Check if analytics is enabled

### 5. Event Tracking API
- **File**: `app/api/analytics/events/route.js`
  - POST endpoint for event ingestion
  - Bot detection and filtering
  - IP anonymization (GDPR compliant)
  - Fingerprint hashing (SHA-256)
  - URL and referrer normalization
  - Restaurant validation
  - Feature toggle checking

### 6. Analytics Dashboard API
- **File**: `app/api/admin/analytics/web/route.js`
  - GET endpoint for dashboard data
  - Supports date range filtering
  - Device, campaign, referrer filters
  - Returns aggregated analytics data

### 7. Admin Dashboard
- **File**: `app/admin/analytics/web/page.jsx`
  - Complete dashboard with Recharts visualizations
  - Stats widgets (visits, unique visitors, bounce rate, avg per visitor)
  - Pageviews over time chart
  - Device breakdown pie chart
  - Top pages list
  - Top referrers list
  - Top countries bar chart
  - UTM campaigns list
  - Date range filters
  - Device filter
  - Responsive design

### 8. Analytics Page Integration
- **File**: `app/admin/analytics/page.js` (updated)
  - Added "Web Analytics" tab
  - Integrated web analytics dashboard

### 9. Helper Script
- **File**: `scripts/create-restaurant.mjs`
  - Creates default restaurant for analytics
  - Checks for existing restaurants
  - Provides setup instructions

### 10. Documentation
- **File**: `docs/ANALYTICS_SETUP.md`
  - Complete setup guide
  - API documentation
  - Troubleshooting guide
  - Privacy & GDPR compliance info

## Database Schema

### Restaurant Model
```javascript
{
  name: String,
  slug: String (unique, optional),
  barId: String (unique, optional), // Backward compatibility
  features: {
    analytics: Boolean (default: true),
    reservations: Boolean,
    ordering: Boolean,
    giftCards: Boolean,
    events: Boolean,
    gallery: Boolean
  },
  settings: Mixed,
  createdAt: Date,
  updatedAt: Date
}
```

### AnalyticsEvent Model
```javascript
{
  restaurantId: ObjectId (ref: Restaurant),
  eventType: String (default: 'pageview'),
  url: String,
  referrer: String (optional),
  utm: Mixed (optional),
  device: String (optional),
  country: String (optional),
  fingerprint: String (required, hashed),
  timestamp: Date (indexed),
  userAgent: String (optional),
  ipHash: String (optional, hashed)
}
```

### Indexes Created
- `restaurantId + timestamp` (compound, descending)
- `restaurantId + url`
- `restaurantId + fingerprint`
- `restaurantId + eventType + timestamp`
- `timestamp` (descending)

## Features Implemented

✅ **Multi-tenant Support**
- Each restaurant has its own analytics
- Feature toggle per restaurant
- Supports ID, slug, or barId lookup

✅ **Privacy & GDPR Compliance**
- Cookie-free tracking
- IP anonymization (last octet removed)
- Fingerprint hashing (SHA-256)
- No personal data stored

✅ **Bot Detection**
- Filters common bots automatically
- Silent rejection (returns success)
- Comprehensive bot pattern matching

✅ **Performance Optimized**
- MongoDB aggregation pipelines
- Efficient indexes
- Minimal database queries
- Cached connections

✅ **Real-time Dashboard**
- Live data visualization
- Multiple chart types
- Filtering capabilities
- Responsive design

✅ **Developer Friendly**
- Well-documented code
- TypeScript-ready (can be converted)
- Modular architecture
- Easy to extend

## API Endpoints

### Public Endpoints

1. **GET** `/analytics/tracker.js`
   - Serves tracking script
   - CORS enabled
   - Cached for 1 hour

2. **POST** `/api/analytics/events`
   - Tracks pageview events
   - Validates restaurant
   - Filters bots
   - Anonymizes data

### Admin Endpoints (Protected)

3. **GET** `/api/admin/analytics/web`
   - Returns analytics dashboard data
   - Supports filtering
   - Requires authentication

## Dashboard Features

### Stats Widgets
- Total Visits
- Unique Visitors
- Bounce Rate (calculated)
- Average Pageviews per Visitor

### Charts & Visualizations
- Pageviews Over Time (Line Chart)
- Unique Visitors Over Time (Line Chart)
- Device Breakdown (Pie Chart)
- Top Countries (Bar Chart)

### Lists
- Top Pages (with visit counts)
- Top Referrers (with visit counts)
- UTM Campaigns (with visit counts)

### Filters
- Date Range (7d, 30d, Custom)
- Device Type (Desktop, Tablet, Mobile, All)
- UTM Campaign
- Referrer

## Setup Steps

1. **Create Restaurant**
   ```bash
   node scripts/create-restaurant.mjs
   ```

2. **Add Tracking Script**
   ```jsx
   <script 
     defer 
     src="/analytics/tracker.js" 
     data-restaurant-id="RESTAURANT_ID">
   </script>
   ```

3. **Access Dashboard**
   - Navigate to `/admin/analytics`
   - Click "Web Analytics" tab

## Testing

1. Visit your website
2. Navigate to different pages
3. Check dashboard at `/admin/analytics` → Web Analytics tab
4. Verify data appears (may take a few seconds)

## Performance Considerations

- **Indexes**: All queries use indexed fields
- **Aggregations**: Optimized MongoDB pipelines
- **Caching**: Script cached for 1 hour
- **Batching**: Events sent via sendBeacon (non-blocking)
- **Bot Filtering**: Reduces unnecessary database writes

## Security

- ✅ Bot detection prevents spam
- ✅ IP anonymization protects privacy
- ✅ Fingerprint hashing (SHA-256)
- ✅ Input validation and sanitization
- ✅ Restaurant validation
- ✅ Feature toggle enforcement

## Future Enhancements

Potential additions:
- Custom events beyond pageviews
- Real-time visitor count
- Goal tracking
- Funnel analysis
- Export data (CSV/JSON)
- Email reports
- API rate limiting
- Data retention policies
- Archive old events

## Dependencies

All dependencies already in package.json:
- `mongoose` - MongoDB ODM
- `recharts` - Chart library
- `next` - Next.js framework

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Uses standard Web APIs (sendBeacon, fetch)
- Graceful degradation for older browsers

## License

Part of the restaurant SaaS platform.

