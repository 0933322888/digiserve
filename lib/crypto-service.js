import crypto from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const SECRET_KEY = process.env.AUTH_SECRET || 'your-secret-key-change-in-production'

// Derive a 32-byte key from the secret
function getKey() {
    return crypto.createHash('sha256').update(SECRET_KEY).digest()
}

/**
 * Encrypt a string
 * @param {string} text - Plain text to encrypt
 * @returns {string} Encrypted text in format: iv:authTag:encryptedData
 */
export function encrypt(text) {
    if (!text) return text

    const key = getKey()
    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv)

    let encrypted = cipher.update(text, 'utf8', 'hex')
    encrypted += cipher.final('hex')

    const authTag = cipher.getAuthTag()

    // Return format: iv:authTag:encryptedData
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`
}

/**
 * Decrypt a string
 * @param {string} encryptedText - Encrypted text in format: iv:authTag:encryptedData
 * @returns {string} Decrypted plain text
 */
export function decrypt(encryptedText) {
    if (!encryptedText) return encryptedText

    // Check if it's already in encrypted format
    if (!encryptedText.includes(':')) {
        // Assume it's plain text (for backward compatibility during migration)
        return encryptedText
    }

    const key = getKey()
    const parts = encryptedText.split(':')

    if (parts.length !== 3) {
        throw new Error('Invalid encrypted text format')
    }

    const iv = Buffer.from(parts[0], 'hex')
    const authTag = Buffer.from(parts[1], 'hex')
    const encrypted = parts[2]

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
    decipher.setAuthTag(authTag)

    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')

    return decrypted
}
