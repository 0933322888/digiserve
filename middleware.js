import { NextResponse } from 'next/server'
import { verifySessionToken } from './lib/auth-edge'

// --- Helper Functions ---
/**
 * Helper to clear the tenant_session cookie
 * @param {NextResponse} response
 * @returns {NextResponse}
 */
function clearTenantSessionCookie(response) {
  response.cookies.delete('tenant_session')
  return response
}

/**
 * Helper to construct the root domain URL, preserving port in development.
 * @param {Request} request
 * @param {string} baseDomain
 * @param {string} host
 * @returns {string}
 */
function getRootDomainUrl(request, baseDomain, host) {
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  let rootHost = baseDomain;
  if (baseDomain === 'localhost' && host.includes(':')) {
    const port = host.split(':')[1];
    rootHost = `${baseDomain}:${port}`;
  }
  return `${protocol}://${rootHost}`;
}

/**
 * Helper to authenticate and authorize for page routes.
 * Returns a NextResponse if authentication/authorization fails, otherwise null.
 * @param {Request} request
 * @param {string | null} tenantId
 * @param {string} pathname
 * @param {string | null} requiredRole
 * @returns {Promise<NextResponse | null>}
 */
async function authenticateAndAuthorizePage(request, tenantId, pathname, requiredRole = null) {
  console.log(`[AuthPage] Checking auth for: ${pathname}`);
  const token = request.cookies.get('tenant_session')?.value;
  console.log(`[AuthPage] Token found: ${!!token}`);
  const redirectPath = pathname.startsWith('/admin') ? '/admin/login' : '/login';

  if (!token) {
    console.log(`[AuthPage] No token found. Redirecting to ${redirectPath}.`);
    const response = NextResponse.redirect(new URL(`${redirectPath}?from=${encodeURIComponent(pathname)}`, request.url));
    return clearTenantSessionCookie(response);
  }

  const payload = await verifySessionToken(token);
  if (!payload) {
    console.log(`[AuthPage] Invalid token. Redirecting to ${redirectPath}.`);
    const response = NextResponse.redirect(new URL(redirectPath, request.url));
    return clearTenantSessionCookie(response);
  }

  if (requiredRole && payload.role !== requiredRole) {
    console.log(`[AuthPage] User role (${payload.role}) is not authorized for ${pathname}. Responding 403.`);
    return new NextResponse('Forbidden', { status: 403 });
  }

  if (tenantId) {
    const isTenantMatch = payload.tenantId === tenantId ||
      payload.tenantSubdomain === tenantId ||
      payload.slug === tenantId ||
      payload.barId === tenantId ||
      (payload.tenantSubdomain && payload.tenantSubdomain.toLowerCase() === tenantId.toLowerCase());

    if (!isTenantMatch) {
      console.log(`[AuthPage] Token tenant (${payload.tenantId} / subdomain: ${payload.tenantSubdomain}) does not match domain tenant (${tenantId}). Redirecting to ${redirectPath}.`);
      const response = NextResponse.redirect(new URL(redirectPath, request.url));
      return clearTenantSessionCookie(response);
    }
  }
  return null; // Success
}

/**
 * Helper to authenticate and authorize for API routes.
 * Returns a NextResponse (401/403) if authentication/authorization fails, otherwise null.
 * @param {Request} request
 * @param {string | null} tenantId
 * @param {string | null} requiredRole
 * @returns {Promise<NextResponse | null>}
 */
async function authenticateAndAuthorizeApi(request, tenantId, requiredRole = null) {
  const { pathname } = request.nextUrl;
  console.log(`[AuthApi] Checking auth for: ${pathname}`);
  const token = request.cookies.get('tenant_session')?.value;
  console.log(`[AuthApi] Token found: ${!!token}`);
  if (!token) { console.log('[AuthApi] No token found. Responding 401.'); return clearTenantSessionCookie(NextResponse.json({ error: 'Unauthorized' }, { status: 401 })); }
  const payload = await verifySessionToken(token);
  if (!payload) { console.log('[AuthApi] Invalid token. Responding 401.'); return clearTenantSessionCookie(NextResponse.json({ error: 'Unauthorized' }, { status: 401 })); }
  if (requiredRole && payload.role !== requiredRole) {
    console.log(`[AuthApi] User role (${payload.role}) is not authorized for ${pathname}. Responding 403.`);
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  if (tenantId) {
    const isTenantMatch = payload.tenantId === tenantId ||
      payload.tenantSubdomain === tenantId ||
      payload.slug === tenantId ||
      payload.barId === tenantId ||
      (payload.tenantSubdomain && payload.tenantSubdomain.toLowerCase() === tenantId.toLowerCase());

    if (!isTenantMatch) {
      console.log(`[AuthApi] Token tenant (${payload.tenantId} / subdomain: ${payload.tenantSubdomain}) does not match domain tenant (${tenantId}). Responding 403.`);
      return NextResponse.json({ error: 'Unauthorized access to this tenant' }, { status: 403 });
    }
  }
  return null; // Success
}

/**
 * Middleware to handle multi-tenancy and authentication
 * - Detects tenant from hostname
 * - Protects tenant routes
 * - Validates session matches tenant
 */
export async function middleware(request) {
  const { pathname } = request.nextUrl
  const host = request.headers.get('host') || ''
  console.log(`\n[Middleware] === New Request: ${request.method} ${pathname} | Host: ${host} ===`);
  const headers = new Headers(request.headers)

  // 1. TENANT RESOLUTION
  let tenantId = null
  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'digiserve.com'
  const cleanHost = host.split(':')[0]

  // Check if this is the root marketing domain
  const isRootDomain = cleanHost === 'localhost' ||
    cleanHost === '127.0.0.1' ||
    cleanHost === baseDomain ||
    cleanHost === `www.${baseDomain}`

  console.log(`[Middleware] Domain check: isRootDomain=${isRootDomain}, cleanHost=${cleanHost}`);
  if (!isRootDomain) {
    // This is a tenant domain - resolve tenant ID using hostname heuristics
    // For development: subdomain.localhost
    if (cleanHost.endsWith('.localhost')) {
      const subdomain = cleanHost.split('.')[0]
      if (subdomain && !['www', 'app', 'api', 'admin'].includes(subdomain)) {
        tenantId = subdomain // Use subdomain as tenant identifier
      }
    }
    // For production: subdomain.digiserve.com
    else if (cleanHost.endsWith(`.${baseDomain}`)) {
      const subdomain = cleanHost.split('.')[0]
      if (subdomain && !['www', 'app', 'api', 'admin'].includes(subdomain)) {
        tenantId = subdomain
      }
    }
    // Custom domain - do not query DB from middleware; let route handlers resolve
    else {
      headers.set('x-custom-domain', cleanHost)
    }
  }

  // Inject tenant ID (subdomain slug) into headers for downstream use
  if (tenantId) {
    console.log(`[Middleware] Tenant resolved: tenantId=${tenantId}. Injecting x-tenant-id header.`);
    headers.set('x-tenant-id', tenantId)
  }

  // 2. ROUTE PROTECTION - Order is crucial here for correct flow

  // A. Static files and Next.js internals (always public)
  if (pathname.startsWith('/_next') || pathname.startsWith('/favicon')) {
    console.log(`[Middleware] Path (${pathname}) is a static/internal file. Allowing.`);
    return NextResponse.next({ request: { headers } });
  }

  // B. Public API routes (login, logout, register, activate, etc.)
  const PUBLIC_API_ROUTES = [
    '/api/admin/auth/login',
    '/api/admin/auth/logout',
    '/api/auth/register',
    '/api/auth/activate'
  ];
  if (PUBLIC_API_ROUTES.some(route => pathname.startsWith(route))) {
    console.log(`[Middleware] Path (${pathname}) is a public API route. Allowing.`);
    return NextResponse.next({ request: { headers } });
  }

  // B. Public Login/Signup Pages (domain-specific)
  if (pathname.startsWith('/login') || pathname.startsWith('/admin/login')) {
    console.log(`[Middleware] Path (${pathname}) is a login page.`);
    if (isRootDomain) {
      // Login pages should not be accessible on the root domain
      console.log('[Middleware] Login on root domain is forbidden. Responding 403.');
      return new NextResponse('Login is only available on tenant domains', { status: 403 });
    }
    // Allow login pages on tenant domains without session check
    console.log('[Middleware] Allowing public access to login page on tenant domain.');
    return NextResponse.next({ request: { headers } });
  }

  if (pathname.startsWith('/signup')) {
    console.log(`[Middleware] Path (${pathname}) is a signup page.`);
    if (!isRootDomain) {
      // Signup page should only be accessible on the root domain
      console.log('[Middleware] Signup on tenant domain is forbidden. Redirecting to root.');
      const rootDomainUrl = getRootDomainUrl(request, baseDomain, host);
      return NextResponse.redirect(new URL(pathname, rootDomainUrl));
    }
    // Allow signup page on root domain without session check
    console.log('[Middleware] Allowing public access to signup page on root domain.');
    return NextResponse.next({ request: { headers } });
  }

  // C. Protected Super Admin routes
  if (pathname === '/super-admin' || pathname.startsWith('/super-admin/') ||
      pathname === '/api/super-admin' || pathname.startsWith('/api/super-admin/')) {
    const isApiRoute = pathname === '/api/super-admin' || pathname.startsWith('/api/super-admin/');
    console.log(`[Middleware] Path (${pathname}) is a protected Super Admin ${isApiRoute ? 'API' : 'UI'} route. Checking auth...`);
    const authResponse = isApiRoute
      ? await authenticateAndAuthorizeApi(request, null, 'super-admin')
      : await authenticateAndAuthorizePage(request, null, pathname, 'super-admin');
    if (authResponse) return authResponse;
    return NextResponse.next({ request: { headers } });
  }

  // C. Root domain public routes (landing page, marketing, etc. - no auth required)
  // These routes are only served on the root domain.
  const MARKETING_ONLY_ROUTES = ['/', '/pricing', '/features', '/terms', '/privacy'];
  // The root path '/' is only a marketing route if it's on the root domain.
  // Other marketing routes are checked with startsWith.
  const isMarketingRoute = (isRootDomain && pathname === '/') ||
    MARKETING_ONLY_ROUTES.slice(1).some(route => pathname.startsWith(route));

  if (isMarketingRoute) {
    console.log(`[Middleware] Path (${pathname}) is a marketing/root-only route.`);
    if (!isRootDomain) {
      // Redirect to root domain
      console.log('[Middleware] Marketing/root route on tenant domain is forbidden. Redirecting to root.');
      const rootDomainUrl = getRootDomainUrl(request, baseDomain, host);
      return NextResponse.redirect(new URL(pathname, rootDomainUrl));
    }
    return NextResponse.next({ request: { headers } });
  }

  // D. Public Tenant Routes (e.g., menu, events - must be on tenant domain, no auth required)
  const TENANT_PUBLIC_ROUTES = ['/menu', '/events', '/gallery', '/reservations', '/gift-cards', '/order'];
  if (pathname === '/' || TENANT_PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
    console.log(`[Middleware] Path (${pathname}) is a public tenant route.`);
    if (isRootDomain) {
      // Redirect to signup if accessing tenant routes on root domain
      console.log('[Middleware] Public tenant route on root domain. Redirecting to signup.');
      return NextResponse.redirect(new URL('/signup', request.url))
    }
    // Allow access on tenant domain
    console.log('[Middleware] Allowing public access to tenant route.');
    return NextResponse.next({ request: { headers } });
  }

  // E. Protected Admin API routes
  if (pathname.startsWith('/api/admin')) {
    // SPECIAL CASE: multiple social OAuth callbacks might come back to the root domain 
    // (localhost or main domain) because of strict redirect URI rules.
    // We allow these through because they carry state/tenant info in the query params.
    const isCallback = pathname === '/api/admin/social-posting/callback';

    // All other /api/admin routes require a tenant and valid session
    if (!tenantId && !headers.get('x-custom-domain') && !isCallback) {
      console.log('[Middleware] No tenant identified for protected API route. Responding 403.');
      return NextResponse.json({ error: 'Tenant required' }, { status: 403 });
    }
    console.log(`[Middleware] Path (${pathname}) is a protected Admin API route. Checking auth...`);

    // Skip auth for social callback (it effectively comes cross-domain from FB to localhost)
    if (!isCallback) {
      const authResponse = await authenticateAndAuthorizeApi(request, tenantId);
      if (authResponse) return authResponse;
    }
    return NextResponse.next({ request: { headers } });
  }

  // F. Protected Admin UI routes
  if (pathname.startsWith('/admin')) {
    if (isRootDomain) {
      console.log('[Middleware] Admin UI on root domain is forbidden. Responding 403.');
      return new NextResponse('Admin access is only available on tenant domains', { status: 403 });
    }
    console.log(`[Middleware] Path (${pathname}) is a protected Admin UI route. Checking auth...`);
    const authResponse = await authenticateAndAuthorizePage(request, tenantId, pathname);
    if (authResponse) return authResponse;
    return NextResponse.next({ request: { headers } });
  }

  // G. Protected Onboarding routes (UI & API)
  if (pathname.startsWith('/onboarding')) {
    console.log(`[Middleware] Path (${pathname}) is an Onboarding route. Checking auth...`);
    // Onboarding API routes
    if (pathname.startsWith('/api/onboarding')) {
      if (!isRootDomain && !tenantId && !headers.get('x-custom-domain')) {
        return NextResponse.json({ error: 'Tenant required' }, { status: 403 });
      }
      const authResponse = await authenticateAndAuthorizeApi(request, tenantId);
      if (authResponse) return authResponse;
      return NextResponse.next({ request: { headers } });
    }

    // Onboarding UI routes
    if (isRootDomain) {
      // Onboarding on root domain (for initial signup)
      const authResponse = await authenticateAndAuthorizePage(request, tenantId, pathname);
      if (authResponse) {
        // If auth fails on root onboarding, redirect to /signup
        const newUrl = new URL('/signup', request.url);
        return clearTenantSessionCookie(NextResponse.redirect(newUrl));
      }
    } else {
      // Onboarding on tenant domain
      const authResponse = await authenticateAndAuthorizePage(request, tenantId, pathname);
      if (authResponse) return authResponse;
    }
    return NextResponse.next({ request: { headers } });
  }

  // H. Default: Allow any other request. This typically covers tenant homepages ('/')
  // that weren't explicitly caught by TENANT_PUBLIC_ROUTES (if '/' was excluded there).
  // Or other unhandled routes.
  console.log(`[Middleware] Path (${pathname}) hit default case. Allowing.`);
  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     */
    '/((?!_next/static|_next/image).*)',
  ],
}
