import crypto from "crypto"

/**
 * Generate a secure API key with prefix
 * Format: cb_live_xxxxxxxxxxxxxxxxxxxxxxxx
 */
export function generateApiKey(): { key: string; keyPrefix: string; hashedKey: string } {
    // Generate random bytes
    const randomBytes = crypto.randomBytes(32)
    const keySecret = randomBytes.toString("hex")

    // Create the full key with prefix
    const prefix = "cb_live"
    const key = `${prefix}_${keySecret}`

    // Store first 8 chars for display
    const keyPrefix = key.substring(0, 15) // "cb_live_xxxxxxx"

    // Hash the full key for storage
    const hashedKey = hashApiKey(key)

    return {
        key,        // Return once to user (never stored plain)
        keyPrefix,  // Store for display in UI
        hashedKey,  // Store for validation
    }
}

/**
 * Hash an API key using SHA-256
 */
export function hashApiKey(key: string): string {
    return crypto.createHash("sha256").update(key).digest("hex")
}

/**
 * Verify an API key against its hash
 */
export function verifyApiKey(key: string, hashedKey: string): boolean {
    const hash = hashApiKey(key)
    return crypto.timingSafeEqual(
        Buffer.from(hash),
        Buffer.from(hashedKey)
    )
}

/**
 * Generate a test API key (for development)
 * Format: cb_test_xxxxxxxxxxxxxxxxxxxxxxxx
 */
export function generateTestApiKey(): { key: string; keyPrefix: string; hashedKey: string } {
    const randomBytes = crypto.randomBytes(32)
    const keySecret = randomBytes.toString("hex")

    const prefix = "cb_test"
    const key = `${prefix}_${keySecret}`
    const keyPrefix = key.substring(0, 15)
    const hashedKey = hashApiKey(key)

    return { key, keyPrefix, hashedKey }
}
