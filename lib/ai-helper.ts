import { db } from "@/lib/db"
import { users, type UserSettings, type ApiKeyConfig } from "@/lib/schema"
import { eq } from "drizzle-orm"
import { createOpenAI } from "@ai-sdk/openai"
import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { createAnthropic } from "@ai-sdk/anthropic"
import { createOpenAI as createGroq } from "@ai-sdk/openai"
import { AI_PROVIDERS } from "@/lib/ai-providers"

export async function createModelInstance(modelName: string, userId: string) {
    const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
        columns: { settings: true }
    })

    const userSettings = (user?.settings || {}) as UserSettings
    const apiKeys = userSettings.apiKeys || []

    const providerConfig = AI_PROVIDERS.find(p => p.models.some(m => m.id === modelName))
    if (!providerConfig) {
        throw new Error(`Model ${modelName} not found in supported providers. Please select a valid model.`)
    }

    const apiKeyConfig = apiKeys.find((k: ApiKeyConfig) => k.providerId === providerConfig.id)
    const hasCustomKey = apiKeyConfig && apiKeyConfig.apiKey && apiKeyConfig.isEnabled

    if (!hasCustomKey) {
        throw new Error(`No API key configured for ${providerConfig.name}. Please add your API key in Settings.`)
    }

    if (providerConfig.id === "openai") {
        const openai = createOpenAI({ apiKey: apiKeyConfig.apiKey })
        return openai(modelName)
    } else if (providerConfig.id === "gemini") {
        const google = createGoogleGenerativeAI({ apiKey: apiKeyConfig.apiKey })
        return google(modelName)
    } else if (providerConfig.id === "anthropic") {
        const anthropic = createAnthropic({ apiKey: apiKeyConfig.apiKey })
        return anthropic(modelName)
    } else if (providerConfig.id === "groq") {
        const groq = createGroq({ apiKey: apiKeyConfig.apiKey, baseURL: "https://api.groq.com/openai/v1" })
        return groq(modelName)
    }

    throw new Error(`Unsupported provider: ${providerConfig.id}`)
}
