import { SignJWT, jwtVerify } from 'jose'

export const SECRET_KEY = process.env.AUTH_SECRET
const key = new TextEncoder().encode(SECRET_KEY)

/**
 * Verify a JWT token
 * @param {string} token - JWT token
 * @returns {Promise<Object|null>} Decoded token payload or null if invalid
 */
export async function verifySessionToken(token) {
    try {
        const { payload } = await jwtVerify(token, key, {
            algorithms: ['HS256'],
        })
        return payload
    } catch (error) {
        return null
    }
}

/**
 * Get the session from cookies
 * @returns {Promise<Object|null>} Session data or null if not authenticated
 */
export async function getSession() {
    const { cookies } = await import('next/headers')
    const cookieStore = await cookies()
    const token = cookieStore.get('tenant_session')?.value

    if (!token) {
        return null
    }

    return await verifySessionToken(token)
}

/**
 * Create a JWT token for user session
 * @param {Object} payload - Token payload
 * @returns {Promise<string>} JWT token
 */
export async function signToken(payload) {
    return new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('24h')
        .sign(key)
}
