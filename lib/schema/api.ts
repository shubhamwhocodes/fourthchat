import {
    timestamp,
    pgTable,
    text,
    boolean,
    integer,
    json,
} from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { users } from "./auth"
import { chatbots } from "./chatbots"

export const apiKeys = pgTable("api_key", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),

    name: text("name").notNull(),
    key: text("key").notNull().unique(),
    keyPrefix: text("key_prefix").notNull(),

    isActive: boolean("is_active").default(true).notNull(),

    rateLimit: integer("rate_limit").default(100).notNull(),
    allowedChatbotIds: json("allowed_chatbot_ids").$type<string[]>(),
    allowedDomains: json("allowed_domains").$type<string[]>(),
    allowedIPs: json("allowed_ips").$type<string[]>(),

    totalRequests: integer("total_requests").default(0).notNull(),
    lastUsedAt: timestamp("last_used_at"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    expiresAt: timestamp("expires_at"),
})

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

    model: text("model"),
    tokensUsed: integer("tokens_used"),
    responseTime: integer("response_time"),

    success: boolean("success").default(true).notNull(),
    errorMessage: text("error_message"),

    timestamp: timestamp("timestamp").defaultNow().notNull(),
})

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
