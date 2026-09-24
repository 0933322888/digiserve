import bcrypt from 'bcryptjs'
import { getUserModel } from './db/models.js'
import connectDB from './db/mongodb-connection.js'
import { signToken, verifySessionToken, getSession } from './auth-edge.js'

export { verifySessionToken, getSession }

/**
 * Compatibility wrapper used by pages expecting a NextAuth-like server session.
 * Reads our tenant_session cookie via getSession() (which returns the JWT payload)
 * and maps it into a { user: { id, name, email, role } } shape.
 *
 * This keeps existing imports like `getServerSession` working without changing callers.
 */
export async function getServerSession() {
  const payload = await getSession()
  if (!payload) return null

  // Map known payload fields into a session-like object
  const user = {
    id: payload.userId || payload.user?.id || payload.user?._id || null,
    name: payload.name || payload.user?.name || null,
    email: payload.email || payload.user?.email || null,
    role: payload.role || payload.user?.role || null,
  }

  return { user }
}

/**
 * Hash a password using bcrypt
 * @param {string} password - Plain text password
 * @returns {Promise<string>} Hashed password
 */
export async function hashPassword(password) {
  return await bcrypt.hash(password, 10)
}

/**
 * Verify a password against a hash
 * @param {string} password - Plain text password
 * @param {string} hash - Hashed password
 * @returns {Promise<boolean>} True if password matches
 */
export async function verifyPassword(password, hash) {
  return await bcrypt.compare(password, hash)
}

/**
 * Verify user credentials against the database (tenant-scoped)
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {string} tenantId - Tenant ID to scope the login
 * @returns {Promise<Object|null>} User object if valid, null otherwise
 */
export async function verifyCredentials(email, password, tenantId) {
  if (!tenantId) {
    throw new Error('tenantId is required for authentication')
  }

  await connectDB()
  const User = getUserModel()

  // Find user that belongs to this tenant
  const user = await User.findOne({
    email: email.toLowerCase(),
    tenantIds: tenantId // User must belong to this tenant
  })

  if (!user) {
    return null
  }

  const isValid = await verifyPassword(password, user.passwordHash)

  if (!isValid) {
    return null
  }

  // Update last login
  await User.updateOne({ id: user.id }, { lastLogin: new Date() })

  return user
}

/**
 * Verify super admin credentials against the database (platform-scoped)
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object|null>} Super-admin user object if valid, null otherwise
 */
export async function verifySuperAdminCredentials(email, password) {
  await connectDB()
  const User = getUserModel()

  const user = await User.findOne({
    email: email.toLowerCase(),
    role: 'super-admin'
  })

  if (!user) {
    return null
  }

  const isValid = await verifyPassword(password, user.passwordHash)

  if (!isValid) {
    return null
  }

  // Update last login
  await User.updateOne({ id: user.id }, { lastLogin: new Date() })

  return user
}

/**
 * Create a JWT session token for a super-admin
 * @param {Object} user - User object
 * @returns {Promise<string>} JWT token
 */
export async function createSuperAdminSessionToken(user) {
  const payload = {
    userId: user._id?.toString() || user.id,
    email: user.email,
    name: user.name,
    username: user.name,
    role: 'super-admin',
    tenantId: null,
    tenantIds: user.tenantIds || [],
    authenticated: true
  }

  return await signToken(payload)
}

/**
 * Create a JWT session token for a user with a specific tenant
 * @param {Object} user - User object
 * @param {string} tenantId - Specific tenant ID for this session
 * @returns {Promise<string>} JWT token
 */
export async function createSessionToken(user, tenantId, tenantSubdomain = null) {
  if (!tenantId) {
    throw new Error('tenantId is required for session token')
  }

  const payload = {
    userId: user._id?.toString() || user.id,
    email: user.email,
    name: user.name,
    username: user.name, // For backward compatibility
    role: user.role,
    tenantId, // Internal tenant id (barId)
    tenantIds: user.tenantIds || [], // Keep for backward compatibility
    authenticated: true
  }

  if (tenantSubdomain) {
    payload.tenantSubdomain = tenantSubdomain
  }

  return await signToken(payload)
}

/**
 * Set the tenant session cookie (domain-specific)
 * @param {string} token - JWT token
 * @param {string} hostname - Request hostname for domain-specific cookie
 */
export async function setSession(token, hostname) {
  const { cookies } = await import('next/headers')
  const cookieStore = await cookies()

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/',
  }

  // Set domain based on hostname
  if (hostname) {
    const cleanHost = hostname.split(':')[0]
    const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'digiserve.com'

    if (process.env.NODE_ENV === 'development') {
      // Development: avoid setting the generic '.localhost' domain (some browsers block it).
      // If request is to the root 'localhost', leave domain unset (host-only cookie).
      // If request is to a subdomain like 'bistro.localhost', set cookie domain to that exact host.
      if (cleanHost === 'localhost') {
        // host-only cookie; do not set cookieOptions.domain
      } else if (cleanHost.endsWith('.localhost')) {
        cookieOptions.domain = cleanHost // set to exact subdomain host
      } else {
        // Custom domain in development
        cookieOptions.domain = cleanHost
      }
    } else {
      // Production
      if (cleanHost.endsWith(`.${baseDomain}`)) {
        // Subdomain: set to base domain for cross-subdomain access
        cookieOptions.domain = `.${baseDomain}`
      } else {
        // Custom domain: set to exact domain
        cookieOptions.domain = cleanHost
      }
    }
  }

  cookieStore.set('tenant_session', token, cookieOptions)
}

/**
 * Clear the tenant session cookie across likely domains.
 * @param {string} [hostname] - Optional hostname (includes port) from the incoming request so we can delete domain-scoped cookies.
 */
export async function clearSession(hostname = null) {
  const { cookies } = await import('next/headers')
  const cookieStore = await cookies()

  // Delete host-only cookie first
  cookieStore.delete('tenant_session')

  try {
    if (hostname) {
      const cleanHost = hostname.split(':')[0]
      const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'digiserve.com'

      // Delete cookie set on exact host (useful for subdomain.localhost or custom domains)
      cookieStore.delete('tenant_session', { domain: cleanHost })

      // If this looks like a production subdomain (e.g. sub.example.com), also try clearing the cookie set on the base domain
      if (cleanHost.endsWith(`.${baseDomain}`)) {
        cookieStore.delete('tenant_session', { domain: `.${baseDomain}` })
      }

      // Development special-case: if host is a subdomain of localhost, try deleting the exact subdomain domain again (some environments may have set it that way)
      if (cleanHost.endsWith('.localhost')) {
        cookieStore.delete('tenant_session', { domain: cleanHost })
      }
    }
  } catch (e) {
    // Non-fatal if domain-specific deletion fails; the host-only delete above covers many cases
    console.warn('clearSession: domain-specific cookie deletion failed', e)
  }
}
