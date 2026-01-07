"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Key, Copy, Trash2, Plus, AlertCircle, Check } from "lucide-react"
import { toast } from "sonner"

interface ApiKey {
    id: string
    name: string
    keyPrefix: string
    isActive: boolean
    totalRequests: number
    lastUsedAt: string | null
    createdAt: string
}

export default function ApiKeysPage() {
    const [keys, setKeys] = useState<ApiKey[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
    const [newKeyName, setNewKeyName] = useState("")
    const [createdKey, setCreatedKey] = useState<string | null>(null)
    const [copiedId, setCopiedId] = useState<string | null>(null)
    const [deleteId, setDeleteId] = useState<string | null>(null)

    useEffect(() => {
        fetchKeys()
    }, [])

    const fetchKeys = async () => {
        try {
            const res = await fetch("/api/keys")
            if (res.ok) {
                const data = await res.json()
                setKeys(data)
            }
        } catch (error) {
            console.error("Error fetching keys:", error)
            toast.error("Failed to load API keys")
        } finally {
            setIsLoading(false)
        }
    }

    const handleCreateKey = async () => {
        if (!newKeyName.trim()) {
            toast.error("Please enter a name for the API key")
            return
        }

        try {
            const res = await fetch("/api/keys", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: newKeyName })
            })

            if (res.ok) {
                const data = await res.json()
                setCreatedKey(data.key)
                setNewKeyName("")
                fetchKeys()
                toast.success("API key created successfully")
            } else {
                toast.error("Failed to create API key")
            }
        } catch (error) {
            console.error("Error creating key:", error)
            toast.error("Failed to create API key")
        }
    }

    const handleRevokeKey = async (keyId: string) => {
        try {
            const res = await fetch(`/api/keys/${keyId}`, {
                method: "DELETE"
            })

            if (res.ok) {
                fetchKeys()
                toast.success("API key revoked")
            } else {
                toast.error("Failed to revoke API key")
            }
        } catch (error) {
            console.error("Error revoking key:", error)
            toast.error("Failed to revoke API key")
        }
    }

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text)
        setCopiedId(id)
        toast.success("Copied to clipboard")
        setTimeout(() => setCopiedId(null), 2000)
    }

    const formatDate = (date: string | null) => {
        if (!date) return "Never"
        return new Date(date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        })
    }

    return (
        <div className="container mx-auto py-8 px-4 max-w-5xl">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold">API Keys</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage your API keys for accessing chatbots programmatically
                    </p>
                </div>

                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Create API Key
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create New API Key</DialogTitle>
                            <DialogDescription>
                                Generate a new API key to access your chatbots from external applications.
                            </DialogDescription>
                        </DialogHeader>

                        {!createdKey ? (
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="keyName">Key Name</Label>
                                    <Input
                                        id="keyName"
                                        placeholder="e.g., Production, Development"
                                        value={newKeyName}
                                        onChange={(e) => setNewKeyName(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && handleCreateKey()}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Choose a descriptive name to identify this key
                                    </p>
                                </div>

                                <Button onClick={handleCreateKey} className="w-full">
                                    Generate API Key
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4 py-4">
                                <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                                    <div className="flex gap-3">
                                        <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                                        <div className="text-sm">
                                            <p className="font-semibold text-amber-900 dark:text-amber-100 mb-1">
                                                Save this key now!
                                            </p>
                                            <p className="text-amber-700 dark:text-amber-300">
                                                This is the only time you&apos;ll see the full key. Store it securely.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Your API Key</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            value={createdKey}
                                            readOnly
                                            className="font-mono text-sm"
                                        />
                                        <Button
                                            size="icon"
                                            variant="outline"
                                            onClick={() => copyToClipboard(createdKey, "new-key")}
                                        >
                                            {copiedId === "new-key" ? (
                                                <Check className="h-4 w-4" />
                                            ) : (
                                                <Copy className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                </div>

                                <Button
                                    onClick={() => {
                                        setCreatedKey(null)
                                        setIsCreateDialogOpen(false)
                                    }}
                                    className="w-full"
                                >
                                    Done
                                </Button>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </div>

            {isLoading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="text-muted-foreground mt-4">Loading API keys...</p>
                </div>
            ) : keys.length === 0 ? (
                <Card className="p-12 text-center">
                    <Key className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No API keys yet</h3>
                    <p className="text-muted-foreground mb-6">
                        Create your first API key to start using the chatbot API
                    </p>
                    <Button onClick={() => setIsCreateDialogOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Your First Key
                    </Button>
                </Card>
            ) : (
                <div className="space-y-4">
                    {keys.map((key) => (
                        <Card key={key.id} className="p-6">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Key className="h-5 w-5 text-muted-foreground" />
                                        <h3 className="font-semibold text-lg">{key.name}</h3>
                                        {key.isActive && (
                                            <span className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-1 rounded-full">
                                                Active
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2 mb-4">
                                        <code className="text-sm bg-muted px-3 py-1 rounded font-mono">
                                            {key.keyPrefix}••••••••••••••••
                                        </code>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4 text-sm">
                                        <div>
                                            <p className="text-muted-foreground">Created</p>
                                            <p className="font-medium">{formatDate(key.createdAt)}</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground">Last Used</p>
                                            <p className="font-medium">{formatDate(key.lastUsedAt)}</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground">Requests</p>
                                            <p className="font-medium">{key.totalRequests.toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setDeleteId(key.id)}
                                    className="text-destructive hover:text-destructive"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Revoke API Key?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to revoke this API key? Any applications using it will immediately lose access. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                if (deleteId) handleRevokeKey(deleteId)
                                setDeleteId(null)
                            }}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Revoke Key
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
