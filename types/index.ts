
// ============================================
// Chatbot Types
// ============================================
export interface Chatbot {
    id: string
    name: string
    status: string | null
    createdAt: Date
    _count?: {
        conversations: number
    }
}

export interface ChatbotSettings {
    model: string | null
    temperature: number | null
    systemPrompt: string | null
    businessAbout: string | null
    fallbackMessage: string | null
    avoidWords: string | null
    responseLength: string | null
    tone: string | null
    gender: string | null
    languages: string[] | null
    useEmojis: boolean | null
    useBulletPoints: boolean | null
    dos: string[] | null
    donts: string[] | null
}

export interface ChatbotWithSettings extends Chatbot {
    settings: ChatbotSettings | null
}

// ============================================
// Knowledge Base Types
// ============================================
export interface KnowledgeBase {
    id: string
    name: string
    description: string | null
    createdAt: Date
    _count?: {
        sources: number
    }
}

export interface KnowledgeSource {
    id: string
    name: string
    type: string
    status: string | null
    createdAt: Date
    updatedAt: Date
}

export interface KnowledgeBaseWithSources extends KnowledgeBase {
    sources: KnowledgeSource[]
}

// ============================================
// Connection Types
// ============================================
export interface Connection {
    id: string
    type: string
    name: string
    isActive: boolean
    chatbotId: string
    totalMessages?: number
    lastUsedAt?: Date | null
    config?: Record<string, unknown>
    createdAt?: Date
    chatbot?: {
        name: string
    }
}

// ============================================
// Message Types
// ============================================
export interface Message {
    id: string
    role: "user" | "assistant"
    content: string
}

// ============================================
// API Key Types
// ============================================
export interface ApiKey {
    id: string
    name: string
    keyPrefix: string
    isActive: boolean
    totalRequests: number
    lastUsedAt: string | null
    createdAt: string
}
