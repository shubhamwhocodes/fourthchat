"use client"

import { updateChatbot } from "@/app/actions/chatbot"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Plus, X, Globe, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { AI_PROVIDERS } from "@/lib/ai-providers"
import Link from "next/link"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"

import { ApiKeyConfig } from "@/lib/schema"

// Available languages
const AVAILABLE_LANGUAGES = [
    { label: "English", value: "english" },
    { label: "Spanish", value: "spanish" },
    { label: "French", value: "french" },
    { label: "German", value: "german" },
    { label: "Portuguese", value: "portuguese" },
    { label: "Italian", value: "italian" },
    { label: "Dutch", value: "dutch" },
    { label: "Russian", value: "russian" },
    { label: "Chinese", value: "chinese" },
    { label: "Japanese", value: "japanese" },
    { label: "Korean", value: "korean" },
    { label: "Arabic", value: "arabic" },
    { label: "Hindi", value: "hindi" },
    { label: "Bengali", value: "bengali" },
    { label: "Tamil", value: "tamil" },
    { label: "Telugu", value: "telugu" },
    { label: "Marathi", value: "marathi" },
    { label: "Gujarati", value: "gujarati" },
    { label: "Kannada", value: "kannada" },
    { label: "Malayalam", value: "malayalam" },
    { label: "Punjabi", value: "punjabi" },
    { label: "Turkish", value: "turkish" },
    { label: "Vietnamese", value: "vietnamese" },
    { label: "Thai", value: "thai" },
    { label: "Indonesian", value: "indonesian" },
    { label: "Polish", value: "polish" },
    { label: "Ukrainian", value: "ukrainian" },
    { label: "Czech", value: "czech" },
    { label: "Swedish", value: "swedish" },
    { label: "Norwegian", value: "norwegian" },
    { label: "Danish", value: "danish" },
    { label: "Finnish", value: "finnish" },
    { label: "Greek", value: "greek" },
    { label: "Hebrew", value: "hebrew" },
    { label: "Hinglish", value: "hinglish" },
]

interface ChatbotSettings {
    model: string | null
    temperature: number | null
    systemPrompt: string | null
    businessAbout: string | null
    fallbackMessage: string | null
    avoidWords: string | null
    responseLength: string | null
    tone: string | null
    gender: string | null
    languages: string[] | null
    useEmojis: boolean | null
    useBulletPoints: boolean | null
    dos: string[] | null
    donts: string[] | null
}

export interface Chatbot {
    id: string
    name: string
    settings: ChatbotSettings | null
}

interface AvailableKnowledgeBase {
    id: string
    name: string
}

export function ChatbotSettingsForm({
    bot,
    availableKbs = [],
    linkedKbIds = [],
    activeApiKeys = []
}: {
    bot: Chatbot,
    availableKbs?: AvailableKnowledgeBase[],
    linkedKbIds?: string[],
    activeApiKeys?: ApiKeyConfig[]
}) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [dos, setDos] = useState<string[]>(bot.settings?.dos || [])
    const [donts, setDonts] = useState<string[]>(bot.settings?.donts || [])
    const [selectedKbs, setSelectedKbs] = useState<string[]>(linkedKbIds)
    const [newDo, setNewDo] = useState("")
    const [newDont, setNewDont] = useState("")

    const [model, setModel] = useState(bot.settings?.model || "gpt-4-turbo")
    const [responseLength, setResponseLength] = useState(bot.settings?.responseLength || "medium")
    const [tone, setTone] = useState(bot.settings?.tone || "neutral")
    const [gender, setGender] = useState(bot.settings?.gender || "neutral")
    const [languages, setLanguages] = useState<string[]>(bot.settings?.languages || [])
    const [languageDialogOpen, setLanguageDialogOpen] = useState(false)

    // Controlled checkboxes
    const [useEmojis, setUseEmojis] = useState(bot.settings?.useEmojis ?? true)
    const [useBulletPoints, setUseBulletPoints] = useState(bot.settings?.useBulletPoints ?? true)

    // Sync state when props change (after router.refresh)
    useEffect(() => {
        setDos(bot.settings?.dos || [])
        setDonts(bot.settings?.donts || [])
        setSelectedKbs(linkedKbIds)

        // Smart model selection logic
        const currentModel = bot.settings?.model || "gpt-4-turbo"
        let validModel = currentModel

        // Check if current model is supported by active providers
        const isActiveProvider = (modelId: string) => {
            if (!activeApiKeys || activeApiKeys.length === 0) return false;
            // Find which provider owns this model
            const provider = AI_PROVIDERS.find(p => p.models.some(m => m.id === modelId));
            if (!provider) return false;
            // Check if user has this provider enabled
            return activeApiKeys.some(k => k.providerId === provider.id && k.isEnabled);
        }

        if (!isActiveProvider(currentModel)) {
            // If current model is not valid/active, try to find the first valid one
            for (const provider of AI_PROVIDERS) {
                const isEnabled = activeApiKeys.some(k => k.providerId === provider.id && k.isEnabled);
                if (isEnabled && provider.models.length > 0) {
                    validModel = provider.models[0].id;
                    break;
                }
            }
        }

        setModel(validModel)

        setResponseLength(bot.settings?.responseLength || "medium")
        setTone(bot.settings?.tone || "neutral")
        setGender(bot.settings?.gender || "neutral")
        setLanguages(bot.settings?.languages || [])
        setUseEmojis(bot.settings?.useEmojis ?? true)
        setUseBulletPoints(bot.settings?.useBulletPoints ?? true)
    }, [bot, linkedKbIds, activeApiKeys])

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        try {
            formData.append("dos", JSON.stringify(dos))
            formData.append("donts", JSON.stringify(donts))
            formData.append("knowledgeBaseIds", JSON.stringify(selectedKbs))
            formData.set("model", model)
            formData.set("responseLength", responseLength)
            formData.set("tone", tone)
            formData.set("gender", gender)
            formData.set("languages", JSON.stringify(languages))
            formData.set("useEmojis", useEmojis ? "true" : "false")
            formData.set("useBulletPoints", useBulletPoints ? "true" : "false")

            const result = await updateChatbot(bot.id, formData)
            if (result?.success) {
                toast.success("Settings saved successfully!")
                router.refresh()
            } else {
                toast.error(result?.error || "Failed to save settings")
            }
        } catch (error) {
            console.error(error)
            toast.error("Something went wrong, please try again.")
        } finally {
            setLoading(false)
        }
    }

    const addDo = () => {
        if (newDo.trim()) {
            setDos([...dos, newDo.trim()])
            setNewDo("")
        }
    }

    const removeDo = (index: number) => {
        setDos(dos.filter((_, i) => i !== index))
    }

    const addDont = () => {
        if (newDont.trim()) {
            setDonts([...donts, newDont.trim()])
            setNewDont("")
        }
    }

    const removeDont = (index: number) => {
        setDonts(donts.filter((_, i) => i !== index))
    }

    const PillSelector = ({
        label,
        value,
        onChange,
        options
    }: {
        label: string,
        value: string,
        onChange: (v: string) => void,
        options: { label: string, value: string }[]
    }) => (
        <div className="space-y-3">
            <Label className="text-sm font-medium">{label}</Label>
            <div className="flex flex-wrap gap-2">
                {options.map((opt) => (
                    <button
                        key={opt.value}
                        type="button"
                        onClick={() => onChange(opt.value)}
                        className={`px-4 py-2 rounded-lg text-sm border transition-colors ${value === opt.value
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-background hover:bg-muted"
                            }`}
                    >
                        {opt.label}
                    </button>
                ))}
            </div>
        </div>
    )

    return (
        <form action={handleSubmit} className="space-y-6">
            <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 mb-6 h-auto p-1 rounded-lg gap-1">
                    <TabsTrigger value="general" className="h-9 sm:h-10 text-xs sm:text-sm rounded-md">General</TabsTrigger>
                    <TabsTrigger value="personality" className="h-9 sm:h-10 text-xs sm:text-sm rounded-md">Personality</TabsTrigger>
                    <TabsTrigger value="knowledge" className="h-9 sm:h-10 text-xs sm:text-sm rounded-md">Knowledge</TabsTrigger>
                    <TabsTrigger value="advanced" className="h-9 sm:h-10 text-xs sm:text-sm rounded-md">Advanced</TabsTrigger>
                </TabsList>

                {/* General Tab */}
                <TabsContent value="general" className="space-y-4">
                    <div className="grid gap-2">
                        <Label className="text-sm font-medium">Bot name</Label>
                        <Input
                            name="name"
                            defaultValue={bot.name}
                            disabled
                            className="bg-muted"
                        />
                        <p className="text-xs text-muted-foreground">To rename, edit from the dashboard list.</p>
                    </div>

                    <div className="grid gap-2">
                        <Label className="text-sm font-medium">Model</Label>
                        {(activeApiKeys && activeApiKeys.filter(k => k.isEnabled).length > 0) ? (
                            <Select value={model} onValueChange={setModel}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a model" />
                                </SelectTrigger>
                                <SelectContent>
                                    {AI_PROVIDERS.map((provider) => {
                                        const isEnabled = activeApiKeys.some(k => k.providerId === provider.id && k.isEnabled);
                                        if (!isEnabled) return null;

                                        return (
                                            <SelectGroup key={provider.id}>
                                                <SelectLabel>{provider.name}</SelectLabel>
                                                {provider.models.map((m) => (
                                                    <SelectItem key={m.id} value={m.id}>
                                                        {m.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectGroup>
                                        )
                                    })}
                                </SelectContent>
                            </Select>
                        ) : (
                            <div className="flex items-center gap-2 p-3 text-sm border border-yellow-200 bg-yellow-50 dark:bg-yellow-900/10 dark:border-yellow-900 rounded-lg text-yellow-800 dark:text-yellow-200">
                                <AlertCircle className="h-4 w-4 shrink-0" />
                                <div className="flex-1">
                                    No AI providers are active.
                                    <Link href="/dashboard/settings" className="font-medium underline ml-1 hover:text-yellow-900 dark:hover:text-yellow-100">
                                        Configure API Keys
                                    </Link>
                                </div>
                            </div>
                        )}
                        <p className="text-xs text-muted-foreground">Select the AI model for this chatbot.</p>
                    </div>

                    <div className="grid gap-2">
                        <Label className="text-sm font-medium">What is your business about?</Label>
                        <Textarea
                            name="businessAbout"
                            defaultValue={bot.settings?.businessAbout || ""}
                            placeholder="Describe your business..."
                            className="min-h-[100px]"
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label className="text-sm font-medium">Fallback message</Label>
                        <Input
                            name="fallbackMessage"
                            defaultValue={bot.settings?.fallbackMessage || "Sorry, I don't have information on this."}
                            placeholder="What to say when the bot doesn't know"
                        />
                    </div>
                </TabsContent>

                {/* Personality Tab */}
                <TabsContent value="personality" className="space-y-6">
                    <PillSelector
                        label="Response length"
                        value={responseLength}
                        onChange={setResponseLength}
                        options={[
                            { label: "Descriptive", value: "descriptive" },
                            { label: "Medium", value: "medium" },
                            { label: "Short", value: "short" }
                        ]}
                    />

                    <PillSelector
                        label="Tone"
                        value={tone}
                        onChange={setTone}
                        options={[
                            { label: "Friendly", value: "friendly" },
                            { label: "Professional", value: "professional" },
                            { label: "Humorous", value: "humorous" },
                            { label: "Neutral", value: "neutral" }
                        ]}
                    />

                    <PillSelector
                        label="Gender"
                        value={gender}
                        onChange={setGender}
                        options={[
                            { label: "Female", value: "female" },
                            { label: "Male", value: "male" },
                            { label: "Neutral", value: "neutral" }
                        ]}
                    />

                    {/* Language Multi-Select */}
                    <div className="space-y-3">
                        <Label className="text-sm font-medium">Languages</Label>
                        <p className="text-xs text-muted-foreground">
                            Select languages the bot should respond in. Leave empty for auto-detect.
                        </p>

                        {/* Selected languages as chips */}
                        <div className="flex flex-wrap gap-2">
                            {languages.length === 0 ? (
                                <span className="text-sm text-muted-foreground italic">Auto-detect (any language)</span>
                            ) : (
                                languages.map((lang) => {
                                    const langInfo = AVAILABLE_LANGUAGES.find(l => l.value === lang)
                                    return (
                                        <span
                                            key={lang}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm"
                                        >
                                            {langInfo?.label || lang}
                                            <button
                                                type="button"
                                                onClick={() => setLanguages(languages.filter(l => l !== lang))}
                                                className="hover:bg-primary-foreground/20 rounded-full p-0.5"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </span>
                                    )
                                })
                            )}
                        </div>

                        {/* Add Language Dialog */}
                        <Dialog open={languageDialogOpen} onOpenChange={setLanguageDialogOpen}>
                            <DialogTrigger asChild>
                                <Button type="button" variant="outline" size="sm" className="gap-2">
                                    <Globe className="h-4 w-4" />
                                    Add Language
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-lg max-h-[80vh]">
                                <DialogHeader>
                                    <DialogTitle>Select Languages</DialogTitle>
                                </DialogHeader>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[50vh] overflow-y-auto py-4">
                                    {AVAILABLE_LANGUAGES.map((lang) => {
                                        const isSelected = languages.includes(lang.value)
                                        return (
                                            <button
                                                key={lang.value}
                                                type="button"
                                                onClick={() => {
                                                    if (isSelected) {
                                                        setLanguages(languages.filter(l => l !== lang.value))
                                                    } else {
                                                        setLanguages([...languages, lang.value])
                                                    }
                                                }}
                                                className={`px-3 py-2 rounded-lg text-sm border transition-colors text-left ${isSelected
                                                    ? "bg-primary text-primary-foreground border-primary"
                                                    : "bg-background hover:bg-muted border-border"
                                                    }`}
                                            >
                                                {lang.label}
                                            </button>
                                        )
                                    })}
                                </div>
                                <div className="flex justify-between items-center pt-2 border-t">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setLanguages([])}
                                    >
                                        Clear All
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={() => setLanguageDialogOpen(false)}
                                    >
                                        Done ({languages.length} selected)
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <div className="flex gap-6 pt-2">
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="useEmojis"
                                checked={useEmojis}
                                onCheckedChange={(checked) => setUseEmojis(checked === true)}
                            />
                            <Label htmlFor="useEmojis">Use emojis</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="useBulletPoints"
                                checked={useBulletPoints}
                                onCheckedChange={(checked) => setUseBulletPoints(checked === true)}
                            />
                            <Label htmlFor="useBulletPoints">Use bullet points</Label>
                        </div>
                    </div>
                </TabsContent>

                {/* Knowledge Tab */}
                <TabsContent value="knowledge" className="space-y-4">
                    <Label className="text-sm font-medium">Link Knowledge Bases</Label>
                    <div className="border rounded-lg p-4 bg-muted/20 space-y-3">
                        {availableKbs.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No knowledge bases available. Create one first.</p>
                        ) : (
                            availableKbs.map((kb) => (
                                <div key={kb.id} className="flex items-center gap-3">
                                    <Checkbox
                                        id={kb.id}
                                        checked={selectedKbs.includes(kb.id)}
                                        onCheckedChange={(checked) => {
                                            if (checked) setSelectedKbs([...selectedKbs, kb.id])
                                            else setSelectedKbs(selectedKbs.filter(id => id !== kb.id))
                                        }}
                                    />
                                    <label htmlFor={kb.id} className="text-sm font-medium">
                                        {kb.name}
                                    </label>
                                </div>
                            ))
                        )}
                    </div>
                </TabsContent>

                {/* Advanced Tab */}
                <TabsContent value="advanced" className="space-y-6">
                    <div className="grid gap-2">
                        <Label className="text-sm font-medium">Words to avoid</Label>
                        <Input
                            name="avoidWords"
                            defaultValue={bot.settings?.avoidWords || ""}
                            placeholder="e.g. profanity, competitor names"
                        />
                    </div>

                    <div className="space-y-3">
                        <Label className="text-sm font-medium text-green-600">Do&apos;s</Label>
                        <div className="space-y-2">
                            {dos.map((item, i) => (
                                <div key={i} className="flex gap-2">
                                    <Input value={item} readOnly className="flex-1" />
                                    <Button type="button" variant="ghost" size="sm" onClick={() => removeDo(i)}>
                                        Remove
                                    </Button>
                                </div>
                            ))}
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Add a Do..."
                                    value={newDo}
                                    onChange={(e) => setNewDo(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addDo())}
                                    className="flex-1"
                                />
                                <Button type="button" variant="outline" size="sm" onClick={addDo}>
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Label className="text-sm font-medium text-red-600">Don&apos;ts</Label>
                        <div className="space-y-2">
                            {donts.map((item, i) => (
                                <div key={i} className="flex gap-2">
                                    <Input value={item} readOnly className="flex-1" />
                                    <Button type="button" variant="ghost" size="sm" onClick={() => removeDont(i)}>
                                        Remove
                                    </Button>
                                </div>
                            ))}
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Add a Don&apos;t..."
                                    value={newDont}
                                    onChange={(e) => setNewDont(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addDont())}
                                    className="flex-1"
                                />
                                <Button type="button" variant="outline" size="sm" onClick={addDont}>
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>

            {/* Save Button - Always visible */}
            <div className="pt-4 border-t">
                <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                    {loading ? "Saving..." : "Save Changes"}
                </Button>
            </div>
        </form>
    )
}
