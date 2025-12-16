import connectDB from '@/lib/db/mongodb-connection'
import { getRestaurantModel } from '@/lib/db/models'

/**
 * Resolve subdomain slug or barId to actual barId
 * @param {string} identifier - Could be subdomain slug (e.g., 'trio') or barId (e.g., 'tenant_xxx')
 * @returns {Promise<string|null>} - The actual barId or null if not found
 */
export async function resolveTenantId(identifier) {
    if (!identifier) return null

    try {
        await connectDB()
        const Restaurant = getRestaurantModel()

        // First try to find by barId directly (for backward compatibility)
        let restaurant = await Restaurant.findOne({ barId: identifier }).select('barId').lean()

        if (restaurant) {
            return restaurant.barId
        }

        // If not found, try by subdomain slug
        restaurant = await Restaurant.findOne({ subdomain: identifier }).select('barId').lean()

        if (restaurant) {
            return restaurant.barId
        }

        // If still not found, try by slug field
        restaurant = await Restaurant.findOne({ slug: identifier }).select('barId').lean()

        if (restaurant) {
            return restaurant.barId
        }

        return null
    } catch (error) {
        console.error('[resolveTenantId] Error:', error)
        return null
    }
}
