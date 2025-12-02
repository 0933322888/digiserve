import bcrypt from 'bcryptjs'
import { getUserModel } from './db/models.js'
import connectDB from './db/mongodb-connection.js'
import { signToken, verifySessionToken, getSession } from './auth-edge.js'

export { verifySessionToken, getSession }

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
 * Verify user credentials against the database
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object|null>} User object if valid, null otherwise
 */
export async function verifyCredentials(email, password) {
  await connectDB()
  const User = getUserModel()

  const user = await User.findOne({ email })

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
 * Create a JWT token for user session
 * @param {Object} user - User object
 * @returns {Promise<string>} JWT token
 */
export async function createSessionToken(user) {
  return await signToken({
    userId: user._id?.toString() || user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    tenantIds: user.tenantIds || []
  })
}

/**
 * Set the admin session cookie
 * @param {string} token - JWT token
 */
export async function setSession(token) {
  const { cookies } = await import('next/headers')
  const cookieStore = await cookies()
  cookieStore.set('admin-session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/',
  })
}

/**
 * Clear the admin session cookie
 */
export async function clearSession() {
  const { cookies } = await import('next/headers')
  const cookieStore = await cookies()
  cookieStore.delete('admin-session')
}
