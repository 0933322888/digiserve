import { NextResponse } from 'next/server'
import connectDB from '@/lib/db/mongodb-connection.js'
import {
  getTotalVisits,
  getUniqueVisitors,
  getTopPages,
  getReferrers,
  getDeviceStats,
  getCountryStats,
  getTimeseries,
  getUTMStats,
  getRestaurant,
} from '@/lib/analytics.js'

/**
 * GET /api/admin/analytics/web
 * Get web analytics data for dashboard
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const restaurantId = searchParams.get('restaurantId') || 'default'
    const range = searchParams.get('range') || '7d' // 7d, 30d, custom
    const startDateParam = searchParams.get('startDate')
    const endDateParam = searchParams.get('endDate')
    const deviceFilter = searchParams.get('device')
    const campaignFilter = searchParams.get('campaign')
    const referrerFilter = searchParams.get('referrer')

    await connectDB()

    // Get restaurant - try by ID, slug, or barId
    const restaurant = await getRestaurant(restaurantId)
    if (!restaurant) {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 })
    }

    // Calculate date range
    let startDate, endDate
    const now = new Date()
    endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)

    if (startDateParam && endDateParam) {
      startDate = new Date(startDateParam)
      endDate = new Date(endDateParam)
      endDate.setHours(23, 59, 59)
    } else {
      switch (range) {
        case '7d':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7, 0, 0, 0)
          break
        case '30d':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30, 0, 0, 0)
          break
        default:
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7, 0, 0, 0)
      }
    }

    // Build base match filter
    const baseFilter = {
      restaurantId: restaurant._id,
      timestamp: { $gte: startDate, $lte: endDate },
    }

    // Apply filters if provided (for future use in aggregation)
    const filters = {
      device: deviceFilter || null,
      campaign: campaignFilter || null,
      referrer: referrerFilter || null,
    }

    // Fetch all analytics data in parallel
    const [
      totalVisits,
      uniqueVisitors,
      topPages,
      referrers,
      deviceStats,
      countryStats,
      timeseries,
      utmStats,
    ] = await Promise.all([
      getTotalVisits(restaurant._id, startDate, endDate),
      getUniqueVisitors(restaurant._id, startDate, endDate),
      getTopPages(restaurant._id, startDate, endDate, 10),
      getReferrers(restaurant._id, startDate, endDate, 10),
      getDeviceStats(restaurant._id, startDate, endDate),
      getCountryStats(restaurant._id, startDate, endDate, 10),
      getTimeseries(restaurant._id, startDate, endDate, range === '7d' ? 'day' : 'day'),
      getUTMStats(restaurant._id, startDate, endDate, 10),
    ])

    return NextResponse.json({
      success: true,
      data: {
        totalVisits,
        uniqueVisitors,
        topPages,
        referrers,
        deviceStats,
        countryStats,
        timeseries,
        utmStats,
        dateRange: {
          start: startDate.toISOString(),
          end: endDate.toISOString(),
        },
        restaurant: {
          id: restaurant._id.toString(),
          name: restaurant.name,
        },
      },
    })
  } catch (error) {
    console.error('Web analytics API error:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics data' }, { status: 500 })
  }
}

