"use client"

import { useState, useEffect, useRef, FormEvent, use } from "react"
import { Send, Bot, User, Loader2 } from "lucide-react"

interface Message {
    id: string
    role: "user" | "assistant"
    content: string
}

export default function WidgetPage({ params }: { params: Promise<{ chatbotId: string }> }) {
    const { chatbotId } = use(params)

    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState("")
    const [sessionId, setSessionId] = useState<string>("")
    const [isLoading, setIsLoading] = useState(false)
    const [config, setConfig] = useState<{
        apiKey: string
        theme: string
        primaryColor: string
        title: string
        subtitle: string
    } | null>(null)

    const messagesEndRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        let storedSessionId = localStorage.getItem("widget_session_id")
        if (!storedSessionId) {
            storedSessionId = crypto.randomUUID()
            localStorage.setItem("widget_session_id", storedSessionId)
        }
        setSessionId(storedSessionId)
    }, [])

    useEffect(() => {
        const params = new URLSearchParams(window.location.search)
        setConfig({
            apiKey: params.get("apiKey") || "",
            theme: params.get("theme") || "light",
            primaryColor: params.get("primaryColor") || "#6366f1",
            title: params.get("title") || "Chat with us",
            subtitle: params.get("subtitle") || "We're here to help!",
        })
    }, [])

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        if (!input.trim() || !config?.apiKey || isLoading) return

        const userMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content: input.trim()
        }

        setMessages(prev => [...prev, userMessage])
        setInput("")
        setIsLoading(true)

        try {
            const response = await fetch("/api/widget/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${config.apiKey}`
                },
                body: JSON.stringify({
                    chatbotId,
                    sessionId,
                    message: userMessage.content,
                    messages: [...messages, userMessage].map(m => ({
                        role: m.role,
                        content: m.content
                    }))
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
                    return [...filtered, {
                        id: assistantId,
                        role: "assistant" as const,
                        content: assistantMessage
                    }]
                })
            }
        } catch (error) {
            console.error("Chat error:", error)
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: "Sorry, I encountered an error. Please try again."
            }])
        } finally {
            setIsLoading(false)
        }
    }

    if (!config) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
        )
    }

    const isDark = config.theme === "dark"
    const primaryColor = config.primaryColor

    return (
        <div
            className="flex flex-col h-screen"
            style={{
                backgroundColor: isDark ? "#1f2937" : "#ffffff",
                color: isDark ? "#f3f4f6" : "#111827"
            }}
        >
            {/* Header */}
            <div
                className="px-4 py-3 border-b flex items-center gap-3"
                style={{
                    backgroundColor: primaryColor,
                    borderColor: isDark ? "#374151" : "#e5e7eb",
                    color: "#ffffff"
                }}
            >
                <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                    <Bot className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm truncate">{config.title}</h3>
                    <p className="text-xs opacity-90 truncate">{config.subtitle}</p>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && (
                    <div className="text-center py-8 text-sm opacity-60">
                        <Bot className="h-12 w-12 mx-auto mb-3 opacity-40" />
                        <p>Start a conversation!</p>
                    </div>
                )}

                {messages.map((m) => (
                    <div
                        key={m.id}
                        className={`flex gap-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                        {m.role === "assistant" && (
                            <div
                                className="h-8 w-8 rounded-full flex items-center justify-center shrink-0 mt-1"
                                style={{
                                    backgroundColor: isDark ? "#374151" : "#f3f4f6"
                                }}
                            >
                                <Bot className="h-4 w-4" style={{ color: primaryColor }} />
                            </div>
                        )}

                        <div
                            className="rounded-2xl px-4 py-2 text-sm max-w-[80%]"
                            style={{
                                backgroundColor: m.role === "user"
                                    ? primaryColor
                                    : isDark ? "#374151" : "#f3f4f6",
                                color: m.role === "user"
                                    ? "#ffffff"
                                    : isDark ? "#f3f4f6" : "#111827"
                            }}
                        >
                            {m.content}
                        </div>

                        {m.role === "user" && (
                            <div
                                className="h-8 w-8 rounded-full flex items-center justify-center shrink-0 mt-1"
                                style={{
                                    backgroundColor: isDark ? "#374151" : "#f3f4f6"
                                }}
                            >
                                <User className="h-4 w-4" style={{ color: primaryColor }} />
                            </div>
                        )}
                    </div>
                ))}

                {isLoading && (
                    <div className="flex gap-2 justify-start">
                        <div
                            className="h-8 w-8 rounded-full flex items-center justify-center shrink-0"
                            style={{ backgroundColor: isDark ? "#374151" : "#f3f4f6" }}
                        >
                            <Bot className="h-4 w-4" style={{ color: primaryColor }} />
                        </div>
                        <div
                            className="rounded-2xl px-4 py-2 text-sm"
                            style={{ backgroundColor: isDark ? "#374151" : "#f3f4f6" }}
                        >
                            <div className="flex gap-1">
                                <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: primaryColor, animationDelay: "0ms" }}></div>
                                <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: primaryColor, animationDelay: "150ms" }}></div>
                                <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: primaryColor, animationDelay: "300ms" }}></div>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div
                className="p-4 border-t"
                style={{
                    backgroundColor: isDark ? "#111827" : "#ffffff",
                    borderColor: isDark ? "#374151" : "#e5e7eb"
                }}
            >
                <form onSubmit={handleSubmit} className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type a message..."
                        disabled={isLoading}
                        className="flex-1 px-4 py-2 rounded-full text-sm outline-none"
                        style={{
                            backgroundColor: isDark ? "#374151" : "#f3f4f6",
                            color: isDark ? "#f3f4f6" : "#111827"
                        }}
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="h-10 w-10 rounded-full flex items-center justify-center shrink-0 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                        style={{
                            backgroundColor: primaryColor,
                            color: "#ffffff"
                        }}
                    >
                        <Send className="h-4 w-4" />
                    </button>
                </form>
            </div>
        </div>
    )
}
