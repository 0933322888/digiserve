import { NextResponse } from 'next/server'
import { getRestaurantModel } from '@/lib/db/models'
import connectDB from '@/lib/db/mongodb-connection'
import { getTenantFromRequest } from '@/lib/tenant-service'
import { headers } from 'next/headers'

/**
 * PUT /api/admin/settings/theme
 * Update tenant theme settings
 */
export async function PUT(request) {
    try {
        const body = await request.json()
        const { type, primaryColor, secondaryColor, logo } = body

        const tenantId = await getTenantFromRequest(request)

        if (!tenantId) {
            return NextResponse.json({ error: 'Tenant context required' }, { status: 400 })
        }

        await connectDB()
        const Restaurant = getRestaurantModel()

        // Update the restaurant's theme
        const result = await Restaurant.updateOne(
            { barId: tenantId },
            {
                $set: {
                    'theme.type': type,
                    'theme.primaryColor': primaryColor,
                    'theme.secondaryColor': secondaryColor,
                    'theme.logo': logo,
                    updatedAt: new Date(),
                }
            }
        )

        if (result.matchedCount === 0) {
            return NextResponse.json(
                { success: false, error: 'Tenant not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            message: 'Theme updated successfully',
            theme: { type, primaryColor, secondaryColor, logo }
        })

    } catch (error) {
        console.error('Failed to update theme:', error)
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        )
    }
}
