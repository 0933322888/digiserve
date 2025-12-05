import { NextResponse } from 'next/server'
import { getRestaurantModel } from '@/lib/db/models'
import connectDB from '@/lib/db/mongodb-connection'
import { getSession } from '@/lib/auth-service'
import { getTenantFromRequest } from '@/lib/tenant-service'

/**
 * GET /api/theme
 * Get current tenant's theme configuration
 */
export async function GET(request) {
    try {
        const tenantId = await getTenantFromRequest(request)

        if (!tenantId) {
            // Return default theme if no tenant
            return NextResponse.json({
                type: 'vintage',
                primaryColor: '#8B0000',
                secondaryColor: '#F5F5DC',
                logo: null,
            })
        }

        await connectDB()
        const Restaurant = getRestaurantModel()

        const restaurant = await Restaurant.findOne({ barId: tenantId })

        if (!restaurant || !restaurant.theme) {
            // Return default theme
            return NextResponse.json({
                type: 'vintage',
                primaryColor: '#8B0000',
                secondaryColor: '#F5F5DC',
                logo: null,
            })
        }

        return NextResponse.json(restaurant.theme)
    } catch (error) {
        console.error('Error fetching theme:', error)
        // Return default theme on error
        return NextResponse.json({
            type: 'vintage',
            primaryColor: '#8B0000',
            secondaryColor: '#F5F5DC',
            logo: null,
        })
    }
}
