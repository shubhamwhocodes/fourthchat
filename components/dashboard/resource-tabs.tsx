"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Link as LinkIcon, ExternalLink } from "lucide-react"
import { ChatbotList } from "@/components/chatbot-list"
import { KnowledgeBaseList } from "@/components/knowledge-base-list"
import { FourthChatLogo } from "@/components/fourthchat-logo"
import type { Chatbot, KnowledgeBase, Connection } from "@/types"

interface ResourceTabsProps {
    chatbots: Chatbot[]
    knowledgeBases: KnowledgeBase[]
    connections: Connection[]
}

export function ResourceTabs({ chatbots, knowledgeBases, connections }: ResourceTabsProps) {
    return (
        <Tabs defaultValue="chatbots" className="space-y-4">
            <TabsList className="h-auto p-1.5 bg-muted/50 rounded-xl flex flex-wrap gap-1">
                <TabsTrigger value="chatbots" className="h-10 px-4 sm:px-8 text-sm sm:text-base rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all flex-1 sm:flex-none">Chatbots</TabsTrigger>
                <TabsTrigger value="knowledge" className="h-10 px-4 sm:px-8 text-sm sm:text-base rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all flex-1 sm:flex-none">Knowledge</TabsTrigger>
                <TabsTrigger value="connections" className="h-10 px-4 sm:px-8 text-sm sm:text-base rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all flex-1 sm:flex-none">Connections</TabsTrigger>
            </TabsList>

            {/* Chatbots Tab - Uses existing ChatbotList component */}
            <TabsContent value="chatbots">
                <ChatbotList bots={chatbots} />
            </TabsContent>

            {/* Knowledge Tab - Uses existing KnowledgeBaseList component */}
            <TabsContent value="knowledge">
                <KnowledgeBaseList kbs={knowledgeBases} />
            </TabsContent>

            {/* Connections Tab */}
            <TabsContent value="connections" className="space-y-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold tracking-tight">Your Connections</h2>
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
                            <Card key={conn.id} className="h-full">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-base font-medium">
                                        {conn.name}
                                    </CardTitle>
                                    <div className="flex items-center gap-2">
                                        <span className={`h-2 w-2 rounded-full ${conn.isActive ? 'bg-green-500' : 'bg-gray-300'}`} />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-wrap gap-2 mt-2 mb-2">
                                        <span className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2.5 py-1 text-xs font-medium">
                                            <LinkIcon className="h-3 w-3" />
                                            {conn.type}
                                        </span>
                                        <span className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 text-primary px-2.5 py-1 text-xs font-medium">
                                            <FourthChatLogo size={12} />
                                            {conn.chatbot?.name || 'Unknown Bot'}
                                        </span>
                                    </div>
                                    <div className="flex justify-end">
                                        <Link href={`/dashboard/chatbot/${conn.chatbotId}/connections`}>
                                            <Button variant="ghost" size="sm" className="h-8">
                                                Manage <ExternalLink className="ml-2 h-3 w-3" />
                                            </Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </TabsContent>
        </Tabs>
    )
}
