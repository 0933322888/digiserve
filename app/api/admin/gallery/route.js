import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import crypto from 'crypto'

/**
 * GET /api/admin/gallery
 * Get all gallery images
 */
export async function GET() {
  try {
    const images = await db.collection('gallery').find()
    // Sort by order, then by creation date
    images.sort((a, b) => {
      if (a.order !== b.order) return (a.order || 0) - (b.order || 0)
      return new Date(b.createdAt) - new Date(a.createdAt)
    })
    return NextResponse.json({ success: true, images })
  } catch (error) {
    console.error('Get gallery images error:', error)
    return NextResponse.json({ error: error.message || 'Failed to get gallery images' }, { status: 500 })
  }
}

/**
 * POST /api/admin/gallery
 * Add a new gallery image
 */
export async function POST(request) {
  try {
    const body = await request.json()
    const { url, alt, caption, category, featured, order } = body

    if (!url) {
      return NextResponse.json({ error: 'Image URL is required' }, { status: 400 })
    }

    const image = {
      id: crypto.randomUUID(),
      url,
      alt: alt || '',
      caption: caption || '',
      category: category || '',
      featured: featured || false,
      order: order || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    await db.collection('gallery').insertOne(image)

    return NextResponse.json({ success: true, image })
  } catch (error) {
    console.error('Add gallery image error:', error)
    return NextResponse.json({ error: error.message || 'Failed to add gallery image' }, { status: 500 })
  }
}

