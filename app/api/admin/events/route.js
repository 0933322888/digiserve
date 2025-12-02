import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { parseLocalDate } from '@/lib/utils'
import crypto from 'crypto'

/**
 * GET /api/admin/events
 * Get all events
 */
export async function GET(request) {
  try {
    const barId = request.headers.get('x-tenant-id')
    if (!barId) {
      return NextResponse.json({ error: 'Tenant ID is required' }, { status: 400 })
    }
    const events = await db.collection('events').find({ barId })
    // Sort by date ascending (using parseLocalDate to avoid timezone issues)
    events.sort((a, b) => parseLocalDate(a.date) - parseLocalDate(b.date))
    return NextResponse.json({ success: true, events })
  } catch (error) {
    console.error('Get events error:', error)
    return NextResponse.json({ error: error.message || 'Failed to get events' }, { status: 500 })
  }
}

/**
 * POST /api/admin/events
 * Create a new event
 */
export async function POST(request) {
  try {
    const barId = request.headers.get('x-tenant-id')
    if (!barId) {
      return NextResponse.json({ error: 'Tenant ID is required' }, { status: 400 })
    }
    const body = await request.json()
    const { title, date, time, description, image, featured } = body

    if (!title || !date || !time || !description) {
      return NextResponse.json({ error: 'Title, date, time, and description are required' }, { status: 400 })
    }

    const event = {
      id: crypto.randomUUID(),
      barId,
      title,
      date,
      time,
      description,
      image: image || '',
      featured: featured || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    await db.collection('events').insertOne(event)

    return NextResponse.json({ success: true, event })
  } catch (error) {
    console.error('Create event error:', error)
    return NextResponse.json({ error: error.message || 'Failed to create event' }, { status: 500 })
  }
}

