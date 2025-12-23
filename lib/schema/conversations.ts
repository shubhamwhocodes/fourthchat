import {
    timestamp,
    pgTable,
    text,
} from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { chatbots } from "./chatbots"

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
