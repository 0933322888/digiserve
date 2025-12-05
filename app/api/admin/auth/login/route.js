import { NextResponse } from 'next/server'
import { verifyCredentials, createSessionToken, setSession } from '@/lib/auth-service'
import { getTenantFromRequest } from '@/lib/tenant-service'
import { headers } from 'next/headers'

/**
 * POST /api/admin/auth/login
 * Authenticate admin user (tenant-scoped)
 */
export async function POST(request) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    // Get tenant ID from middleware header
    const hostname = (await headers()).get('host')

    // Resolve tenant ID using helper that handles subdomain -> UUID mapping
    const tenantId = await getTenantFromRequest(request)

    if (!tenantId) {
      return NextResponse.json({
        error: 'Login is only available on tenant domains. Please access your restaurant\'s domain.'
      }, { status: 403 })
    }

    // Verify credentials (tenant-scoped)
    const user = await verifyCredentials(email, password, tenantId)

    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    // Extract subdomain for session token (to satisfy middleware checks)
    let tenantSubdomain = null
    const cleanHost = hostname ? hostname.split(':')[0] : ''
    const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'digiserve.com'

    if (cleanHost && cleanHost.endsWith('.localhost')) {
      tenantSubdomain = cleanHost.split('.')[0]
    } else if (cleanHost && cleanHost.endsWith(`.${baseDomain}`)) {
      tenantSubdomain = cleanHost.split('.')[0]
    }

    // Create session token with specific tenant and subdomain
    const token = await createSessionToken(user, tenantId, tenantSubdomain)

    // Set session cookie (domain-specific)
    await setSession(token, hostname)

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      user: {
        email: user.email,
        name: user.name,
        role: user.role
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
