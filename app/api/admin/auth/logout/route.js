import { NextResponse } from 'next/server'
import { clearSession } from '@/lib/auth-service'

/**
 * POST /api/admin/auth/logout
 * Clear admin session
 */
export async function POST() {
  try {
    await clearSession()
    return NextResponse.json({ success: true, message: 'Logout successful' })
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

