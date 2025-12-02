/**
 * Migration Script: Add barId to existing Activity Log entries
 * 
 * This script updates existing Activity Log entries that don't have a barId field.
 * Run this once after deploying the schema changes.
 * 
 * Usage:
 *   node scripts/migrate-activity-logs.js
 * 
 * Options:
 *   --dry-run    Show what would be updated without making changes
 *   --default-bar-id=<id>    Set a default barId for logs without one (default: 'bar_1')
 */

import { getActivityLogModel } from '../lib/db/models.js'
import connectDB from '../lib/db/mongodb-connection.js'

async function migrateActivityLogs() {
    const args = process.argv.slice(2)
    const dryRun = args.includes('--dry-run')
    const defaultBarIdArg = args.find(arg => arg.startsWith('--default-bar-id='))
    const defaultBarId = defaultBarIdArg ? defaultBarIdArg.split('=')[1] : 'bar_1'

    console.log('🔄 Activity Log Migration Script')
    console.log('================================')
    console.log(`Mode: ${dryRun ? 'DRY RUN (no changes will be made)' : 'LIVE'}`)
    console.log(`Default barId: ${defaultBarId}`)
    console.log('')

    try {
        await connectDB()
        const ActivityLog = getActivityLogModel()

        // Find all logs without barId
        const logsWithoutBarId = await ActivityLog.find({
            $or: [
                { barId: { $exists: false } },
                { barId: null },
                { barId: '' }
            ]
        })

        console.log(`📊 Found ${logsWithoutBarId.length} activity logs without barId`)

        if (logsWithoutBarId.length === 0) {
            console.log('✅ No migration needed - all logs have barId')
            process.exit(0)
        }

        if (dryRun) {
            console.log('\n📋 Preview of changes (first 10):')
            logsWithoutBarId.slice(0, 10).forEach(log => {
                console.log(`  - Log ${log.id}: ${log.type} - ${log.description.substring(0, 50)}...`)
            })
            console.log(`\n⚠️  DRY RUN: Would update ${logsWithoutBarId.length} logs with barId="${defaultBarId}"`)
            console.log('Run without --dry-run to apply changes')
            process.exit(0)
        }

        // Perform the migration
        console.log(`\n🔧 Updating ${logsWithoutBarId.length} logs...`)

        const result = await ActivityLog.updateMany(
            {
                $or: [
                    { barId: { $exists: false } },
                    { barId: null },
                    { barId: '' }
                ]
            },
            {
                $set: { barId: defaultBarId }
            }
        )

        console.log(`\n✅ Migration complete!`)
        console.log(`   - Matched: ${result.matchedCount}`)
        console.log(`   - Modified: ${result.modifiedCount}`)

        // Verify the migration
        const remainingWithoutBarId = await ActivityLog.countDocuments({
            $or: [
                { barId: { $exists: false } },
                { barId: null },
                { barId: '' }
            ]
        })

        if (remainingWithoutBarId === 0) {
            console.log('\n✨ All activity logs now have barId!')
        } else {
            console.log(`\n⚠️  Warning: ${remainingWithoutBarId} logs still without barId`)
        }

    } catch (error) {
        console.error('❌ Migration failed:', error)
        process.exit(1)
    }

    process.exit(0)
}

// Run the migration
migrateActivityLogs()
