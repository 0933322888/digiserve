import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { hashPassword } from '@/lib/auth-service'
import { getUserModel, getRestaurantModel } from '@/lib/db/models'
import connectDB from '@/lib/db/mongodb-connection'
import { generateUniqueSlug, generateSubdomain } from '@/lib/slug-utils'
import {
    getDefaultBusinessHours,
    getDefaultTheme,
    getDefaultOrderingConfig,
    getDefaultContactInfo,
    getDefaultSEO
} from '@/lib/sample-data'

/**
 * POST /api/auth/register
 * Register a new user and create their tenant
 */
export async function POST(request) {
    try {
        const body = await request.json()
        const { email, password, businessName, phone } = body

        // Validation
        if (!email || !password || !businessName) {
            return NextResponse.json(
                { error: 'Email, password, and business name are required' },
                { status: 400 }
            )
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: 'Invalid email format' },
                { status: 400 }
            )
        }

        // Validate password strength (minimum 8 characters)
        if (password.length < 8) {
            return NextResponse.json(
                { error: 'Password must be at least 8 characters long' },
                { status: 400 }
            )
        }

        await connectDB()
        const User = getUserModel()
        const Restaurant = getRestaurantModel()

        // Check if email already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() })
        if (existingUser) {
            return NextResponse.json(
                { error: 'An account with this email already exists' },
                { status: 409 }
            )
        }

        // Generate unique slug from business name
        let slug
        try {
            slug = await generateUniqueSlug(businessName)
        } catch (error) {
            return NextResponse.json(
                { error: error.message },
                { status: 400 }
            )
        }

        // Generate subdomain
        const subdomain = generateSubdomain(slug)

        // Generate IDs
        const userId = uuidv4()
        const tenantId = `tenant_${Date.now()}_${Math.random().toString(36).substring(7)}`
        const barId = tenantId // Use tenantId as barId for consistency

        // Hash password
        const passwordHash = await hashPassword(password)

        // Create tenant/restaurant record
        const restaurant = await Restaurant.create({
            id: tenantId,
            barId,
            name: businessName,
            slug,
            subdomain,
            onboardingCompletedAt: null,
            sampleDataLoaded: false,
            theme: getDefaultTheme('vintage'),
            modules: ['ordering', 'reservations', 'events', 'gallery'],
            ordering: getDefaultOrderingConfig(),
            businessHours: getDefaultBusinessHours(),
            social: {
                facebook: '',
                instagram: '',
                twitter: '',
            },
            contact: {
                ...getDefaultContactInfo(businessName),
                phone: phone || '',
            },
            seo: getDefaultSEO(businessName),
            features: {
                analytics: true,
                enableEmail: true,
                enableStripe: false, // Disabled until billing is set up
            },
            settings: {
                currency: 'CAD',
                timezone: 'America/Toronto',
                locale: 'en-CA',
            },
            subscription: {
                plan: 'basic',
                status: 'active',
            },
            createdAt: new Date(),
            updatedAt: new Date(),
        })

        // Create user record
        const user = await User.create({
            id: userId,
            email: email.toLowerCase(),
            passwordHash,
            name: businessName, // Use business name as initial user name
            role: 'admin',
            tenantIds: [barId],
            onboardingStatus: 'pending',
            onboardingStep: 1,
            emailVerified: false, // Can add email verification later
            createdAt: new Date(),
            updatedAt: new Date(),
        })

        console.log(`✅ New tenant registered: ${businessName} (${slug})`)
        console.log(`   User: ${email}`)
        console.log(`   Subdomain: ${subdomain}`)

        // Create session token
        const { createSessionToken, setSession } = await import('@/lib/auth-service')
        const token = await createSessionToken(user)

        // Set session cookie
        await setSession(token)

        return NextResponse.json({
            success: true,
            message: 'Registration successful',
            data: {
                userId: user.id,
                tenantId: restaurant.barId,
                slug,
                subdomain,
                businessName,
            },
        }, { status: 201 })

    } catch (error) {
        console.error('Registration error:', error)

        // Handle duplicate key errors
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern || {})[0]
            return NextResponse.json(
                { error: `This ${field} is already in use` },
                { status: 409 }
            )
        }

        return NextResponse.json(
            { error: 'Registration failed. Please try again.' },
            { status: 500 }
        )
    }
}
