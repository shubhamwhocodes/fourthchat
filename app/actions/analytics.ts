"use server"

import { auth } from "@/auth"
import { db } from "@/lib/db"
import { chatbots, knowledgeBases, apiUsage } from "@/lib/schema"
import { eq, count, avg } from "drizzle-orm"

export type DashboardMetrics = {
    totalMessages: number
    messageTrend: number | null
    avgResponseTime: number
    responseTimeTrend: number | null
    activeChatbots: number
    totalKnowledgeSources: number
    sourceTrend: number
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
    const session = await auth()
    if (!session?.user?.id) {
        return {
            totalMessages: 0,
            messageTrend: null,
            avgResponseTime: 0,
            responseTimeTrend: null,
            activeChatbots: 0,
            totalKnowledgeSources: 0,
            sourceTrend: 0
        }
    }

    const userId = session.user.id
    const now = new Date()
    const firstDayCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    try {
        // 1. Total Messages 
        const [msgCount] = await db
            .select({ value: count() })
            .from(apiUsage)
            .where(eq(apiUsage.userId, userId))

        // 2. Avg Response Time
        const [avgTime] = await db
            .select({ value: avg(apiUsage.responseTime) })
            .from(apiUsage)
            .where(eq(apiUsage.userId, userId))

        // 3. Active Chatbots
        const [botCount] = await db
            .select({ value: count() })
            .from(chatbots)
            .where(eq(chatbots.userId, userId))

        // 4. Total Knowledge Sources
        const userKbs = await db.query.knowledgeBases.findMany({
            where: eq(knowledgeBases.userId, userId),
            columns: { id: true }
        })

        const kbIds = userKbs.map(k => k.id)
        let sourceCount = 0
        let newSourcesCount = 0

        if (kbIds.length > 0) {
            const sources = await db.query.knowledgeSources.findMany({
                where: (sources, { inArray }) => inArray(sources.knowledgeBaseId, kbIds)
            })
            sourceCount = sources.length

            newSourcesCount = sources.filter(s => new Date(s.createdAt) >= firstDayCurrentMonth).length
        }

        return {
            totalMessages: msgCount?.value || 0,
            messageTrend: 0, // No historical comparison yet
            avgResponseTime: Math.round(Number(avgTime?.value || 0)),
            responseTimeTrend: 0,
            activeChatbots: botCount?.value || 0,
            totalKnowledgeSources: sourceCount,
            sourceTrend: newSourcesCount
        }

    } catch (error) {
        console.error("Failed to fetch analytics:", error)
        return {
            totalMessages: 0,
            messageTrend: null,
            avgResponseTime: 0,
            responseTimeTrend: null,
            activeChatbots: 0,
            totalKnowledgeSources: 0,
            sourceTrend: 0
        }
    }
}
