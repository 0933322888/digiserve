import { NextResponse } from 'next/server'
import { getRestaurantConfig, updateRestaurantConfig } from '@/lib/restaurant-config-service'

/**
 * GET /api/admin/settings/restaurant
 * Get restaurant settings (DB-first with siteConfig fallback)
 */
export async function GET() {
  try {
    const restaurant = await getRestaurantConfig()
    return NextResponse.json({ success: true, restaurant })
  } catch (error) {
    console.error('Get restaurant settings error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get restaurant settings' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/admin/settings/restaurant
 * Update restaurant settings
 */
export async function PUT(request) {
  try {
    const body = await request.json()
    const { name, tagline, description, phone, email, address } = body

    const updates = {}
    if (name !== undefined) updates.name = name
    if (tagline !== undefined) updates.tagline = tagline
    if (description !== undefined) updates.description = description
    if (phone !== undefined) updates.phone = phone
    if (email !== undefined) updates.email = email
    if (address !== undefined) updates.address = address

    // Validate required fields if provided
    if (address && typeof address === 'object') {
      const required = ['street', 'city', 'state', 'zip', 'country']
      for (const field of required) {
        if (!address[field]) {
          return NextResponse.json(
            { error: `Address ${field} is required` },
            { status: 400 }
          )
        }
      }
    }

    const updated = await updateRestaurantConfig(updates, 'admin')

    return NextResponse.json({
      success: true,
      message: 'Restaurant settings updated successfully',
      restaurant: updated,
    })
  } catch (error) {
    console.error('Update restaurant settings error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update restaurant settings' },
      { status: 500 }
    )
  }
}

