import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { getRestaurantModel, getUserModel } from '@/lib/db/models.js'
import connectDB from '@/lib/db/mongodb-connection.js'
import { hashPassword } from '@/lib/auth-service'

import { siteConfig } from '@/config/siteConfig'

/**
 * POST /api/signup
 * Create a new tenant (restaurant) and admin user
 * This is the onboarding endpoint for new businesses
 */
export async function POST(request) {
    try {
        const body = await request.json()
        const {
            // Restaurant info
            restaurantName,
            slug, // URL-friendly identifier (e.g., 'my-restaurant')

            // Admin user info
            adminName,
            adminEmail,
            adminPassword,

            // Optional settings
            modules, // Array of module names to enable
            domain, // Custom domain (optional)
        } = body

        // Validation
        if (!restaurantName || !slug || !adminName || !adminEmail || !adminPassword) {
            return NextResponse.json(
                { error: 'Missing required fields: restaurantName, slug, adminName, adminEmail, adminPassword' },
                { status: 400 }
            )
        }

        // Validate slug format (alphanumeric and hyphens only)
        if (!/^[a-z0-9-]+$/.test(slug)) {
            return NextResponse.json(
                { error: 'Slug must contain only lowercase letters, numbers, and hyphens' },
                { status: 400 }
            )
        }

        // Validate email format
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adminEmail)) {
            return NextResponse.json(
                { error: 'Invalid email format' },
                { status: 400 }
            )
        }

        // Validate password strength
        if (adminPassword.length < 8) {
            return NextResponse.json(
                { error: 'Password must be at least 8 characters long' },
                { status: 400 }
            )
        }

        await connectDB()
        const Restaurant = getRestaurantModel()
        const User = getUserModel()

        // Check if slug is already taken
        const existingRestaurant = await Restaurant.findOne({ slug })
        if (existingRestaurant) {
            return NextResponse.json(
                { error: 'This slug is already taken. Please choose a different one.' },
                { status: 409 }
            )
        }

        // Check if email is already registered
        const existingUser = await User.findOne({ email: adminEmail })
        if (existingUser) {
            return NextResponse.json(
                { error: 'This email is already registered.' },
                { status: 409 }
            )
        }

        // Check if custom domain is already taken
        if (domain) {
            const existingDomain = await Restaurant.findOne({ domain })
            if (existingDomain) {
                return NextResponse.json(
                    { error: 'This domain is already registered.' },
                    { status: 409 }
                )
            }
        }

        // Generate unique barId
        const barId = `bar_${crypto.randomUUID().substring(0, 8)}`

        // Default modules if not specified
        const enabledModules = modules || [
            'ordering',
            'reservations',
            'events',
            'gallery',
            'social',
            'analytics',
        ]

        // Create Restaurant (Tenant)
        const newRestaurant = new Restaurant({
            id: crypto.randomUUID(),
            barId,
            name: restaurantName,
            slug,
            domain: domain || null,
            modules: enabledModules,

            // Populate configuration from siteConfig template
            ordering: siteConfig.ordering,
            businessHours: siteConfig.businessHours,
            social: {
                facebook: siteConfig.seo.facebookUrl,
                instagram: siteConfig.seo.instagramUrl,
                twitter: siteConfig.seo.twitterHandle,
            },
            contact: {
                phone: siteConfig.restaurant.phone,
                email: siteConfig.restaurant.email,
                address: siteConfig.restaurant.address,
            },
            seo: {
                title: siteConfig.seo.defaultTitle,
                description: siteConfig.seo.defaultDescription,
                image: siteConfig.seo.defaultImage,
            },
            features: {
                analytics: true,
                enableEmail: siteConfig.api.enableEmail,
                enableStripe: siteConfig.api.enableStripe,
            },

            settings: {
                currency: 'USD',
                timezone: 'America/New_York',
                locale: 'en-US',
                theme: 'default',
            },
            subscription: {
                plan: 'basic',
                status: 'active',
                expiresAt: null, // Set based on your billing logic
            },
            createdAt: new Date(),
            updatedAt: new Date(),
        })

        await newRestaurant.save()

        // Hash password
        const passwordHash = await hashPassword(adminPassword)

        // Create Admin User
        const newUser = new User({
            id: crypto.randomUUID(),
            email: adminEmail,
            passwordHash,
            name: adminName,
            role: 'admin',
            tenantIds: [barId], // User has access to this tenant
            lastLogin: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        })

        await newUser.save()

        // Return success with tenant info (but not sensitive data)
        return NextResponse.json({
            success: true,
            message: 'Account created successfully',
            tenant: {
                barId,
                name: restaurantName,
                slug,
                url: domain || `${slug}.yourdomain.com`, // Replace with actual domain
                modules: enabledModules,
            },
            user: {
                email: adminEmail,
                name: adminName,
            },
        }, { status: 201 })

    } catch (error) {
        console.error('Signup error:', error)
        return NextResponse.json(
            { error: 'Internal server error. Please try again later.' },
            { status: 500 }
        )
    }
}
