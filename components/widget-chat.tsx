"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Bot, User } from "lucide-react"
import { FormEvent, useState } from "react"

interface WidgetChatProps {
    chatbotId: string
}

interface Message {
    id: string
    role: "user" | "assistant"
    content: string
}

export function WidgetChat({ chatbotId }: WidgetChatProps) {
    const [input, setInput] = useState("")
    const [messages, setMessages] = useState<Message[]>([])
    const [isLoading, setIsLoading] = useState(false)

    const onSubmit = async (e: FormEvent) => {
        e.preventDefault()
        if (!input.trim() || isLoading) return

        const userMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content: input.trim()
        }

        setMessages(prev => [...prev, userMessage])
        setInput("")
        setIsLoading(true)

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: [...messages, userMessage].map(m => ({ role: m.role, content: m.content })),
                    chatbotId
                })
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            const reader = response.body?.getReader()
            const decoder = new TextDecoder()

            if (!reader) {
                throw new Error("No response body")
            }

            let assistantMessage = ""
            const assistantId = (Date.now() + 1).toString()

            while (true) {
                const { done, value } = await reader.read()
                if (done) break

                const chunk = decoder.decode(value)
                assistantMessage += chunk

                setMessages(prev => {
                    const filtered = prev.filter(m => m.id !== assistantId)
                    return [...filtered, { id: assistantId, role: "assistant" as const, content: assistantMessage }]
                })
            }
        } catch (err) {
            console.error("Chat error:", err)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex flex-col h-full bg-background">
            <ScrollArea className="flex-1 p-3">
                <div className="space-y-3">
                    {messages.length === 0 && (
                        <div className="text-center text-muted-foreground py-8 text-xs">
                            Send a message to start chatting
                        </div>
                    )}
                    {messages.map((m) => (
                        <div
                            key={m.id}
                            className={`flex gap-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                            {m.role === "assistant" && (
                                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                    <Bot className="h-3 w-3 text-primary" />
                                </div>
                            )}
                            <div
                                className={`rounded-lg px-3 py-2 text-xs max-w-[80%] ${m.role === "user"
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted"
                                    }`}
                            >
                                {m.content}
                            </div>
                            {m.role === "user" && (
                                <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center shrink-0">
                                    <User className="h-3 w-3" />
                                </div>
                            )}
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex gap-2 justify-start">
                            <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                <Bot className="h-3 w-3 text-primary" />
                            </div>
                            <div className="bg-muted rounded-lg px-3 py-2 text-xs">
                                <span className="animate-pulse">Typing...</span>
                            </div>
                        </div>
                    )}
                </div>
            </ScrollArea>

            <div className="p-3 border-t">
                <form onSubmit={onSubmit} className="flex gap-2">
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 text-xs h-8"
                    />
                    <Button
                        type="submit"
                        size="icon"
                        className="h-8 w-8"
                        disabled={isLoading || !input.trim()}
                    >
                        <Send className="h-3 w-3" />
                    </Button>
                </form>
            </div>
        </div>
    )
}
