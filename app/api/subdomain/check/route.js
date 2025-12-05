import { NextResponse } from 'next/server'
import connectDB from '@/lib/db/mongodb-connection'
import { getRestaurantModel } from '@/lib/db/models'

export async function POST(request) {
  try {
    const body = await request.json()
    const { subdomain } = body || {}
    if (!subdomain || typeof subdomain !== 'string') {
      return NextResponse.json({ error: 'subdomain is required' }, { status: 400 })
    }

    const clean = subdomain.trim().toLowerCase()
    if (!/^[a-z0-9-]{2,63}$/.test(clean)) {
      return NextResponse.json({ available: false, reason: 'invalid_format' })
    }

    await connectDB()
    const Restaurant = getRestaurantModel()

    // Check slug, subdomain, domain and customDomains
    const existing = await Restaurant.findOne({
      $or: [
        { slug: clean },
        { subdomain: clean },
        { domain: clean },
        { customDomains: clean },
      ],
    })

    if (existing) {
      return NextResponse.json({ available: false })
    }

    // reserved list
    const reserved = ['www', 'app', 'api', 'admin']
    if (reserved.includes(clean)) {
      return NextResponse.json({ available: false, reason: 'reserved' })
    }

    return NextResponse.json({ available: true })
  } catch (error) {
    console.error('Subdomain check error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
