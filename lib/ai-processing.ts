import { db } from "@/lib/db"
import { conversations, messages } from "@/lib/schema"
import { eq, and } from "drizzle-orm"
import { agentService } from "@/lib/agent/service"

export async function processWhatsAppMessage(
    chatbotId: string,
    phoneNumber: string,
    messageText: string,
    remoteJid: string,
    replyCallback: (to: string, text: string) => Promise<void>
) {
    let conversation = await db.query.conversations.findFirst({
        where: and(
            eq(conversations.chatbotId, chatbotId),
            eq(conversations.externalUserId, phoneNumber)
        )
    })

    if (!conversation) {
        const [newConversation] = await db.insert(conversations).values({
            chatbotId: chatbotId,
            externalUserId: phoneNumber
        }).returning()
        conversation = newConversation
    }

    await db.insert(messages).values({
        conversationId: conversation.id,
        role: "user",
        content: messageText
    })

    try {
        const agent = await agentService.getAgent(chatbotId)
        if (!agent) {
            console.error("Agent not found for chatbot:", chatbotId)
            return
        }
        const response = await agent.process(messageText, conversation.id)

        await db.insert(messages).values({
            conversationId: conversation.id,
            role: "assistant",
            content: response.text
        })

        await replyCallback(remoteJid, response.text)

    } catch (error) {
        console.error("Error processing message with agent:", error)
    }
}
