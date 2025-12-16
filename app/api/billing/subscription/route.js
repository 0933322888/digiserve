import { NextResponse } from 'next/server'
import { getTenantFromRequest } from '@/lib/tenant-service'
import { getTenantAddonModel } from '@/lib/db/models'
import { stripe, MOCK_STRIPE } from '@/lib/stripe'
import { setSetting } from '@/lib/app-settings-service'

export async function DELETE(request) {
    try {
        const barId = await getTenantFromRequest(request)
        const { addonKey } = await request.json()

        if (!addonKey) {
            return NextResponse.json({ error: 'Module key is required' }, { status: 400 })
        }

        const TenantAddon = getTenantAddonModel()
        const addon = await TenantAddon.findOne({ barId, addonKey })

        if (!addon) {
            return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
        }

        // 1. Cancel in Stripe (or Mock)
        if (MOCK_STRIPE) {
            // Mock Cancellation
            await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate network delay
        } else {
            // Real Stripe Cancellation
            if (addon.stripeSubscriptionId) {
                try {
                    await stripe.subscriptions.cancel(addon.stripeSubscriptionId)
                } catch (stripeError) {
                    console.error('Stripe cancellation error:', stripeError)
                    // We might want to continue even if Stripe fails if we want to force disable locally,
                    // but usually best to report error.
                    // For now, let's assume we want to proceed with local disable if it's already "canceled" in Stripe 
                    // or if we want to force it.
                    // But safest is to return error.
                    return NextResponse.json({ error: 'Failed to cancel Stripe subscription: ' + stripeError.message }, { status: 500 })
                }
            }
        }

        // 2. Update DB Status
        addon.status = 'canceled'
        addon.updatedAt = new Date()
        await addon.save()

        // 3. Update App Setting
        const dbKey = `MODULE_${addonKey.toUpperCase()}_ENABLED`
        await setSetting(
            barId,
            dbKey,
            false,
            `User canceled subscription for ${addonKey}`,
            'modules',
            'admin'
        )

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error('Cancellation error:', error)
        return NextResponse.json({ error: error.message || 'Failed to cancel subscription' }, { status: 500 })
    }
}
