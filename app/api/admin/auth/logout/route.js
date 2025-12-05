import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * POST /api/admin/auth/logout
 * Clears the user's session cookie and confirms logout.
 * This endpoint is the single source of truth for logging out and does not perform redirects.
 */
export async function POST(request) {
  try {
    console.log('[Logout API] Received POST request. Clearing session cookie.');
    // Create a response object to be able to delete the cookie.
    const response = NextResponse.json({ success: true, message: 'Logout successful' }, { status: 200 });

    // 1. Delete the tenant_session cookie (host-only)
    // This handles cookies set without a specific domain attribute (top-level or simple host)
    response.cookies.delete('tenant_session');

    // 2. Also try deleting with the specific domain if applicable
    // This handles cases where the cookie was set with a specific domain (e.g., .localhost, subdomain.localhost, or custom domain)
    // The login route sets cookies using the hostname as the domain in many cases.
    const host = request.headers.get('host');
    const domain = host?.split(':')[0];

    if (domain) {
      console.log(`[Logout API] Attempting to clear cookie for domain: ${domain}`);
      // Deleting with explicit domain option
      response.cookies.delete({
        name: 'tenant_session',
        domain: domain,
        path: '/',
      });

      // If it's a subdomain (e.g. trio.localhost), also try clearing for the parent per good practice (optional but safe)
      // Note: In development with .localhost, this can be tricky, but targeting the exact domain from host header is the most critical step.
    }

    console.log('[Logout API] Cookie cleared. Sending success response.');
    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

// The GET handler has been removed to prevent the problematic redirect-based logout flow.
// All logouts should be initiated by a POST request from the client.

/**
 * Explicitly disallow GET requests to this endpoint.
 * This prevents accidental logout via direct navigation or simple links
 * and enforces the use of the client-side POST request flow.
 */
export async function GET() {
  return NextResponse.json({ error: 'Method Not Allowed. Please use POST.' }, { status: 405 });
}
