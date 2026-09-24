import { NextResponse } from 'next/server';

/**
 * POST /api/super-admin/auth/logout
 * Clears the session cookie for super-admin and confirms logout.
 */
export async function POST(request) {
  try {
    const response = NextResponse.json({ success: true, message: 'Super Admin logout successful' }, { status: 200 });

    // Delete host-only cookie
    response.cookies.delete('tenant_session');

    const host = request.headers.get('host');
    const domain = host?.split(':')[0];

    if (domain) {
      response.cookies.delete({
        name: 'tenant_session',
        domain: domain,
        path: '/',
      });
    }

    return response;
  } catch (error) {
    console.error('Super Admin logout error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
