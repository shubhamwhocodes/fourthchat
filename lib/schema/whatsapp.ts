import { pgTable, text, jsonb } from "drizzle-orm/pg-core"

export const whatsappSessions = pgTable("whatsapp_sessions", {
    id: text("id").primaryKey(),
    creds: jsonb("creds").notNull(),
    keys: jsonb("keys").notNull(),
})
