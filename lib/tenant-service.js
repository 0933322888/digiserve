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

    // For localhost development, return default tenant
    if (cleanHost.includes('localhost') || cleanHost.includes('127.0.0.1')) {
        // Strict mode: No default tenant for localhost
        return null
    }

    await connectDB()
    const Restaurant = getRestaurantModel()

    // Try to find by custom domain first
    let tenant = await Restaurant.findOne({ domain: cleanHost })

    // If not found, try subdomain mapping
    if (!tenant) {
        const subdomain = cleanHost.split('.')[0]

        // Skip common subdomains
        if (['www', 'app', 'api', 'admin'].includes(subdomain)) {
            return null
        }

        // Try to find by slug (subdomain)
        tenant = await Restaurant.findOne({ slug: subdomain })

        // If still not found, try by barId directly (for prototype)
        if (!tenant) {
            tenant = await Restaurant.findOne({ barId: subdomain })
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
        return explicitTenantId
    }

    // Fall back to host-based resolution (for public routes)
    const host = request.headers.get('host')
    return await getTenantFromHost(host)
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
