import { NextResponse } from 'next/server'
import { siteConfig } from '@/config/siteConfig'

/**
 * Stripe Webhook Endpoint
 * Handles Stripe payment events
 */
export async function POST(request) {
  try {
    if (!siteConfig.api.enableStripe) {
      return NextResponse.json({ error: 'Stripe is not enabled' }, { status: 400 })
    }

    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    let event

    try {
      const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      )
    } catch (err) {
      console.error(`Webhook signature verification failed: ${err.message}`)
      return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object
        // TODO: Fulfill the purchase based on the session
        // We might want to call our verify endpoint logic here or reuse it
        console.log('Payment successful for session:', session.id)
        break
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true }, { status: 200 })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
