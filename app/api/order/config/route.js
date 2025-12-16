import { NextResponse } from 'next/server'
import { getSettingsByCategory } from '@/lib/app-settings-service'
import { isModuleEnabled } from '@/lib/module-settings-service'
import { siteConfig } from '@/config/siteConfig'

/**
 * GET /api/order/config
 * Get public checkout configuration (stripe status, ordering settings)
 */
export async function GET(request) {
    try {
        const tenantId = request.headers.get('x-tenant-id')

        const stripeEnabled = await isModuleEnabled('stripe', tenantId)
        const dbSettings = await getSettingsByCategory(tenantId, 'ordering')

        const orderingSettings = {
            pickup: dbSettings?.ORDERING_PICKUP ?? siteConfig.ordering?.pickup ?? true,
            delivery: dbSettings?.ORDERING_DELIVERY ?? siteConfig.ordering?.delivery ?? true,
            dineIn: dbSettings?.ORDERING_DINEIN ?? siteConfig.ordering?.dineIn ?? true,
            enabled: dbSettings?.ORDERING_ENABLED ?? siteConfig.ordering?.enabled ?? true,
        }

        return NextResponse.json({
            stripeEnabled,
            orderingSettings,
        })
    } catch (error) {
        console.error('Error fetching checkout config:', error)
        return NextResponse.json(
            { error: 'Failed to fetch checkout configuration' },
            { status: 500 }
        )
    }
}
