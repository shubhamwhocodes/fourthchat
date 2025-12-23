import {
    timestamp,
    pgTable,
    text,
    boolean,
    integer,
    json,
    primaryKey,
} from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { users } from "./auth"
import { knowledgeBases } from "./knowledge"
import { conversations } from "./conversations"

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
