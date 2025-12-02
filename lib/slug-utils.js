/**
 * Slug Generation Utilities
 * 
 * Utilities for generating URL-safe slugs from business names
 * and ensuring uniqueness across tenants.
 */

import { getRestaurantModel } from './db/models.js'
import connectDB from './db/mongodb-connection.js'

/**
 * Convert a business name to a URL-safe slug
 * @param {string} name - Business name
 * @returns {string} URL-safe slug
 */
export function generateSlug(name) {
    if (!name || typeof name !== 'string') {
        throw new Error('Business name is required')
    }

    return name
        .toLowerCase()
        .trim()
        // Remove special characters except spaces and hyphens
        .replace(/[^\w\s-]/g, '')
        // Replace spaces and multiple hyphens with single hyphen
        .replace(/[\s_-]+/g, '-')
        // Remove leading/trailing hyphens
        .replace(/^-+|-+$/g, '')
}

/**
 * Validate slug format
 * @param {string} slug - Slug to validate
 * @returns {boolean} True if valid
 */
export function validateSlugFormat(slug) {
    if (!slug || typeof slug !== 'string') {
        return false
    }

    // Must be 3-50 characters, lowercase alphanumeric and hyphens only
    const slugRegex = /^[a-z0-9]([a-z0-9-]{1,48}[a-z0-9])?$/
    return slugRegex.test(slug)
}

/**
 * Check if a slug is already in use
 * @param {string} slug - Slug to check
 * @returns {Promise<boolean>} True if available, false if taken
 */
export async function isSlugAvailable(slug) {
    await connectDB()
    const Restaurant = getRestaurantModel()

    const existing = await Restaurant.findOne({ slug })
    return !existing
}

/**
 * Generate a unique slug from a business name
 * If the base slug is taken, append a number (e.g., triobistro-2)
 * @param {string} businessName - Business name
 * @returns {Promise<string>} Unique slug
 */
export async function generateUniqueSlug(businessName) {
    const baseSlug = generateSlug(businessName)

    if (!validateSlugFormat(baseSlug)) {
        throw new Error('Generated slug is invalid. Please use a different business name.')
    }

    // Check if base slug is available
    if (await isSlugAvailable(baseSlug)) {
        return baseSlug
    }

    // Try appending numbers until we find an available slug
    let counter = 2
    let candidateSlug = `${baseSlug}-${counter}`

    while (!(await isSlugAvailable(candidateSlug))) {
        counter++
        candidateSlug = `${baseSlug}-${counter}`

        // Safety check to prevent infinite loop
        if (counter > 100) {
            throw new Error('Unable to generate unique slug. Please use a different business name.')
        }
    }

    return candidateSlug
}

/**
 * Generate subdomain from slug
 * @param {string} slug - Tenant slug
 * @returns {string} Full subdomain URL
 */
export function generateSubdomain(slug) {
    const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'digiserve.com'
    return `${slug}.${baseDomain}`
}

/**
 * Extract slug from subdomain
 * @param {string} host - Host header value
 * @returns {string|null} Slug if subdomain, null otherwise
 */
export function extractSlugFromHost(host) {
    const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'digiserve.com'

    if (!host || !host.includes(baseDomain)) {
        return null
    }

    // Remove port if present
    const cleanHost = host.split(':')[0]

    // Check if it's a subdomain of base domain
    const subdomainPattern = new RegExp(`^(.+)\\.${baseDomain.replace('.', '\\.')}$`)
    const match = cleanHost.match(subdomainPattern)

    return match ? match[1] : null
}
