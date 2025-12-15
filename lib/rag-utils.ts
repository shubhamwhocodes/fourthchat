import { embed } from "ai"
import { qdrant, CHATBOT_COLLECTION } from "./qdrant"
import { createEmbeddingModel } from "./embedding-config"
import { db } from "./db"
import { users } from "./schema"
import { eq } from "drizzle-orm"

export async function getRelevantContext(query: string, kbIds: string[], userId: string) {
    if (kbIds.length === 0) return ""

    try {
        const user = await db.query.users.findFirst({
            where: eq(users.id, userId)
        })

        if (!user) return ""
        const settings = user.settings || {}
        const providerId = settings.embeddingProvider

        if (!providerId) return ""

        const apiKeyConfig = (settings.apiKeys || []).find(k => k.providerId === providerId)

        if (!apiKeyConfig || !apiKeyConfig.apiKey) return ""

        const embeddingModel = createEmbeddingModel(providerId, apiKeyConfig.apiKey, settings.embeddingModel)

        const { embedding } = await embed({
            model: embeddingModel,
            value: query,
        })

        try {
            const collections = await qdrant.getCollections()
            const collectionExists = collections.collections.some(c => c.name === CHATBOT_COLLECTION)

            if (!collectionExists) {
                return ""
            }
        } catch (collectionError) {
            console.error("Error checking Qdrant collections:", collectionError)
            return ""
        }

        const results = await qdrant.search(CHATBOT_COLLECTION, {
            vector: embedding,
            filter: {
                must: [
                    {
                        key: "kbId",
                        match: {
                            any: kbIds,
                        },
                    },
                ],
            },
            limit: 5,
            with_payload: true,
        })

        const context = results
            .map((r) => r.payload?.text)
            .filter(Boolean)
            .join("\n\n")

        return context
    } catch (error) {
        console.error("Error fetching context:", error)
        return ""
    }
}
