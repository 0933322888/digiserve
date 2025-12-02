/**
 * Initialize Database Settings from siteConfig.ts
 * 
 * This script populates the database with default values from siteConfig.ts
 * Run this when setting up a new installation or to sync defaults.
 * 
 * Usage:
 *   node scripts/initialize-settings.js
 *   npm run init-settings
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load environment variables from .env.local FIRST, before any other imports
// This is critical because mongodb-connection.js checks for MONGODB_URI at module load time
const envPath = path.join(__dirname, '..', '.env.local')
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, 'utf8')
  envFile.split('\n').forEach(line => {
    const match = line.match(/^([^=:#]+)=(.*)$/)
    if (match) {
      const key = match[1].trim()
      const value = match[2].trim().replace(/^["']|["']$/g, '')
      if (!process.env[key]) {
        process.env[key] = value
      }
    }
  })
}

// We'll use dynamic imports for db modules after env is loaded
let db, connectDB

/**
 * Load and parse siteConfig.ts file
 * Since Node.js can't import TypeScript directly, we read and parse it
 */
function loadSiteConfig() {
  const configPath = path.join(__dirname, '..', 'config', 'siteConfig.ts')
  
  if (!fs.existsSync(configPath)) {
    throw new Error(`siteConfig.ts not found at: ${configPath}`)
  }
  
  const configContent = fs.readFileSync(configPath, 'utf8')
  
  // Find the siteConfig object - look for "export const siteConfig" and extract the object
  const startMarker = 'export const siteConfig'
  const startIndex = configContent.indexOf(startMarker)
  
  if (startIndex === -1) {
    throw new Error('Could not find siteConfig export in TypeScript file')
  }
  
  // Find the opening brace after the equals sign
  let braceIndex = configContent.indexOf('{', startIndex)
  if (braceIndex === -1) {
    throw new Error('Could not find opening brace for siteConfig object')
  }
  
  // Extract the object by counting braces
  let braceCount = 0
  let inString = false
  let stringChar = null
  let i = braceIndex
  
  for (; i < configContent.length; i++) {
    const char = configContent[i]
    const prevChar = i > 0 ? configContent[i - 1] : ''
    
    // Handle string literals
    if ((char === '"' || char === "'" || char === '`') && prevChar !== '\\') {
      if (!inString) {
        inString = true
        stringChar = char
      } else if (char === stringChar) {
        inString = false
        stringChar = null
      }
      continue
    }
    
    if (inString) continue
    
    // Count braces
    if (char === '{') {
      braceCount++
    } else if (char === '}') {
      braceCount--
      if (braceCount === 0) {
        // Found the closing brace
        break
      }
    }
  }
  
  if (braceCount !== 0) {
    throw new Error('Could not find matching closing brace for siteConfig object')
  }
  
  let configStr = configContent.substring(braceIndex, i + 1)
  
  // Remove TypeScript-specific syntax carefully
  // First, remove comments (but be careful with strings)
  configStr = configStr
    // Remove block comments (/* ... */)
    .replace(/\/\*[\s\S]*?\*\//g, '')
    // Remove single-line comments (// ...) but not inside strings
    // Match // followed by non-quote chars until newline or end
    .replace(/\/\/[^\n'"]*(?:\n|$)/g, '\n')
  
  // Replace ?? with || for compatibility (do this before other replacements)
  configStr = configStr.replace(/\?\?/g, '||')
  
  // Remove optional property markers from keys (?: -> :)
  configStr = configStr.replace(/\?\s*:/g, ':')
  
  // Note: The config object itself doesn't have type annotations,
  // so we don't need to remove them. The interface has type annotations,
  // but those are separate from the actual object values.
  
  try {
    // Use Function constructor for safer evaluation
    // Pass process so environment variables work
    const evalConfig = new Function('process', `return ${configStr}`)
    return evalConfig(process)
  } catch (error) {
    console.error('Error parsing siteConfig:', error.message)
    console.error('Error details:', error)
    // Write the problematic config to a temp file for debugging
    const debugPath = path.join(__dirname, '..', 'temp-config-debug.js')
    fs.writeFileSync(debugPath, `// Debug output\nconst config = ${configStr}\nmodule.exports = config`)
    console.error(`Debug output written to: ${debugPath}`)
    throw new Error(`Failed to parse siteConfig: ${error.message}`)
  }
}

const siteConfig = loadSiteConfig()

/**
 * Initialize database modules (must be called after env is loaded)
 */
async function initDBModules() {
  if (!db || !connectDB) {
    const dbModule = await import('../lib/db/index.js')
    const connectModule = await import('../lib/db/mongodb-connection.js')
    db = dbModule.db
    connectDB = connectModule.default
  }
  return { db, connectDB }
}

/**
 * Initialize database settings from siteConfig.ts
 * Only creates settings that don't already exist (non-destructive)
 */
export async function initializeSettingsFromConfig() {
  // Ensure DB modules are loaded
  const { db: dbInstance, connectDB: connectDBInstance } = await initDBModules()
  
  // Use the loaded instances
  const dbToUse = dbInstance
  const connectDBToUse = connectDBInstance
  console.log('🚀 Initializing settings from siteConfig.ts...\n')

  const settings = [
    // Restaurant Information
    {
      key: 'RESTAURANT_NAME',
      value: siteConfig.restaurant.name,
      category: 'restaurant',
      description: 'Restaurant name',
    },
    {
      key: 'RESTAURANT_TAGLINE',
      value: siteConfig.restaurant.tagline,
      category: 'restaurant',
      description: 'Restaurant tagline',
    },
    {
      key: 'RESTAURANT_DESCRIPTION',
      value: siteConfig.restaurant.description,
      category: 'restaurant',
      description: 'Restaurant description',
    },
    {
      key: 'RESTAURANT_PHONE',
      value: siteConfig.restaurant.phone,
      category: 'restaurant',
      description: 'Restaurant phone number',
    },
    {
      key: 'RESTAURANT_EMAIL',
      value: siteConfig.restaurant.email,
      category: 'restaurant',
      description: 'Restaurant email address',
    },
    {
      key: 'RESTAURANT_ADDRESS',
      value: siteConfig.restaurant.address,
      category: 'restaurant',
      description: 'Restaurant address',
    },

    // Feature Modules
    {
      key: 'MODULE_EVENTS_ENABLED',
      value: siteConfig.features.events,
      category: 'modules',
      description: 'Events module enabled/disabled',
    },
    {
      key: 'MODULE_GALLERY_ENABLED',
      value: siteConfig.features.gallery,
      category: 'modules',
      description: 'Gallery module enabled/disabled',
    },
    {
      key: 'MODULE_RESERVATIONS_ENABLED',
      value: siteConfig.features.reservations,
      category: 'modules',
      description: 'Reservations module enabled/disabled',
    },
    {
      key: 'MODULE_GIFTCARDS_ENABLED',
      value: siteConfig.features.giftCards,
      category: 'modules',
      description: 'Gift Cards module enabled/disabled',
    },

    // Ordering Configuration
    {
      key: 'MODULE_ORDERING_ENABLED',
      value: siteConfig.ordering?.enabled ?? false,
      category: 'modules',
      description: 'Ordering system enabled/disabled',
    },
    {
      key: 'MODULE_ORDERING_PICKUP_ENABLED',
      value: siteConfig.ordering?.pickup ?? false,
      category: 'modules',
      description: 'Ordering pickup option enabled/disabled',
    },
    {
      key: 'MODULE_ORDERING_DELIVERY_ENABLED',
      value: siteConfig.ordering?.delivery ?? false,
      category: 'modules',
      description: 'Ordering delivery option enabled/disabled',
    },
    {
      key: 'MODULE_ORDERING_DINEIN_ENABLED',
      value: siteConfig.ordering?.dineIn ?? false,
      category: 'modules',
      description: 'Ordering dine-in option enabled/disabled',
    },
    {
      key: 'ORDERING_TAX_RATE',
      value: siteConfig.ordering?.taxRate ?? 0.13,
      category: 'ordering',
      description: 'Tax rate for orders (0-1, e.g., 0.13 for 13%)',
    },
    {
      key: 'ORDERING_DELIVERY_SETTINGS',
      value: siteConfig.ordering?.deliverySettings ?? null,
      category: 'ordering',
      description: 'Delivery settings (zones, fees, etc.)',
    },
    {
      key: 'ORDERING_BUSINESS_HOURS',
      value: siteConfig.businessHours ?? {},
      category: 'ordering',
      description: 'Business hours for ordering and reservations',
    },

    // Reservations Configuration
    {
      key: 'RESERVATIONS_MAX_SEATS_PER_SLOT',
      value: siteConfig.reservations?.maxSeatsPerSlot ?? 40,
      category: 'reservations',
      description: 'Maximum seats per reservation slot',
    },
    {
      key: 'RESERVATIONS_SLOT_DURATION_MINUTES',
      value: siteConfig.reservations?.slotDurationMinutes ?? 120,
      category: 'reservations',
      description: 'Reservation slot duration in minutes',
    },

    // SEO Configuration
    {
      key: 'SEO_SITE_NAME',
      value: siteConfig.seo.siteName,
      category: 'seo',
      description: 'SEO site name',
    },
    {
      key: 'SEO_DEFAULT_TITLE',
      value: siteConfig.seo.defaultTitle,
      category: 'seo',
      description: 'SEO default title',
    },
    {
      key: 'SEO_DEFAULT_DESCRIPTION',
      value: siteConfig.seo.defaultDescription,
      category: 'seo',
      description: 'SEO default description',
    },
    {
      key: 'SEO_DEFAULT_IMAGE',
      value: siteConfig.seo.defaultImage,
      category: 'seo',
      description: 'SEO default image URL',
    },
    {
      key: 'SEO_TWITTER_HANDLE',
      value: siteConfig.seo.twitterHandle || null,
      category: 'seo',
      description: 'Twitter handle',
    },
    {
      key: 'SEO_FACEBOOK_URL',
      value: siteConfig.seo.facebookUrl || null,
      category: 'seo',
      description: 'Facebook page URL',
    },
    {
      key: 'SEO_INSTAGRAM_URL',
      value: siteConfig.seo.instagramUrl || null,
      category: 'seo',
      description: 'Instagram profile URL',
    },

    // API Configuration
    {
      key: 'MODULE_EMAIL_ENABLED',
      value: siteConfig.api.enableEmail,
      category: 'modules',
      description: 'Email notifications enabled/disabled',
    },
    {
      key: 'MODULE_STRIPE_ENABLED',
      value: siteConfig.api.enableStripe,
      category: 'modules',
      description: 'Stripe payments enabled/disabled',
    },

    // Social Posting Module
    {
      key: 'MODULE_SOCIALPOSTING_ENABLED',
      value: siteConfig.modules?.socialPosting?.enabled ?? false,
      category: 'modules',
      description: 'Social media posting module enabled/disabled',
    },
  ]

  let created = 0
  let skipped = 0
  let errors = 0

  for (const setting of settings) {
    try {
      const existing = await dbToUse.collection('appSettings').findOne({ key: setting.key })

      if (!existing) {
        await dbToUse.collection('appSettings').insertOne({
          ...setting,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          updatedBy: 'system',
        })
        console.log(`✅ Created: ${setting.key}`)
        created++
      } else {
        console.log(`⏭️  Skipped (exists): ${setting.key}`)
        skipped++
      }
    } catch (error) {
      console.error(`❌ Error with ${setting.key}:`, error.message)
      errors++
    }
  }

  console.log('\n' + '='.repeat(50))
  console.log('📊 Summary:')
  console.log(`   ✅ Created: ${created}`)
  console.log(`   ⏭️  Skipped: ${skipped}`)
  console.log(`   ❌ Errors: ${errors}`)
  console.log('='.repeat(50))

  if (errors === 0) {
    console.log('\n✨ Settings initialization complete!')
    console.log(
      '💡 Note: Existing settings were not modified. This script only creates new settings.'
    )
  } else {
    console.log('\n⚠️  Some errors occurred. Please review the output above.')
    process.exit(1)
  }
}

// Run if called directly
const isMainModule = import.meta.url === `file://${process.argv[1]}` || 
                     process.argv[1]?.endsWith('initialize-settings.js') ||
                     process.argv[1]?.includes('initialize-settings.js')

if (isMainModule) {
  // Connect to database first, then run initialization
  initDBModules()
    .then(({ connectDB: connectDBInstance }) => connectDBInstance())
    .then(() => initializeSettingsFromConfig())
    .then(() => {
      console.log('\n✅ Done!')
      process.exit(0)
    })
    .catch(error => {
      console.error('\n❌ Fatal error:', error)
      process.exit(1)
    })
}

// Export is already done above with export async function

