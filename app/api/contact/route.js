import { NextResponse } from 'next/server'
import { siteConfig } from '@/config/siteConfig'

/**
 * Contact Form API Route
 * AWS Lambda-compatible endpoint for contact form submissions
 *
 * In production, integrate with AWS SES for email sending
 */
export async function POST(request) {
  try {
    const body = await request.json()
    const { name, email, phone, subject, message } = body

    // Validation
    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: 'All required fields must be provided' }, { status: 400 })
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    // In production, send email via AWS SES
    if (siteConfig.api.enableEmail) {
      // TODO: Integrate with AWS SES
      // Example:
      // await ses.sendEmail({
      //   Source: siteConfig.restaurant.email,
      //   Destination: { ToAddresses: [siteConfig.restaurant.email] },
      //   Message: {
      //     Subject: { Data: `Contact Form: ${subject}` },
      //     Body: {
      //       Text: {
      //         Data: `Name: ${name}\nEmail: ${email}\nPhone: ${phone || 'N/A'}\n\nMessage:\n${message}`,
      //       },
      //     },
      //   },
      // })

      // For now, log the submission (in production, this would be sent via SES)
      console.log('Contact form submission:', {
        name,
        email,
        phone,
        subject,
        message,
        timestamp: new Date().toISOString(),
      })
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Your message has been received. We will get back to you soon.',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    )
  }
}
