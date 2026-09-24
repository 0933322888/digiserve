import { NextResponse } from 'next/server'
import { verifySuperAdminCredentials, createSuperAdminSessionToken, setSession } from '@/lib/auth-service'
import { headers } from 'next/headers'

/**
 * POST /api/super-admin/auth/login
 * Authenticate platform super-admin user
 */
export async function POST(request) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    const hostname = (await headers()).get('host')

    // Verify credentials for super-admin
    const user = await verifySuperAdminCredentials(email, password)

    if (!user) {
      return NextResponse.json({ error: 'Invalid super-admin credentials' }, { status: 401 })
    }

    // Create session token for super-admin
    const token = await createSuperAdminSessionToken(user)

    // Set session cookie
    await setSession(token, hostname)

    return NextResponse.json({
      success: true,
      message: 'Super Admin login successful',
      user: {
        email: user.email,
        name: user.name,
        role: user.role
      },
    })
  } catch (error) {
    console.error('Super Admin login error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
