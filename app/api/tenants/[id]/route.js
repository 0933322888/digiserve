import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth-service'
import { getRestaurantModel } from '@/lib/db/models'
import connectDB from '@/lib/db/mongodb-connection'

/**
 * GET /api/tenants/[id]
 * Get tenant information
 */
export async function GET(request, { params }) {
    try {
        const session = await getSession()
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params

        await connectDB()
        const Restaurant = getRestaurantModel()

        const restaurant = await Restaurant.findOne({ barId: id })

        if (!restaurant) {
            return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
        }

        // Return public tenant info
        return NextResponse.json({
            barId: restaurant.barId,
            name: restaurant.name,
            slug: restaurant.slug,
            subdomain: restaurant.subdomain,
            theme: restaurant.theme,
            onboardingCompleted: !!restaurant.onboardingCompletedAt,
        })
    } catch (error) {
        console.error('Error fetching tenant:', error)
        return NextResponse.json(
            { error: 'Failed to fetch tenant information' },
            { status: 500 }
        )
    }
}
