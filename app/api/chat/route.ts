import { streamText } from "ai"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { chatbotSettings, chatbotKnowledgeBases } from "@/lib/schema"
import { eq } from "drizzle-orm"
import { getRelevantContext } from "@/lib/rag-utils"
import { createModelInstance } from "@/lib/ai-helper"

export async function POST(req: Request) {
    const session = await auth()
    if (!session?.user?.id) {
        return new Response("Unauthorized", { status: 401 })
    }

    const { messages, chatbotId } = await req.json()

    if (!chatbotId) {
        return new Response("Chatbot ID required", { status: 400 })
    }

    // specific bot settings fetching
    const settings = await db.query.chatbotSettings.findFirst({
        where: eq(chatbotSettings.chatbotId, chatbotId),
    })

    // Fetch linked knowledge bases
    const linkedKbs = await db.query.chatbotKnowledgeBases.findMany({
        where: eq(chatbotKnowledgeBases.chatbotId, chatbotId),
    })

    const kbIds = linkedKbs.map((kb) => kb.knowledgeBaseId)
    let context = ""
    const lastMessage = messages[messages.length - 1]
    if (kbIds.length > 0 && lastMessage?.role === "user") {
        context = await getRelevantContext(lastMessage.content, kbIds, session.user!.id!)
    }

    const modelName = settings?.model || "gpt-3.5-turbo"

    // Construct System Prompt
    let systemPrompt = settings?.systemPrompt || ""

    if (context) {
        systemPrompt += `\n\nKNOWLEDGE BASE CONTEXT:\n${context}\n\nINSTRUCTIONS:\nAnswer the user's question based ONLY on the above context. If the answer is not in the context, say you don't know.`
    }

    // 1. Identity & Business Context
    if (settings?.businessAbout) {
        systemPrompt += `\n\nCONTEXT & BUSINESS INFO:\n${settings.businessAbout}`
    }

    // 2. Fallback Behavior
    if (settings?.fallbackMessage) {
        systemPrompt += `\n\nFALLBACK INSTRUCTION:\nIf you are unsure or don't have the answer, strictly say: "${settings.fallbackMessage}"`
    }

    // 3. Style & Tone
    const toneInstructions = []
    if (settings?.tone && settings.tone !== 'neutral') toneInstructions.push(`Tone: ${settings.tone}`)
    if (settings?.responseLength) {
        if (settings.responseLength === 'short') toneInstructions.push("Keep responses concise and short.")
        else if (settings.responseLength === 'descriptive') toneInstructions.push("Provide detailed and descriptive responses.")
    }
    if (settings?.languages && settings.languages.length > 0) toneInstructions.push(`Respond in one of these languages: ${settings.languages.join(', ')} unless the user speaks a different language.`)
    if (settings?.gender && settings.gender !== 'neutral') toneInstructions.push(`Persona gender: ${settings.gender}`)

    if (toneInstructions.length > 0) {
        systemPrompt += `\n\nSTYLE GUIDELINES:\n${toneInstructions.join('\n')}`
    }

    // 4. Formatting
    const formatting = []
    if (settings?.useEmojis) formatting.push("Use emojis where appropriate to be friendly.")
    if (settings?.useBulletPoints === false) formatting.push("Avoid using bullet points.") // default is usually to use them if helpful, so explicit false means avoid? Or just toggle on meaning "prefer"? Let's assume toggle on means "prefer using".
    // Actually user checkboxes are "Use emojis" and "Use bullet points", usually meaning "Enable/Encourage".
    if (settings?.useBulletPoints) formatting.push("Use bullet points for lists or structured info.")

    if (formatting.length > 0) {
        systemPrompt += `\n\nFORMATTING:\n${formatting.join('\n')}`
    }

    // 5. Constraints
    if (settings?.avoidWords) {
        systemPrompt += `\n\nAVOIDANCE:\nDo not use these words/phrases: ${settings.avoidWords}`
    }

    // 6. Dos and Donts
    if (settings?.dos && Array.isArray(settings.dos) && settings.dos.length > 0) {
        systemPrompt += `\n\nDO:\n- ${settings.dos.join('\n- ')}`
    }
    if (settings?.donts && Array.isArray(settings.donts) && settings.donts.length > 0) {
        systemPrompt += `\n\nDON'T:\n- ${settings.donts.join('\n- ')}`
    }

    // Default basic instruction if empty
    if (!systemPrompt.trim()) {
        systemPrompt = "You are a helpful AI assistant."
    }

    try {
        const model = await createModelInstance(modelName, session.user.id);

        const result = streamText({
            model,
            system: systemPrompt,
            messages,
        })

        return result.toTextStreamResponse()

    } catch (error) {
        console.error("Error creating model:", error)
        const errorMessage = error instanceof Error ? error.message : "Failed to initialize AI model"
        if (errorMessage.includes("No API key configured")) {
            return new Response(errorMessage, { status: 422 })
        } else if (errorMessage.includes("not found in supported providers")) {
            return new Response(errorMessage, { status: 400 })
        }
        return new Response(errorMessage, { status: 500 })
    }
}