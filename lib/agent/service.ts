import { db } from "@/lib/db"
import { ChatbotAgent } from "./core"
import { AgentConfig } from "./types"

export class AgentService {
    private static instance: AgentService

    private constructor() { }

    public static getInstance(): AgentService {
        if (!AgentService.instance) {
            AgentService.instance = new AgentService()
        }
        return AgentService.instance
    }

    public async getAgent(chatbotId: string): Promise<ChatbotAgent | null> {

        const chatbot = await db.query.chatbots.findFirst({
            where: (chatbots, { eq }) => eq(chatbots.id, chatbotId),
            with: {
                settings: true,
                knowledgeBases: {
                    with: {
                        knowledgeBase: true
                    }
                }
            }
        })

        if (!chatbot) {
            console.error(`Chatbot ${chatbotId} not found`)
            return null
        }

        const config: AgentConfig = {
            chatbotId: chatbot.id,
            userId: chatbot.userId,
            settings: {
                model: chatbot.settings?.model || undefined,
                systemPrompt: chatbot.settings?.systemPrompt || undefined,
                businessAbout: chatbot.settings?.businessAbout || undefined,
                fallbackMessage: chatbot.settings?.fallbackMessage || undefined,
                temperature: chatbot.settings?.temperature || undefined,
                // Map other settings as needed
            },
            knowledgeBaseIds: chatbot.knowledgeBases?.map(kb => kb.knowledgeBaseId) || []
        }

        return new ChatbotAgent(config)
    }
}

export const agentService = AgentService.getInstance()
