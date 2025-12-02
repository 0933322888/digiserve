import { NextResponse } from 'next/server'
import { verifyCredentials, createSessionToken, setSession } from '@/lib/auth-service'

/**
 * POST /api/admin/auth/login
 * Authenticate admin user and create session
 */
export async function POST(request) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    // Verify credentials
    const user = await verifyCredentials(email, password)

    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    // Create session token
    const token = await createSessionToken(user)

    // Set session cookie
    await setSession(token)

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

