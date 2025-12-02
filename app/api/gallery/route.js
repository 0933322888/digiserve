import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getTenantFromRequest } from '@/lib/tenant-service'

/**
 * GET /api/gallery
 * Get all gallery images (public endpoint)
 */
export async function GET(request) {
  try {
    const barId = await getTenantFromRequest(request)

    if (!barId) {
      return NextResponse.json({ error: 'Invalid tenant or domain' }, { status: 400 })
    }

    const images = await db.collection('gallery').find({ barId })
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

