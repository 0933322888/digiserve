import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth-service'
import { getUserModel, getRestaurantModel } from '@/lib/db/models'
import connectDB from '@/lib/db/mongodb-connection'
import { clearTenantCache } from '@/lib/tenant-service'

/**
 * PATCH /api/onboarding/branding
 * Save branding configuration
 */
export async function PATCH(request) {
    try {
        const session = await getSession()
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { tenantId, theme } = body

        if (!tenantId || !theme) {
            return NextResponse.json(
                { error: 'Tenant ID and theme are required' },
                { status: 400 }
            )
        }

        await connectDB()
        const User = getUserModel()
        const Restaurant = getRestaurantModel()

        // Verify user has access to this tenant
        const user = await User.findOne({ email: session.email })
        if (!user || !user.tenantIds.includes(tenantId)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        // Update restaurant theme
        await Restaurant.updateOne(
            { barId: tenantId },
            {
                $set: {
                    theme,
                    updatedAt: new Date(),
                },
            }
        )

        // Clear tenant cache so subsequent requests get fresh theme data
        clearTenantCache()

        // Update user onboarding progress
        await User.updateOne(
            { id: user.id },
            {
                $set: {
                    onboardingStatus: 'in_progress',
                    onboardingStep: 2,
                    updatedAt: new Date(),
                },
            }
        )

        console.log(`✅ Branding saved for tenant: ${tenantId}`)

        return NextResponse.json({
            success: true,
            message: 'Branding saved successfully',
        })
    } catch (error) {
        console.error('Branding save error:', error)
        return NextResponse.json(
            { error: 'Failed to save branding' },
            { status: 500 }
        )
    }
}
