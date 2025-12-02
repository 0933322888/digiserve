import crypto from 'crypto'
import { siteConfig } from '@/config/siteConfig'
import { db } from './db'
import { getBusinessHours } from './app-settings-service'

// --- Helpers ---

function getDayName(dateStr) {
  const date = new Date(dateStr)
  // Adjust for timezone if necessary, but assuming dateStr is YYYY-MM-DD
  // and we want the day of the week relative to that date.
  // Using UTC to avoid timezone shifts for simple date strings
  const dayIndex = new Date(dateStr + 'T12:00:00').getDay()
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  return days[dayIndex]
}

function isTimeWithinHours(time, open, close) {
  // time, open, close are "HH:MM" strings
  return time >= open && time <= close
}

// --- Service Methods ---

export function getSettings() {
  return {
    maxSeatsPerSlot: siteConfig.reservations?.maxSeatsPerSlot || 40,
    slotDurationMinutes: siteConfig.reservations?.slotDurationMinutes || 120,
  }
}

// Removed updateSettings as config is now static in siteConfig.ts

export async function getReservations(barId, date) {
  const query = { barId }
  if (date) {
    query.date = date
  }
  const all = await db.collection('reservations').find(query)
  return all.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

export async function createReservation(data) {
  const settings = getSettings()
  // Note: settings should also be tenant-aware in future

  const { barId, name, email, phone, date, time, partySize, specialRequests } = data

  if (!barId) throw new Error('barId is required')

  const reservations = await db.collection('reservations').find({ barId })

  const size = parseInt(partySize)

  // 1. Validate Business Hours
  const dayName = getDayName(date)
  const allHours = await getBusinessHours() // TODO: Tenant aware
  const hours = allHours?.[dayName]

  if (!hours || hours.closed) {
    throw new Error(`We are closed on ${dayName}s.`)
  }

  if (!isTimeWithinHours(time, hours.open, hours.close)) {
    throw new Error(`Selected time is outside our business hours (${hours.open} - ${hours.close}).`)
  }

  // 2. Validate Capacity
  // settings is already declared at top of function
  const turnTimeMinutes = settings.slotDurationMinutes
  const bookingTime = new Date(`${date}T${time}`)
  const bookingEnd = new Date(bookingTime.getTime() + turnTimeMinutes * 60000)

  const conflictingReservations = reservations.filter(r => {
    if (r.date !== date) return false
    const rTime = new Date(`${r.date}T${r.time}`)
    const rEnd = new Date(rTime.getTime() + turnTimeMinutes * 60000)

    // Check overlap
    return bookingTime < rEnd && bookingEnd > rTime
  })

  const currentSeatsOccupied = conflictingReservations.reduce(
    (sum, r) => sum + parseInt(r.partySize),
    0
  )

  if (currentSeatsOccupied + size > settings.maxSeatsPerSlot) {
    throw new Error(`Sorry, we are fully booked at this time. Please try a different time.`)
  }

  // 3. Create Record
  const newReservation = {
    id: crypto.randomUUID(),
    barId,
    name,
    email,
    phone,
    date,
    time,
    partySize: size,
    specialRequests,
    status: 'pending', // pending | confirmed | cancelled
    createdAt: new Date().toISOString(),
  }

  await db.collection('reservations').insertOne(newReservation)

  return newReservation
}

export async function updateReservationStatus(barId, id, status) {
  const reservation = await db.collection('reservations').findOne({ id, barId })

  if (!reservation) {
    throw new Error('Reservation not found')
  }

  // Only update the status field, not the entire reservation object
  await db.collection('reservations').updateOne({ id, barId }, { status })

  // Fetch the updated reservation to return
  const updatedReservation = await db.collection('reservations').findOne({ id, barId })
  return updatedReservation
}

export async function getReservationStats(barId) {
  if (!barId) return null

  const reservations = await db.collection('reservations').find({ barId })
  const today = new Date().toISOString().split('T')[0]

  return {
    pending: reservations.filter(r => r.status === 'pending').length,
    confirmed: reservations.filter(r => r.status === 'confirmed').length,
    cancelled: reservations.filter(r => r.status === 'cancelled').length,
    total: reservations.length,
    todayConfirmed: reservations.filter(r => r.status === 'confirmed' && r.date === today).length,
  }
}
