"use client"


import Link from "next/link"
import { createKnowledgeBase } from "@/app/actions/knowledge"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { formatDistanceToNow } from "date-fns"
import { Plus, Book, MoreVertical } from "lucide-react"
import { useState } from "react"
import type { KnowledgeBase } from "@/types"

export function KnowledgeBaseList({ kbs }: { kbs: KnowledgeBase[] }) {
    const [open, setOpen] = useState(false)

    async function handleSubmit(formData: FormData) {
        try {
            const result = await createKnowledgeBase(formData)

            if (result?.success) {
                toast.success("Knowledge Base created successfully")
                setOpen(false)
            } else if (result?.error) {
                toast.error(result.error)
            } else {
                toast.error("Unexpected error occurred")
            }
        } catch (error) {
            console.error("Error in handleSubmit:", error)
            toast.error("Failed to create knowledge base")
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold tracking-tight flex items-center gap-2">
                    <Book className="h-5 w-5" />
                    Knowledge Bases
                </h2>
                <Button onClick={() => setOpen(true)}>
                    <Plus className="h-4 w-4" />
                    <span className="hidden md:inline">New Knowledge Base</span>
                </Button>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Create Knowledge Base</DialogTitle>
                            <DialogDescription>
                                Create a collection of documents for your chatbot to learn from.
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
                                        placeholder="e.g. Product Docs"
                                        className="col-span-3"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="description" className="text-right">
                                        Description
                                    </Label>
                                    <Textarea
                                        id="description"
                                        name="description"
                                        placeholder="Optional description..."
                                        className="col-span-3"
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

            {kbs.length === 0 ? (
                <div className="text-center py-12 border rounded-lg bg-muted/10 dashed border-muted-foreground/25">
                    <Book className="mx-auto h-12 w-12 text-muted-foreground/50" />
                    <h3 className="mt-4 text-lg font-semibold">No Knowledge Bases</h3>
                    <p className="text-muted-foreground">Create your first knowledge base to get started.</p>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {kbs.map((kb) => (
                        <Link key={kb.id} href={`/dashboard/knowledge-base/${kb.id}`}>
                            <div
                                className="flex flex-col p-6 space-y-4 border rounded-xl hover:bg-muted/50 transition-colors cursor-pointer h-full"
                            >
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <h3 className="font-semibold">{kb.name}</h3>
                                        <p className="text-sm text-muted-foreground line-clamp-2">
                                            {kb.description || "No description"}
                                        </p>
                                    </div>
                                    <Button variant="ghost" size="icon" className="-mr-2 -mt-2">
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </div>
                                <div className="pt-4 mt-auto border-t flex items-center justify-between text-xs text-muted-foreground">
                                    <span>{formatDistanceToNow(new Date(kb.createdAt), { addSuffix: true })}</span>
                                    <span>{kb._count?.sources || 0} sources</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}
