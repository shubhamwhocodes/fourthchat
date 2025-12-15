import { auth } from "@/auth"
import { getDashboardMetrics } from "@/app/actions/analytics"
import { getChatbots } from "@/app/actions/chatbot"
import { getKnowledgeBases } from "@/app/actions/knowledge"
import { AnalyticsCards } from "@/components/dashboard/analytics-cards"
import { DashboardSections, DashboardSectionsSkeleton } from "@/components/dashboard/dashboard-sections"
import { db } from "@/lib/db"
import { connections } from "@/lib/schema"
import { eq, desc } from "drizzle-orm"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import type { Connection } from "@/types"

export default async function DashboardPage() {
    const session = await auth()

    if (!session?.user?.id) {
        redirect("/login")
    }

    return (
        <div className="flex flex-col gap-12">
            <Suspense fallback={<AnalyticsCardsSkeleton />}>
                <AnalyticsSection />
            </Suspense>

            <Suspense fallback={<DashboardSectionsSkeleton />}>
                <ResourcesSection userId={session.user.id} />
            </Suspense>
        </div>
    )
}

async function AnalyticsSection() {
    const metrics = await getDashboardMetrics()
    return <AnalyticsCards metrics={metrics} />
}

async function ResourcesSection({ userId }: { userId: string }) {
    const [userChatbots, userKnowledgeBases, rawConnections] = await Promise.all([
        getChatbots(),
        getKnowledgeBases(),
        db.query.connections.findMany({
            where: eq(connections.userId, userId),
            orderBy: [desc(connections.createdAt)],
            with: {
                chatbot: true
            }
        })
    ])

    const userConnections: Connection[] = rawConnections.map((conn) => ({
        id: conn.id,
        type: conn.type,
        name: conn.name,
        isActive: conn.isActive,
        chatbotId: conn.chatbotId,
        totalMessages: conn.totalMessages,
        lastUsedAt: conn.lastUsedAt,
        config: conn.config as Record<string, string> | undefined,
        createdAt: conn.createdAt,
        chatbot: conn.chatbot ? { name: conn.chatbot.name } : undefined,
    }))

    return (
        <DashboardSections
            chatbots={userChatbots}
            knowledgeBases={userKnowledgeBases}
            connections={userConnections}
        />
    )
}

function AnalyticsCardsSkeleton() {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className="p-6 border rounded-xl space-y-3">
                    <div className="h-4 w-24 bg-muted rounded" />
                    <div className="h-8 w-16 bg-muted rounded" />
                    <div className="h-3 w-20 bg-muted rounded" />
                </div>
            ))}
        </div>
    )
}
