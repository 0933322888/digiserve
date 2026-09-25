import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { getSession } from '@/lib/auth-service'
import { getUserModel, getRestaurantModel, getEventModel, getGalleryImageModel } from '@/lib/db/models'
import connectDB from '@/lib/db/mongodb-connection'
import { getSampleEvents, getSampleGalleryImages } from '@/lib/sample-data'
import { clearTenantCache } from '@/lib/tenant-service'

/**
 * POST /api/onboarding/complete
 * Complete onboarding and load sample data
 */
export async function POST(request) {
    try {
        const session = await getSession()
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        await connectDB()
        const User = getUserModel()
        const Restaurant = getRestaurantModel()
        const Event = getEventModel()
        const GalleryImage = getGalleryImageModel()

        // Get user
        const user = await User.findOne({ email: session.email })
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        const tenantId = user.tenantIds?.[0]
        if (!tenantId) {
            return NextResponse.json({ error: 'No tenant found' }, { status: 404 })
        }

        // Get restaurant
        const restaurant = await Restaurant.findOne({ barId: tenantId })
        if (!restaurant) {
            return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 })
        }

        // Load sample data if not already loaded
        if (!restaurant.sampleDataLoaded) {
            // Add sample events
            const sampleEvents = getSampleEvents()
            for (const event of sampleEvents) {
                await Event.create({
                    ...event,
                    id: uuidv4(),
                    barId: tenantId,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                })
            }

            // Add sample gallery images
            const sampleImages = getSampleGalleryImages()
            for (const image of sampleImages) {
                await GalleryImage.create({
                    ...image,
                    id: uuidv4(),
                    barId: tenantId,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                })
            }

            // Mark sample data as loaded
            await Restaurant.updateOne(
                { barId: tenantId },
                {
                    $set: {
                        sampleDataLoaded: true,
                        onboardingCompletedAt: new Date(),
                        updatedAt: new Date(),
                    },
                }
            )
        }

        // Clear tenant cache so subsequent requests get fresh theme data
        clearTenantCache()

        // Update user onboarding status
        await User.updateOne(
            { id: user.id },
            {
                $set: {
                    onboardingStatus: 'completed',
                    onboardingCompletedAt: new Date(),
                    updatedAt: new Date(),
                },
            }
        )

        console.log(`✅ Onboarding completed for tenant: ${tenantId}`)

        // Generate tenant redirect URL
        const { getTenantRedirectUrl } = await import('@/lib/tenant-service')
        const redirectUrl = await getTenantRedirectUrl(tenantId) || '/admin'

        return NextResponse.json({
            success: true,
            message: 'Onboarding completed successfully',
            redirectUrl,
            tenantId,
            slug: restaurant.slug,
        })
    } catch (error) {
        console.error('Onboarding completion error:', error)
        return NextResponse.json(
            { error: 'Failed to complete onboarding' },
            { status: 500 }
        )
    }
}
