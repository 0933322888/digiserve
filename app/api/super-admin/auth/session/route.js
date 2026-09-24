import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth-edge'

/**
 * GET /api/super-admin/auth/session
 * Check current super-admin session status
 */
export async function GET() {
  try {
    const session = await getSession()

    if (!session || !session.authenticated || session.role !== 'super-admin') {
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    return NextResponse.json({
      authenticated: true,
      username: session.username || session.name,
      email: session.email,
      role: session.role,
    })
  } catch (error) {
    console.error('Super Admin session check error:', error)
    return NextResponse.json({ authenticated: false }, { status: 500 })
  }
}
