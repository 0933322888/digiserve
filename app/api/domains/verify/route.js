import { NextResponse } from 'next/server'
import dns from 'dns'
import connectDB from '@/lib/db/mongodb-connection'
import { getRestaurantModel } from '@/lib/db/models'

const resolveTxt = dns.promises.resolveTxt

export async function POST(request) {
  try {
    const body = await request.json()
    const { tenantId, domain } = body
    if (!tenantId || !domain) {
      return NextResponse.json({ error: 'tenantId and domain are required' }, { status: 400 })
    }

    await connectDB()
    const Restaurant = getRestaurantModel()
    const restaurant = await Restaurant.findOne({ barId: tenantId })
    if (!restaurant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
    }

    if (!restaurant.domainVerification || !restaurant.domainVerification.token) {
      return NextResponse.json({ error: 'No pending domain verification for this tenant' }, { status: 400 })
    }

    // Attempt to resolve TXT records for the provided domain
    try {
      const records = await resolveTxt(domain)
      const flat = records.flat().map(r => r.toString())
      const expected = restaurant.domainVerification.token
      const match = flat.find(r => r.includes(expected) || r === expected)
      if (match) {
        restaurant.domainVerification.verified = true
        restaurant.domainVerification.verifiedAt = new Date()
        await restaurant.save()
        return NextResponse.json({ success: true, message: 'Domain verified' })
      }
      return NextResponse.json({ success: false, message: 'TXT record not found or does not match' }, { status: 400 })
    } catch (err) {
      console.error('DNS lookup error:', err)
      return NextResponse.json({ error: 'Failed to check DNS records. Please try again later.' }, { status: 500 })
    }

  } catch (error) {
    console.error('Domain verify error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
