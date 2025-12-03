import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth-service'

/**
 * GET /api/admin/auth/session
 * Get current session information
 */
export async function GET() {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    return NextResponse.json({
      authenticated: true,
      username: session.username,
      tenantIds: session.tenantIds,
      role: session.role,
    })
  } catch (error) {
    console.error('Session check error:', error)
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }
}

