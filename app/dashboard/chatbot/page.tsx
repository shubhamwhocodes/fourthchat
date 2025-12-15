import { getChatbots } from "@/app/actions/chatbot"
import { ChatbotList } from "@/components/chatbot-list"

export default async function ChatbotPage() {
    const bots = await getChatbots()

    return (
        <div className="flex flex-1 flex-col gap-4">
            <h1 className="text-2xl font-bold">Chatbot Configuration</h1>
            <p className="text-muted-foreground">Configure your AI agent settings and behavior here.</p>
            <ChatbotList bots={bots} />
        </div>
    )
}
