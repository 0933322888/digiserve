import { NextResponse } from 'next/server'
import { getRestaurantModel } from '@/lib/db/models'
import connectDB from '@/lib/db/mongodb-connection'
import { generateCompleteThemeColors, validateColorObject } from '@/lib/color-utils'
import { resolveTenantId } from '@/lib/tenant-resolver'

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

        // Return current color configuration
        const colors = restaurant.theme?.colors || null

        return NextResponse.json({
            success: true,
            colors,
            templateId: restaurant.theme?.templateId || 'bar'
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
        const { colors, autoCalculate, templateId } = body

        if (!colors) {
            return NextResponse.json({ error: 'Colors are required' }, { status: 400 })
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

        console.log('[ColorSettings PUT] Found restaurant:', { barId: restaurant.barId, subdomain: restaurant.subdomain, name: restaurant.name })

        let finalColors = colors

        // Auto-calculate missing colors if requested
        if (autoCalculate && colors.light?.primary?.bg && colors.light?.secondary?.bg) {
            finalColors = generateCompleteThemeColors(
                colors.light.primary.bg,
                colors.light.secondary.bg
            )
        } else {
            // Validate and normalize each color object
            finalColors = {
                light: {
                    primary: validateColorObject(colors.light?.primary),
                    secondary: validateColorObject(colors.light?.secondary)
                },
                dark: {
                    primary: validateColorObject(colors.dark?.primary),
                    secondary: validateColorObject(colors.dark?.secondary)
                }
            }
        }

        // Update restaurant theme colors
        restaurant.theme = restaurant.theme || {}
        restaurant.theme.colors = finalColors

        // Sync legacy fields for backward compatibility
        if (finalColors.light?.primary?.bg) {
            restaurant.theme.primaryColor = finalColors.light.primary.bg
        }
        if (finalColors.light?.secondary?.bg) {
            restaurant.theme.secondaryColor = finalColors.light.secondary.bg
        }

        if (templateId) {
            restaurant.theme.templateId = templateId
        }
        restaurant.updatedAt = new Date()

        await restaurant.save()

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
