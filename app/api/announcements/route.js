import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { parseLocalDate } from '@/lib/utils'
import { getTenantFromRequest } from '@/lib/tenant-service'

/**
 * GET /api/announcements
 * Get active announcements within their date range
 * Public API for displaying announcements on the home page
 */
export async function GET(request) {
  try {
    const barId = await getTenantFromRequest(request)

    if (!barId) {
      return NextResponse.json({ error: 'Invalid tenant or domain' }, { status: 400 })
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const allAnnouncements = await db.collection('announcements').find({ barId })

    // Filter announcements that are:
    // 1. Active
    // 2. Within their date range (today is between startDate and endDate)
    const activeAnnouncements = allAnnouncements.filter(announcement => {
      if (!announcement.active) return false

      const startDate = parseLocalDate(announcement.startDate)
      startDate.setHours(0, 0, 0, 0)
      const endDate = parseLocalDate(announcement.endDate)
      endDate.setHours(23, 59, 59, 999)

      return today >= startDate && today <= endDate
    })

    // Sort by start date (most recent first)
    activeAnnouncements.sort((a, b) => parseLocalDate(b.startDate) - parseLocalDate(a.startDate))

    return NextResponse.json({ success: true, announcements: activeAnnouncements })
  } catch (error) {
    console.error('Get active announcements error:', error)
    return NextResponse.json({ error: error.message || 'Failed to get announcements' }, { status: 500 })
  }
}

