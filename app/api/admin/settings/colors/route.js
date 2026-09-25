import { NextResponse } from 'next/server'
import { getRestaurantModel } from '@/lib/db/models'
import connectDB from '@/lib/db/mongodb-connection'
import { resolveTenantId } from '@/lib/tenant-resolver'
import { clearTenantCache } from '@/lib/tenant-service'
import { getTemplateById } from '@/config/templates'

/**
 * GET /api/admin/settings/colors
 * Get current color configuration
 */
export async function GET(request) {
    try {
        const tenantIdentifier = request.headers.get('x-tenant-id')
        if (!tenantIdentifier) {
            return NextResponse.json({ error: 'Tenant ID is required' }, { status: 400 })
        }

        // Resolve tenant identifier to actual barId
        const barId = await resolveTenantId(tenantIdentifier)
        if (!barId) {
            console.log(`[ColorSettings GET] Tenant not found for identifier: ${tenantIdentifier}`)
            return NextResponse.json({
                error: 'Restaurant not found',
                details: `No tenant found for identifier: ${tenantIdentifier}`
            }, { status: 404 })
        }

        await connectDB()
        const Restaurant = getRestaurantModel()

        const restaurant = await Restaurant.findOne({ barId })

        const templateId = restaurant.theme?.templateId || 'bar'
        const template = getTemplateById(templateId)
        const defaultPalette = template?.palettes?.[0]
        const colors = restaurant.theme?.colors || {
            primary: defaultPalette.primary,
            accent: defaultPalette.accent,
        }

        return NextResponse.json({
            success: true,
            colors,
            templateId
        })
    } catch (error) {
        console.error('Get colors error:', error)
        return NextResponse.json({ error: error.message || 'Failed to get colors' }, { status: 500 })
    }
}

/**
 * PUT /api/admin/settings/colors
 * Update color configuration
 */
export async function PUT(request) {
    try {
        const tenantIdentifier = request.headers.get('x-tenant-id')
        if (!tenantIdentifier) {
            return NextResponse.json({ error: 'Tenant ID is required' }, { status: 400 })
        }

        const body = await request.json()
        const { colors, templateId } = body

        if (!colors) {
            return NextResponse.json({ error: 'Colors are required' }, { status: 400 })
        }
        if (!colors.primary || !colors.accent) {
            return NextResponse.json({ error: 'Primary and accent colors are required' }, { status: 400 })
        }

        // Resolve tenant identifier to actual barId
        const barId = await resolveTenantId(tenantIdentifier)
        if (!barId) {
            console.log(`[ColorSettings PUT] Tenant not found for identifier: ${tenantIdentifier}`)
            return NextResponse.json({
                error: 'Restaurant not found',
                details: `No tenant found for identifier: ${tenantIdentifier}`
            }, { status: 404 })
        }

        await connectDB()
        const Restaurant = getRestaurantModel()

        console.log('[ColorSettings PUT] Looking for restaurant with barId:', barId)

        const restaurant = await Restaurant.findOne({ barId })

        if (!restaurant) {
            console.log('[ColorSettings PUT] Restaurant not found in database with barId:', barId)
            return NextResponse.json({
                error: 'Restaurant not found',
                details: `Restaurant with barId ${barId} does not exist in database`
            }, { status: 404 })
        }

        console.log('[ColorSettings PUT] Found restaurant:', { barId: restaurant.barId, slug: restaurant.slug, name: restaurant.name })

        const finalColors = {
            primary: colors.primary,
            accent: colors.accent,
        }

        // Update restaurant theme colors
        restaurant.theme = restaurant.theme || {}
        restaurant.theme.colors = finalColors

        if (templateId) {
            restaurant.theme.templateId = templateId
        }
        restaurant.updatedAt = new Date()

        await restaurant.save()

        // Clear tenant cache so subsequent requests get fresh theme data
        clearTenantCache()

        return NextResponse.json({
            success: true,
            colors: finalColors,
            message: 'Colors updated successfully'
        })
    } catch (error) {
        console.error('Update colors error:', error)
        return NextResponse.json({ error: error.message || 'Failed to update colors' }, { status: 500 })
    }
}
