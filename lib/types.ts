export interface ConnectionConfig {
    webhookUrl?: string
    secret?: string
    headers?: Record<string, string>
    verifyToken?: string
    phoneNumberId?: string
    accessToken?: string
}

export interface WebhookPayload {
    userId?: string
    message?: string
    conversationId?: string
    messageId?: string
    timestamp?: string
    metadata?: Record<string, unknown>
    [key: string]: unknown
}

export { type ApiKeyConfig, type UserSettings } from "@/lib/schema"
