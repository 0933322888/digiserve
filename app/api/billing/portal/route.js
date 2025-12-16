import { NextResponse } from 'next/server'
import { stripe, MOCK_STRIPE } from '@/lib/stripe'
import { getTenantAddonModel } from '@/lib/db/models'

export async function POST(request) {
    try {
        const { barId, moduleId, returnUrl } = await request.json()

        if (!barId) {
            return NextResponse.json({ error: 'Tenant ID (barId) is required' }, { status: 400 })
        }

        if (!moduleId) {
            return NextResponse.json({ error: 'Module ID is required' }, { status: 400 })
        }

        if (MOCK_STRIPE) {
            return NextResponse.json({
                url: `/mock-billing/portal?barId=${barId}&moduleId=${moduleId}&returnUrl=${returnUrl || request.headers.get('origin') + '/admin/settings'}`
            })
        }

        const TenantAddon = getTenantAddonModel()
        const addon = await TenantAddon.findOne({ barId, addonKey: moduleId })

        if (!addon || !addon.stripeCustomerId) {
            // Ideally we should have stripeCustomerId on the TenantAddon or Tenant model.
            // For this implementation, we might need to assume we can get it from the addon if we saved it,
            // or we need to look it up.
            // Let's assume for now we might save stripeCustomerId on the addon, or we need to look up the customer.
            // Only subscriptionId is on the addon schema currently.

            // If we only have subscriptionId, we can retrieve the subscription to get the customer.
            if (addon && addon.stripeSubscriptionId) {
                const subscription = await stripe.subscriptions.retrieve(addon.stripeSubscriptionId)
                const session = await stripe.billingPortal.sessions.create({
                    customer: subscription.customer,
                    return_url: returnUrl || `${request.headers.get('origin')}/admin/settings`,
                })
                return NextResponse.json({ url: session.url })
            }

            return NextResponse.json({ error: 'No active subscription found for this module' }, { status: 404 })
        }

        // Determine the return URL
        const finalReturnUrl = returnUrl || `${request.headers.get('origin')}/admin/settings`

        // Create a portal session
        const session = await stripe.billingPortal.sessions.create({
            customer: addon.stripeCustomerId,
            return_url: finalReturnUrl,
        })

        return NextResponse.json({ url: session.url })
    } catch (error) {
        console.error('Error creating portal session:', error)
        return NextResponse.json(
            { error: 'Failed to create portal session' },
            { status: 500 }
        )
    }
}
