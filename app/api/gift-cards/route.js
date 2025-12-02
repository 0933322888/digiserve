import { NextResponse } from 'next/server'
import { siteConfig } from '@/config/siteConfig'
import Stripe from 'stripe'
import nodemailer from 'nodemailer'

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
})

// Initialize Nodemailer
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
})

/**
 * Gift Cards API Route
 * Handles Stripe Checkout Session creation and Email notifications
 */
export async function POST(request) {
  try {
    const body = await request.json()
    const { recipientName, recipientEmail, senderName, senderEmail, amount, message } = body

    // Validation
    if (!recipientName || !recipientEmail || !senderName || !senderEmail || !amount) {
      return NextResponse.json({ error: 'All required fields must be provided' }, { status: 400 })
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(recipientEmail) || !emailRegex.test(senderEmail)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    // Amount validation
    const amountNum = parseFloat(amount)
    if (isNaN(amountNum) || amountNum < 10 || amountNum > 1000) {
      return NextResponse.json(
        { error: 'Gift card amount must be between $10 and $1000' },
        { status: 400 }
      )
    }

    // Process Payment via Stripe
    if (siteConfig.api.enableStripe && process.env.STRIPE_SECRET_KEY) {
      try {
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          line_items: [
            {
              price_data: {
                currency: 'usd',
                product_data: {
                  name: `Gift Card for ${siteConfig.restaurant.name}`,
                  description: `Gift Card for ${recipientName} from ${senderName}`,
                  images: [
                    siteConfig.seo.defaultImage
                      ? `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}${siteConfig.seo.defaultImage}`
                      : 'https://placehold.co/600x400',
                  ],
                },
                unit_amount: Math.round(amountNum * 100), // Convert to cents
              },
              quantity: 1,
            },
          ],
          mode: 'payment',
          success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/gift-cards?success=true&session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/gift-cards?canceled=true`,
          metadata: {
            recipientName,
            recipientEmail,
            senderName,
            senderEmail,
            message: message || '',
            type: 'gift_card',
          },
        })

        return NextResponse.json({ url: session.url })
      } catch (stripeError) {
        console.error('Stripe error:', stripeError)
        return NextResponse.json(
          { error: 'Payment processing failed. Please try again.' },
          { status: 500 }
        )
      }
    }

    // If Stripe is disabled, we cannot process the gift card in this flow
    // because we need to generate a code and store it, which is now handled in verify-payment
    return NextResponse.json(
      { error: 'Payment configuration missing or Stripe is disabled.' },
      { status: 500 }
    )
  } catch (error) {
    console.error('Gift card form error:', error)
    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    )
  }
}
