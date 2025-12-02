import { NextResponse } from 'next/server'
import { hasModule } from '@/lib/tenant-service'

/**
 * Module Access Middleware Helper
 * Use this in API routes to check if a tenant has access to a specific module
 * 
 * Example usage in an API route:
 * 
 * import { checkModuleAccess } from '@/lib/module-middleware'
 * 
 * export async function GET(request) {
 *   const barId = request.headers.get('x-tenant-id')
 *   const moduleCheck = await checkModuleAccess(barId, 'ordering')
 *   if (moduleCheck) return moduleCheck // Returns error response if no access
 *   
 *   // Continue with route logic...
 * }
 */

/**
 * Check if tenant has access to a module
 * @param {string} barId - Tenant ID
 * @param {string} moduleName - Module name (e.g., 'ordering', 'reservations')
 * @returns {NextResponse|null} Returns error response if no access, null if access granted
 */
export async function checkModuleAccess(barId, moduleName) {
    if (!barId) {
        return NextResponse.json(
            { error: 'Tenant ID is required' },
            { status: 400 }
        )
    }

    const hasAccess = await hasModule(barId, moduleName)

    if (!hasAccess) {
        return NextResponse.json(
            {
                error: `Module '${moduleName}' is not enabled for this account`,
                module: moduleName,
                enabled: false
            },
            { status: 403 }
        )
    }

    return null // Access granted
}

/**
 * Get all enabled modules for a tenant
 * @param {string} barId - Tenant ID
 * @returns {Promise<string[]>} Array of enabled module names
 */
export async function getEnabledModules(barId) {
    const { getTenantConfig } = await import('@/lib/tenant-service')
    const tenant = await getTenantConfig(barId)
    return tenant?.modules || []
}

/**
 * Check multiple modules at once
 * @param {string} barId - Tenant ID
 * @param {string[]} moduleNames - Array of module names to check
 * @returns {Promise<Object>} Object with module names as keys and boolean access as values
 */
export async function checkMultipleModules(barId, moduleNames) {
    const results = {}

    for (const moduleName of moduleNames) {
        results[moduleName] = await hasModule(barId, moduleName)
    }

    return results
}
