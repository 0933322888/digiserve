/**
 * Create Restaurant Script
 * 
 * Creates a restaurant record in the database for analytics tracking
 * 
 * Usage: node scripts/create-restaurant.mjs
 */

import mongoose from 'mongoose'
import { getRestaurantModel } from '../lib/db/models.js'

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  console.error('Error: MONGODB_URI environment variable is not set')
  console.error('Please set it in your .env.local file')
  process.exit(1)
}

async function createRestaurant() {
  try {
    console.log('Connecting to MongoDB...')
    await mongoose.connect(MONGODB_URI)
    console.log('Connected to MongoDB\n')

    const Restaurant = getRestaurantModel()

    // Check if a default restaurant already exists (by slug or barId)
    const existing = await Restaurant.findOne({
      $or: [
        { slug: 'triobistro' },
        { barId: 'bar_1' }
      ]
    })
    if (existing) {
      console.log('Default restaurant already exists:')
      console.log(`  ID: ${existing._id}`)
      console.log(`  Name: ${existing.name}`)
      console.log(`  Slug: ${existing.slug || 'N/A'}`)
      console.log(`  Analytics Enabled: ${existing.features?.analytics !== false}`)
      process.exit(0)
    }

    // Create default restaurant
    // Note: Other features (events, gallery, reservations, etc.) are managed via AppSettings
    // Only analytics is stored here as it's multi-tenant specific
    const restaurant = await Restaurant.create({
      name: 'TRIO BISTRO AND LOUNGE',
      slug: 'triobistro',
      barId: 'bar_1',
      features: {
        analytics: true, // Only analytics is restaurant-specific (multi-tenant)
      },
      settings: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    console.log('✅ Restaurant created successfully!')
    console.log('\nRestaurant Details:')
    console.log(`  ID: ${restaurant._id}`)
    console.log(`  Name: ${restaurant.name}`)
    console.log(`  Slug: ${restaurant.slug}`)
    console.log(`  Bar ID: ${restaurant.barId}`)
    console.log(`  Analytics Enabled: ${restaurant.features?.analytics}`)
    console.log('\n📋 Next Steps:')
    console.log('1. Add the tracking script to your website:')
    console.log(`   <script defer src="/analytics/tracker.js" data-restaurant-id="${restaurant._id}"></script>`)
    console.log(`   Or use slug: data-restaurant-id="${restaurant.slug}"`)
    console.log('2. Visit your website to generate analytics events')
    console.log('3. Check the dashboard at /admin/analytics → Web Analytics tab')
  } catch (error) {
    console.error('Error creating restaurant:', error)
    process.exit(1)
  } finally {
    await mongoose.disconnect()
    console.log('\nDisconnected from MongoDB')
  }
}

createRestaurant()

