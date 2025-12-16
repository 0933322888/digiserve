import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { getTenantAddonModel } from '@/lib/db/models'

export async function POST(request) {
    try {
        const { sessionId } = await request.json()
        if (!sessionId) return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 })

        const session = await stripe.checkout.sessions.retrieve(sessionId)

        if (session.payment_status !== 'paid' && session.mode !== 'setup') {
            // session.mode might be subscription or payment. 
            // For subscription checkout with trial, payment_status might be 'paid' (if $0 due) or 'no_payment_required' if trial?
            // "The payment_status of the checkout session, one of paid, unpaid, or no_payment_required."
            if (session.payment_status === 'unpaid') {
                return NextResponse.json({ error: 'Payment not completed or failed', status: session.payment_status }, { status: 400 })
            }
        }

        const { barId, addonKey } = session.metadata
        if (!barId || !addonKey) {
            return NextResponse.json({ error: 'Invalid session metadata' }, { status: 400 })
        }

        const TenantAddon = getTenantAddonModel()

        // Upsert the addon status to active
        await TenantAddon.findOneAndUpdate(
            { barId, addonKey },
            {
                barId,
                addonKey,
                status: 'active',
                subscriptionId: session.subscription,
                updatedAt: new Date()
            },
            { upsert: true, new: true }
        )

        return NextResponse.json({ success: true, addonKey })
    } catch (err) {
        console.error('Verify error:', err)
        return NextResponse.json({ error: err.message || 'Verification failed' }, { status: 500 })
    }
}
