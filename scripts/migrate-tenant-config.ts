/**
 * Migration Script: Migrate Tenant Configuration
 * 
 * This script updates existing Restaurant (Tenant) records to include the new configuration fields
 * using values from the tenant configuration registry.
 * 
 * Usage:
 *   npx ts-node scripts/migrate-tenant-config.ts --tenant=<barId>
 * 
 * Options:
 *   --dry-run    Show what would be updated without making changes
 *   --tenant=<id>  Specific tenant to migrate (required)
 */

import mongoose from 'mongoose'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { tenants } from '../config/tenants'
import { SiteConfig } from '../config/siteConfig'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load environment variables from .env.local manually
try {
    const envPath = path.resolve(__dirname, '../.env.local')
    if (fs.existsSync(envPath)) {
        const envConfig = fs.readFileSync(envPath, 'utf8')
        envConfig.split('\n').forEach(line => {
            const [key, value] = line.split('=')
            if (key && value) {
                process.env[key.trim()] = value.trim()
            }
        })
    }
} catch (error) {
    console.warn('⚠️ Could not load .env.local:', error)
}

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI is not defined in environment or .env.local')
    process.exit(1)
}

// Minimal Restaurant Schema
const RestaurantSchema = new mongoose.Schema(
    {
        barId: { type: String, required: true, unique: true },
        name: { type: String },
        ordering: mongoose.Schema.Types.Mixed,
        businessHours: mongoose.Schema.Types.Mixed,
        social: mongoose.Schema.Types.Mixed,
        contact: mongoose.Schema.Types.Mixed,
        seo: mongoose.Schema.Types.Mixed,
        features: mongoose.Schema.Types.Mixed,
    },
    { strict: false } // Allow other fields
)

const Restaurant = mongoose.models.Restaurant || mongoose.model('Restaurant', RestaurantSchema)

async function migrateTenantConfig() {
    const args = process.argv.slice(2)
    const dryRun = args.includes('--dry-run')
    const tenantArg = args.find(arg => arg.startsWith('--tenant='))
    const targetTenantId = tenantArg ? tenantArg.split('=')[1] : null

    console.log('🔄 Tenant Configuration Migration Script')
    console.log('======================================')
    console.log(`Mode: ${dryRun ? 'DRY RUN (no changes will be made)' : 'LIVE'}`)
    console.log(`Target Tenant: ${targetTenantId || 'ALL (Not supported yet, please specify --tenant)'}`)
    console.log('')

    if (!targetTenantId) {
        console.error('❌ Please specify a tenant to migrate using --tenant=<barId>')
        console.log('Available tenants in registry:', Object.keys(tenants).join(', '))
        process.exit(1)
    }

    const config = tenants[targetTenantId]
    if (!config) {
        console.error(`❌ Configuration not found for tenant: ${targetTenantId}`)
        console.log('Available tenants in registry:', Object.keys(tenants).join(', '))
        process.exit(1)
    }

    try {
        await mongoose.connect(MONGODB_URI as string)
        console.log('✅ Connected to MongoDB')

        // Find the restaurant
        const tenant = await Restaurant.findOne({ barId: targetTenantId })

        if (!tenant) {
            console.error(`❌ Tenant not found in database: ${targetTenantId}`)
            process.exit(1)
        }

        console.log(`\nProcessing tenant: ${tenant.name} (${tenant.barId})`)

        const updates = {
            ordering: config.ordering,
            businessHours: config.businessHours,
            social: {
                facebook: config.seo.facebookUrl,
                instagram: config.seo.instagramUrl,
                twitter: config.seo.twitterHandle,
            },
            contact: {
                phone: config.restaurant.phone,
                email: config.restaurant.email,
                address: config.restaurant.address,
            },
            seo: {
                title: config.seo.defaultTitle,
                description: config.seo.defaultDescription,
                image: config.seo.defaultImage,
            },
            features: {
                ...tenant.features,
                enableEmail: config.api.enableEmail,
                enableStripe: config.api.enableStripe,
            }
        }

        if (dryRun) {
            console.log('  - Would update with new configuration fields from registry')
            console.log('  - Config Source:', targetTenantId)
        } else {
            await Restaurant.updateOne({ _id: tenant._id }, { $set: updates })
            console.log('  - Updated successfully')
        }

        console.log(`\n✅ Migration complete!`)

    } catch (error) {
        console.error('❌ Migration failed:', error)
        process.exit(1)
    } finally {
        await mongoose.disconnect()
        process.exit(0)
    }
}

// Run the migration
migrateTenantConfig()
