import { NextResponse } from 'next/server'
import { siteConfig } from '@/config/siteConfig'
import { getBusinessHours } from '@/lib/app-settings-service'
import { createOrder } from '@/lib/order-service'
import { logEvent } from '@/lib/event-service'
import { getTenantFromRequest, getTenantConfig } from '@/lib/tenant-service'

/**
 * Create Order API Route
 * Validates order and creates order record
 */
export async function POST(request) {
  try {
    const barId = await getTenantFromRequest(request)

    if (!barId) {
      return NextResponse.json({ error: 'Invalid tenant or domain' }, { status: 400 })
    }

    const tenantConfig = await getTenantConfig(barId)
    if (!tenantConfig) {
      return NextResponse.json({ error: 'Tenant configuration not found' }, { status: 404 })
    }

    const body = await request.json()
    const {
      cartItems,
      customerInfo,
      orderType,
      pickupTime,
      dineInTime,
      deliveryAddress,
      totals,
      paymentIntentId,
    } = body

    // Validation
    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
    }

    if (!customerInfo || !customerInfo.name || !customerInfo.email || !customerInfo.phone) {
      return NextResponse.json({ error: 'Customer information is required' }, { status: 400 })
    }

    if (
      !orderType ||
      (orderType !== 'pickup' && orderType !== 'delivery' && orderType !== 'dineIn')
    ) {
      return NextResponse.json({ error: 'Invalid order type' }, { status: 400 })
    }

    // Validate pickup time if pickup
    if (orderType === 'pickup') {
      if (!pickupTime) {
        return NextResponse.json({ error: 'Pickup time is required' }, { status: 400 })
      }

      // Validate pickup time is in the future
      const pickupDate = new Date(pickupTime)
      const now = new Date()
      if (pickupDate <= now) {
        return NextResponse.json({ error: 'Pickup time must be in the future' }, { status: 400 })
      }

      // Validate business hours
      const dayName = pickupDate.toLocaleDateString('en-US', { weekday: 'long' })
      const allHours = await getBusinessHours(barId)
      const businessHours = allHours?.[dayName]

      if (businessHours?.closed) {
        return NextResponse.json({ error: `We are closed on ${dayName}` }, { status: 400 })
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
            {
              error: `Pickup time must be between ${businessHours.open} and ${businessHours.close}`,
            },
            { status: 400 }
          )
        }
      }
    }

    // Validate dine-in time if dineIn
    if (orderType === 'dineIn') {
      if (!dineInTime) {
        return NextResponse.json({ error: 'Dine-in time is required' }, { status: 400 })
      }

      // Check if dine-in is enabled
      if (!tenantConfig.ordering?.dineIn) {
        return NextResponse.json({ error: 'Dine-in ordering is not available' }, { status: 400 })
      }

      // Validate dine-in time is in the future
      const dineInDate = new Date(dineInTime)
      const now = new Date()
      if (dineInDate <= now) {
        return NextResponse.json({ error: 'Dine-in time must be in the future' }, { status: 400 })
      }

      // Validate business hours (same logic as pickup)
      const dayName = dineInDate.toLocaleDateString('en-US', { weekday: 'long' })
      const allHours = await getBusinessHours()
      const businessHours = allHours?.[dayName]

      if (businessHours?.closed) {
        return NextResponse.json({ error: `We are closed on ${dayName}` }, { status: 400 })
      }

      if (businessHours) {
        const dineInHour = dineInDate.getHours()
        const dineInMinute = dineInDate.getMinutes()
        const [openHour, openMinute] = businessHours.open.split(':').map(Number)
        const [closeHour, closeMinute] = businessHours.close.split(':').map(Number)

        const dineInTimeMinutes = dineInHour * 60 + dineInMinute
        const openTimeMinutes = openHour * 60 + openMinute
        const closeTimeMinutes = closeHour * 60 + closeMinute

        if (dineInTimeMinutes < openTimeMinutes || dineInTimeMinutes > closeTimeMinutes) {
          return NextResponse.json(
            {
              error: `Dine-in time must be between ${businessHours.open} and ${businessHours.close}`,
            },
            { status: 400 }
          )
        }
      }
    }

    // Validate delivery address if delivery
    if (orderType === 'delivery') {
      if (
        !deliveryAddress ||
        !deliveryAddress.street ||
        !deliveryAddress.city ||
        !deliveryAddress.zip
      ) {
        return NextResponse.json({ error: 'Delivery address is required' }, { status: 400 })
      }

      // Check if delivery is enabled
      if (!tenantConfig.ordering?.delivery) {
        return NextResponse.json({ error: 'Delivery is not available' }, { status: 400 })
      }

      // Validate delivery zone (optional)
      if (tenantConfig.ordering?.deliverySettings?.deliveryZones) {
        const zipPrefix = deliveryAddress.zip.substring(0, 4)
        const validZone = tenantConfig.ordering.deliverySettings.deliveryZones.some(zone =>
          deliveryAddress.zip.startsWith(zone.postal)
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
    const orderData = {
      customerInfo,
      orderType,
      items: cartItems,
      totals,
      paymentIntentId,
      status: 'pending',
      createdAt: new Date().toISOString(),
      barId, // Use validated tenant ID from request
      ...(orderType === 'pickup' && { pickupTime }),
      ...(orderType === 'dineIn' && { dineInTime }),
      ...(orderType === 'delivery' && { deliveryAddress }),
    }

    // Store order
    const order = await createOrder(orderData)

    // Log order creation event
    await logEvent(orderData.barId, 'ORDER', `New order created: ${order.id} - ${order.orderType}`, 'SUCCESS', {
      orderId: order.id,
      orderType: order.orderType,
      customerName: customerInfo.name,
      total: order.totals?.total || 0,
    })

    // Also store in database if enabled
    // Always store in database for now
    // if (tenantConfig.ordering?.useDatabase) { ... }

    // Send confirmation email if enabled
    if (tenantConfig.features?.enableEmail) {
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
