# Web Analytics Module Setup Guide

This guide explains how to set up and use the web analytics module for tracking pageviews, unique visitors, referrers, UTM campaigns, devices, and countries.

## Overview

The analytics module is a lightweight, cookie-free, GDPR-compliant web analytics solution similar to Plausible Analytics. It tracks:

- **Pageviews** - Total number of page views
- **Unique Visitors** - Based on anonymized fingerprints (no cookies)
- **Referrers** - Traffic sources
- **UTM Parameters** - Campaign tracking
- **Devices** - Desktop, tablet, mobile breakdown
- **Countries** - Visitor locations (via timezone heuristics)
- **Top Pages** - Most visited pages

## Features

- ✅ Cookie-free (GDPR compliant)
- ✅ Bot detection and filtering
- ✅ IP anonymization (privacy-first)
- ✅ Multi-tenant support
- ✅ Feature toggle per restaurant
- ✅ Lightweight tracking script (~5KB)
- ✅ Real-time dashboard with charts

## Prerequisites

1. MongoDB database connection configured
2. Next.js application running
3. Recharts library installed (already in package.json)

## Setup Instructions

### 1. Environment Variables

Ensure your `.env.local` file has:

```env
MONGODB_URI=mongodb://localhost:27017/trio
# or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/trio
```

### 2. Create a Restaurant

The analytics module requires a Restaurant record in the database. You can create one via MongoDB or through a migration script.

#### Option A: Create via MongoDB

```javascript
// In MongoDB shell or Compass
db.restaurants.insertOne({
  name: "My Restaurant",
  slug: "my-restaurant", // Optional: URL-friendly identifier
  barId: "bar_1", // Optional: for backward compatibility
  features: {
    analytics: true,
    reservations: true,
    ordering: true,
    giftCards: true,
    events: true,
    gallery: true
  },
  settings: {},
  createdAt: new Date(),
  updatedAt: new Date()
})
```

#### Option B: Create via Migration Script

Create a script at `scripts/create-restaurant.mjs`:

```javascript
import mongoose from 'mongoose'
import { getRestaurantModel } from '../lib/db/models.js'
import connectDB from '../lib/db/mongodb-connection.js'

const MONGODB_URI = process.env.MONGODB_URI

async function createRestaurant() {
  await connectDB()
  const Restaurant = getRestaurantModel()

  const restaurant = await Restaurant.create({
    name: 'My Restaurant',
    slug: 'my-restaurant',
    barId: 'bar_1',
    features: {
      analytics: true,
    },
  })

  console.log('Restaurant created:', restaurant._id.toString())
  process.exit(0)
}

createRestaurant().catch(console.error)
```

Run it:
```bash
node scripts/create-restaurant.mjs
```

### 3. Get Your Restaurant ID

After creating a restaurant, note the `_id` (ObjectId) or use the `slug` or `barId` as the identifier.

### 4. Embed the Tracking Script

Add the tracking script to your website's HTML. You can add it to your main layout file (`app/layout.js`):

```jsx
// app/layout.js
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Other head elements */}
        <script
          defer
          src="/analytics/tracker.js"
          data-restaurant-id="YOUR_RESTAURANT_ID_OR_SLUG"
        ></script>
      </head>
      <body>{children}</body>
    </html>
  )
}
```

**Or for multi-tenant setups**, you can make it dynamic:

```jsx
// app/layout.js
export default function RootLayout({ children }) {
  const restaurantId = process.env.NEXT_PUBLIC_RESTAURANT_ID || 'default'

  return (
    <html lang="en">
      <head>
        <script
          defer
          src="/analytics/tracker.js"
          data-restaurant-id={restaurantId}
        ></script>
      </head>
      <body>{children}</body>
    </html>
  )
}
```

### 5. Verify Tracking

1. Visit your website
2. Navigate to `/admin/analytics` and click on the "Web Analytics" tab
3. You should see your pageview appear (may take a few seconds)

## Dashboard Access

Access the web analytics dashboard at:
- **URL**: `/admin/analytics`
- **Tab**: Click "Web Analytics" tab

The dashboard includes:

- **Stats Widgets**: Total visits, unique visitors, bounce rate, avg per visitor
- **Pageviews Over Time**: Line chart showing pageviews and unique visitors
- **Device Breakdown**: Pie chart of desktop/tablet/mobile
- **Top Pages**: List of most visited pages
- **Top Referrers**: List of traffic sources
- **Top Countries**: Bar chart of visitor countries
- **UTM Campaigns**: List of active UTM campaigns

## Filters

The dashboard supports filtering by:

- **Date Range**: Last 7 days, Last 30 days, or Custom range
- **Device**: Desktop, Tablet, Mobile, or All
- **UTM Campaign**: Filter by specific campaign
- **Referrer**: Filter by specific referrer

## API Endpoints

### Track Event

**POST** `/api/analytics/events`

Tracks a pageview event. Called automatically by the tracking script.

```json
{
  "restaurantId": "restaurant-id-or-slug",
  "event": "pageview",
  "url": "/page-path",
  "referrer": "https://example.com",
  "utm": {
    "source": "google",
    "medium": "cpc",
    "campaign": "summer-sale"
  },
  "device": "desktop",
  "country": "US",
  "fingerprint": "abc123",
  "timestamp": 1234567890
}
```

### Get Analytics Data

**GET** `/api/admin/analytics/web?restaurantId=YOUR_ID&range=7d`

Returns comprehensive analytics data for the dashboard.

Query Parameters:
- `restaurantId` (required): Restaurant ID, slug, or barId
- `range` (optional): `7d`, `30d`, or `custom`
- `startDate` (optional): ISO date string for custom range
- `endDate` (optional): ISO date string for custom range
- `device` (optional): Filter by device type
- `campaign` (optional): Filter by UTM campaign
- `referrer` (optional): Filter by referrer

## Disable Analytics for a Restaurant

To disable analytics for a specific restaurant:

```javascript
// Update restaurant features
await Restaurant.updateOne(
  { _id: restaurantId },
  { 
    $set: { 
      'features.analytics': false 
    } 
  }
)
```

When analytics is disabled, the tracking script will still send events but the API will reject them.

## Privacy & GDPR Compliance

### IP Anonymization

- IP addresses are anonymized (last octet removed for IPv4)
- Only hashed anonymized IPs are stored
- No raw IP addresses are stored

### Fingerprinting

- Uses a combination of user agent, screen resolution, timezone, and language
- Fingerprints are hashed with SHA-256 before storage
- No cookies used

### Bot Detection

Common bots are automatically filtered:
- Search engine crawlers (Google, Bing, etc.)
- Social media bots (Facebook, Twitter, LinkedIn)
- Monitoring tools
- Known bot patterns

## Performance Optimization

### Database Indexes

The following indexes are automatically created for optimal query performance:

```javascript
AnalyticsEventSchema.index({ restaurantId: 1, timestamp: -1 })
AnalyticsEventSchema.index({ restaurantId: 1, url: 1 })
AnalyticsEventSchema.index({ restaurantId: 1, fingerprint: 1 })
AnalyticsEventSchema.index({ restaurantId: 1, eventType: 1, timestamp: -1 })
AnalyticsEventSchema.index({ timestamp: -1 })
```

### Aggregation Pipelines

All analytics queries use MongoDB aggregation pipelines for:
- Fast data retrieval
- Efficient grouping and counting
- Minimal database load

## Troubleshooting

### No Data Appearing

1. **Check Restaurant ID**: Ensure the `data-restaurant-id` attribute matches a restaurant in the database
2. **Check Analytics Enabled**: Verify `features.analytics` is `true` for the restaurant
3. **Check Browser Console**: Look for JavaScript errors
4. **Check Network Tab**: Verify requests to `/api/analytics/events` are successful
5. **Check Bot Detection**: Ensure you're not being filtered as a bot

### Events Not Being Tracked

1. Check MongoDB connection
2. Check API route logs for errors
3. Verify restaurant exists in database
4. Check that analytics is enabled for the restaurant

### Performance Issues

1. Ensure MongoDB indexes are created
2. Consider archiving old data (events older than 90 days)
3. Use date range filters to limit query scope

## Data Retention

By default, events are stored indefinitely. To implement data retention:

```javascript
// Archive events older than 90 days
await AnalyticsEvent.deleteMany({
  timestamp: { $lt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) }
})
```

## Multi-Tenant Setup

For multi-tenant deployments:

1. Create a Restaurant record for each tenant
2. Use unique `slug` or `barId` for each restaurant
3. Embed the tracking script with the appropriate `data-restaurant-id`
4. Access analytics per restaurant in the admin dashboard

## Support

For issues or questions:
1. Check this documentation
2. Review the code comments in `/lib/analytics.js`
3. Check MongoDB logs for database errors
4. Check Next.js logs for API errors

## Next Steps

- Customize the dashboard widgets
- Add custom events beyond pageviews
- Set up automated reports
- Integrate with email notifications

