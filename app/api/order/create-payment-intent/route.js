import { NextResponse } from 'next/server'
import { siteConfig } from '@/config/siteConfig'

/**
 * Create Payment Intent API Route
 * Creates Stripe payment intent for order
 */
export async function POST(request) {
  try {
    const { amount } = await request.json()

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    }

    // If Stripe is configured, use real Stripe API
    if (siteConfig.api.enableStripe && siteConfig.api.stripeSecretKey) {
      // TODO: Uncomment when Stripe package is installed
      // const stripe = require('stripe')(siteConfig.api.stripeSecretKey)
      // const paymentIntent = await stripe.paymentIntents.create({
      //   amount: amount,
      //   currency: 'usd',
      //   automatic_payment_methods: {
      //     enabled: true,
      //   },
      // })
      // return NextResponse.json(
      //   { clientSecret: paymentIntent.client_secret },
      //   { status: 200 }
      // )

      // For now, return error if Stripe is expected but not fully configured
      return NextResponse.json(
        {
          error:
            'Stripe integration is not fully set up. Please install stripe package and uncomment the code.',
        },
        { status: 500 }
      )
    }

    // If Stripe is not configured, return a test mode response
    // This allows testing the order flow without payment
    return NextResponse.json(
      {
        clientSecret: null,
        testMode: true,
        message: 'Test mode - payment skipped',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Payment intent creation error:', error)
    return NextResponse.json({ error: 'Failed to create payment intent' }, { status: 500 })
  }
}
