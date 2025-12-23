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
import { messages } from "./conversations"

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
