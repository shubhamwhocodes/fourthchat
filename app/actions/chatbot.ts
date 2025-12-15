"use server"

import { auth } from "@/auth"
import { db } from "@/lib/db"
import { chatbots, chatbotSettings, chatbotKnowledgeBases, users } from "@/lib/schema"
import { eq, desc, and } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { AI_PROVIDERS } from "@/lib/ai-providers"


const createChatbotSchema = z.object({
    name: z.string().min(1, "Name is required"),
})

const updateChatbotSchema = z.object({
    model: z.string().optional(),
    temperature: z.number().min(0).max(10).optional(),
    systemPrompt: z.string().optional(),
    businessAbout: z.string().optional(),
    fallbackMessage: z.string().optional(),
    avoidWords: z.string().optional(),
    responseLength: z.string().optional(),
    tone: z.string().optional(),
    gender: z.string().optional(),
    languages: z.array(z.string()).optional(),
    useEmojis: z.boolean().optional(),
    useBulletPoints: z.boolean().optional(),
    dos: z.array(z.string()).optional(),
    donts: z.array(z.string()).optional(),
    knowledgeBaseIds: z.array(z.string()).optional(),
})

export async function getChatbots() {
    const session = await auth()
    if (!session?.user?.id) return []

    const bots = await db.query.chatbots.findMany({
        where: eq(chatbots.userId, session.user.id),
        orderBy: [desc(chatbots.createdAt)],
        with: {
            conversations: true
        }
    })

    return bots.map(bot => ({
        ...bot,
        _count: {
            conversations: bot.conversations.length
        }
    }))
}

export async function createChatbot(formData: FormData) {
    const session = await auth()
    if (!session?.user?.id) return { error: "Unauthorized" }

    const name = formData.get("name") as string
    const result = createChatbotSchema.safeParse({ name })

    if (!result.success) {
        return { error: "Invalid data" }
    }

    try {
        const [newBot] = await db.insert(chatbots).values({
            userId: session.user.id,
            name: result.data.name,
        }).returning()

        // Create default settings
        await db.insert(chatbotSettings).values({
            chatbotId: newBot.id,
            model: "gpt-4-turbo",
            temperature: 7,
            businessAbout: "You are a helpful AI assistant.",
        })

        revalidatePath("/dashboard/chatbot")
        return { success: true, id: newBot.id }
    } catch (error) {
        console.error("Failed to create chatbot:", error)
        return { error: "Failed to create chatbot" }
    }
}

export async function getChatbot(id: string) {
    const session = await auth()
    if (!session?.user?.id) return null

    const bot = await db.query.chatbots.findFirst({
        where: and(
            eq(chatbots.id, id),
            eq(chatbots.userId, session.user.id)
        ),
        // we can add with: { settings: true } if relations defined
    })

    if (!bot) return null

    const settings = await db.query.chatbotSettings.findFirst({
        where: eq(chatbotSettings.chatbotId, bot.id),
    })

    return { ...bot, settings }
}

export async function updateChatbot(id: string, formData: FormData) {
    const session = await auth()
    if (!session?.user?.id) return { error: "Unauthorized" }

    // Verify ownership
    const bot = await db.query.chatbots.findFirst({
        where: and(
            eq(chatbots.id, id),
            eq(chatbots.userId, session.user.id)
        ),
    })

    if (!bot) return { error: "Chatbot not found" }

    // Helper to safely get string or undefined from FormData
    const getOptionalString = (key: string) => {
        const value = formData.get(key)
        if (!value || value === "null" || value === "undefined") return undefined
        return value.toString()
    }

    const model = getOptionalString("model")
    const temperature = Number(formData.get("temperature"))
    const systemPrompt = getOptionalString("systemPrompt")

    // New fields
    const businessAbout = getOptionalString("businessAbout")
    const fallbackMessage = getOptionalString("fallbackMessage")
    const avoidWords = getOptionalString("avoidWords")
    const responseLength = getOptionalString("responseLength")
    const tone = getOptionalString("tone")
    const gender = getOptionalString("gender")
    let languages: string[] = []
    try {
        const languagesJson = formData.get("languages") as string
        if (languagesJson) languages = JSON.parse(languagesJson)
    } catch (e) {
        console.error("Failed to parse languages", e)
    }
    const useEmojis = formData.get("useEmojis") === "true"
    const useBulletPoints = formData.get("useBulletPoints") === "true"

    let dos: string[] = []
    let donts: string[] = []

    try {
        const dosJson = formData.get("dos") as string
        if (dosJson) dos = JSON.parse(dosJson)

        const dontsJson = formData.get("donts") as string
        if (dontsJson) donts = JSON.parse(dontsJson)
    } catch (e) {
        console.error("Failed to parse JSON lists", e)
    }

    let knowledgeBaseIds: string[] = []
    try {
        const kbIdsJson = formData.get("knowledgeBaseIds") as string
        if (kbIdsJson) knowledgeBaseIds = JSON.parse(kbIdsJson)
    } catch (e) {
        console.error("Failed to parse KB IDs", e)
    }

    const result = updateChatbotSchema.safeParse({
        model,
        temperature,
        systemPrompt,
        businessAbout,
        fallbackMessage,
        avoidWords,
        responseLength,
        tone,
        gender,
        languages,
        useEmojis,
        useBulletPoints,
        dos,
        donts,
        knowledgeBaseIds,
    })

    if (!result.success) return { error: "Invalid data" }

    if (result.data.model) {
        const providerForModel = AI_PROVIDERS.find(p => p.models.some(m => m.id === result.data.model));
        if (providerForModel) {
            const userRecord = await db.query.users.findFirst({
                where: eq(users.id, session.user.id),
                columns: { settings: true }
            });
            const apiKeys = ((userRecord?.settings as { apiKeys?: Array<{ providerId: string; apiKey?: string; isEnabled?: boolean }> })?.apiKeys) || [];
            const providerConfig = apiKeys.find((k) => k.providerId === providerForModel.id);
            if (!providerConfig || (providerConfig.isEnabled === false)) {
                if (!providerConfig || !providerConfig.apiKey) {
                    return { error: `Provider ${providerForModel.name} is not configured.` };
                }
                if (providerConfig.isEnabled === false) {
                    return { error: `Provider ${providerForModel.name} is disabled in Settings.` };
                }
            }
        }
    }

    try {
        await db
            .insert(chatbotSettings)
            .values({
                chatbotId: id,
                ...result.data,
            })
            .onConflictDoUpdate({
                target: chatbotSettings.chatbotId,
                set: result.data,
            })

        // Update Knowledge Bases Relations
        if (knowledgeBaseIds) {
            // Delete existing relations
            await db.delete(chatbotKnowledgeBases)
                .where(eq(chatbotKnowledgeBases.chatbotId, id))

            // Insert new ones
            if (knowledgeBaseIds.length > 0) {
                await db.insert(chatbotKnowledgeBases).values(
                    knowledgeBaseIds.map(kbId => ({
                        chatbotId: id,
                        knowledgeBaseId: kbId
                    }))
                )
            }
        }

        revalidatePath(`/dashboard/chatbot/${id}`)
        return { success: true }
    } catch (error) {
        console.error("Failed to update chatbot:", error)
        return { error: "Failed to update chatbot" }
    }
}

export async function deleteChatbot(id: string) {
    const session = await auth()
    if (!session?.user?.id) return { error: "Unauthorized" }

    // Verify ownership
    const bot = await db.query.chatbots.findFirst({
        where: and(
            eq(chatbots.id, id),
            eq(chatbots.userId, session.user.id)
        ),
    })

    if (!bot) return { error: "Chatbot not found" }

    try {
        // Import schema items we need to delete
        const { connections, conversations, messages } = await import("@/lib/schema")

        // Delete related data in order
        // 1. Delete messages from all conversations
        const convs = await db.query.conversations.findMany({
            where: eq(conversations.chatbotId, id)
        })
        for (const conv of convs) {
            await db.delete(messages).where(eq(messages.conversationId, conv.id))
        }

        // 2. Delete conversations
        await db.delete(conversations).where(eq(conversations.chatbotId, id))

        // 3. Delete connections
        await db.delete(connections).where(eq(connections.chatbotId, id))

        // 4. Delete chatbot-knowledge base links
        await db.delete(chatbotKnowledgeBases).where(eq(chatbotKnowledgeBases.chatbotId, id))

        // 6. Delete settings
        await db.delete(chatbotSettings).where(eq(chatbotSettings.chatbotId, id))

        // 7. Delete the chatbot itself
        await db.delete(chatbots).where(eq(chatbots.id, id))

        revalidatePath("/dashboard/chatbot")
        return { success: true }
    } catch (error) {
        console.error("Failed to delete chatbot:", error)
        return { error: "Failed to delete chatbot" }
    }
}
