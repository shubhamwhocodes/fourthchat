"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { AI_PROVIDERS } from "@/lib/ai-providers"
import { Loader2 } from "lucide-react"

interface EmbeddingConfigFormProps {
    onSuccess: () => void
}

interface ApiKeyConfig {
    providerId: string
    apiKey?: string
    isEnabled?: boolean
}

export function EmbeddingConfigForm({ onSuccess }: EmbeddingConfigFormProps) {
    const [provider, setProvider] = useState("")
    const [model, setModel] = useState("")
    const [apiKey, setApiKey] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    const handleSave = async () => {
        if (!provider || !model) {
            toast.error("Please select a provider and model")
            return
        }

        setIsLoading(true)
        try {
            const currentRes = await fetch("/api/settings/api-keys")
            const currentData = await currentRes.json()

            const currentApiKeys = currentData.apiKeys || []

            const newApiKeys = [...currentApiKeys]
            if (apiKey) {
                const existingIndex = newApiKeys.findIndex((k: ApiKeyConfig) => k.providerId === provider)
                if (existingIndex >= 0) {
                    newApiKeys[existingIndex] = { ...newApiKeys[existingIndex], apiKey, isEnabled: true }
                } else {
                    newApiKeys.push({ providerId: provider, apiKey, isEnabled: true })
                }
            }

            const payload = {
                apiKeys: newApiKeys,
                defaultProvider: currentData.defaultProvider,
                embeddingProvider: provider,
                embeddingModel: model
            }

            const response = await fetch("/api/settings/api-keys", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            })

            if (response.ok) {
                toast.success("Embedding configuration saved")
                onSuccess()
            } else {
                const data = await response.json()
                toast.error(data.error || "Failed to save configuration")
            }
        } catch (error) {
            console.error(error)
            toast.error("An error occurred")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="grid gap-4 py-4">
            <div className="grid gap-2">
                <Label htmlFor="provider">Embedding Provider</Label>
                <Select value={provider} onValueChange={(val) => {
                    setProvider(val)
                    if (val === "openai") setModel("text-embedding-3-small")
                    if (val === "gemini") setModel("text-embedding-004")
                }}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select provider" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="openai">OpenAI</SelectItem>
                        <SelectItem value="gemini">Google Gemini</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {provider && (
                <div className="grid gap-2">
                    <Label htmlFor="model">Model</Label>
                    <Select value={model} onValueChange={setModel}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select model" />
                        </SelectTrigger>
                        <SelectContent>
                            {provider === "openai" && (
                                <>
                                    <SelectItem value="text-embedding-3-small">Text Embedding 3 Small</SelectItem>
                                    <SelectItem value="text-embedding-3-large">Text Embedding 3 Large</SelectItem>
                                </>
                            )}
                            {provider === "gemini" && (
                                <SelectItem value="text-embedding-004">Text Embedding 004</SelectItem>
                            )}
                        </SelectContent>
                    </Select>
                </div>
            )}

            {provider && (
                <div className="grid gap-2">
                    <Label htmlFor="apikey">API Key (Optional if already configured)</Label>
                    <Input
                        id="apikey"
                        type="password"
                        placeholder="sk-..."
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                    />
                    <p className="text-[0.8rem] text-muted-foreground">
                        Leave blank if you have already configured a key for {AI_PROVIDERS.find(p => p.id === provider)?.name}.
                    </p>
                </div>
            )}

            <Button onClick={handleSave} disabled={isLoading || !provider || !model}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save & Continue
            </Button>
        </div>
    )
}
