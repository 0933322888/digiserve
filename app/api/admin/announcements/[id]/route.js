import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { parseLocalDate } from '@/lib/utils'

/**
 * GET /api/admin/announcements/[id]
 * Get a specific announcement
 */
export async function GET(request, context) {
  try {
    const { id } = await context.params
    const announcement = await db.collection('announcements').findOne({ id })

    if (!announcement) {
      return NextResponse.json({ error: 'Announcement not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, announcement })
  } catch (error) {
    console.error('Get announcement error:', error)
    return NextResponse.json({ error: error.message || 'Failed to get announcement' }, { status: 500 })
  }
}

/**
 * PUT /api/admin/announcements/[id]
 * Update an announcement
 */
export async function PUT(request, context) {
  try {
    const { id } = await context.params
    const body = await request.json()
    const { title, message, startDate, endDate, type, active } = body

    const announcement = await db.collection('announcements').findOne({ id })
    if (!announcement) {
      return NextResponse.json({ error: 'Announcement not found' }, { status: 404 })
    }

    const updates = {}
    if (title !== undefined) updates.title = title
    if (message !== undefined) updates.message = message
    if (startDate !== undefined) updates.startDate = startDate
    if (endDate !== undefined) updates.endDate = endDate
    if (type !== undefined) updates.type = type
    if (active !== undefined) updates.active = active
    updates.updatedAt = new Date().toISOString()

    // Validate date range if both dates are being updated
    if (updates.startDate && updates.endDate) {
      const start = parseLocalDate(updates.startDate)
      const end = parseLocalDate(updates.endDate)
      if (end < start) {
        return NextResponse.json({ error: 'End date must be after start date' }, { status: 400 })
      }
    } else if (updates.startDate) {
      const start = parseLocalDate(updates.startDate)
      const end = parseLocalDate(announcement.endDate)
      if (end < start) {
        return NextResponse.json({ error: 'End date must be after start date' }, { status: 400 })
      }
    } else if (updates.endDate) {
      const start = parseLocalDate(announcement.startDate)
      const end = parseLocalDate(updates.endDate)
      if (end < start) {
        return NextResponse.json({ error: 'End date must be after start date' }, { status: 400 })
      }
    }

    await db.collection('announcements').updateOne({ id }, { $set: updates })

    const updatedAnnouncement = await db.collection('announcements').findOne({ id })
    return NextResponse.json({ success: true, announcement: updatedAnnouncement })
  } catch (error) {
    console.error('Update announcement error:', error)
    return NextResponse.json({ error: error.message || 'Failed to update announcement' }, { status: 500 })
  }
}

/**
 * DELETE /api/admin/announcements/[id]
 * Delete an announcement
 */
export async function DELETE(request, context) {
  try {
    const { id } = await context.params

    const result = await db.collection('announcements').deleteOne({ id })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Announcement not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: 'Announcement deleted successfully' })
  } catch (error) {
    console.error('Delete announcement error:', error)
    return NextResponse.json({ error: error.message || 'Failed to delete announcement' }, { status: 500 })
  }
}

