"use client"

import { createChatbot } from "@/app/actions/chatbot"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { formatDistanceToNow } from "date-fns"
import { Plus, Bot, MoreVertical, MessageSquare, Link2, Code } from "lucide-react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { Chatbot } from "@/types"

export function ChatbotList({ bots }: { bots: Chatbot[] }) {
    const [open, setOpen] = useState(false)
    const router = useRouter()

    async function handleSubmit(formData: FormData) {
        const result = await createChatbot(formData)
        if (result?.success) {
            setOpen(false)
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold tracking-tight flex items-center gap-2">
                    <Bot className="h-5 w-5" />
                    Chatbots
                </h2>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="h-4 w-4" />
                            <span className="hidden sm:inline">New Chatbot</span>
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Create Chatbot</DialogTitle>
                            <DialogDescription>
                                Create a new AI agent to answer questions.
                            </DialogDescription>
                        </DialogHeader>
                        <form action={handleSubmit}>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="name" className="text-right">
                                        Name
                                    </Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        placeholder="e.g. Website Support"
                                        className="col-span-3"
                                        required
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit">Create</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {bots.length === 0 ? (
                <div className="text-center py-12 border rounded-lg bg-muted/10 dashed border-muted-foreground/25">
                    <Bot className="mx-auto h-12 w-12 text-muted-foreground/50" />
                    <h3 className="mt-4 text-lg font-semibold">No Chatbots</h3>
                    <p className="text-muted-foreground">Create your first chatbot to get started.</p>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {bots.map((bot) => (
                        <div
                            key={bot.id}
                            onClick={() => router.push(`/dashboard/chatbot/${bot.id}`)}
                            className="flex flex-col p-6 space-y-4 border rounded-xl hover:bg-muted/50 transition-colors cursor-pointer h-full"
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                        <Bot className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">{bot.name}</h3>
                                        <p className="text-xs text-muted-foreground capitalize">
                                            {bot.status}
                                        </p>
                                    </div>
                                </div>
                                <Button variant="ghost" size="icon" className="-mr-2 -mt-2" onClick={(e) => e.stopPropagation()}>
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </div>

                            {/* Quick Actions */}
                            <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                                <Button variant="outline" size="sm" className="text-xs" asChild>
                                    <Link href={`/dashboard/chatbot/${bot.id}/connections`}>
                                        <Link2 className="h-3 w-3 mr-1" />
                                        Connections
                                    </Link>
                                </Button>
                                <Button variant="outline" size="sm" className="text-xs" asChild>
                                    <Link href={`/dashboard/chatbot/${bot.id}/embed`}>
                                        <Code className="h-3 w-3 mr-1" />
                                        Embed
                                    </Link>
                                </Button>
                            </div>

                            <div className="pt-4 mt-auto border-t flex items-center justify-between text-xs text-muted-foreground">
                                <span>{formatDistanceToNow(new Date(bot.createdAt), { addSuffix: true })}</span>
                                <span className="flex items-center gap-1">
                                    <MessageSquare className="h-3 w-3" /> {bot._count?.conversations || 0} chats
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
