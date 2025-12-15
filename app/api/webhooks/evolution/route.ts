import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { connections, conversations, messages } from "@/lib/schema"
import { eq, and } from "drizzle-orm"
import { generateText } from "ai"
import { getRelevantContext } from "@/lib/rag-utils"
import type { ConnectionConfig } from "@/lib/types"
import { createModelInstance } from "@/lib/ai-helper"

/**
 * Evolution API Webhook Handler
 * Receives messages from self-hosted Evolution API instances
 */
export async function POST(req: Request) {
    try {
        const body = await req.json()

        // Evolution API sends different event types
        const event = body.event
        const instance = body.instance
        const data = body.data

        // Only process incoming messages
        if (event !== "messages.upsert") {
            return NextResponse.json({ status: "ignored", reason: `Event type: ${event}` })
        }

        // Skip messages from ourselves
        if (data?.key?.fromMe) {
            return NextResponse.json({ status: "ignored", reason: "Message from self" })
        }

        // Extract message details
        const remoteJid = data?.key?.remoteJid // Format: 5511999999999@s.whatsapp.net
        const messageText = data?.message?.conversation ||
            data?.message?.extendedTextMessage?.text ||
            data?.message?.imageMessage?.caption ||
            null

        // Skip non-text messages
        if (!messageText) {
            return NextResponse.json({ status: "ignored", reason: "Not a text message" })
        }

        // Extract phone number from JID
        const phoneNumber = remoteJid?.split("@")[0]


        // Find the Evolution API connection by instance name
        const connection = await db.query.connections.findFirst({
            where: and(
                eq(connections.type, "whatsapp-evolution"),
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

        if (!connection) {
            console.error("No active Evolution API connection found")
            return NextResponse.json({ error: "No connection found" }, { status: 404 })
        }

        // Verify instance name matches (if stored in config)
        const config = connection.config as ConnectionConfig | null
        if (config?.instanceName && config.instanceName !== instance) {
            console.error("Instance name mismatch")
            return NextResponse.json({ error: "Instance mismatch" }, { status: 403 })
        }

        // Get or create conversation for this user
        let conversation = await db.query.conversations.findFirst({
            where: and(
                eq(conversations.chatbotId, connection.chatbotId),
                eq(conversations.externalUserId, phoneNumber)
            )
        })

        if (!conversation) {
            const [newConversation] = await db.insert(conversations).values({
                chatbotId: connection.chatbotId,
                externalUserId: phoneNumber
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
            orderBy: (messages, { desc }) => [desc(messages.createdAt)],
            limit: 20
        }).then(msgs => msgs.reverse())


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
            systemPrompt += `\n\nFALLBACK INSTRUCTION:\nIf you are unsure, say: "${settings.fallbackMessage}"`
        }

        if (!systemPrompt.trim()) {
            systemPrompt = "You are a helpful AI assistant."
        }

        // Initialize model
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

        // Send reply via Evolution API
        if (config?.evolutionApiUrl && config?.apiKey && config?.instanceName) {
            await sendEvolutionMessage(
                config.evolutionApiUrl,
                config.apiKey,
                config.instanceName,
                remoteJid,
                aiResponse
            )
        }

        // Update connection stats
        await db.update(connections)
            .set({
                totalMessages: (connection.totalMessages || 0) + 1,
                lastUsedAt: new Date()
            })
            .where(eq(connections.id, connection.id))

        return NextResponse.json({ status: "success" })

    } catch (error) {
        console.error("Evolution API webhook error:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}

/**
 * Send a message via Evolution API
 */
async function sendEvolutionMessage(
    apiUrl: string,
    apiKey: string,
    instanceName: string,
    to: string,
    message: string
) {
    const url = `${apiUrl}/message/sendText/${instanceName}`

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "apikey": apiKey
        },
        body: JSON.stringify({
            number: to,
            text: message
        })
    })

    if (!response.ok) {
        const error = await response.text()
        console.error("Failed to send Evolution message:", error)
        throw new Error(`Evolution API error: ${error}`)
    }

    const result = await response.json()

    return result
}
