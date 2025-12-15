import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { users } from "@/lib/schema"
import { eq } from "drizzle-orm"
import bcrypt from "bcryptjs"

// POST - Update user password
export async function POST(req: Request) {
    const session = await auth()
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const body = await req.json()
        const { currentPassword, newPassword } = body

        if (!currentPassword || !newPassword) {
            return NextResponse.json({ error: "Both passwords are required" }, { status: 400 })
        }

        if (newPassword.length < 6) {
            return NextResponse.json({ error: "New password must be at least 6 characters" }, { status: 400 })
        }

        // Get current user
        const user = await db.query.users.findFirst({
            where: eq(users.id, session.user.id)
        })

        if (!user || !user.password) {
            return NextResponse.json({ error: "User not found or no password set" }, { status: 404 })
        }

        // Verify current password
        const isValid = await bcrypt.compare(currentPassword, user.password)
        if (!isValid) {
            return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 })
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10)

        // Update password
        await db.update(users)
            .set({
                password: hashedPassword,
                updatedAt: new Date()
            })
            .where(eq(users.id, session.user.id))

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error("Error updating password:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
