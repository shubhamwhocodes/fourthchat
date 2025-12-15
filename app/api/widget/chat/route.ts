import { db } from "@/lib/db"
import { streamText } from "ai"
import { chatbots, chatbotSettings, conversations, messages } from "@/lib/schema"
import { eq, and } from "drizzle-orm"
import { createModelInstance } from "@/lib/ai-helper"

export async function POST(req: Request) {
    const { chatbotId, sessionId, message: userMessageText } = await req.json()

    if (!chatbotId || !sessionId || !userMessageText) {
        return new Response("Chatbot ID, Session ID, and Message are required", { status: 400 })
    }

    const bot = await db.query.chatbots.findFirst({ where: eq(chatbots.id, chatbotId) })
    if (!bot) return new Response("Chatbot not found", { status: 404 })

    const settings = await db.query.chatbotSettings.findFirst({ where: eq(chatbotSettings.chatbotId, chatbotId) })
    let conversation = await db.query.conversations.findFirst({
        where: and(
            eq(conversations.chatbotId, chatbotId),
            eq(conversations.externalUserId, sessionId)
        )
    })

    if (!conversation) {
        const [newConv] = await db.insert(conversations).values({
            chatbotId,
            externalUserId: sessionId
        }).returning()
        conversation = newConv
    }

    await db.insert(messages).values({
        conversationId: conversation.id,
        role: "user",
        content: userMessageText
    })

    const history = await db.query.messages.findMany({
        where: eq(messages.conversationId, conversation.id),
        orderBy: (messages, { desc }) => [desc(messages.createdAt)],
        limit: 20
    }).then(msgs => msgs.reverse())

    const modelName = settings?.model || "gpt-3.5-turbo"

    let systemPrompt = settings?.systemPrompt || ""
    if (settings?.businessAbout) systemPrompt += `\n\nCONTEXT & BUSINESS INFO:\n${settings.businessAbout}`
    if (settings?.fallbackMessage) systemPrompt += `\n\nFALLBACK INSTRUCTION:\nIf you are unsure or don't have the answer, strictly say: "${settings.fallbackMessage}"`

    const toneInstructions = []
    if (settings?.tone && settings.tone !== 'neutral') toneInstructions.push(`Tone: ${settings.tone}`)
    if (settings?.responseLength) {
        if (settings.responseLength === 'short') toneInstructions.push("Keep responses concise and short.")
        else if (settings.responseLength === 'descriptive') toneInstructions.push("Provide detailed and descriptive responses.")
    }
    const languages = settings?.languages as string[] | null
    if (languages && languages.length > 0) toneInstructions.push(`Respond in one of these languages: ${languages.join(', ')} unless user speaks otherwise.`)
    if (settings?.gender && settings.gender !== 'neutral') toneInstructions.push(`Persona gender: ${settings.gender}`)
    if (toneInstructions.length > 0) systemPrompt += `\n\nSTYLE GUIDELINES:\n${toneInstructions.join('\n')}`

    const formatting = []
    if (settings?.useEmojis) formatting.push("Use emojis where appropriate.")
    if (settings?.useBulletPoints === false) formatting.push("Avoid bullet points.")
    if (settings?.useBulletPoints) formatting.push("Use bullet points for lists.")
    if (formatting.length > 0) systemPrompt += `\n\nFORMATTING:\n${formatting.join('\n')}`

    if (settings?.avoidWords) systemPrompt += `\n\nAVOIDANCE:\nDo not use: ${settings.avoidWords}`

    const dos = settings?.dos as string[] | null
    if (dos && dos.length > 0) systemPrompt += `\n\nDO:\n- ${dos.join('\n- ')}`

    const donts = settings?.donts as string[] | null
    if (donts && donts.length > 0) systemPrompt += `\n\nDON'T:\n- ${donts.join('\n- ')}`

    if (!systemPrompt.trim()) systemPrompt = "You are a helpful AI assistant."

    try {
        const model = await createModelInstance(modelName, bot.userId);

        const result = streamText({
            model,
            system: systemPrompt,
            messages: history.map(m => ({ role: m.role as "user" | "assistant", content: m.content })),
            onFinish: async (event) => {
                await db.insert(messages).values({
                    conversationId: conversation.id,
                    role: "assistant",
                    content: event.text
                })

                await db.update(conversations)
                    .set({ updatedAt: new Date() })
                    .where(eq(conversations.id, conversation.id))
            }
        })

        return result.toTextStreamResponse()

    } catch (error) {
        console.error("Error creating model:", error)
        const errorMessage = error instanceof Error ? error.message : "Failed to initialize AI model"
        return new Response(errorMessage, { status: 400 })
    }
}
