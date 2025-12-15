import { getKnowledgeBases } from "@/app/actions/knowledge"
import { KnowledgeBaseList } from "@/components/knowledge-base-list"

export default async function KnowledgeBasePage() {
    const kbs = await getKnowledgeBases()

    return (
        <div className="flex flex-1 flex-col gap-4">
            <h1 className="text-2xl font-bold">Knowledge Base</h1>
            <p className="text-muted-foreground">Manage the data your AI uses to answer questions.</p>
            <KnowledgeBaseList kbs={kbs} />
        </div>
    )
}
