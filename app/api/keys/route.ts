import { auth } from "@/auth"
import { db } from "@/lib/db"
import { apiKeys } from "@/lib/schema"
import { generateApiKey } from "@/lib/api-key-utils"
import { eq, desc } from "drizzle-orm"

export async function GET() {
    const session = await auth()
    if (!session?.user?.id) {
        return new Response("Unauthorized", { status: 401 })
    }

    try {
        const keys = await db.query.apiKeys.findMany({
            where: eq(apiKeys.userId, session.user.id),
            orderBy: [desc(apiKeys.createdAt)],
        })

        const safeKeys = keys.map(key => ({
            id: key.id,
            name: key.name,
            keyPrefix: key.keyPrefix,
            isActive: key.isActive,
            rateLimit: key.rateLimit,
            totalRequests: key.totalRequests,
            lastUsedAt: key.lastUsedAt,
            createdAt: key.createdAt,
            expiresAt: key.expiresAt,
        }))

        return Response.json(safeKeys)
    } catch (error) {
        console.error("Error fetching API keys:", error)
        return new Response("Internal Server Error", { status: 500 })
    }
}

export async function POST(req: Request) {
    const session = await auth()
    if (!session?.user?.id) {
        return new Response("Unauthorized", { status: 401 })
    }

    try {
        const body = await req.json()
        const { name, rateLimit } = body

        if (!name || typeof name !== "string") {
            return new Response("Name is required", { status: 400 })
        }

        const { key, keyPrefix, hashedKey } = generateApiKey()

        const [newKey] = await db.insert(apiKeys).values({
            userId: session.user.id,
            name,
            key: hashedKey,
            keyPrefix,
            rateLimit: rateLimit || 100,
        }).returning()

        return Response.json({
            ...newKey,
            key,
        })
    } catch (error) {
        console.error("Error creating API key:", error)
        return new Response("Internal Server Error", { status: 500 })
    }
}
