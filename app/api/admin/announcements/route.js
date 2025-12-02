import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { parseLocalDate } from '@/lib/utils'
import crypto from 'crypto'

/**
 * GET /api/admin/announcements
 * Get all announcements
 */
export async function GET() {
  try {
    const announcements = await db.collection('announcements').find()
    // Sort by start date descending (most recent first)
    announcements.sort((a, b) => parseLocalDate(b.startDate) - parseLocalDate(a.startDate))
    return NextResponse.json({ success: true, announcements })
  } catch (error) {
    console.error('Get announcements error:', error)
    return NextResponse.json({ error: error.message || 'Failed to get announcements' }, { status: 500 })
  }
}

/**
 * POST /api/admin/announcements
 * Create a new announcement
 */
export async function POST(request) {
  try {
    const body = await request.json()
    const { title, message, startDate, endDate, type, active } = body

    if (!title || !message || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Title, message, start date, and end date are required' },
        { status: 400 }
      )
    }

    // Validate date range
    const start = parseLocalDate(startDate)
    const end = parseLocalDate(endDate)
    if (end < start) {
      return NextResponse.json({ error: 'End date must be after start date' }, { status: 400 })
    }

    const announcement = {
      id: crypto.randomUUID(),
      title,
      message,
      startDate,
      endDate,
      type: type || 'info',
      active: active !== undefined ? active : true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    await db.collection('announcements').insertOne(announcement)

    return NextResponse.json({ success: true, announcement })
  } catch (error) {
    console.error('Create announcement error:', error)
    return NextResponse.json({ error: error.message || 'Failed to create announcement' }, { status: 500 })
  }
}

