import { NextResponse } from "next/server"
import whatsappManager from "@/lib/whatsapp/manager"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { connections } from "@/lib/schema"
import { eq, and } from "drizzle-orm"

export async function GET(req: Request) {
    const session = await auth()
    if (!session?.user?.id) {
        return new NextResponse("Unauthorized", { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const connectionId = searchParams.get('connectionId')

    if (!connectionId) {
        return new NextResponse("Connection ID required", { status: 400 })
    }

    const status = whatsappManager.getStatus(connectionId)

    return NextResponse.json({
        status: status.status,
        qrCode: status.qrCode,
        lastError: status.lastError
    })
}

export async function POST(req: Request) {
    const session = await auth()
    if (!session?.user?.id) {
        return new NextResponse("Unauthorized", { status: 401 })
    }

    const { connectionId } = await req.json()

    if (!connectionId) {
        return new NextResponse("Connection ID required", { status: 400 })
    }

    const connection = await db.query.connections.findFirst({
        where: and(
            eq(connections.id, connectionId),
            eq(connections.userId, session.user.id)
        )
    })

    if (!connection) {
        return new NextResponse("Connection not found", { status: 404 })
    }

    whatsappManager.connect(connectionId)

    return NextResponse.json({ status: "connecting" })
}

export async function DELETE(req: Request) {
    const session = await auth()
    if (!session?.user?.id) {
        return new NextResponse("Unauthorized", { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const connectionId = searchParams.get('connectionId')

    if (!connectionId) {
        return new NextResponse("Connection ID required", { status: 400 })
    }

    await whatsappManager.logout(connectionId)

    return NextResponse.json({ status: "disconnected" })
}
