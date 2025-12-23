import {
    boolean,
    timestamp,
    pgTable,
    text,
    primaryKey,
    integer,
    json,
} from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { type AdapterAccount } from "next-auth/adapters"

export interface ApiKeyConfig {
    providerId: string
    apiKey: string
    isEnabled: boolean
    selectedModel: string
}

export interface UserSettings {
    apiKeys?: ApiKeyConfig[]
    defaultProvider?: string
    embeddingProvider?: string
    embeddingModel?: string
}

export const users = pgTable("user", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    name: text("name"),
    email: text("email").notNull(),
    emailVerified: timestamp("emailVerified", { mode: "date" }),
    image: text("image"),
    password: text("password"),

    settings: json("settings").$type<UserSettings>(),
    updatedAt: timestamp("updated_at").defaultNow(),
})

export const accounts = pgTable(
    "account",
    {
        userId: text("userId")
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        type: text("type").$type<AdapterAccount>().notNull(),
        provider: text("provider").notNull(),
        providerAccountId: text("providerAccountId").notNull(),
        refresh_token: text("refresh_token"),
        access_token: text("access_token"),
        expires_at: integer("expires_at"),
        token_type: text("token_type"),
        scope: text("scope"),
        id_token: text("id_token"),
        session_state: text("session_state"),
    },
    (account) => [
        primaryKey({
            columns: [account.provider, account.providerAccountId],
        }),
    ]
)

export const sessions = pgTable("session", {
    sessionToken: text("sessionToken").primaryKey(),
    userId: text("userId")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    expires: timestamp("expires", { mode: "date" }).notNull(),
})

export const verificationTokens = pgTable(
    "verificationToken",
    {
        identifier: text("identifier").notNull(),
        token: text("token").notNull(),
        expires: timestamp("expires", { mode: "date" }).notNull(),
    },
    (verificationToken) => [
        primaryKey({
            columns: [verificationToken.identifier, verificationToken.token],
        }),
    ]
)

export const knowledgeBases = pgTable("knowledge_base", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    visibility: text("visibility").default("private"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const knowledgeSources = pgTable("knowledge_source", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    knowledgeBaseId: text("knowledge_base_id")
        .notNull()
        .references(() => knowledgeBases.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    name: text("name").notNull(),
    content: text("content"),
    originalPath: text("original_path"),
    lastSyncedAt: timestamp("last_synced_at"),
    status: text("status").default("pending"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const embeddings = pgTable("embedding", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    sourceId: text("source_id")
        .notNull()
        .references(() => knowledgeSources.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    embedding: text("embedding"),
    metadata: text("metadata"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const knowledgeBasesRelations = relations(knowledgeBases, ({ one, many }) => ({
    user: one(users, {
        fields: [knowledgeBases.userId],
        references: [users.id],
    }),
    sources: many(knowledgeSources),
}))

export const knowledgeSourcesRelations = relations(knowledgeSources, ({ one, many }) => ({
    knowledgeBase: one(knowledgeBases, {
        fields: [knowledgeSources.knowledgeBaseId],
        references: [knowledgeBases.id],
    }),
    embeddings: many(embeddings),
}))

export const embeddingsRelations = relations(embeddings, ({ one }) => ({
    source: one(knowledgeSources, {
        fields: [embeddings.sourceId],
        references: [knowledgeSources.id],
    }),
}))

export const chatbots = pgTable("chatbot", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    slug: text("slug").unique(),
    status: text("status").default("draft"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const chatbotSettings = pgTable("chatbot_settings", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    chatbotId: text("chatbot_id")
        .notNull()
        .unique() // One settings per bot
        .references(() => chatbots.id, { onDelete: "cascade" }),
    model: text("model").default("gpt-4-turbo"),
    temperature: integer("temperature").default(7),
    systemPrompt: text("system_prompt"),
    businessAbout: text("business_about"),
    fallbackMessage: text("fallback_message"),
    avoidWords: text("avoid_words"),
    responseLength: text("response_length").default("medium"),
    tone: text("tone").default("neutral"),
    gender: text("gender").default("neutral"),
    languages: json("languages").$type<string[]>().default([]),
    useEmojis: boolean("use_emojis").default(true),
    useBulletPoints: boolean("use_bullet_points").default(true),
    dos: json("dos"),
    donts: json("donts"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const chatbotKnowledgeBases = pgTable("fourthchat_knowledge_base", {
    chatbotId: text("chatbot_id")
        .notNull()
        .references(() => chatbots.id, { onDelete: "cascade" }),
    knowledgeBaseId: text("knowledge_base_id")
        .notNull()
        .references(() => knowledgeBases.id, { onDelete: "cascade" }),
}, (t) => [
    primaryKey({ columns: [t.chatbotId, t.knowledgeBaseId] }),
])

// Relations for chatbots
export const chatbotsRelations = relations(chatbots, ({ one, many }) => ({
    user: one(users, {
        fields: [chatbots.userId],
        references: [users.id],
    }),
    settings: one(chatbotSettings, {
        fields: [chatbots.id],
        references: [chatbotSettings.chatbotId],
    }),
    knowledgeBases: many(chatbotKnowledgeBases),
    conversations: many(conversations),
}))

export const chatbotSettingsRelations = relations(chatbotSettings, ({ one }) => ({
    chatbot: one(chatbots, {
        fields: [chatbotSettings.chatbotId],
        references: [chatbots.id],
    }),
}))

export const chatbotKnowledgeBasesRelations = relations(chatbotKnowledgeBases, ({ one }) => ({
    chatbot: one(chatbots, {
        fields: [chatbotKnowledgeBases.chatbotId],
        references: [chatbots.id],
    }),
    knowledgeBase: one(knowledgeBases, {
        fields: [chatbotKnowledgeBases.knowledgeBaseId],
        references: [knowledgeBases.id],
    }),
}))


export const conversations = pgTable("conversation", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    chatbotId: text("chatbot_id")
        .notNull()
        .references(() => chatbots.id, { onDelete: "cascade" }),
    externalUserId: text("external_user_id"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const messages = pgTable("message", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    conversationId: text("conversation_id")
        .notNull()
        .references(() => conversations.id, { onDelete: "cascade" }),
    role: text("role").notNull(), // user, assistant, system
    content: text("content").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const conversationsRelations = relations(conversations, ({ one, many }) => ({
    chatbot: one(chatbots, {
        fields: [conversations.chatbotId],
        references: [chatbots.id],
    }),
    messages: many(messages),
}))

export const messagesRelations = relations(messages, ({ one }) => ({
    conversation: one(conversations, {
        fields: [messages.conversationId],
        references: [conversations.id],
    }),
}))

// API Keys for external access
export const apiKeys = pgTable("api_key", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),

    name: text("name").notNull(), // e.g., "Production Key", "Development"
    key: text("key").notNull().unique(), // The actual API key (hashed)
    keyPrefix: text("key_prefix").notNull(), // First 8 chars for display (e.g., "cb_live_")

    isActive: boolean("is_active").default(true).notNull(),

    // Rate limiting
    rateLimit: integer("rate_limit").default(100).notNull(), // requests per minute

    // Scoping - optional restrictions
    allowedChatbotIds: json("allowed_chatbot_ids").$type<string[]>(), // null = all chatbots

    // Security
    allowedDomains: json("allowed_domains").$type<string[]>(), // For CORS
    allowedIPs: json("allowed_ips").$type<string[]>(), // Optional IP whitelist

    // Usage tracking
    totalRequests: integer("total_requests").default(0).notNull(),
    lastUsedAt: timestamp("last_used_at"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    expiresAt: timestamp("expires_at"), // Optional expiration
})

// API Usage tracking for billing & analytics
export const apiUsage = pgTable("api_usage", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    apiKeyId: text("api_key_id")
        .notNull()
        .references(() => apiKeys.id, { onDelete: "cascade" }),
    userId: text("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    chatbotId: text("chatbot_id")
        .notNull()
        .references(() => chatbots.id, { onDelete: "cascade" }),

    // Request details
    model: text("model"), // Which AI model was used
    tokensUsed: integer("tokens_used"), // For billing calculation

    // Performance
    responseTime: integer("response_time"), // milliseconds

    // Status
    success: boolean("success").default(true).notNull(),
    errorMessage: text("error_message"),

    timestamp: timestamp("timestamp").defaultNow().notNull(),
})

// Relations for API keys
export const apiKeysRelations = relations(apiKeys, ({ one, many }) => ({
    user: one(users, {
        fields: [apiKeys.userId],
        references: [users.id],
    }),
    usage: many(apiUsage),
}))

export const apiUsageRelations = relations(apiUsage, ({ one }) => ({
    apiKey: one(apiKeys, {
        fields: [apiUsage.apiKeyId],
        references: [apiKeys.id],
    }),
    user: one(users, {
        fields: [apiUsage.userId],
        references: [users.id],
    }),
    chatbot: one(chatbots, {
        fields: [apiUsage.chatbotId],
        references: [chatbots.id],
    }),
}))

export const connections = pgTable("connection", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    chatbotId: text("chatbot_id")
        .notNull()
        .references(() => chatbots.id, { onDelete: "cascade" }),
    userId: text("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),

    type: text("type").notNull(),

    name: text("name").notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    config: json("config").$type<Record<string, unknown>>(),

    totalMessages: integer("total_messages").default(0).notNull(),
    lastUsedAt: timestamp("last_used_at"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const connectionsRelations = relations(connections, ({ one, many }) => ({
    chatbot: one(chatbots, {
        fields: [connections.chatbotId],
        references: [chatbots.id],
    }),
    user: one(users, {
        fields: [connections.userId],
        references: [users.id],
    }),
    webhookDeliveries: many(webhookDeliveries),
}))

export const webhookDeliveries = pgTable("webhook_delivery", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    connectionId: text("connection_id")
        .notNull()
        .references(() => connections.id, { onDelete: "cascade" }),
    messageId: text("message_id")
        .references(() => messages.id, { onDelete: "set null" }),

    webhookUrl: text("webhook_url").notNull(),
    payload: json("payload").notNull(),

    status: text("status").notNull(),
    statusCode: integer("status_code"),
    response: text("response"),
    error: text("error"),

    attempts: integer("attempts").default(0).notNull(),
    lastAttemptAt: timestamp("last_attempt_at"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    deliveredAt: timestamp("delivered_at"),
})

export const webhookDeliveriesRelations = relations(webhookDeliveries, ({ one }) => ({
    connection: one(connections, {
        fields: [webhookDeliveries.connectionId],
        references: [connections.id],
    }),
    message: one(messages, {
        fields: [webhookDeliveries.messageId],
        references: [messages.id],
    }),
}))
