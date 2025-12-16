import { NextResponse } from 'next/server'
import connectDB from '@/lib/db/mongodb-connection'
import { getRestaurantModel, getActivityLogModel } from '@/lib/db/models'

export async function POST(request, context) {
    // Use await for context.params in Next.js 15
    const { id: barId } = await context.params

    if (!barId) {
        return NextResponse.json({ error: 'Tenant ID is required' }, { status: 400 })
    }

    try {
        const body = await request.json()
        const { templateId, primaryColor, secondaryColor, overrides } = body

        console.log(`[Theme API] Updating theme for ${barId}`, { templateId, primaryColor, secondaryColor })

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
        if (templateId) tenant.theme.templateId = templateId
        if (primaryColor) tenant.theme.primaryColor = primaryColor
        if (secondaryColor) tenant.theme.secondaryColor = secondaryColor

        // Handle overrides map
        if (overrides && typeof overrides === 'object') {
            // Convert object to Map if passed as JSON object
            tenant.theme.overrides = new Map(Object.entries(overrides))
        }

        tenant.markModified('theme')
        await tenant.save()
        console.log(`[Theme API] Saved tenant theme:`, tenant.theme)

        // Log activity
        await ActivityLog.create({
            id: crypto.randomUUID(),
            barId: tenant.barId, // Use the actual tenant ID from DB
            type: 'THEME_UPDATE',
            description: `Updated theme to template: ${templateId || tenant.theme.templateId}`,
            status: 'SUCCESS',
            metadata: { templateId, primaryColor, secondaryColor }
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
