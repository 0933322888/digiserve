import { NextResponse } from 'next/server'
import { siteConfig } from '@/config/siteConfig'

/**
 * Reservations API Route
 * AWS Lambda-compatible endpoint for reservation submissions
 * 
 * In production, integrate with AWS SES for email sending
 */
export async function POST(request) {
  try {
    const body = await request.json()
    const { name, email, phone, date, time, partySize, specialRequests } = body

    // Validation
    if (!name || !email || !phone || !date || !time || !partySize) {
      return NextResponse.json(
        { error: 'All required fields must be provided' },
        { status: 400 }
      )
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
    }

    // Date validation
    const reservationDate = new Date(`${date}T${time}`)
    const now = new Date()
    if (reservationDate <= now) {
      return NextResponse.json(
        { error: 'Reservation date and time must be in the future' },
        { status: 400 }
      )
    }

    // Party size validation
    const partySizeNum = parseInt(partySize, 10)
    if (isNaN(partySizeNum) || partySizeNum < 1 || partySizeNum > 20) {
      return NextResponse.json(
        { error: 'Party size must be between 1 and 20' },
        { status: 400 }
      )
    }

    // In production, send email via AWS SES and optionally save to database
    if (siteConfig.api.enableEmail) {
      // TODO: Integrate with AWS SES
      // Example:
      // await ses.sendEmail({
      //   Source: siteConfig.restaurant.email,
      //   Destination: { ToAddresses: [siteConfig.restaurant.email] },
      //   Message: {
      //     Subject: { Data: `New Reservation Request from ${name}` },
      //     Body: {
      //       Text: {
      //         Data: `Reservation Details:\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone}\nDate: ${date}\nTime: ${time}\nParty Size: ${partySize}\nSpecial Requests: ${specialRequests || 'None'}`,
      //       },
      //     },
      //   },
      // })
      
      // For now, log the submission
      console.log('Reservation request:', {
        name,
        email,
        phone,
        date,
        time,
        partySize,
        specialRequests,
        timestamp: new Date().toISOString(),
      })
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Your reservation request has been submitted. We will confirm shortly.',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Reservation form error:', error)
    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    )
  }
}

