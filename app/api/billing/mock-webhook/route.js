import { NextResponse } from 'next/server'
import { getTenantAddonModel } from '@/lib/db/models'
import { setSetting } from '@/lib/app-settings-service'

// Helper to enable/disable module in app settings
async function updateModuleStatus(barId, addonKey, enabled) {
    const dbKey = `MODULE_${addonKey.toUpperCase()}_ENABLED`
    await setSetting(
        barId,
        dbKey,
        enabled,
        `System update: Subscription ${enabled ? 'active' : 'canceled'}`,
        'modules',
        'system'
    )
}

export async function POST(request) {
    try {
        const { type, barId, addonKey } = await request.json()
        const TenantAddon = getTenantAddonModel()

        console.log('[Mock Webhook] Processing:', type, barId, addonKey)

        if (type === 'checkout.session.completed') {
            await TenantAddon.findOneAndUpdate(
                { barId, addonKey },
                {
                    status: 'active',
                    stripeSubscriptionId: 'sub_mock_' + Math.random().toString(36).substring(7),
                    updatedAt: new Date(),
                },
                { upsert: true, new: true }
            )
            await updateModuleStatus(barId, addonKey, true)
        }
        else if (type === 'customer.subscription.deleted') {
            await TenantAddon.findOneAndUpdate(
                { barId, addonKey },
                {
                    status: 'canceled',
                    updatedAt: new Date(),
                }
            )
            await updateModuleStatus(barId, addonKey, false)
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('[Mock Webhook] Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
