import { getOrders } from './order-service'
import { getAllMenus, getActiveMenu } from './menu-service'

// ========== SALES REPORTS ==========

export async function getSalesReport(barId, startDate, endDate) {
  const allOrders = await getOrders({ barId })
  // Filter by date range
  const orders = allOrders.filter(order => {
    const orderDate = new Date(order.createdAt).toISOString().split('T')[0]
    return orderDate >= startDate && orderDate <= endDate
  })

  const report = {
    period: { startDate, endDate },
    totalOrders: orders.length,
    totalRevenue: 0,
    averageOrderValue: 0,
    revenueByType: {
      pickup: 0,
      delivery: 0,
      dineIn: 0,
    },
    revenueByDay: {},
    ordersByStatus: {
      pending: 0,
      preparing: 0,
      ready: 0,
      completed: 0,
      cancelled: 0,
    },
  }

  orders.forEach(order => {
    const orderTotal = order.totals?.total || 0
    report.totalRevenue += orderTotal

    // Revenue by order type
    if (order.orderType === 'pickup') {
      report.revenueByType.pickup += orderTotal
    } else if (order.orderType === 'delivery') {
      report.revenueByType.delivery += orderTotal
    } else if (order.orderType === 'dineIn') {
      report.revenueByType.dineIn += orderTotal
    }

    // Revenue by day
    const orderDate = new Date(order.createdAt).toISOString().split('T')[0]
    if (!report.revenueByDay[orderDate]) {
      report.revenueByDay[orderDate] = 0
    }
    report.revenueByDay[orderDate] += orderTotal

    // Orders by status
    const status = order.status || 'pending'
    if (report.ordersByStatus[status] !== undefined) {
      report.ordersByStatus[status]++
    }
  })

  report.averageOrderValue = report.totalOrders > 0 ? report.totalRevenue / report.totalOrders : 0

  return report
}

// ========== POPULAR ITEMS ANALYSIS ==========

export async function getPopularItems(barId, startDate, endDate, limit = 10) {
  const allOrders = await getOrders({ barId })
  const orders = allOrders.filter(order => {
    const orderDate = new Date(order.createdAt).toISOString().split('T')[0]
    return orderDate >= startDate && orderDate <= endDate
  })
  const activeMenu = await getActiveMenu(barId)

  const itemCounts = {}
  const itemRevenue = {}

  orders.forEach(order => {
    if (!order.items || !Array.isArray(order.items)) return

    order.items.forEach(item => {
      const itemId = item.id || item.name
      const quantity = item.quantity || 1
      const price = item.price || 0

      if (!itemCounts[itemId]) {
        itemCounts[itemId] = {
          id: itemId,
          name: item.name || itemId,
          quantity: 0,
          revenue: 0,
          orders: 0,
        }
      }

      itemCounts[itemId].quantity += quantity
      itemCounts[itemId].revenue += price * quantity
      itemCounts[itemId].orders += 1
    })
  })

  // Get item details from menu if available
  const itemsWithDetails = Object.values(itemCounts).map(item => {
    if (activeMenu) {
      // Try to find item in menu sections
      for (const section of activeMenu.sections || []) {
        const menuItem = section.items?.find(i => i.id === item.id || i.name === item.name)
        if (menuItem) {
          item.category = section.name
          item.description = menuItem.description
          break
        }
      }
    }
    return item
  })

  // Sort by quantity (most popular)
  itemsWithDetails.sort((a, b) => b.quantity - a.quantity)

  return itemsWithDetails.slice(0, limit)
}

export async function getItemsByCategory(barId, startDate, endDate) {
  const allOrders = await getOrders({ barId })
  const orders = allOrders.filter(order => {
    const orderDate = new Date(order.createdAt).toISOString().split('T')[0]
    return orderDate >= startDate && orderDate <= endDate
  })
  const activeMenu = await getActiveMenu(barId)

  const categoryStats = {}

  orders.forEach(order => {
    if (!order.items || !Array.isArray(order.items)) return

    order.items.forEach(item => {
      let category = 'Uncategorized'

      // Find category from menu
      if (activeMenu) {
        for (const section of activeMenu.sections || []) {
          const menuItem = section.items?.find(i => i.id === item.id || i.name === item.name)
          if (menuItem) {
            category = section.name
            break
          }
        }
      }

      if (!categoryStats[category]) {
        categoryStats[category] = {
          category,
          quantity: 0,
          revenue: 0,
          orders: 0,
        }
      }

      const quantity = item.quantity || 1
      const price = item.price || 0

      categoryStats[category].quantity += quantity
      categoryStats[category].revenue += price * quantity
      categoryStats[category].orders += 1
    })
  })

  return Object.values(categoryStats).sort((a, b) => b.revenue - a.revenue)
}

// ========== REVENUE TRENDS ==========

export async function getRevenueTrends(barId, startDate, endDate, groupBy = 'day') {
  const allOrders = await getOrders({ barId })
  const orders = allOrders.filter(order => {
    const orderDate = new Date(order.createdAt).toISOString().split('T')[0]
    return orderDate >= startDate && orderDate <= endDate
  })

  const trends = {}
  const start = new Date(startDate)
  const end = new Date(endDate)

  orders.forEach(order => {
    const orderDate = new Date(order.createdAt)
    let key

    if (groupBy === 'day') {
      key = orderDate.toISOString().split('T')[0]
    } else if (groupBy === 'week') {
      const weekStart = new Date(orderDate)
      weekStart.setDate(orderDate.getDate() - orderDate.getDay())
      key = weekStart.toISOString().split('T')[0]
    } else if (groupBy === 'month') {
      key = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}`
    } else if (groupBy === 'hour') {
      key = `${orderDate.toISOString().split('T')[0]} ${String(orderDate.getHours()).padStart(2, '0')}:00`
    }

    if (!trends[key]) {
      trends[key] = {
        period: key,
        revenue: 0,
        orders: 0,
      }
    }

    trends[key].revenue += order.totals?.total || 0
    trends[key].orders += 1
  })

  return Object.values(trends).sort((a, b) => a.period.localeCompare(b.period))
}

// ========== CUSTOMER ANALYTICS ==========

export async function getCustomerAnalytics(barId, startDate, endDate) {
  const allOrders = await getOrders({ barId })
  const orders = allOrders.filter(order => {
    const orderDate = new Date(order.createdAt).toISOString().split('T')[0]
    return orderDate >= startDate && orderDate <= endDate
  })

  const customerStats = {}
  const customerOrders = {}

  orders.forEach(order => {
    const customerId = order.customerInfo?.email || order.customerInfo?.phone || 'anonymous'
    const orderTotal = order.totals?.total || 0

    if (!customerStats[customerId]) {
      customerStats[customerId] = {
        customerId,
        customerName: order.customerInfo?.name || 'Anonymous',
        email: order.customerInfo?.email || '',
        phone: order.customerInfo?.phone || '',
        totalOrders: 0,
        totalSpent: 0,
        averageOrderValue: 0,
        firstOrderDate: order.createdAt,
        lastOrderDate: order.createdAt,
      }
      customerOrders[customerId] = []
    }

    customerStats[customerId].totalOrders += 1
    customerStats[customerId].totalSpent += orderTotal
    customerStats[customerId].lastOrderDate = order.createdAt
    customerOrders[customerId].push(order)
  })

  // Calculate average order value and lifetime value
  Object.keys(customerStats).forEach(customerId => {
    const stats = customerStats[customerId]
    stats.averageOrderValue = stats.totalOrders > 0 ? stats.totalSpent / stats.totalOrders : 0
    stats.lifetimeValue = stats.totalSpent
  })

  return {
    totalCustomers: Object.keys(customerStats).length,
    customers: Object.values(customerStats).sort((a, b) => b.totalSpent - a.totalSpent),
    averageOrderValue:
      orders.length > 0
        ? orders.reduce((sum, o) => sum + (o.totals?.total || 0), 0) / orders.length
        : 0,
    topCustomers: Object.values(customerStats)
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 10),
  }
}

// ========== ORDER PATTERNS ==========

export async function getOrderPatterns(barId, startDate, endDate) {
  const allOrders = await getOrders({ barId })
  const orders = allOrders.filter(order => {
    const orderDate = new Date(order.createdAt).toISOString().split('T')[0]
    return orderDate >= startDate && orderDate <= endDate
  })

  const patterns = {
    byTimeOfDay: {},
    byDayOfWeek: {},
    byOrderType: {
      pickup: 0,
      delivery: 0,
      dineIn: 0,
    },
    byHour: {},
  }

  orders.forEach(order => {
    const orderDate = new Date(order.createdAt)
    const hour = orderDate.getHours()
    const dayOfWeek = orderDate.toLocaleDateString('en-US', { weekday: 'long' })

    // Time of day
    let timeOfDay
    if (hour >= 6 && hour < 12) {
      timeOfDay = 'Morning (6 AM - 12 PM)'
    } else if (hour >= 12 && hour < 17) {
      timeOfDay = 'Afternoon (12 PM - 5 PM)'
    } else if (hour >= 17 && hour < 22) {
      timeOfDay = 'Evening (5 PM - 10 PM)'
    } else {
      timeOfDay = 'Night (10 PM - 6 AM)'
    }

    if (!patterns.byTimeOfDay[timeOfDay]) {
      patterns.byTimeOfDay[timeOfDay] = { period: timeOfDay, orders: 0, revenue: 0 }
    }
    patterns.byTimeOfDay[timeOfDay].orders += 1
    patterns.byTimeOfDay[timeOfDay].revenue += order.totals?.total || 0

    // Day of week
    if (!patterns.byDayOfWeek[dayOfWeek]) {
      patterns.byDayOfWeek[dayOfWeek] = { day: dayOfWeek, orders: 0, revenue: 0 }
    }
    patterns.byDayOfWeek[dayOfWeek].orders += 1
    patterns.byDayOfWeek[dayOfWeek].revenue += order.totals?.total || 0

    // Order type
    if (order.orderType && patterns.byOrderType[order.orderType] !== undefined) {
      patterns.byOrderType[order.orderType]++
    }

    // By hour
    if (!patterns.byHour[hour]) {
      patterns.byHour[hour] = { hour, orders: 0, revenue: 0 }
    }
    patterns.byHour[hour].orders += 1
    patterns.byHour[hour].revenue += order.totals?.total || 0
  })

  return {
    byTimeOfDay: Object.values(patterns.byTimeOfDay),
    byDayOfWeek: Object.values(patterns.byDayOfWeek).sort((a, b) => {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      return days.indexOf(a.day) - days.indexOf(b.day)
    }),
    byOrderType: patterns.byOrderType,
    byHour: Object.values(patterns.byHour).sort((a, b) => a.hour - b.hour),
  }
}

// ========== PEAK HOURS ANALYSIS ==========

export async function getPeakHoursAnalysis(barId, startDate, endDate) {
  const patterns = await getOrderPatterns(barId, startDate, endDate)

  const peakHours = patterns.byHour
    .map(h => ({ ...h, hourLabel: `${h.hour}:00` }))
    .sort((a, b) => b.orders - a.orders)

  const peakDays = patterns.byDayOfWeek.sort((a, b) => b.orders - a.orders)

  return {
    peakHours: peakHours.slice(0, 5),
    slowestHours: peakHours.slice(-5).reverse(),
    peakDays: peakDays.slice(0, 3),
    slowestDays: peakDays.slice(-3).reverse(),
    averageOrdersPerHour:
      peakHours.length > 0 ? peakHours.reduce((sum, h) => sum + h.orders, 0) / peakHours.length : 0,
  }
}

// ========== MULTI-BAR COMPARISON ==========

export async function getMultiBarComparison(startDate, endDate) {
  // For now, we'll compare by barId
  // In a real system, you'd have multiple bars
  const bars = ['bar_1'] // This would come from a bars/locations service

  const comparison = await Promise.all(
    bars.map(async barId => {
      const allOrders = await getOrders({ barId })
      const orders = allOrders.filter(order => {
        const orderDate = new Date(order.createdAt).toISOString().split('T')[0]
        return orderDate >= startDate && orderDate <= endDate
      })
      const totalRevenue = orders.reduce((sum, o) => sum + (o.totals?.total || 0), 0)

      return {
        barId,
        barName: `Bar ${barId.split('_')[1]}`,
        totalOrders: orders.length,
        totalRevenue,
        averageOrderValue: orders.length > 0 ? totalRevenue / orders.length : 0,
        ordersByType: {
          pickup: orders.filter(o => o.orderType === 'pickup').length,
          delivery: orders.filter(o => o.orderType === 'delivery').length,
          dineIn: orders.filter(o => o.orderType === 'dineIn').length,
        },
      }
    })
  )

  return comparison.sort((a, b) => b.totalRevenue - a.totalRevenue)
}
