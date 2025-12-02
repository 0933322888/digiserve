import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const DATA_DIR = path.join(__dirname, '..', 'data')

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

// Initialize modules
async function initModules() {
  if (!connectDB) {
    const mongodbConnection = await import('../lib/db/mongodb-connection.js')
    connectDB = mongodbConnection.default
  }
  if (!models) {
    models = await import('../lib/db/models.js')
  }
}

// Helper to read JSON file
function readJson(filePath, defaultValue = []) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`File not found: ${filePath}, using default value`)
      return defaultValue
    }
    const fileData = fs.readFileSync(filePath, 'utf8')
    const json = JSON.parse(fileData)
    
    // Handle nested structure (e.g., { menus: [...] })
    if (typeof json === 'object' && !Array.isArray(json)) {
      const values = Object.values(json)
      const arrayVal = values.find(v => Array.isArray(v))
      return arrayVal || defaultValue
    }
    
    return json
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error)
    return defaultValue
  }
}

// Convert date strings to Date objects
function processDates(obj) {
  if (!obj || typeof obj !== 'object') return obj
  
  const dateFields = [
    'createdAt',
    'updatedAt',
    'pickupTime',
    'confirmedAt',
    'completedAt',
    'cancelledAt',
    'startTime',
    'endTime',
    'clockIn',
    'clockOut',
    'breakStart',
    'breakEnd',
    'requestedAt',
    'reviewedAt',
    'timestamp',
    'scheduledFor',
    'publishedAt',
    'connectedAt',
    'lastRefreshedAt',
    'tokenExpiresAt',
    'expiresAt',
    'lastRedemptionAt',
  ]

  const processed = Array.isArray(obj) ? [...obj] : { ...obj }

  for (const key in processed) {
    if (dateFields.includes(key) && typeof processed[key] === 'string') {
      processed[key] = new Date(processed[key])
    } else if (typeof processed[key] === 'object' && processed[key] !== null) {
      if (Array.isArray(processed[key])) {
        processed[key] = processed[key].map(item =>
          typeof item === 'object' && item !== null ? processDates(item) : item
        )
      } else {
        processed[key] = processDates(processed[key])
      }
    }
  }

  return processed
}

async function migrateCollection(name, filePath, modelGetterName, transform = null) {
  try {
    await initModules()
    console.log(`\nMigrating ${name}...`)
    const data = readJson(filePath, [])
    
    if (!Array.isArray(data) || data.length === 0) {
      console.log(`  No data found in ${name}, skipping...`)
      return { migrated: 0, skipped: 0 }
    }

    await connectDB()
    const modelGetter = models[modelGetterName]
    if (!modelGetter) {
      throw new Error(`Model getter ${modelGetterName} not found`)
    }
    const Model = modelGetter()
    
    // Check if collection already has data
    const existingCount = await Model.countDocuments()
    if (existingCount > 0) {
      console.log(`  Collection ${name} already has ${existingCount} documents. Skipping to avoid duplicates.`)
      return { migrated: 0, skipped: data.length }
    }

    // Process and transform data
    let processedData = data.map(item => processDates(item))
    if (transform) {
      processedData = processedData.map(transform)
    }

    // Insert data
    if (processedData.length > 0) {
      await Model.insertMany(processedData, { ordered: false })
      console.log(`  ✓ Migrated ${processedData.length} ${name} documents`)
      return { migrated: processedData.length, skipped: 0 }
    }

    return { migrated: 0, skipped: 0 }
  } catch (error) {
    if (error.code === 11000) {
      // Duplicate key error - some documents already exist
      console.log(`  ⚠ Some ${name} documents already exist, skipping duplicates`)
      return { migrated: 0, skipped: 0 }
    }
    console.error(`  ✗ Error migrating ${name}:`, error.message)
    return { migrated: 0, skipped: 0, error: error.message }
  }
}

async function migrateMenus() {
  try {
    await initModules()
    console.log(`\nMigrating menus...`)
    const filePath = path.join(DATA_DIR, 'menus.json')
    const data = readJson(filePath, { menus: [] })
    
    let menus = Array.isArray(data) ? data : (data.menus || [])
    
    // If no menus in menus.json, check if we need to import from food.json and drinks.json
    if (menus.length === 0) {
      console.log(`  No menus found in menus.json, checking data/menu/ directory...`)
      
      const foodPath = path.join(DATA_DIR, 'menu', 'food.json')
      const drinksPath = path.join(DATA_DIR, 'menu', 'drinks.json')
      
      const foodData = readJson(foodPath, null)
      const drinksData = readJson(drinksPath, null)
      
      // If we have food.json and drinks.json, create a combined menu
      if (foodData && drinksData) {
        console.log(`  Found food.json and drinks.json, creating combined menu...`)
        menus = [
          {
            id: 'menu-1',
            name: 'Regular Menu',
            active: true,
            sections: [
              ...(foodData.sections || []),
              ...(drinksData.sections || []),
            ],
          },
        ]
        console.log(`  Created menu with ${menus[0].sections.length} sections`)
      }
    }
    
    if (menus.length === 0) {
      console.log(`  No menus found, skipping...`)
      return { migrated: 0, skipped: 0 }
    }

    await connectDB()
    const Model = models.getMenuModel()
    
    const existingCount = await Model.countDocuments()
    if (existingCount > 0) {
      console.log(`  Collection menus already has ${existingCount} documents. Skipping to avoid duplicates.`)
      return { migrated: 0, skipped: menus.length }
    }

    const processedMenus = menus.map(menu => {
      const processed = processDates(menu)
      // Ensure menu has required fields
      if (!processed.id) {
        processed.id = `menu-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      }
      if (processed.active === undefined) {
        processed.active = false
      }
      if (!processed.sections) {
        processed.sections = []
      }
      return processed
    })
    
    if (processedMenus.length > 0) {
      await Model.insertMany(processedMenus, { ordered: false })
      console.log(`  ✓ Migrated ${processedMenus.length} menu documents`)
      console.log(`    - Total sections: ${processedMenus.reduce((sum, m) => sum + (m.sections?.length || 0), 0)}`)
      console.log(`    - Total items: ${processedMenus.reduce((sum, m) => sum + (m.sections?.reduce((s, sec) => s + (sec.items?.length || 0), 0) || 0), 0)}`)
      return { migrated: processedMenus.length, skipped: 0 }
    }

    return { migrated: 0, skipped: 0 }
  } catch (error) {
    if (error.code === 11000) {
      console.log(`  ⚠ Some menu documents already exist, skipping duplicates`)
      return { migrated: 0, skipped: 0 }
    }
    console.error(`  ✗ Error migrating menus:`, error.message)
    return { migrated: 0, skipped: 0, error: error.message }
  }
}

async function migrateStaffFiles() {
  const staffDir = path.join(DATA_DIR, 'staff')
  const results = {
    employees: { migrated: 0, skipped: 0 },
    roles: { migrated: 0, skipped: 0 },
    shifts: { migrated: 0, skipped: 0 },
    timeEntries: { migrated: 0, skipped: 0 },
    shiftRequests: { migrated: 0, skipped: 0 },
  }

    // Employees
    const employeesResult = await migrateCollection(
      'employees',
      path.join(staffDir, 'employees.json'),
      'getEmployeeModel',
      (data) => {
        // Handle nested structure if needed
        return data
      }
    )
    results.employees = employeesResult

    // Roles
    const rolesResult = await migrateCollection(
      'roles',
      path.join(staffDir, 'roles.json'),
      'getRoleModel'
    )
    results.roles = rolesResult

    // Shifts
    const shiftsResult = await migrateCollection(
      'shifts',
      path.join(staffDir, 'shifts.json'),
      'getShiftModel'
    )
    results.shifts = shiftsResult

    // Time Entries
    const timeEntriesResult = await migrateCollection(
      'timeEntries',
      path.join(staffDir, 'time-entries.json'),
      'getTimeEntryModel'
    )
    results.timeEntries = timeEntriesResult

  // Shift Requests - handle nested structure
  try {
    console.log(`\nMigrating shiftRequests...`)
    const filePath = path.join(staffDir, 'shift-requests.json')
    const data = readJson(filePath, { requests: [] })
    
    // Handle nested structure: { requests: [...] }
    const requests = Array.isArray(data) ? data : (data.requests || [])
    
    if (requests.length === 0) {
      console.log(`  No shift requests found, skipping...`)
      results.shiftRequests = { migrated: 0, skipped: 0 }
    } else {
      await initModules()
      await connectDB()
      const Model = models.getShiftRequestModel()
      
      const existingCount = await Model.countDocuments()
      if (existingCount > 0) {
        console.log(`  Collection shiftRequests already has ${existingCount} documents. Skipping to avoid duplicates.`)
        results.shiftRequests = { migrated: 0, skipped: requests.length }
      } else {
        const processedRequests = requests.map(req => processDates(req))
        await Model.insertMany(processedRequests, { ordered: false })
        console.log(`  ✓ Migrated ${processedRequests.length} shift request documents`)
        results.shiftRequests = { migrated: processedRequests.length, skipped: 0 }
      }
    }
  } catch (error) {
    if (error.code === 11000) {
      console.log(`  ⚠ Some shift request documents already exist, skipping duplicates`)
      results.shiftRequests = { migrated: 0, skipped: 0 }
    } else {
      console.error(`  ✗ Error migrating shiftRequests:`, error.message)
      results.shiftRequests = { migrated: 0, skipped: 0, error: error.message }
    }
  }

  return results
}

async function main() {
  console.log('Starting migration from JSON files to MongoDB...')
  console.log('='.repeat(60))

  try {
    await initModules()
    await connectDB()
    console.log('✓ Connected to MongoDB')

    const results = {
      orders: { migrated: 0, skipped: 0 },
      reservations: { migrated: 0, skipped: 0 },
      giftCards: { migrated: 0, skipped: 0 },
      menus: { migrated: 0, skipped: 0 },
      activityLog: { migrated: 0, skipped: 0 },
      socialAccounts: { migrated: 0, skipped: 0 },
      socialPosts: { migrated: 0, skipped: 0 },
      socialCampaigns: { migrated: 0, skipped: 0 },
      staff: {},
    }

    // Migrate main collections
    results.orders = await migrateCollection(
      'orders',
      path.join(DATA_DIR, 'orders.json'),
      'getOrderModel'
    )

    results.reservations = await migrateCollection(
      'reservations',
      path.join(DATA_DIR, 'reservations.json'),
      'getReservationModel'
    )

    results.giftCards = await migrateCollection(
      'giftCards',
      path.join(DATA_DIR, 'gift-cards.json'),
      'getGiftCardModel'
    )

    results.menus = await migrateMenus()

    results.activityLog = await migrateCollection(
      'activityLog',
      path.join(DATA_DIR, 'activity-log.json'),
      'getActivityLogModel'
    )

    // Migrate social media collections
    results.socialAccounts = await migrateCollection(
      'socialAccounts',
      path.join(DATA_DIR, 'social-accounts.json'),
      'getSocialAccountModel'
    )

    results.socialPosts = await migrateCollection(
      'socialPosts',
      path.join(DATA_DIR, 'social-posts.json'),
      'getSocialPostModel'
    )

    results.socialCampaigns = await migrateCollection(
      'socialCampaigns',
      path.join(DATA_DIR, 'social-campaigns.json'),
      'getSocialCampaignModel'
    )

    // Migrate staff files
    results.staff = await migrateStaffFiles()

    // Print summary
    console.log('\n' + '='.repeat(60))
    console.log('Migration Summary:')
    console.log('='.repeat(60))
    
    const totalMigrated = 
      results.orders.migrated +
      results.reservations.migrated +
      results.giftCards.migrated +
      results.menus.migrated +
      results.activityLog.migrated +
      results.socialAccounts.migrated +
      results.socialPosts.migrated +
      results.socialCampaigns.migrated +
      results.staff.employees.migrated +
      results.staff.roles.migrated +
      results.staff.shifts.migrated +
      results.staff.timeEntries.migrated +
      results.staff.shiftRequests.migrated

    console.log(`\nTotal documents migrated: ${totalMigrated}`)
    console.log('\nDetailed results:')
    console.log(`  Orders: ${results.orders.migrated} migrated, ${results.orders.skipped} skipped`)
    console.log(`  Reservations: ${results.reservations.migrated} migrated, ${results.reservations.skipped} skipped`)
    console.log(`  Gift Cards: ${results.giftCards.migrated} migrated, ${results.giftCards.skipped} skipped`)
    console.log(`  Menus: ${results.menus.migrated} migrated, ${results.menus.skipped} skipped`)
    console.log(`  Activity Log: ${results.activityLog.migrated} migrated, ${results.activityLog.skipped} skipped`)
    console.log(`  Social Accounts: ${results.socialAccounts.migrated} migrated, ${results.socialAccounts.skipped} skipped`)
    console.log(`  Social Posts: ${results.socialPosts.migrated} migrated, ${results.socialPosts.skipped} skipped`)
    console.log(`  Social Campaigns: ${results.socialCampaigns.migrated} migrated, ${results.socialCampaigns.skipped} skipped`)
    console.log(`  Employees: ${results.staff.employees.migrated} migrated, ${results.staff.employees.skipped} skipped`)
    console.log(`  Roles: ${results.staff.roles.migrated} migrated, ${results.staff.roles.skipped} skipped`)
    console.log(`  Shifts: ${results.staff.shifts.migrated} migrated, ${results.staff.shifts.skipped} skipped`)
    console.log(`  Time Entries: ${results.staff.timeEntries.migrated} migrated, ${results.staff.timeEntries.skipped} skipped`)
    console.log(`  Shift Requests: ${results.staff.shiftRequests.migrated} migrated, ${results.staff.shiftRequests.skipped} skipped`)

    console.log('\n✓ Migration completed!')
    process.exit(0)
  } catch (error) {
    console.error('\n✗ Migration failed:', error)
    process.exit(1)
  }
}

main()

