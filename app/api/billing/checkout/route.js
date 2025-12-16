import { NextResponse } from 'next/server'
import { getTenantFromRequest } from '@/lib/tenant-service'
import { stripe, MODULE_PRICES, MODULE_NAMES, MOCK_STRIPE } from '@/lib/stripe'
import { getTenantAddonModel } from '@/lib/db/models'

export async function POST(request) {
    try {
        const barId = await getTenantFromRequest(request)
        const { addonKey, returnUrl } = await request.json()

        if (!addonKey || !MODULE_PRICES[addonKey]) {
            return NextResponse.json({ error: 'Invalid module key' }, { status: 400 })
        }

        if (MOCK_STRIPE) {
            return NextResponse.json({
                url: `/mock-billing/checkout?barId=${barId}&moduleId=${addonKey}&returnUrl=${request.headers.get('origin')}/admin/settings`
            })
        }

        const priceId = MODULE_PRICES[addonKey]

        // Check if we have a valid price ID (not a placeholder)
        if (priceId.includes('placeholder') && process.env.NODE_ENV === 'production') {
            return NextResponse.json({ error: 'Configuration error: Missing Price ID' }, { status: 500 })
        }

        // Check if already subscribed
        const TenantAddon = getTenantAddonModel()
        const existingAddon = await TenantAddon.findOne({ barId, addonKey })

        if (existingAddon && existingAddon.status === 'active') {
            return NextResponse.json({ error: 'Module already active' }, { status: 400 })
        }

        // Create Checkout Session
        const origin = request.headers.get('origin') || 'http://localhost:3000'
        const successUrl = returnUrl || `${origin}/admin/settings?success=true&addon=${addonKey}&session_id={CHECKOUT_SESSION_ID}`
        const cancelUrl = `${origin}/admin/settings?canceled=true`

        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            subscription_data: {
                trial_period_days: 5,
                metadata: {
                    barId,
                    addonKey,
                },
            },
            metadata: {
                barId,
                addonKey,
            },
            success_url: successUrl,
            cancel_url: cancelUrl,
        })

        return NextResponse.json({ url: session.url })
    } catch (error) {
        console.error('Checkout error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to create checkout session' },
            { status: 500 }
        )
    }
}
