"use client"

import { deleteChatbot } from "@/app/actions/chatbot"
import { Button } from "@/components/ui/button"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface DeleteChatbotButtonProps {
    chatbotId: string
    chatbotName: string
}

export function DeleteChatbotButton({ chatbotId, chatbotName }: DeleteChatbotButtonProps) {
    const router = useRouter()

    async function handleDelete() {
        const result = await deleteChatbot(chatbotId)
        if (result?.success) {
            router.push("/dashboard/chatbot")
            toast.success("Chatbot deleted")
        } else if (result?.error) {
            toast.error(result.error)
        }
    }

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="outline" size="icon" className="h-9 w-9 border-destructive text-destructive hover:bg-destructive/10">
                    <Trash2 className="h-4 w-4" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete {"\"" + chatbotName + "\""}? </AlertDialogTitle>
                    <AlertDialogDescription>
                        This will permanently delete this chatbot, all its conversations, connections, and settings. This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
