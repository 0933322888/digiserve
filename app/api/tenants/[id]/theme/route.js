import { NextResponse } from 'next/server'
import connectDB from '@/lib/db/mongodb-connection'
import { getRestaurantModel, getActivityLogModel } from '@/lib/db/models'
import { clearTenantCache } from '@/lib/tenant-service'

export async function POST(request, context) {
    // Use await for context.params in Next.js 15
    const { id: barId } = await context.params

    if (!barId) {
        return NextResponse.json({ error: 'Tenant ID is required' }, { status: 400 })
    }

    try {
        const body = await request.json()
        const { templateId, colors, overrides } = body

        if (colors && (!colors.primary || !colors.accent)) {
            return NextResponse.json({ error: 'Primary and accent colors are required' }, { status: 400 })
        }

        console.log(`[Theme API] Updating theme for ${barId}`, { templateId, colors })

        await connectDB()
        const Restaurant = getRestaurantModel()
        const ActivityLog = getActivityLogModel()

        // Find the tenant by barId or slug
        const tenant = await Restaurant.findOne({
            $or: [{ barId }, { slug: barId }]
        })

        if (!tenant) {
            return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
        }

        // Update theme config
        // We only update fields that are provided
        tenant.theme = tenant.theme || {}
        if (templateId) tenant.theme.templateId = templateId
        if (colors) tenant.theme.colors = colors

        // Handle overrides map
        if (overrides && typeof overrides === 'object') {
            // Convert object to Map if passed as JSON object
            tenant.theme.overrides = new Map(Object.entries(overrides))
        }

        tenant.markModified('theme')
        await tenant.save()

        // Clear tenant cache so subsequent requests get fresh theme data
        clearTenantCache()

        console.log(`[Theme API] Saved tenant theme:`, tenant.theme)

        // Log activity
        await ActivityLog.create({
            id: crypto.randomUUID(),
            barId: tenant.barId, // Use the actual tenant ID from DB
            type: 'THEME_UPDATE',
            description: `Updated theme to template: ${templateId || tenant.theme.templateId}`,
            status: 'SUCCESS',
            metadata: { templateId, colors }
        })

        return NextResponse.json({ success: true, theme: tenant.theme })
    } catch (error) {
        console.error('Error updating tenant theme:', error)
        return NextResponse.json({ error: 'Failed to update theme' }, { status: 500 })
    }
}

export async function GET(request, context) {
    const { id: barId } = await context.params

    if (!barId) {
        return NextResponse.json({ error: 'Tenant ID is required' }, { status: 400 })
    }

    try {
        await connectDB()
        const Restaurant = getRestaurantModel()

        const tenant = await Restaurant.findOne({
            $or: [{ barId }, { slug: barId }]
        })

        if (!tenant) {
            return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
        }

        return NextResponse.json({ success: true, theme: tenant.theme })
    } catch (error) {
        console.error('Error fetching tenant theme:', error)
        return NextResponse.json({ error: 'Failed to fetch theme' }, { status: 500 })
    }
}
