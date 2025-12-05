import { getRestaurantModel } from './db/models.js'
import connectDB from './db/mongodb-connection.js'

/**
 * Tenant Resolution Service
 * Handles mapping from subdomain/domain to tenant (barId)
 */

// In-memory cache for tenant lookups (production should use Redis)
const tenantCache = new Map()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

/**
 * Get tenant ID from host (subdomain or custom domain)
 * @param {string} host - The host header value (e.g., 'bar1.myapp.com' or 'customdomain.com')
 * @returns {Promise<string|null>} The tenant's barId or null if not found
 */
export async function getTenantFromHost(host) {
    if (!host) {
        return null
    }

    // Remove port if present
    const cleanHost = host.split(':')[0]

    // Check cache first
    const cached = tenantCache.get(cleanHost)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.barId
    }

    // For localhost development
    if (cleanHost === 'localhost' || cleanHost === '127.0.0.1') {
        // Root domain - no tenant
        return null
    }

    await connectDB()
    const Restaurant = getRestaurantModel()

    const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'digiserve.com'

    // Check if this is the root domain (marketing site)
    if (cleanHost === baseDomain || cleanHost === `www.${baseDomain}`) {
        return null // Public marketing site
    }

    // Try to find by custom domain first (exact match)
    let tenant = await Restaurant.findOne({
        $or: [
            { customDomains: cleanHost },
            { domain: cleanHost } // Legacy support
        ]
    })

    // If not found, try subdomain mapping
    if (!tenant) {
        let subdomain = null

        // Check for localhost subdomain (e.g., trio.localhost)
        if (cleanHost.endsWith('.localhost')) {
            subdomain = cleanHost.split('.')[0]
        }
        // Check for production subdomain (e.g., trio.digiserve.com)
        else if (cleanHost.endsWith(`.${baseDomain}`)) {
            subdomain = cleanHost.split('.')[0]
        }

        if (subdomain && !['www', 'app', 'api', 'admin'].includes(subdomain)) {
            // Try to find by slug (subdomain)
            tenant = await Restaurant.findOne({ slug: subdomain })

            // If still not found, try by barId directly (for prototype)
            if (!tenant) {
                tenant = await Restaurant.findOne({ barId: subdomain })
            }
        }
    }

    if (tenant) {
        // Cache the result
        tenantCache.set(cleanHost, {
            barId: tenant.barId,
            timestamp: Date.now(),
        })
        return tenant.barId
    }

    return null
}

/**
 * Get tenant from request headers
 * Checks x-tenant-id header first, then falls back to host-based resolution
 * @param {Request} request - Next.js request object
 * @returns {Promise<string|null>} The tenant's barId or null
 */
export async function getTenantFromRequest(request) {
    // Check for explicit tenant ID in header (used by admin routes via middleware)
    const explicitTenantId = request.headers.get('x-tenant-id')
    if (explicitTenantId) {
        // The header may be either a canonical barId OR a subdomain slug.
        // Try to resolve it to a barId by looking up the tenant config.
        await connectDB()
        const Restaurant = getRestaurantModel()

        // First, try to find a tenant by barId
        let tenant = await Restaurant.findOne({ barId: explicitTenantId })
        if (tenant) return tenant.barId

        // Next, try to find by slug
        tenant = await Restaurant.findOne({ slug: explicitTenantId })
        if (tenant) return tenant.barId

        // Fallback: if header doesn't match any DB value, fall through to host resolution
    }

    // Fall back to host-based resolution (for public routes)
    const host = request.headers.get('host')
    return await getTenantFromHost(host)
}

/**
 * Get tenant configuration by barId
 * @param {string} barId - Tenant identifier
 * @returns {Promise<Object|null>} Tenant configuration
 */
export async function _deprecated_getTenantConfig(barId) {
    if (!barId) {
        console.log('getTenantConfig: No barId provided')
        return null
    }

    console.log('getTenantConfig: Looking up tenant:', barId)

    await connectDB()
    const Restaurant = getRestaurantModel()

    const tenant = await Restaurant.findOne({ barId })

    if (!tenant) {
        console.log('getTenantConfig: Tenant not found for barId:', barId)
    } else {
        console.log('getTenantConfig: Found tenant:', tenant.name)
    }

    return tenant
}

/**
 * Validate that a tenant exists and is active
 * @param {string} barId - The tenant's barId
 * @returns {Promise<Object|null>} The tenant object or null
 */
export async function validateTenant(barId) {
    if (!barId) {
        return null
    }

    await connectDB()
    const Restaurant = getRestaurantModel()

    const tenant = await Restaurant.findOne({
        barId,
        'subscription.status': { $in: ['active', 'trialing'] }
    })

    return tenant
}

/**
 * Clear tenant cache (useful for testing or after tenant updates)
 * @param {string} host - Optional specific host to clear, or clear all if not provided
 */
export function clearTenantCache(host = null) {
    if (host) {
        tenantCache.delete(host)
    } else {
        tenantCache.clear()
    }
}

/**
 * Get tenant configuration
 * @param {string} barId - The tenant's barId
 * @returns {Promise<Object|null>} The tenant configuration
 */
export async function getTenantConfig(barId) {
    if (!barId) {
        return null
    }

    await connectDB()
    const Restaurant = getRestaurantModel()

    return await Restaurant.findOne({ barId })
}

/**
 * Check if a tenant has a specific module enabled
 * @param {string} barId - The tenant's barId
 * @param {string} moduleName - The module name (e.g., 'ordering', 'reservations')
 * @returns {Promise<boolean>} True if module is enabled
 */
export async function hasModule(barId, moduleName) {
    const tenant = await getTenantConfig(barId)
    if (!tenant) {
        return false
    }

    return tenant.modules && tenant.modules.includes(moduleName)
}

/**
 * Get the full redirect URL for a tenant's admin dashboard
 * @param {string} barId - The tenant's barId
 * @returns {Promise<string|null>} The full URL (e.g. http://sub.domain.com/admin) or null
 */
export async function getTenantRedirectUrl(barId) {
    const tenant = await getTenantConfig(barId)
    if (!tenant) return null

    const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https'

    if (tenant.domain) {
        return `${protocol}://${tenant.domain}/admin`
    }

    if (tenant.subdomain) {
        const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'digiserve.com'

        if (process.env.NODE_ENV === 'development') {
            return `http://${tenant.subdomain}.localhost:3000/admin`
        } else {
            return `https://${tenant.subdomain}.${baseDomain}/admin`
        }
    }

    return null
}
