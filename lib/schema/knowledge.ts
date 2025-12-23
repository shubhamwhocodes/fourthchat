import {
    timestamp,
    pgTable,
    text,
} from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { users } from "./auth"

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
