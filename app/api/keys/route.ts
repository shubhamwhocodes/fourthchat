import { auth } from "@/auth"
import { db } from "@/lib/db"
import { apiKeys } from "@/lib/schema"
import { generateApiKey } from "@/lib/api-key-utils"
import { eq, and, desc } from "drizzle-orm"

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
            allowedChatbotIds: key.allowedChatbotIds,
            allowedDomains: key.allowedDomains,
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
        const { name, rateLimit, allowedChatbotIds, allowedDomains } = body

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
            allowedChatbotIds: allowedChatbotIds || null,
            allowedDomains: allowedDomains || null,
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

export async function DELETE(req: Request) {
    const session = await auth()
    if (!session?.user?.id) {
        return new Response("Unauthorized", { status: 401 })
    }

    try {
        const url = new URL(req.url)
        const keyId = url.pathname.split("/").pop()

        if (!keyId) {
            return new Response("Key ID is required", { status: 400 })
        }

        const result = await db.delete(apiKeys)
            .where(
                and(
                    eq(apiKeys.id, keyId),
                    eq(apiKeys.userId, session.user.id)
                )
            )
            .returning()

        if (result.length === 0) {
            return new Response("API key not found", { status: 404 })
        }

        return Response.json({ success: true })
    } catch (error) {
        console.error("Error deleting API key:", error)
        return new Response("Internal Server Error", { status: 500 })
    }
}
