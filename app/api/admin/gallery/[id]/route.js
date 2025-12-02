import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

/**
 * PUT /api/admin/gallery/[id]
 * Update a gallery image
 */
export async function PUT(request, { params }) {
  try {
    const { id } = params
    const body = await request.json()
    const { url, alt, caption, category, featured, order } = body

    const image = await db.collection('gallery').findOne({ id })

    if (!image) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 })
    }

    const updates = {
      updatedAt: new Date().toISOString(),
    }

    if (url !== undefined) updates.url = url
    if (alt !== undefined) updates.alt = alt
    if (caption !== undefined) updates.caption = caption
    if (category !== undefined) updates.category = category
    if (featured !== undefined) updates.featured = featured
    if (order !== undefined) updates.order = order

    await db.collection('gallery').updateOne({ id }, updates)

    const updatedImage = await db.collection('gallery').findOne({ id })
    return NextResponse.json({ success: true, image: updatedImage })
  } catch (error) {
    console.error('Update gallery image error:', error)
    return NextResponse.json({ error: error.message || 'Failed to update gallery image' }, { status: 500 })
  }
}

/**
 * DELETE /api/admin/gallery/[id]
 * Delete a gallery image
 */
export async function DELETE(request, { params }) {
  try {
    const { id } = params

    const result = await db.collection('gallery').deleteOne({ id })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete gallery image error:', error)
    return NextResponse.json({ error: error.message || 'Failed to delete gallery image' }, { status: 500 })
  }
}

