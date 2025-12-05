import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth-edge'
import { headers } from 'next/headers'

/**
 * GET /api/admin/auth/session
 * Check current session status
 */
export async function GET() {
  try {
    const session = await getSession()
    const headersList = await headers()
    const tenantId = headersList.get('x-tenant-id')

    if (!session || !session.authenticated) {
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    // Validate session matches current tenant
    // tenantId header may be a canonical barId or a subdomain slug; accept either
    if (tenantId && session.tenantId !== tenantId && session.tenantSubdomain !== tenantId) {
      return NextResponse.json({
        authenticated: false,
        error: 'Session tenant mismatch'
      }, { status: 401 })
    }

    return NextResponse.json({
      authenticated: true,
      username: session.username || session.name,
      email: session.email,
      tenantId: session.tenantId,
      tenantIds: session.tenantIds,
      role: session.role,
    })
  } catch (error) {
    console.error('Session check error:', error)
    return NextResponse.json({ authenticated: false }, { status: 500 })
  }
}
