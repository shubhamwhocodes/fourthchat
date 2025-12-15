import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { connections, conversations, messages } from "@/lib/schema"
import { eq, and } from "drizzle-orm"
import { createModelInstance } from "@/lib/ai-helper"
import { generateText } from "ai"
import { getRelevantContext } from "@/lib/rag-utils"

/**
 * GET - Webhook Verification (required by Meta)
 * Meta sends a GET request to verify your webhook URL
 * 
 * Each connection has its own verifyToken stored in config.
 * We find the connection by matching the token.
 */
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url)

    const mode = searchParams.get("hub.mode")
    const token = searchParams.get("hub.verify_token")
    const challenge = searchParams.get("hub.challenge")

    if (mode !== "subscribe" || !token) {
        return NextResponse.json({ error: "Invalid verification request" }, { status: 400 })
    }

    // Find all WhatsApp Business connections and check for matching token
    const allConnections = await db.query.connections.findMany({
        where: and(
            eq(connections.type, "whatsapp-business"),
            eq(connections.isActive, true)
        )
    })

    // Find the connection with matching verifyToken
    const connection = allConnections.find(c => {
        const cfg = c.config as Record<string, string>
        return cfg?.verifyToken === token
    })

    if (connection) {

        return new Response(challenge, { status: 200 })
    }


    return NextResponse.json({ error: "Forbidden - token mismatch" }, { status: 403 })
}

/**
 * POST - Receive incoming WhatsApp messages
 * 
 * Finds the connection by phoneNumberId from the webhook payload.
 * All credentials are stored per-connection, no env variables needed.
 */
export async function POST(req: Request) {
    try {
        const body = await req.json()



        // Meta sends notifications in this structure
        const entry = body.entry?.[0]
        const changes = entry?.changes?.[0]
        const value = changes?.value

        // Check if this is a message notification
        if (value?.messages?.[0]) {
            const message = value.messages[0]
            const metadata = value.metadata

            const phoneNumberId = metadata?.phone_number_id
            const from = message.from // Sender's phone number
            const messageText = message.text?.body



            // Skip if not a text message
            if (!messageText) {
                return NextResponse.json({ status: "ignored", reason: "not a text message" })
            }

            // Find the WhatsApp connection by phoneNumberId stored in config
            const allConnections = await db.query.connections.findMany({
                where: and(
                    eq(connections.type, "whatsapp-business"),
                    eq(connections.isActive, true)
                ),
                with: {
                    chatbot: {
                        with: {
                            settings: true,
                            knowledgeBases: {
                                with: {
                                    knowledgeBase: true
                                }
                            }
                        }
                    }
                }
            })

            // Find the connection matching this phoneNumberId
            const connection = allConnections.find(c => {
                const cfg = c.config as Record<string, string>
                return cfg?.phoneNumberId === phoneNumberId
            })

            if (!connection) {
                console.error(`No WhatsApp connection found for phoneNumberId: ${phoneNumberId}`)
                return NextResponse.json({ error: "No matching connection found" }, { status: 404 })
            }

            const config = connection.config as Record<string, string>

            // Validate access token exists
            if (!config?.accessToken) {
                console.error("Connection missing accessToken")
                return NextResponse.json({ error: "Connection not configured properly" }, { status: 500 })
            }

            // Get or create conversation for this user
            let conversation = await db.query.conversations.findFirst({
                where: and(
                    eq(conversations.chatbotId, connection.chatbotId),
                    eq(conversations.externalUserId, from)
                )
            })

            if (!conversation) {
                const [newConversation] = await db.insert(conversations).values({
                    chatbotId: connection.chatbotId,
                    externalUserId: from
                }).returning()
                conversation = newConversation
            }

            // Save user message
            await db.insert(messages).values({
                conversationId: conversation.id,
                role: "user",
                content: messageText
            })

            // Get conversation history
            const conversationMessages = await db.query.messages.findMany({
                where: eq(messages.conversationId, conversation.id),
                orderBy: (messages, { asc }) => [asc(messages.createdAt)],
                limit: 20
            })

            // Generate AI response
            const chatbot = connection.chatbot
            const settings = chatbot?.settings
            const knowledgeBaseIds = chatbot?.knowledgeBases?.map(kb => kb.knowledgeBaseId) || []

            // Build system prompt
            let systemPrompt = settings?.systemPrompt || ""

            if (knowledgeBaseIds.length > 0) {
                const ragContext = await getRelevantContext(messageText, knowledgeBaseIds, chatbot.userId)
                if (ragContext) {
                    systemPrompt += `\n\nRELEVANT CONTEXT:\n${ragContext}`
                }
            }

            if (settings?.businessAbout) {
                systemPrompt += `\n\nCONTEXT & BUSINESS INFO:\n${settings.businessAbout}`
            }

            if (settings?.fallbackMessage) {
                systemPrompt += `\n\nFALLBACK INSTRUCTION:\nIf unsure, say: "${settings.fallbackMessage}"`
            }

            if (!systemPrompt.trim()) {
                systemPrompt = "You are a helpful AI assistant."
            }

            // Select model
            const modelName = settings?.model || "gpt-4-turbo"
            const model = await createModelInstance(modelName, chatbot.userId)

            // Generate response
            const { text: aiResponse } = await generateText({
                model,
                system: systemPrompt,
                messages: conversationMessages.map(m => ({
                    role: m.role as "user" | "assistant",
                    content: m.content
                }))
            })

            // Save assistant response
            await db.insert(messages).values({
                conversationId: conversation.id,
                role: "assistant",
                content: aiResponse
            })

            // Send reply via WhatsApp API (using connection-specific token)
            await sendWhatsAppMessage(
                phoneNumberId,
                from,
                aiResponse,
                config.accessToken as string
            )

            // Update connection stats
            await db.update(connections)
                .set({
                    totalMessages: (connection.totalMessages || 0) + 1,
                    lastUsedAt: new Date()
                })
                .where(eq(connections.id, connection.id))

            return NextResponse.json({ status: "success" })
        }

        // Handle other webhook events (status updates, etc.)
        return NextResponse.json({ status: "received" })

    } catch (error) {
        console.error("WhatsApp webhook error:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}

/**
 * Send a WhatsApp message using the Cloud API
 */
async function sendWhatsAppMessage(
    phoneNumberId: string,
    to: string,
    message: string,
    accessToken: string
) {
    const url = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to: to,
            type: "text",
            text: {
                preview_url: false,
                body: message
            }
        })
    })

    if (!response.ok) {
        const error = await response.text()
        console.error("Failed to send WhatsApp message:", error)
        throw new Error(`WhatsApp API error: ${error}`)
    }

    const result = await response.json()

    return result
}
