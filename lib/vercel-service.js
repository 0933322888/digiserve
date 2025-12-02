/**
 * Vercel API Service
 * 
 * Wrapper for Vercel API to manage custom domains programmatically
 * Docs: https://vercel.com/docs/rest-api/endpoints#domains
 */

const VERCEL_API_BASE = 'https://api.vercel.com'

/**
 * Get Vercel API configuration from environment
 * @returns {Object} API configuration
 */
function getVercelConfig() {
    const token = process.env.VERCEL_API_TOKEN
    const projectId = process.env.VERCEL_PROJECT_ID
    const teamId = process.env.VERCEL_TEAM_ID

    if (!token || !projectId) {
        throw new Error('VERCEL_API_TOKEN and VERCEL_PROJECT_ID must be set in environment variables')
    }

    return { token, projectId, teamId }
}

/**
 * Make a request to Vercel API
 * @param {string} endpoint - API endpoint
 * @param {Object} options - Fetch options
 * @returns {Promise<Object>} API response
 */
async function vercelRequest(endpoint, options = {}) {
    const { token, teamId } = getVercelConfig()

    const url = new URL(`${VERCEL_API_BASE}${endpoint}`)
    if (teamId) {
        url.searchParams.set('teamId', teamId)
    }

    const response = await fetch(url.toString(), {
        ...options,
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            ...options.headers,
        },
    })

    const data = await response.json()

    if (!response.ok) {
        console.error('Vercel API error:', data)
        throw new Error(data.error?.message || `Vercel API error: ${response.status}`)
    }

    return data
}

/**
 * Add a custom domain to the Vercel project
 * @param {string} domain - Domain to add (e.g., 'www.example.com' or 'example.com')
 * @returns {Promise<Object>} Domain configuration
 */
export async function addDomainToProject(domain) {
    const { projectId } = getVercelConfig()

    try {
        const data = await vercelRequest(`/v10/projects/${projectId}/domains`, {
            method: 'POST',
            body: JSON.stringify({ name: domain }),
        })

        console.log(`✅ Domain ${domain} added to Vercel project`)
        return data
    } catch (error) {
        console.error(`Failed to add domain ${domain}:`, error.message)
        throw error
    }
}

/**
 * Remove a domain from the Vercel project
 * @param {string} domain - Domain to remove
 * @returns {Promise<void>}
 */
export async function removeDomainFromProject(domain) {
    const { projectId } = getVercelConfig()

    try {
        await vercelRequest(`/v9/projects/${projectId}/domains/${domain}`, {
            method: 'DELETE',
        })

        console.log(`✅ Domain ${domain} removed from Vercel project`)
    } catch (error) {
        console.error(`Failed to remove domain ${domain}:`, error.message)
        throw error
    }
}

/**
 * Get domain status and verification info
 * @param {string} domain - Domain to check
 * @returns {Promise<Object>} Domain status
 */
export async function getDomainStatus(domain) {
    const { projectId } = getVercelConfig()

    try {
        const data = await vercelRequest(`/v9/projects/${projectId}/domains/${domain}`)

        return {
            name: data.name,
            verified: data.verified || false,
            verification: data.verification || [],
            apexConfigured: isApexConfigured(data.verification),
            sslProvisioned: data.verified && hasSSL(data),
        }
    } catch (error) {
        console.error(`Failed to get domain status for ${domain}:`, error.message)
        throw error
    }
}

/**
 * Check if apex domain is configured (A record)
 * @param {Array} verification - Verification array from Vercel
 * @returns {boolean}
 */
function isApexConfigured(verification) {
    if (!verification || !Array.isArray(verification)) return false

    return verification.some(v => v.type === 'A' && v.verified)
}

/**
 * Check if SSL is provisioned
 * @param {Object} domainData - Domain data from Vercel
 * @returns {boolean}
 */
function hasSSL(domainData) {
    // Vercel automatically provisions SSL when domain is verified
    return domainData.verified === true
}

/**
 * Get all domains in the project
 * @returns {Promise<Array>} List of domains
 */
export async function getProjectDomains() {
    const { projectId } = getVercelConfig()

    try {
        const data = await vercelRequest(`/v9/projects/${projectId}/domains`)
        return data.domains || []
    } catch (error) {
        console.error('Failed to get project domains:', error.message)
        throw error
    }
}

/**
 * Get DNS instructions for a domain
 * @param {string} domain - Domain name
 * @returns {Object} DNS instructions
 */
export function getDNSInstructions(domain) {
    const isApex = !domain.includes('www.') && domain.split('.').length === 2

    if (isApex) {
        // Apex domain (example.com)
        return {
            type: 'apex',
            instructions: [
                {
                    type: 'A',
                    name: '@',
                    value: '76.76.21.21',
                    description: 'Point your apex domain to Vercel',
                },
                {
                    type: 'CNAME',
                    name: 'www',
                    value: 'cname.vercel-dns.com',
                    description: 'Optional: Also configure www subdomain',
                },
            ],
        }
    } else {
        // Subdomain (www.example.com or custom.example.com)
        const subdomain = domain.split('.')[0]
        return {
            type: 'subdomain',
            instructions: [
                {
                    type: 'CNAME',
                    name: subdomain,
                    value: 'cname.vercel-dns.com',
                    description: `Point ${subdomain} subdomain to Vercel`,
                },
            ],
        }
    }
}

/**
 * Validate domain format
 * @param {string} domain - Domain to validate
 * @returns {Object} Validation result
 */
export function validateDomain(domain) {
    if (!domain || typeof domain !== 'string') {
        return { valid: false, error: 'Domain is required' }
    }

    // Remove protocol if present
    domain = domain.replace(/^https?:\/\//, '').replace(/\/$/, '')

    // Basic domain regex
    const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/i

    if (!domainRegex.test(domain)) {
        return { valid: false, error: 'Invalid domain format' }
    }

    // Check if it's a subdomain of digiserve.com (not allowed as custom domain)
    const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'digiserve.com'
    if (domain.endsWith(`.${baseDomain}`) || domain === baseDomain) {
        return {
            valid: false,
            error: `Cannot use ${baseDomain} subdomains as custom domains. They are reserved for platform use.`
        }
    }

    return { valid: true, domain }
}
