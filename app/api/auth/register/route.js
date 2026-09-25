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
import { getTemplateById } from '@/config/templates'

/**
 * POST /api/auth/register
 * Register a new user and create their tenant
 */
export async function POST(request) {
    try {
        const body = await request.json()
    const { email, password, businessName, phone, subdomain: requestedSubdomain, domain: customDomain, theme: themeFromBody, template: templateFromBody } = body

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

        // Validate password strength (minimum 5 characters)
        if (password.length < 5) {
            return NextResponse.json(
                { error: 'Password must be at least 5 characters long' },
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

        // Decide subdomain label: use requestedSubdomain (left-most label) if provided, otherwise use slug
        let subdomainLabel = null
        if (requestedSubdomain && requestedSubdomain.trim()) {
            // normalize: if user pasted full hostname, grab left-most label before any dots
            const raw = requestedSubdomain.trim().toLowerCase()
            subdomainLabel = raw.split('.')[0]
        } else {
            subdomainLabel = slug
        }

        // Validate subdomain format (label only)
        if (!/^[a-z0-9-]{2,63}$/.test(subdomainLabel)) {
            return NextResponse.json(
                { error: 'Invalid subdomain format' },
                { status: 400 }
            )
        }

        // disallow reserved subdomains
        const reserved = ['www', 'app', 'api', 'admin']
        if (reserved.includes(subdomainLabel)) {
            return NextResponse.json(
                { error: 'Requested subdomain is reserved. Please choose another.' },
                { status: 400 }
            )
        }

        // Generate IDs
        const userId = uuidv4()
        const tenantId = `tenant_${Date.now()}_${Math.random().toString(36).substring(7)}`
        const barId = tenantId // Use tenantId as barId for consistency

        // Hash password
        const passwordHash = await hashPassword(password)

        // If a custom domain is provided, validate basic format
        let domainToStore = null
        let domainVerification = null
        if (customDomain) {
            const d = customDomain.trim().toLowerCase()
            if (!/^[a-z0-9.-]+\.[a-z]{2,}$/.test(d)) {
                return NextResponse.json({ error: 'Invalid custom domain format' }, { status: 400 })
            }

            // Check uniqueness of domain
            const existingDomain = await Restaurant.findOne({ customDomains: d })
            if (existingDomain) {
                return NextResponse.json({ error: 'This domain is already registered.' }, { status: 409 })
            }

            domainToStore = d
            // Generate verification token for domain ownership verification
            domainVerification = {
                token: uuidv4(),
                createdAt: new Date(),
                verified: false,
            }
        }

        // Determine theme: prefer submitted theme, fall back to default
        let themeToStore = null
        const templateId = templateFromBody || (themeFromBody && themeFromBody.templateId) || 'bar'
        if (themeFromBody && typeof themeFromBody === 'object') {
            const defaultPalette = getTemplateById(templateId).palettes[0]
            themeToStore = {
                templateId,
                type: themeFromBody.type || 'custom',
                colors: themeFromBody.colors || defaultPalette,
            }
        } else {
            themeToStore = {
                templateId,
                ...getDefaultTheme('vintage')
            }
        }

        // Create tenant/restaurant record
        const restaurantData = {
            barId,
            name: businessName,
            slug,
            customDomains: domainToStore ? [domainToStore] : [],
            domainVerification,
            onboardingCompletedAt: null,
            sampleDataLoaded: false,
            theme: themeToStore,
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
        }

        const restaurant = await Restaurant.create(restaurantData)

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
    console.log(`   Subdomain: ${subdomainLabel}`)

        // Create an activation token so we can set a tenant-scoped session on the tenant host
    const activationToken = uuidv4()
        // Persist activation token on the user so the tenant host can exchange it for a session cookie
        await User.updateOne({ id: user.id }, { $set: { activationToken, activationTokenExpires: new Date(Date.now() + 1000 * 60 * 15) } })

        const responsePayload = {
            success: true,
            message: 'Registration successful',
            data: {
                userId: user.id,
                tenantId: restaurant.barId,
                slug,
                businessName,
            },
        }

        if (domainToStore && domainVerification) {
            responsePayload.data.customDomain = domainToStore
            responsePayload.data.domainVerification = {
                token: domainVerification.token,
                instructions: `Add a TXT record to your DNS for ${domainToStore}: Name: _bar_verification, Value: ${domainVerification.token}`,
            }
        }

        // Return activation token so client can redirect to tenant host to complete session setup
        responsePayload.data.activationToken = activationToken

        return NextResponse.json(responsePayload, { status: 201 })

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
