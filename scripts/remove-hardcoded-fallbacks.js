/**
 * Script to remove hardcoded 'bar_1' fallbacks from admin pages
 * Run this to update all admin pages to properly handle missing tenant IDs
 */

const fs = require('fs')
const path = require('path')

const adminPages = [
    'app/admin/staff/page.js',
    'app/admin/social-posting/page.js',
    'app/admin/reservations/page.js',
    'app/admin/orders/page.js',
    'app/admin/menu/page.js',
    'app/admin/gift-cards/page.js',
    'app/admin/events/page.js',
    'app/admin/analytics/page.js',
]

const oldPattern = /const barId = headersList\.get\('x-tenant-id'\) \|\| 'bar_1'.*$/m
const newCode = `const barId = headersList.get('x-tenant-id')

  if (!barId) {
    // In production, this should never happen as middleware handles it
    // If it does, it's a configuration error
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-red-600">Configuration Error</h1>
        <p>Tenant ID not found. Please contact support.</p>
      </div>
    )
  }`

adminPages.forEach(filePath => {
    const fullPath = path.join(process.cwd(), filePath)

    if (!fs.existsSync(fullPath)) {
        console.log(`⚠️  File not found: ${filePath}`)
        return
    }

    let content = fs.readFileSync(fullPath, 'utf8')

    if (content.match(oldPattern)) {
        content = content.replace(oldPattern, newCode)
        fs.writeFileSync(fullPath, content, 'utf8')
        console.log(`✅ Updated: ${filePath}`)
    } else {
        console.log(`ℹ️  No changes needed: ${filePath}`)
    }
})

console.log('\n✨ Done! All admin pages updated.')
