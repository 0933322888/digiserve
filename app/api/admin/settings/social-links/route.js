import { NextResponse } from 'next/server'
import { getRestaurantModel } from '@/lib/db/models.js'
import connectDB from '@/lib/db/mongodb-connection.js'

/**
 * PUT /api/admin/settings/social-links
 * Update tenant social media links
 */
export async function PUT(request) {
    try {
        const tenantId = request.headers.get('x-tenant-id')
        if (!tenantId) {
            return NextResponse.json({ error: 'Tenant ID required' }, { status: 400 })
        }

        const body = await request.json()
        const { facebook, instagram, twitter } = body

        await connectDB()
        const Restaurant = getRestaurantModel()

        // Update social fields
        const update = {
            $set: {
                'social.facebook': facebook,
                'social.instagram': instagram,
                'social.twitter': twitter
            }
        }

        // Find by barId or slug
        const restaurant = await Restaurant.findOneAndUpdate(
            { $or: [{ barId: tenantId }, { slug: tenantId }] },
            update,
            { new: true }
        )

        if (!restaurant) {
            return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
        }

        return NextResponse.json({
            success: true,
            message: 'Social links updated successfully',
            social: restaurant.social,
        })
    } catch (error) {
        console.error('Update social links error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to update social links' },
            { status: 500 }
        )
    }
}
