import { getKnowledgeBase } from "@/app/actions/knowledge"
import { KnowledgeBaseDetail, type KnowledgeBase } from "@/components/knowledge-base-detail"
import { notFound } from "next/navigation"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { users } from "@/lib/schema"
import { eq } from "drizzle-orm"

interface PageProps {
    params: Promise<{ id: string }>
}

export default async function KnowledgeBaseDetailPage({ params }: PageProps) {
    const { id } = await params
    const session = await auth()

    if (!session?.user?.id) {
        return notFound()
    }

    const [kb, user] = await Promise.all([
        getKnowledgeBase(id),
        db.query.users.findFirst({
            where: eq(users.id, session.user.id),
        })
    ])

    if (!kb) {
        notFound()
    }

    const settings = user?.settings || {}
    const hasEmbeddingConfig = !!settings.embeddingProvider

    return (
        <div className="flex flex-1 flex-col gap-4">
            <KnowledgeBaseDetail kb={kb as KnowledgeBase} hasEmbeddingConfig={hasEmbeddingConfig} />
        </div>
    )
}
