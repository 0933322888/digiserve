import { NextResponse } from 'next/server'
import { updateReservationStatus } from '@/lib/reservation-service'
import { siteConfig } from '@/config/siteConfig'
import nodemailer from 'nodemailer'
import { logEvent } from '@/lib/event-service'

// Initialize Nodemailer
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
})

export async function POST(request, context) {
  try {
    const { id } = await context.params
    const { status } = await request.json()

    const reservation = await updateReservationStatus(id, status)

    await logEvent('RESERVATION', `Reservation ${status}: ${reservation.name}`, 'SUCCESS', {
      reservationId: reservation.id,
      status,
    })

    // Send Customer Email if Confirmed
    if (status === 'confirmed' && siteConfig.api.enableEmail && process.env.EMAIL_SERVER_HOST) {
      try {
        await transporter.sendMail({
          from: process.env.EMAIL_FROM || siteConfig.restaurant.email,
          to: reservation.email,
          subject: `Reservation Confirmed: ${siteConfig.restaurant.name}`,
          text: `
Great news! Your reservation has been confirmed.

Date: ${reservation.date}
Time: ${reservation.time}
Guests: ${reservation.partySize}

We look forward to seeing you!

${siteConfig.restaurant.name}
${siteConfig.restaurant.address.street}
${siteConfig.restaurant.phone}
                    `,
        })
      } catch (emailError) {
        console.error('Email error:', emailError)
        await logEvent('SYSTEM', 'Failed to send confirmation email', 'FAILED', {
          error: emailError.message,
        })
      }
    }

    return NextResponse.json({ success: true, reservation })
  } catch (error) {
    await logEvent('RESERVATION', `Reservation status update failed: ${error.message}`, 'FAILED', {
      error: error.message,
    })
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
