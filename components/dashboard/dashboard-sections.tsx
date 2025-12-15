"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Link as LinkIcon, ExternalLink } from "lucide-react"
import { ChatbotList } from "@/components/chatbot-list"
import { KnowledgeBaseList } from "@/components/knowledge-base-list"
import { FourthChatLogo } from "@/components/fourthchat-logo"
import type { Chatbot, KnowledgeBase, Connection } from "@/types"

interface DashboardSectionsProps {
    chatbots: Chatbot[]
    knowledgeBases: KnowledgeBase[]
    connections: Connection[]
}

export function DashboardSections({ chatbots, knowledgeBases, connections }: DashboardSectionsProps) {
    return (
        <div className="space-y-10">
            {/* Chatbots Section */}
            <section>
                <ChatbotList bots={chatbots} />
            </section>

            <hr className="border-border" />

            {/* Knowledge Bases Section */}
            <section>
                <KnowledgeBaseList kbs={knowledgeBases} />
            </section>

            <hr className="border-border" />

            {/* Connections Section */}
            <section className="space-y-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold tracking-tight flex items-center gap-2">
                        <LinkIcon className="h-5 w-5" />
                        Connections
                    </h2>
                </div>
                {connections.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center animate-in fade-in-50">
                        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                            <LinkIcon className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <h3 className="mt-4 text-lg font-semibold">No active connections</h3>
                        <p className="mb-4 mt-2 text-sm text-muted-foreground max-w-sm">
                            Connect your chatbots to external platforms (Whatsapp, Slack, etc.) inside the chatbot settings.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {connections.map((conn) => (
                            <div key={conn.id} className="p-6 border rounded-xl space-y-3">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-semibold">{conn.name}</h3>
                                    <span className={`h-2 w-2 rounded-full ${conn.isActive ? 'bg-green-500' : 'bg-gray-300'}`} />
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <span className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2.5 py-1 text-xs font-medium">
                                        <LinkIcon className="h-3 w-3" />
                                        {conn.type}
                                    </span>
                                    <span className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 text-primary px-2.5 py-1 text-xs font-medium">
                                        <FourthChatLogo size={12} />
                                        {conn.chatbot?.name || 'Unknown Bot'}
                                    </span>
                                </div>
                                <div className="flex justify-end pt-2">
                                    <Link href={`/dashboard/chatbot/${conn.chatbotId}/connections`}>
                                        <Button variant="outline" size="sm" className="text-xs">
                                            Manage <ExternalLink className="ml-2 h-3 w-3" />
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    )
}

// Shimmer loading skeleton
export function DashboardSectionsSkeleton() {
    return (
        <div className="space-y-12 animate-pulse">
            {/* Chatbots Skeleton */}
            <section className="space-y-4">
                <div className="flex justify-between items-center">
                    <div className="h-7 w-40 bg-muted rounded" />
                    <div className="h-10 w-32 bg-muted rounded" />
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="p-6 border rounded-xl space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 bg-muted rounded-lg" />
                                <div className="space-y-2">
                                    <div className="h-5 w-32 bg-muted rounded" />
                                    <div className="h-3 w-16 bg-muted rounded" />
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <div className="h-8 w-24 bg-muted rounded" />
                                <div className="h-8 w-20 bg-muted rounded" />
                            </div>
                            <div className="pt-4 border-t flex justify-between">
                                <div className="h-3 w-20 bg-muted rounded" />
                                <div className="h-3 w-16 bg-muted rounded" />
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Knowledge Bases Skeleton */}
            <section className="space-y-4">
                <div className="flex justify-between items-center">
                    <div className="h-7 w-48 bg-muted rounded" />
                    <div className="h-10 w-40 bg-muted rounded" />
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2].map((i) => (
                        <div key={i} className="p-6 border rounded-xl space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 bg-muted rounded-lg" />
                                <div className="h-5 w-36 bg-muted rounded" />
                            </div>
                            <div className="h-3 w-24 bg-muted rounded" />
                        </div>
                    ))}
                </div>
            </section>

            {/* Connections Skeleton */}
            <section className="space-y-4">
                <div className="h-7 w-44 bg-muted rounded" />
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {[1].map((i) => (
                        <div key={i} className="p-4 border rounded-lg space-y-3">
                            <div className="flex justify-between items-center">
                                <div className="h-5 w-28 bg-muted rounded" />
                                <div className="h-2 w-2 bg-muted rounded-full" />
                            </div>
                            <div className="h-3 w-20 bg-muted rounded" />
                        </div>
                    ))}
                </div>
            </section>
        </div>
    )
}
