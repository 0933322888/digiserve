import { NextResponse } from 'next/server'
import { getSetting, setSetting } from '@/lib/app-settings-service'
import { siteConfig } from '@/config/siteConfig'

/**
 * GET /api/admin/settings/reservations-config
 * Get reservations configuration (max seats per slot, slot duration, etc.)
 */
export async function GET() {
  try {
    const getSettingValue = async (key, defaultValue) => {
      const dbValue = await getSetting(key)
      return dbValue !== null && dbValue !== undefined ? dbValue : defaultValue
    }

    const maxSeatsPerSlot = await getSettingValue(
      'RESERVATIONS_MAX_SEATS_PER_SLOT',
      siteConfig.reservations?.maxSeatsPerSlot ?? 40
    )

    const slotDurationMinutes = await getSettingValue(
      'RESERVATIONS_SLOT_DURATION_MINUTES',
      siteConfig.reservations?.slotDurationMinutes ?? 120
    )

    return NextResponse.json({
      success: true,
      reservations: {
        maxSeatsPerSlot,
        slotDurationMinutes,
      },
    })
  } catch (error) {
    console.error('Get reservations config error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get reservations configuration' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/admin/settings/reservations-config
 * Update reservations configuration
 */
export async function PUT(request) {
  try {
    const body = await request.json()
    const { maxSeatsPerSlot, slotDurationMinutes } = body

    if (
      maxSeatsPerSlot === undefined &&
      slotDurationMinutes === undefined
    ) {
      return NextResponse.json(
        { error: 'No reservations settings provided for update' },
        { status: 400 }
      )
    }

    if (maxSeatsPerSlot !== undefined) {
      const seatsNum =
        typeof maxSeatsPerSlot === 'string'
          ? parseInt(maxSeatsPerSlot, 10)
          : maxSeatsPerSlot

      if (!Number.isFinite(seatsNum) || seatsNum <= 0) {
        return NextResponse.json(
          { error: 'maxSeatsPerSlot must be a positive number' },
          { status: 400 }
        )
      }

      await setSetting(
        'RESERVATIONS_MAX_SEATS_PER_SLOT',
        seatsNum,
        'Maximum number of seats per reservation slot',
        'reservations',
        'admin'
      )
    }

    if (slotDurationMinutes !== undefined) {
      const durationNum =
        typeof slotDurationMinutes === 'string'
          ? parseInt(slotDurationMinutes, 10)
          : slotDurationMinutes

      if (!Number.isFinite(durationNum) || durationNum <= 0) {
        return NextResponse.json(
          { error: 'slotDurationMinutes must be a positive number' },
          { status: 400 }
        )
      }

      await setSetting(
        'RESERVATIONS_SLOT_DURATION_MINUTES',
        durationNum,
        'Reservation slot duration in minutes',
        'reservations',
        'admin'
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Reservations configuration updated successfully',
    })
  } catch (error) {
    console.error('Update reservations config error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update reservations configuration' },
      { status: 500 }
    )
  }
}


