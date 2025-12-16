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

        let { id } = await params

        // Handle "me" alias
        if (id === 'me') {
            const tenantId = request.headers.get('x-tenant-id')
            if (tenantId) {
                id = tenantId
            }
        }

        await connectDB()
        const Restaurant = getRestaurantModel()

        // Find by barId (primary) or slug (subdomain)
        const restaurant = await Restaurant.findOne({
            $or: [{ barId: id }, { slug: id }]
        })

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
            social: restaurant.social,
            contact: restaurant.contact,
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
