import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

/**
 * PUT /api/admin/events/[id]
 * Update an event
 */
export async function PUT(request, context) {
  try {
    const barId = request.headers.get('x-tenant-id')
    if (!barId) {
      return NextResponse.json({ error: 'Tenant ID is required' }, { status: 400 })
    }
    const { id } = await context.params
    const body = await request.json()
    const { title, date, time, description, image, featured } = body

    const event = await db.collection('events').findOne({ id, barId })

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    const updates = {
      updatedAt: new Date().toISOString(),
    }

    if (title !== undefined) updates.title = title
    if (date !== undefined) updates.date = date
    if (time !== undefined) updates.time = time
    if (description !== undefined) updates.description = description
    if (image !== undefined) updates.image = image
    if (featured !== undefined) updates.featured = featured

    await db.collection('events').updateOne({ id, barId }, { $set: updates })

    const updatedEvent = await db.collection('events').findOne({ id, barId })
    return NextResponse.json({ success: true, event: updatedEvent })
  } catch (error) {
    console.error('Update event error:', error)
    return NextResponse.json({ error: error.message || 'Failed to update event' }, { status: 500 })
  }
}

/**
 * DELETE /api/admin/events/[id]
 * Delete an event
 */
export async function DELETE(request, context) {
  try {
    const barId = request.headers.get('x-tenant-id')
    if (!barId) {
      return NextResponse.json({ error: 'Tenant ID is required' }, { status: 400 })
    }
    const { id } = await context.params

    const result = await db.collection('events').deleteOne({ id, barId })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete event error:', error)
    return NextResponse.json({ error: error.message || 'Failed to delete event' }, { status: 500 })
  }
}

