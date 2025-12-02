import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createGiftCard } from '@/lib/gift-card-service'
import { logEvent } from '@/lib/event-service'

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
})

export async function POST(request) {
  try {
    const { sessionId, sessionData } = await request.json()

    if (!sessionId && !sessionData) {
      return NextResponse.json({ error: 'Missing session ID or data' }, { status: 400 })
    }

    let paymentIntentId
    let amount
    let metadata

    // If we have a sessionId, verify with Stripe
    if (sessionId) {
      const session = await stripe.checkout.sessions.retrieve(sessionId)

      if (session.payment_status !== 'paid') {
        await logEvent('GIFT_CARD', 'Gift card purchase failed: Payment not paid', 'FAILED', {
          sessionId,
        })
        return NextResponse.json({ error: 'Payment not completed' }, { status: 400 })
      }

      paymentIntentId = session.payment_intent
      amount = session.amount_total / 100 // Convert from cents
      metadata = session.metadata
    } else {
      // For testing/demo purposes without Stripe
      // In production, this branch should be removed or secured
      paymentIntentId = `demo_${Date.now()}`
      amount = sessionData.amount
      metadata = {
        recipientName: sessionData.recipientName,
        recipientEmail: sessionData.recipientEmail,
        senderName: sessionData.senderName,
        senderEmail: sessionData.senderEmail,
      }
    }

    // Create the gift card
    const giftCardData = {
      initialAmount: amount,
      currency: 'USD', // Default to USD for now
      customerName: metadata.recipientName,
      customerEmail: metadata.recipientEmail,
      purchaserName: metadata.senderName,
      purchaserEmail: metadata.senderEmail,
      stripePaymentId: paymentIntentId,
      paymentMethod: 'stripe_checkout',
    }

    const newGiftCard = await createGiftCard(giftCardData)

    await logEvent('GIFT_CARD', `Gift card purchased: ${newGiftCard.code}`, 'SUCCESS', {
      giftCardId: newGiftCard.giftCardId,
      amount: newGiftCard.initialAmount,
    })

    return NextResponse.json({
      success: true,
      giftCard: newGiftCard,
    })
  } catch (error) {
    console.error('Payment verification error:', error)
    await logEvent('GIFT_CARD', 'Gift card purchase error', 'FAILED', { error: error.message })
    return NextResponse.json({ error: 'Payment verification failed' }, { status: 500 })
  }
}
