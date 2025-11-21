import { NextResponse } from 'next/server'
import { siteConfig } from '@/config/siteConfig'

/**
 * Gift Cards API Route
 * AWS Lambda-compatible endpoint for gift card requests
 * 
 * In production, integrate with Stripe for payment processing and AWS SES for email
 */
export async function POST(request) {
  try {
    const body = await request.json()
    const {
      recipientName,
      recipientEmail,
      senderName,
      senderEmail,
      amount,
      message,
    } = body

    // Validation
    if (
      !recipientName ||
      !recipientEmail ||
      !senderName ||
      !senderEmail ||
      !amount
    ) {
      return NextResponse.json(
        { error: 'All required fields must be provided' },
        { status: 400 }
      )
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(recipientEmail) || !emailRegex.test(senderEmail)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
    }

    // Amount validation
    const amountNum = parseFloat(amount)
    if (isNaN(amountNum) || amountNum < 10 || amountNum > 1000) {
      return NextResponse.json(
        { error: 'Gift card amount must be between $10 and $1000' },
        { status: 400 }
      )
    }

    // In production, process payment via Stripe if enabled
    if (siteConfig.api.enableStripe && siteConfig.api.stripePublicKey) {
      // TODO: Integrate with Stripe
      // Example:
      // const paymentIntent = await stripe.paymentIntents.create({
      //   amount: amountNum * 100, // Convert to cents
      //   currency: 'usd',
      //   metadata: {
      //     recipientName,
      //     recipientEmail,
      //     senderName,
      //     senderEmail,
      //   },
      // })
    }

    // Send email via AWS SES if enabled
    if (siteConfig.api.enableEmail) {
      // TODO: Integrate with AWS SES
      // Example:
      // await ses.sendEmail({
      //   Source: siteConfig.restaurant.email,
      //   Destination: { ToAddresses: [senderEmail, recipientEmail] },
      //   Message: {
      //     Subject: { Data: `Gift Card from ${senderName}` },
      //     Body: {
      //       Text: {
      //         Data: `Gift Card Details:\n\nAmount: $${amount}\nRecipient: ${recipientName}\nMessage: ${message || 'None'}`,
      //       },
      //     },
      //   },
      // })
      
      // For now, log the submission
      console.log('Gift card request:', {
        recipientName,
        recipientEmail,
        senderName,
        senderEmail,
        amount,
        message,
        timestamp: new Date().toISOString(),
      })
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Your gift card request has been submitted. We will process it shortly.',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Gift card form error:', error)
    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    )
  }
}

