import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { users } from "@/lib/schema"
import { eq } from "drizzle-orm"

export async function POST(req: Request) {
    const session = await auth()
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const body = await req.json()
        const { name } = body

        if (!name || typeof name !== "string" || name.trim().length === 0) {
            return NextResponse.json({ error: "Name is required" }, { status: 400 })
        }

        await db.update(users)
            .set({
                name: name.trim(),
                updatedAt: new Date()
            })
            .where(eq(users.id, session.user.id))

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error("Error updating profile:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
