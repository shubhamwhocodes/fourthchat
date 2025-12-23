import { QdrantClient } from "@qdrant/js-client-rest"

const url = process.env.QDRANT_URL
const port = url?.startsWith("https://") ? 443 : undefined

export const qdrant = new QdrantClient({
    url,
    ...(port ? { port } : {}),
    ...(process.env.QDRANT_API_KEY ? { apiKey: process.env.QDRANT_API_KEY } : {}),
    checkCompatibility: false,
})

export const CHATBOT_COLLECTION = "fourthchat_knowledge"

export async function ensureCollection(dimension: number) {
    const collections = await qdrant.getCollections()
    const existing = collections.collections.find((c) => c.name === CHATBOT_COLLECTION)

    if (existing) {
        const info = await qdrant.getCollection(CHATBOT_COLLECTION)
        const currentSize = (info.config.params.vectors as { size: number }).size

        if (currentSize !== dimension) {
            console.log(`Recreating collection ${CHATBOT_COLLECTION} due to dimension mismatch: ${currentSize} -> ${dimension}`)
            await qdrant.deleteCollection(CHATBOT_COLLECTION)
        } else {
            return
        }
    }

    await qdrant.createCollection(CHATBOT_COLLECTION, {
        vectors: {
            size: dimension,
            distance: "Cosine",
        },
    })
}

