import { NextResponse } from 'next/server'
import { createReservation, getReservations } from '@/lib/reservation-service'
import { siteConfig } from '@/config/siteConfig'
import nodemailer from 'nodemailer'
import { logEvent } from '@/lib/event-service'
import { getTenantFromRequest } from '@/lib/tenant-service'

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

export async function POST(request) {
  try {
    const barId = await getTenantFromRequest(request)

    if (!barId) {
      return NextResponse.json({ error: 'Invalid tenant or domain' }, { status: 400 })
    }

    const body = await request.json()
    const reservation = await createReservation({ ...body, barId })

    await logEvent('RESERVATION', `New reservation request: ${reservation.name}`, 'SUCCESS', {
      reservationId: reservation.id,
      date: reservation.date,
    })

    // Send Restaurant Notification (Customer email sent upon Admin Confirmation)
    if (siteConfig.api.enableEmail && process.env.EMAIL_SERVER_HOST) {
      try {
        await transporter.sendMail({
          from: process.env.EMAIL_FROM || siteConfig.restaurant.email,
          to: siteConfig.restaurant.email,
          subject: `New Reservation Request: ${reservation.date} at ${reservation.time} — ${reservation.partySize} guests`,
          text: `
New Reservation Request (Pending Confirmation):

Name: ${reservation.name}
Email: ${reservation.email}
Phone: ${reservation.phone}
Date: ${reservation.date}
Time: ${reservation.time}
Guests: ${reservation.partySize}
Special Requests: ${reservation.specialRequests || 'None'}

Please log in to the Admin Dashboard to confirm or cancel this request.
          `,
        })
      } catch (emailError) {
        console.error('Email error:', emailError)
        await logEvent('SYSTEM', 'Failed to send reservation notification email', 'FAILED', {
          error: emailError.message,
        })
      }
    }

    return NextResponse.json({ success: true, reservation })
  } catch (error) {
    await logEvent('RESERVATION', 'Reservation request failed', 'FAILED', { error: error.message })
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}

export async function GET(request) {
  try {
    const barId = await getTenantFromRequest(request)

    if (!barId) {
      return NextResponse.json({ error: 'Invalid tenant or domain' }, { status: 400 })
    }

    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    const reservations = await getReservations(barId, date)
    return NextResponse.json(reservations)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch reservations' }, { status: 500 })
  }
}
