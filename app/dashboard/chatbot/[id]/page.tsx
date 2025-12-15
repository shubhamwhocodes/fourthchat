import { getChatbot } from "@/app/actions/chatbot"
import { ChatbotSettingsForm, type Chatbot } from "@/components/chatbot-settings-form"
import { ChatPlayground } from "@/components/chat-playground"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { DeleteChatbotButton } from "@/components/delete-chatbot-button"
import { db } from "@/lib/db"
import { knowledgeBases, chatbotKnowledgeBases, users, type UserSettings } from "@/lib/schema"
import { eq } from "drizzle-orm"
import { auth } from "@/auth"

interface PageProps {
    params: Promise<{ id: string }>
}

export default async function ChatbotDetailPage({ params }: PageProps) {
    const { id } = await params
    const bot = await getChatbot(id)
    const session = await auth()

    if (!bot || !session?.user?.id) {
        notFound()
    }

    const kbs = await db.query.knowledgeBases.findMany({
        where: eq(knowledgeBases.userId, bot.userId),
    })

    const linkedKbs = await db.query.chatbotKnowledgeBases.findMany({
        where: eq(chatbotKnowledgeBases.chatbotId, bot.id),
    })
    const linkedKbIds = linkedKbs.map(k => k.knowledgeBaseId)

    const userInfo = await db.query.users.findFirst({
        where: eq(users.id, session.user.id),
        columns: {
            settings: true
        }
    })
    const settings = (userInfo?.settings || {}) as UserSettings
    const activeApiKeys = settings.apiKeys || []

    return (
        <div className="flex flex-1 flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-3">
                <div className="flex items-center gap-3">
                    <Link href="/dashboard/chatbot">
                        <Button variant="ghost" size="icon" className="shrink-0">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <h1 className="text-xl sm:text-2xl font-bold truncate">{bot.name}</h1>
                </div>
                <div className="flex gap-2 lg:ml-10">
                    <Link href={`/dashboard/chatbot/${bot.id}/connections`}>
                        <Button variant="outline" size="sm" className="h-9">
                            <svg className="h-4 w-4 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                            Connections
                        </Button>
                    </Link>
                    <Link href={`/dashboard/chatbot/${bot.id}/embed`}>
                        <Button variant="outline" size="sm" className="h-9">
                            <svg className="h-4 w-4 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                            </svg>
                            Embed Widget
                        </Button>
                    </Link>
                    <DeleteChatbotButton chatbotId={bot.id} chatbotName={bot.name} />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
                <div className="lg:col-span-3">
                    <ChatbotSettingsForm
                        bot={bot as Chatbot}
                        availableKbs={kbs}
                        linkedKbIds={linkedKbIds}
                        activeApiKeys={activeApiKeys}
                    />
                </div>
                <div className="lg:col-span-2 lg:sticky lg:top-4 lg:self-start">
                    <ChatPlayground chatbotId={bot.id} />
                </div>
            </div>
        </div >
    )
}
