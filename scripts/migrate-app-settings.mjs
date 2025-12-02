import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load environment variables from .env.local
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

// Use dynamic import for Next.js modules
let connectDB
let models

async function initModules() {
  if (!connectDB) {
    const mongodbConnection = await import('../lib/db/mongodb-connection.js')
    connectDB = mongodbConnection.default
  }
  if (!models) {
    models = await import('../lib/db/models.js')
  }
}

async function main() {
  console.log('Migrating app settings from environment variables to MongoDB...')
  console.log('='.repeat(60))

  try {
    await initModules()
    await connectDB()
    console.log('✓ Connected to MongoDB')

    const Model = models.getAppSettingsModel()

    // Check if settings already exist
    const existingCount = await Model.countDocuments()
    if (existingCount > 0) {
      console.log(`  Collection appSettings already has ${existingCount} documents.`)
      console.log('  Skipping migration to avoid overwriting existing settings.')
      return
    }

    const settingsToMigrate = []

    // Facebook App Credentials
    if (process.env.FACEBOOK_APP_ID) {
      settingsToMigrate.push({
        key: 'FACEBOOK_APP_ID',
        value: process.env.FACEBOOK_APP_ID,
        description: 'Facebook App ID for social media posting',
        category: 'social',
      })
    }

    if (process.env.FACEBOOK_APP_SECRET) {
      settingsToMigrate.push({
        key: 'FACEBOOK_APP_SECRET',
        value: process.env.FACEBOOK_APP_SECRET,
        description: 'Facebook App Secret for social media posting',
        category: 'social',
        encrypted: true,
      })
    }

    // OpenAI API Key
    if (process.env.OPENAI_API_KEY) {
      settingsToMigrate.push({
        key: 'OPENAI_API_KEY',
        value: process.env.OPENAI_API_KEY,
        description: 'OpenAI API Key for AI caption generation',
        category: 'social',
        encrypted: true,
      })
    }

    if (settingsToMigrate.length === 0) {
      console.log('  No environment variables found to migrate.')
      console.log('  You can add settings manually via the admin API.')
      return
    }

    // Add timestamps
    const now = new Date().toISOString()
    const settingsWithTimestamps = settingsToMigrate.map(setting => ({
      ...setting,
      updatedAt: now,
      updatedBy: 'migration-script',
    }))

    await Model.insertMany(settingsWithTimestamps)
    console.log(`  ✓ Migrated ${settingsWithTimestamps.length} app settings:`)
    settingsWithTimestamps.forEach(setting => {
      console.log(`    - ${setting.key} (${setting.category})`)
    })

    console.log('\n✓ Migration completed!')
    console.log('\nNote: Environment variables are still available as fallback.')
    console.log('      You can now manage these settings via the admin API.')
  } catch (error) {
    console.error('\n✗ Migration failed:', error)
    process.exit(1)
  }
}

main()

