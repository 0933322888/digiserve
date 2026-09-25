import { NextResponse } from 'next/server'
import { getRestaurantModel, getUserModel } from '@/lib/db/models.js'
import connectDB from '@/lib/db/mongodb-connection.js'
import { clearTenantCache } from '@/lib/tenant-service'

/**
 * GET /api/super-admin/tenants/[id]
 * Fetch single tenant details with assigned users
 */
export async function GET(request, context) {
  try {
    const { id } = await context.params
    await connectDB()
    const Restaurant = getRestaurantModel()
    const User = getUserModel()

    const tenant = await Restaurant.findOne({
      $or: [{ barId: id }, { slug: id }]
    }).lean()

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
    }

    // Fetch users who have access to this tenant
    const users = await User.find({
      $or: [{ tenantIds: tenant.barId }, { barId: tenant.barId }]
    })
      .select('name email role createdAt lastLogin')
      .lean()

    return NextResponse.json({
      success: true,
      tenant,
      users: users || [],
    })
  } catch (error) {
    console.error('Error fetching tenant (super-admin):', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch tenant' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/super-admin/tenants/[id]
 * Update tenant details, custom domains, modules, and subscriptions
 */
export async function PUT(request, context) {
  try {
    const { id } = await context.params
    const body = await request.json()
    await connectDB()
    const Restaurant = getRestaurantModel()

    const tenant = await Restaurant.findOne({
      $or: [{ barId: id }, { slug: id }]
    })

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
    }

    const {
      name,
      customDomains,
      modules,
      subscription,
      contact,
      theme,
      features,
    } = body

    if (name !== undefined) tenant.name = name.trim()

    if (customDomains !== undefined && Array.isArray(customDomains)) {
      const normalizedDomains = customDomains.map(d => d.trim().toLowerCase()).filter(Boolean)
      const domainExists = await Restaurant.findOne({
        _id: { $ne: tenant._id },
        customDomains: { $in: normalizedDomains },
      })
      if (domainExists) {
        return NextResponse.json(
          { error: 'One or more custom domains are already assigned to another tenant.' },
          { status: 409 }
        )
      }
      tenant.customDomains = normalizedDomains
    }

    if (modules !== undefined && Array.isArray(modules)) {
      tenant.modules = modules
    }

    if (subscription !== undefined && typeof subscription === 'object') {
      tenant.subscription = {
        ...tenant.subscription,
        ...subscription,
      }
    }

    if (contact !== undefined && typeof contact === 'object') {
      tenant.contact = {
        ...tenant.contact,
        ...contact,
      }
    }

    if (features !== undefined && typeof features === 'object') {
      tenant.features = {
        ...tenant.features,
        ...features,
      }
    }

    if (theme?.templateId !== undefined) {
      if (!tenant.theme) tenant.theme = {}
      tenant.theme.templateId = theme.templateId
    }

    tenant.updatedAt = new Date()
    await tenant.save()

    // Clear tenant resolution cache
    clearTenantCache()

    return NextResponse.json({
      success: true,
      message: 'Tenant updated successfully',
      tenant,
    })
  } catch (error) {
    console.error('Error updating tenant (super-admin):', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update tenant' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/super-admin/tenants/[id]
 * Deactivate or permanently delete tenant
 */
export async function DELETE(request, context) {
  try {
    const { id } = await context.params
    const { searchParams } = new URL(request.url)
    const permanent = searchParams.get('permanent') === 'true'

    await connectDB()
    const Restaurant = getRestaurantModel()

    const tenant = await Restaurant.findOne({
      $or: [{ barId: id }, { slug: id }]
    })

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
    }

    if (permanent) {
      await Restaurant.deleteOne({ _id: tenant._id })
      clearTenantCache()
      return NextResponse.json({
        success: true,
        message: `Tenant "${tenant.name}" (${tenant.barId}) was permanently deleted.`,
      })
    } else {
      // Soft cancel subscription
      tenant.subscription = {
        ...tenant.subscription,
        status: 'canceled',
      }
      tenant.updatedAt = new Date()
      await tenant.save()
      clearTenantCache()
      return NextResponse.json({
        success: true,
        message: `Tenant "${tenant.name}" subscription canceled.`,
        tenant,
      })
    }
  } catch (error) {
    console.error('Error deleting tenant (super-admin):', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete tenant' },
      { status: 500 }
    )
  }
}
