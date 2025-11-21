import { NextResponse } from 'next/server'
import { siteConfig } from '@/config/siteConfig'

/**
 * Create Order API Route
 * Validates order and creates order record
 */
export async function POST(request) {
  try {
    const body = await request.json()
    const {
      cartItems,
      customerInfo,
      orderType,
      pickupTime,
      deliveryAddress,
      totals,
      paymentIntentId,
    } = body

    // Validation
    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json(
        { error: 'Cart is empty' },
        { status: 400 }
      )
    }

    if (!customerInfo || !customerInfo.name || !customerInfo.email || !customerInfo.phone) {
      return NextResponse.json(
        { error: 'Customer information is required' },
        { status: 400 }
      )
    }

    if (!orderType || (orderType !== 'pickup' && orderType !== 'delivery')) {
      return NextResponse.json(
        { error: 'Invalid order type' },
        { status: 400 }
      )
    }

    // Validate pickup time if pickup
    if (orderType === 'pickup') {
      if (!pickupTime) {
        return NextResponse.json(
          { error: 'Pickup time is required' },
          { status: 400 }
        )
      }

      // Validate pickup time is in the future
      const pickupDate = new Date(pickupTime)
      const now = new Date()
      if (pickupDate <= now) {
        return NextResponse.json(
          { error: 'Pickup time must be in the future' },
          { status: 400 }
        )
      }

      // Validate business hours
      const dayName = pickupDate.toLocaleDateString('en-US', { weekday: 'long' })
      const businessHours = siteConfig.ordering?.businessHours?.[dayName]
      
      if (businessHours?.closed) {
        return NextResponse.json(
          { error: `We are closed on ${dayName}` },
          { status: 400 }
        )
      }

      if (businessHours) {
        const pickupHour = pickupDate.getHours()
        const pickupMinute = pickupDate.getMinutes()
        const [openHour, openMinute] = businessHours.open.split(':').map(Number)
        const [closeHour, closeMinute] = businessHours.close.split(':').map(Number)

        const pickupTimeMinutes = pickupHour * 60 + pickupMinute
        const openTimeMinutes = openHour * 60 + openMinute
        const closeTimeMinutes = closeHour * 60 + closeMinute

        if (pickupTimeMinutes < openTimeMinutes || pickupTimeMinutes > closeTimeMinutes) {
          return NextResponse.json(
            { error: `Pickup time must be between ${businessHours.open} and ${businessHours.close}` },
            { status: 400 }
          )
        }
      }
    }

    // Validate delivery address if delivery
    if (orderType === 'delivery') {
      if (!deliveryAddress || !deliveryAddress.street || !deliveryAddress.city || !deliveryAddress.zip) {
        return NextResponse.json(
          { error: 'Delivery address is required' },
          { status: 400 }
        )
      }

      // Check if delivery is enabled
      if (!siteConfig.ordering?.delivery) {
        return NextResponse.json(
          { error: 'Delivery is not available' },
          { status: 400 }
        )
      }

      // Validate delivery zone (optional)
      if (siteConfig.ordering?.deliverySettings?.deliveryZones) {
        const zipPrefix = deliveryAddress.zip.substring(0, 4)
        const validZone = siteConfig.ordering.deliverySettings.deliveryZones.some(
          (zone) => deliveryAddress.zip.startsWith(zone.postal)
        )
        if (!validZone) {
          return NextResponse.json(
            { error: 'Delivery is not available to this address' },
            { status: 400 }
          )
        }
      }
    }

    // Create order object
    const order = {
      id: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      customerInfo,
      orderType,
      items: cartItems,
      totals,
      paymentIntentId,
      status: 'pending',
      createdAt: new Date().toISOString(),
      ...(orderType === 'pickup' && { pickupTime }),
      ...(orderType === 'delivery' && { deliveryAddress }),
    }

    // Store in database if enabled
    if (siteConfig.ordering?.useDatabase) {
      // TODO: Store in DynamoDB
      // Example:
      // await dynamodb.put({
      //   TableName: 'Orders',
      //   Item: order,
      // }).promise()
    }

    // Send confirmation email if enabled
    if (siteConfig.api.enableEmail) {
      // TODO: Send email via AWS SES
      // Example:
      // await ses.sendEmail({
      //   Source: siteConfig.restaurant.email,
      //   Destination: { ToAddresses: [customerInfo.email] },
      //   Message: {
      //     Subject: { Data: `Order Confirmation - ${order.id}` },
      //     Body: {
      //       Text: { Data: `Your order ${order.id} has been received...` },
      //     },
      //   },
      // }).promise()
    }

    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    console.error('Order creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    )
  }
}

