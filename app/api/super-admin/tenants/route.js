import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { getRestaurantModel, getUserModel } from '@/lib/db/models.js'
import connectDB from '@/lib/db/mongodb-connection.js'
import { hashPassword } from '@/lib/auth-service'
import { clearTenantCache } from '@/lib/tenant-service'
import { siteConfig } from '@/config/siteConfig'

/**
 * GET /api/super-admin/tenants
 * Lists all tenants (restaurants) across the entire platform
 */
export async function GET(request) {
  try {
    await connectDB()
    const Restaurant = getRestaurantModel()

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''

    const query = {}
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { slug: { $regex: search, $options: 'i' } },
        { barId: { $regex: search, $options: 'i' } },
        { customDomains: { $regex: search, $options: 'i' } },
      ]
    }

    if (status) {
      query['subscription.status'] = status
    }

    const tenants = await Restaurant.find(query)
      .select('barId name slug customDomains modules subscription theme contact createdAt updatedAt')
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json({
      success: true,
      tenants: tenants.map(t => ({
        ...t,
        modules: t.modules || ['ordering', 'reservations', 'events', 'gallery', 'social'],
        subscription: t.subscription || { plan: 'basic', status: 'active' },
      })),
      total: tenants.length,
    })
  } catch (error) {
    console.error('Error fetching tenants (super-admin):', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch tenants' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/super-admin/tenants
 * Provision a new tenant directly from super-admin platform console
 */
export async function POST(request) {
  try {
    const body = await request.json()
    const {
      name,
      slug,
      adminName,
      adminEmail,
      adminPassword,
      customDomains = [],
      modules = ['ordering', 'reservations', 'events', 'gallery', 'social'],
      subscriptionPlan = 'basic',
      subscriptionStatus = 'active',
      templateId = 'bar',
      phone = '',
      email = '',
    } = body

    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Tenant name and slug are required' },
        { status: 400 }
      )
    }

    const cleanSlug = slug.toLowerCase().trim()
    if (!/^[a-z0-9-]+$/.test(cleanSlug)) {
      return NextResponse.json(
        { error: 'Slug must contain only lowercase letters, numbers, and hyphens' },
        { status: 400 }
      )
    }

    await connectDB()
    const Restaurant = getRestaurantModel()
    const User = getUserModel()

    // Check slug collision
    const existing = await Restaurant.findOne({ slug: cleanSlug })
    if (existing) {
      return NextResponse.json(
        { error: `The slug "${cleanSlug}" is already in use.` },
        { status: 409 }
      )
    }

    // Check custom domain collision
    const normalizedDomains = Array.isArray(customDomains)
      ? customDomains.map(domain => domain.trim().toLowerCase()).filter(Boolean)
      : []

    if (normalizedDomains.length > 0) {
      const existingDomain = await Restaurant.findOne({ customDomains: { $in: normalizedDomains } })
      if (existingDomain) {
        return NextResponse.json(
          { error: 'One or more custom domains are already assigned to another tenant.' },
          { status: 409 }
        )
      }
    }

    // Check email collision if admin creation requested
    if (adminEmail) {
      const existingUser = await User.findOne({ email: adminEmail.toLowerCase().trim() })
      if (existingUser) {
        return NextResponse.json(
          { error: `User with email "${adminEmail}" already exists.` },
          { status: 409 }
        )
      }
    }

    const barId = `bar_${crypto.randomUUID().substring(0, 8)}`
    const tenant = new Restaurant({
      barId,
      name: name.trim(),
      slug: cleanSlug,
      customDomains: normalizedDomains,
      modules,
      theme: {
        templateId: templateId || 'bar',
        colors: {
          light: {
            primary: { bg: '#8B0000', text: '#FFFFFF' },
            secondary: { bg: '#F5F5DC', text: '#2C3E50' }
          },
          dark: {
            primary: { bg: '#A00000', text: '#FFFFFF' },
            secondary: { bg: '#2C2C2C', text: '#E8E8E8' }
          }
        }
      },
      ordering: siteConfig.ordering || {},
      contact: {
        phone: phone || '',
        email: email || adminEmail || '',
        address: {
          street: '',
          city: '',
          state: '',
          zip: '',
          country: 'CA'
        }
      },
      subscription: {
        plan: subscriptionPlan,
        status: subscriptionStatus,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    await tenant.save()

    // Clear tenant cache so subsequent requests get fresh theme data
    clearTenantCache()

    // Provision admin user if requested
    let createdAdmin = null
    if (adminName && adminEmail && adminPassword) {
      const hashedPassword = await hashPassword(adminPassword)
      const user = new User({
        id: crypto.randomUUID(),
        email: adminEmail.toLowerCase().trim(),
        passwordHash: hashedPassword,
        name: adminName.trim(),
        role: 'admin',
        tenantIds: [barId],
        createdAt: new Date(),
      })
      await user.save()
      createdAdmin = {
        name: user.name,
        email: user.email,
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Tenant created successfully',
      tenant: {
        barId: tenant.barId,
        name: tenant.name,
        slug: tenant.slug,
        customDomains: tenant.customDomains,
        modules: tenant.modules,
        subscription: tenant.subscription,
      },
      admin: createdAdmin,
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating tenant (super-admin):', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create tenant' },
      { status: 500 }
    )
  }
}
