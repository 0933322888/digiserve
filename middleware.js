import { NextResponse } from 'next/server'
import { verifySessionToken } from './lib/auth-edge'

/**
 * Middleware to handle multi-tenancy and authentication
 */
export async function middleware(request) {
  const { pathname } = request.nextUrl
  const headers = new Headers(request.headers)

  // Public routes that don't require authentication
  const publicRoutes = [
    '/signup',
    '/login',
    '/api/auth/register',
    '/api/auth/login',
    '/terms',
    '/privacy',
    '/_next',
    '/favicon.ico',
  ]

  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))

  // 1. Tenant Resolution
  // Check for X-Tenant-ID header (API calls) or resolve from host
  let tenantId = headers.get('x-tenant-id')

  if (!tenantId) {
    const host = headers.get('host')
    if (host) {
      // Lightweight tenant resolution for Edge Runtime
      // 1. Localhost
      if (host.includes('localhost') || host.includes('127.0.0.1')) {
        if (process.env.NODE_ENV === 'development') {
          tenantId = process.env.DEFAULT_TENANT_ID || 'bar_1'
        }
      } else {
        // 2. Subdomain (e.g., tenant.domain.com)
        const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'digiserve.com'
        if (host.endsWith(`.${baseDomain}`)) {
          const subdomain = host.split('.')[0]
          if (subdomain && !['www', 'app', 'api', 'admin'].includes(subdomain)) {
            tenantId = subdomain
          }
        }
        // 3. Custom domain mapping would require Edge Config or external API fetch here
        // For now, we rely on the API routes to validate the tenant if middleware guesses wrong
      }
    }
  }

  // Inject tenantId into headers for downstream
  if (tenantId) {
    headers.set('x-tenant-id', tenantId)
  }

  // 2. Authentication & Access Control
  // Only protect admin routes and onboarding (except login and public routes)
  if (!isPublicRoute) {
    const token = request.cookies.get('admin-session')?.value

    // Check if accessing admin routes
    if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
      if (!token) {
        // Redirect to login if no token
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('from', pathname)
        return NextResponse.redirect(loginUrl)
      }

      const payload = await verifySessionToken(token)

      if (!payload) {
        // Token is invalid, redirect to login
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('from', pathname)
        const response = NextResponse.redirect(loginUrl)
        response.cookies.delete('admin-session')
        return response
      }

      // Check if user has access to the resolved tenant
      // In development on localhost, use the user's first tenant if tenantId is bar_1
      if (tenantId && payload.tenantIds) {
        const host = headers.get('host')
        const isLocalhost = host && (host.includes('localhost') || host.includes('127.0.0.1'))

        // In development, if tenantId is the default and user has tenants, use their first tenant
        if (isLocalhost && tenantId === 'bar_1' && payload.tenantIds.length > 0) {
          // Override tenantId with user's first tenant
          headers.set('x-tenant-id', payload.tenantIds[0])
        } else if (!payload.tenantIds.includes(tenantId) && payload.role !== 'superadmin') {
          // User doesn't have access to this tenant
          return NextResponse.json({ error: 'Unauthorized access to this tenant' }, { status: 403 })
        }
      }

      // TODO: Check onboarding status and redirect if incomplete
      // This would require a database call, which is not ideal in middleware
      // Consider using Edge Config or moving this check to the page level
    }

    // Check if accessing onboarding
    if (pathname.startsWith('/onboarding')) {
      if (!token) {
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('from', pathname)
        return NextResponse.redirect(loginUrl)
      }

      const payload = await verifySessionToken(token)

      if (!payload) {
        const loginUrl = new URL('/login', request.url)
        const response = NextResponse.redirect(loginUrl)
        response.cookies.delete('admin-session')
        return response
      }
    }

    // Also protect admin API routes (except auth routes)
    if (pathname.startsWith('/api/admin') && !pathname.startsWith('/api/admin/auth')) {
      if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const payload = await verifySessionToken(token)

      if (!payload) {
        const response = NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        response.cookies.delete('admin-session')
        return response
      }

      // Check tenant access - same logic as admin routes
      if (tenantId && payload.tenantIds) {
        const host = headers.get('host')
        const isLocalhost = host && (host.includes('localhost') || host.includes('127.0.0.1'))

        // In development, if tenantId is the default and user has tenants, use their first tenant
        if (isLocalhost && tenantId === 'bar_1' && payload.tenantIds.length > 0) {
          // Override tenantId with user's first tenant
          headers.set('x-tenant-id', payload.tenantIds[0])
        } else if (!payload.tenantIds.includes(tenantId) && payload.role !== 'superadmin') {
          return NextResponse.json({ error: 'Unauthorized access to this tenant' }, { status: 403 })
        }
      }
    }

    // Protect onboarding API routes
    if (pathname.startsWith('/api/onboarding')) {
      if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const payload = await verifySessionToken(token)

      if (!payload) {
        const response = NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        response.cookies.delete('admin-session')
        return response
      }
    }
  }

  return NextResponse.next({
    request: {
      headers,
    },
  })
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/onboarding/:path*',
    '/api/:path*',
    '/signup',
    '/login',
  ],
}

