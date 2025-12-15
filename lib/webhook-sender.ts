import { db } from "@/lib/db"
import { webhookDeliveries } from "@/lib/schema"
import { eq } from "drizzle-orm"
import { createHmac } from "crypto"
import type { WebhookPayload } from "@/lib/types"

interface WebhookSendParams {
    deliveryId: string
    webhookUrl: string
    secret: string
    payload: WebhookPayload
    headers: Record<string, string>
}

export async function sendWebhook({ deliveryId, webhookUrl, secret, payload, headers }: WebhookSendParams) {
    const maxRetries = 3
    let lastError: Error | null = null

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            // Generate HMAC signature
            let signature = ""
            if (secret) {
                signature = createHmac("sha256", secret)
                    .update(JSON.stringify(payload))
                    .digest("hex")
            }

            const requestHeaders: Record<string, string> = {
                "Content-Type": "application/json",
                "X-Webhook-Timestamp": new Date().toISOString(),
                "User-Agent": "FourthChat-Webhook/1.0",
                ...headers
            }

            if (signature) {
                requestHeaders["X-Webhook-Signature"] = signature
            }

            const res = await fetch(webhookUrl, {
                method: "POST",
                headers: requestHeaders,
                body: JSON.stringify(payload),
                signal: AbortSignal.timeout(30000)
            })

            const responseText = await res.text()

            // Update delivery status
            await db.update(webhookDeliveries)
                .set({
                    status: res.ok ? "success" : "failed",
                    statusCode: res.status,
                    response: responseText.substring(0, 1000),
                    deliveredAt: res.ok ? new Date() : null,
                    attempts: attempt,
                    lastAttemptAt: new Date()
                })
                .where(eq(webhookDeliveries.id, deliveryId))

            if (res.ok) {
                return { success: true, status: res.status }
            }

            lastError = new Error(`HTTP ${res.status}: ${responseText.substring(0, 100)}`)

        } catch (error) {
            lastError = error instanceof Error ? error : new Error("Unknown error")

            await db.update(webhookDeliveries)
                .set({
                    attempts: attempt,
                    lastAttemptAt: new Date(),
                    error: lastError.message
                })
                .where(eq(webhookDeliveries.id, deliveryId))
        }

        // Wait before retry (exponential backoff)
        if (attempt < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000))
        }
    }

    // Final failure update
    await db.update(webhookDeliveries)
        .set({
            status: "failed",
            error: lastError?.message || "Max retries exceeded"
        })
        .where(eq(webhookDeliveries.id, deliveryId))

    return { success: false, error: lastError?.message }
}
