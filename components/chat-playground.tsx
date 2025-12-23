"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Bot, User } from "lucide-react"
import { FormEvent, useState } from "react"
import { Message } from "@/types"
import Link from "next/link"

interface ChatPlaygroundProps {
    chatbotId: string
}

export function ChatPlayground({ chatbotId }: ChatPlaygroundProps) {
    const [input, setInput] = useState("")
    const [messages, setMessages] = useState<Message[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | React.ReactNode | null>(null)

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
        setError(null)

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
                if (response.status === 422) {
                    setError(
                        <span>
                            No API key configured. Please add your API key in{" "}
                            <Link href="/dashboard/settings" className="underline font-semibold hover:text-destructive-foreground">
                                Settings
                            </Link>
                        </span>
                    )
                    setIsLoading(false)
                    return
                }
                const errorText = await response.text()
                throw new Error(errorText || `Request failed with status ${response.status}`)
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
                if (chunk.includes("AI_RetryError") || chunk.includes("quota") || chunk.includes("error")) {
                    if (chunk.toLowerCase().includes("quota exceeded") || chunk.toLowerCase().includes("rate limit")) {
                        throw new Error("API quota exceeded. Please check your plan and billing details.")
                    }
                }

                assistantMessage += chunk

                setMessages(prev => {
                    const filtered = prev.filter(m => m.id !== assistantId)
                    return [...filtered, { id: assistantId, role: "assistant" as const, content: assistantMessage }]
                })
            }

            if (!assistantMessage.trim()) {
                throw new Error("No response received from the AI. Please check your API configuration.")
            }
        } catch (err) {
            console.error("Chat error:", err)
            let errorMessage = "An error occurred"
            if (err instanceof Error) {
                errorMessage = err.message
                if (errorMessage.includes("quota")) {
                    errorMessage = "API quota exceeded. Please try a different model or check your billing."
                } else if (errorMessage.includes("401")) {
                    errorMessage = "Invalid API key. Please check your API key configuration."
                } else if (errorMessage.includes("400")) {
                    errorMessage = "Invalid request. Please check your chatbot configuration."
                }
            }
            setError(errorMessage)
        } finally {
            setIsLoading(false)
        }
    }



    return (
        <div className="flex flex-col h-[600px] border rounded-xl bg-background overflow-hidden">
            <div className="p-4 border-b bg-muted/40 font-medium flex items-center gap-2">
                <Bot className="h-4 w-4" />
                Playground
            </div>

            <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                    {messages.length === 0 && (
                        <div className="text-center text-muted-foreground py-10 text-sm">
                            Send a message to start testing your bot.
                        </div>
                    )}
                    {messages.map((m: Message) => (
                        <div
                            key={m.id}
                            className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                            {m.role === "assistant" && (
                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                    <Bot className="h-4 w-4 text-primary" />
                                </div>
                            )}
                            <div
                                className={`rounded-lg px-3 py-2 text-sm max-w-[80%] ${m.role === "user"
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted"
                                    }`}
                            >
                                {m.content}
                            </div>
                            {m.role === "user" && (
                                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                                    <User className="h-4 w-4" />
                                </div>
                            )}
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex gap-3 justify-start">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                <Bot className="h-4 w-4 text-primary" />
                            </div>
                            <div className="bg-muted rounded-lg px-3 py-2 text-sm">
                                <span className="animate-pulse">Thinking...</span>
                            </div>
                        </div>
                    )}
                    {error && (
                        <div className="flex gap-3 justify-start">
                            <div className="h-8 w-8 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
                                <Bot className="h-4 w-4 text-destructive" />
                            </div>
                            <div className="bg-destructive/10 text-destructive rounded-lg px-3 py-2 text-sm">
                                {error}
                            </div>
                        </div>
                    )}
                </div>
            </ScrollArea>

            <div className="p-4 border-t bg-background">
                <form onSubmit={onSubmit} className="flex gap-2">
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1"
                    />
                    <Button
                        type="submit"
                        size="icon"
                        disabled={isLoading || !input.trim()}
                    >
                        <Send className="h-4 w-4" />
                    </Button>
                </form>
            </div>
        </div>
    )
}
