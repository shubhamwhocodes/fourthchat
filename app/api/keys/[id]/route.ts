import { auth } from "@/auth"
import { db } from "@/lib/db"
import { apiKeys } from "@/lib/schema"
import { eq, and } from "drizzle-orm"

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
