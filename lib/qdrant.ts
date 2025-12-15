import { QdrantClient } from "@qdrant/js-client-rest"

export const qdrant = new QdrantClient({ url: process.env.QDRANT_URL })

export const CHATBOT_COLLECTION = "chatbot_knowledge"

export async function ensureCollection(dimension: number) {
    const collections = await qdrant.getCollections()
    const existing = collections.collections.find((c) => c.name === CHATBOT_COLLECTION)

    if (existing) {
        // Check if dimensions match, if not recreate
        const info = await qdrant.getCollection(CHATBOT_COLLECTION)
        const currentSize = (info.config.params.vectors as { size: number }).size

        if (currentSize !== dimension) {
            console.log(`Recreating collection ${CHATBOT_COLLECTION} due to dimension mismatch: ${currentSize} -> ${dimension}`)
            await qdrant.deleteCollection(CHATBOT_COLLECTION)
        } else {
            return // Collection exists with correct dimensions
        }
    }

    await qdrant.createCollection(CHATBOT_COLLECTION, {
        vectors: {
            size: dimension,
            distance: "Cosine",
        },
    })
}

