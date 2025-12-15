import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { users, ApiKeyConfig, chatbots } from "@/lib/schema"
import { eq } from "drizzle-orm"
import { AI_PROVIDERS } from "@/lib/ai-providers"

export async function GET() {
    const session = await auth()
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const user = await db.query.users.findFirst({
            where: eq(users.id, session.user.id)
        })

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        const settings = (user.settings || {}) as { apiKeys?: Array<{ providerId: string; apiKey?: string; isEnabled?: boolean; selectedModel?: string }>; defaultProvider?: string; embeddingProvider?: string; embeddingModel?: string }

        const maskedApiKeys = (settings.apiKeys || []).map((key) => ({
            ...key,
            apiKey: key.apiKey ? `${"•".repeat(20)}${key.apiKey.slice(-4)}` : ""
        }))

        return NextResponse.json({
            apiKeys: maskedApiKeys,
            defaultProvider: settings.defaultProvider || "gemini",
            embeddingProvider: settings.embeddingProvider,
            embeddingModel: settings.embeddingModel
        })

    } catch (error) {
        console.error("Error loading API keys:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

export async function POST(req: Request) {
    const session = await auth()
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const body = await req.json()
        const { apiKeys, defaultProvider } = body

        const user = await db.query.users.findFirst({
            where: eq(users.id, session.user.id)
        })

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        const currentSettings = (user.settings || {}) as { apiKeys?: ApiKeyConfig[]; defaultProvider?: string; embeddingProvider?: string; embeddingModel?: string }
        const existingApiKeys: ApiKeyConfig[] = currentSettings.apiKeys || []

        // Create a mutable copy of existing keys to update
        const updatedApiKeys: ApiKeyConfig[] = [...existingApiKeys]

        // Process incoming apiKeys (updates and new keys)
        for (const update of apiKeys) {
            const existingKeyIndex = updatedApiKeys.findIndex(k => k.providerId === update.providerId)

            if (existingKeyIndex >= 0) {
                // Update existing key
                const currentKey = updatedApiKeys[existingKeyIndex]
                if (update.apiKey && update.apiKey.includes("•")) {
                    // If the incoming apiKey is masked, retain the existing one
                    updatedApiKeys[existingKeyIndex] = { ...currentKey, ...update, apiKey: currentKey.apiKey }
                } else {
                    // Otherwise, update with the new apiKey
                    updatedApiKeys[existingKeyIndex] = { ...currentKey, ...update }
                }
            } else {
                // Add new key, ensuring all required fields are present
                const newKey: ApiKeyConfig = {
                    providerId: update.providerId,
                    apiKey: update.apiKey || "", // Ensure apiKey is a string
                    isEnabled: update.isEnabled ?? true, // Default to true if not provided
                    selectedModel: update.selectedModel || "" // Ensure selectedModel is a string
                }
                updatedApiKeys.push(newKey)
            }
        }

        // Validate constraint: Check if we are disabling any provider that is currently in use
        const disabledProviderIds = updatedApiKeys
            .filter(newKey => {
                const oldKey = existingApiKeys.find(k => k.providerId === newKey.providerId)
                // return true if it was enabled (or default true) and is now explicitly disabled
                const wasEnabled = oldKey ? (oldKey.isEnabled ?? true) : false
                const isNowDisabled = newKey.isEnabled === false
                return wasEnabled && isNowDisabled
            })
            .map(k => k.providerId)

        if (disabledProviderIds.length > 0) {
            // Get all models belonging to these disabled providers
            const disabledModels = AI_PROVIDERS
                .filter(p => disabledProviderIds.includes(p.id))
                .flatMap(p => p.models.map(m => m.id))

            if (disabledModels.length > 0) {
                const userChatbots = await db.query.chatbots.findMany({
                    where: eq(chatbots.userId, session.user.id),
                    with: {
                        settings: true
                    }
                })

                const conflictingBots = userChatbots.filter(bot => {
                    const model = bot.settings?.model
                    return model && disabledModels.includes(model)
                })

                if (conflictingBots.length > 0) {
                    const botNames = conflictingBots.map(b => b.name).slice(0, 3).join(", ")
                    const moreCount = conflictingBots.length - 3
                    const suffix = moreCount > 0 ? ` and ${moreCount} others` : ""

                    return NextResponse.json({
                        error: `Cannot disable provider. Used by: ${botNames}${suffix}. Please change their models first.`
                    }, { status: 400 })
                }
            }
        }

        // Filter out keys that are empty or still masked after processing
        const finalApiKeys = updatedApiKeys.filter(k => k.apiKey && k.apiKey.length > 0 && !k.apiKey.includes("•"))

        await db.update(users)
            .set({
                settings: {
                    ...currentSettings,
                    apiKeys: finalApiKeys,
                    defaultProvider: defaultProvider || "gemini",
                    embeddingProvider: body.embeddingProvider,
                    embeddingModel: body.embeddingModel
                },
                updatedAt: new Date()
            })
            .where(eq(users.id, session.user.id))

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error("Error saving API keys:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
