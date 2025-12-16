/**
 * Migration script to update existing restaurants to new color structure
 * Run with: node scripts/migrate-theme-colors.mjs
 */

import { config } from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { readFileSync } from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables from .env.local
const envPath = resolve(__dirname, '../.env.local')
const envConfig = readFileSync(envPath, 'utf-8')
envConfig.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=')
    if (key && valueParts.length) {
        const value = valueParts.join('=').trim()
        process.env[key.trim()] = value.replace(/^["']|["']$/g, '')
    }
})

import mongoose from 'mongoose'
import { generateCompleteThemeColors } from '../lib/color-utils.js'

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI not found in environment variables')
    process.exit(1)
}

// Restaurant Schema (simplified for migration)
const RestaurantSchema = new mongoose.Schema({
    barId: String,
    name: String,
    theme: mongoose.Schema.Types.Mixed,
}, { strict: false })

const Restaurant = mongoose.models.Restaurant || mongoose.model('Restaurant', RestaurantSchema)

async function migrateThemeColors() {
    try {
        console.log('🔄 Connecting to MongoDB...')
        await mongoose.connect(MONGODB_URI)
        console.log('✅ Connected to MongoDB')

        console.log('\n📊 Fetching all restaurants...')
        const restaurants = await Restaurant.find({})
        console.log(`Found ${restaurants.length} restaurant(s)`)

        let migratedCount = 0
        let skippedCount = 0
        let errorCount = 0

        for (const restaurant of restaurants) {
            try {
                console.log(`\n🏪 Processing: ${restaurant.name} (${restaurant.barId})`)

                // Check if already migrated
                if (restaurant.theme?.colors?.light && restaurant.theme?.colors?.dark) {
                    console.log('  ⏭️  Already has new color structure, skipping')
                    skippedCount++
                    continue
                }

                // Get legacy colors or use defaults
                const primaryColor = restaurant.theme?.primaryColor || '#8B0000'
                const secondaryColor = restaurant.theme?.secondaryColor || '#F5F5DC'

                console.log(`  📝 Legacy colors: primary=${primaryColor}, secondary=${secondaryColor}`)

                // Generate complete color structure
                const colors = generateCompleteThemeColors(primaryColor, secondaryColor)
                console.log('  ✨ Generated new color structure')

                // Update restaurant
                restaurant.theme = restaurant.theme || {}
                restaurant.theme.colors = colors

                // Keep legacy fields for backward compatibility
                restaurant.theme.primaryColor = primaryColor
                restaurant.theme.secondaryColor = secondaryColor

                restaurant.updatedAt = new Date()

                await restaurant.save()
                console.log('  ✅ Migration successful')
                migratedCount++

            } catch (error) {
                console.error(`  ❌ Error migrating ${restaurant.name}:`, error.message)
                errorCount++
            }
        }

        console.log('\n' + '='.repeat(50))
        console.log('📈 Migration Summary:')
        console.log(`  ✅ Migrated: ${migratedCount}`)
        console.log(`  ⏭️  Skipped: ${skippedCount}`)
        console.log(`  ❌ Errors: ${errorCount}`)
        console.log('='.repeat(50))

    } catch (error) {
        console.error('\n❌ Migration failed:', error)
        process.exit(1)
    } finally {
        await mongoose.connection.close()
        console.log('\n👋 Disconnected from MongoDB')
    }
}

// Run migration
migrateThemeColors()
    .then(() => {
        console.log('\n✅ Migration completed successfully')
        process.exit(0)
    })
    .catch((error) => {
        console.error('\n❌ Migration failed:', error)
        process.exit(1)
    })
