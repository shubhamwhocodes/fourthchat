"use client"

import { useState, use } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Copy, Check, ArrowLeft, MessageSquare } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

interface EmbedPageProps {
    params: Promise<{ id: string }>
}

export default function EmbedPage({ params }: EmbedPageProps) {
    const { id: chatbotId } = use(params)

    const [apiKey, setApiKey] = useState("")
    const [position, setPosition] = useState<"bottom-right" | "bottom-left">("bottom-right")
    const [primaryColor, setPrimaryColor] = useState("#6366f1")
    const [theme, setTheme] = useState<"light" | "dark">("light")
    const [title, setTitle] = useState("Chat with us")
    const [copied, setCopied] = useState(false)

    const generateEmbedCode = () => {
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'YOUR_DOMAIN'
        return `<!-- FourthChat Widget -->
<script src="${baseUrl}/widget/chatbot-widget.js"></script>
<script>
  ChatbotWidget.init({
    apiKey: '${apiKey || "YOUR_API_KEY"}',
    chatbotId: '${chatbotId}',
    position: '${position}',
    primaryColor: '${primaryColor}',
    theme: '${theme}',
    title: '${title}',
    baseUrl: '${baseUrl}'
  });
</script>`
    }

    const copyEmbedCode = () => {
        navigator.clipboard.writeText(generateEmbedCode())
        setCopied(true)
        toast.success("Copied to clipboard!")
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="flex flex-1 flex-col gap-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href={`/dashboard/chatbot/${chatbotId}`}>
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold">Embed Widget</h1>
                    <p className="text-sm text-muted-foreground">Customize and add the chatbot to your website</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Left: Configuration */}
                <div className="lg:col-span-3 space-y-6">
                    {/* API Key */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">API Key</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Input
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                placeholder="cb_live_xxxxxxxxxxxx"
                                className="font-mono text-sm"
                            />
                            {(!apiKey || apiKey.includes("••••")) && (
                                <p className="text-sm text-muted-foreground">
                                    <Link href="/dashboard/api-keys" className="text-primary underline">
                                        Create an API key
                                    </Link>{" "}and paste the full key here.
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Customization */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Customization</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Position */}
                            <div className="space-y-2">
                                <Label>Position</Label>
                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        variant={position === "bottom-right" ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setPosition("bottom-right")}
                                        className="flex-1"
                                    >
                                        Bottom Right
                                    </Button>
                                    <Button
                                        type="button"
                                        variant={position === "bottom-left" ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setPosition("bottom-left")}
                                        className="flex-1"
                                    >
                                        Bottom Left
                                    </Button>
                                </div>
                            </div>

                            {/* Color */}
                            <div className="space-y-2">
                                <Label>Primary Color</Label>
                                <div className="flex gap-2">
                                    <Input
                                        type="color"
                                        value={primaryColor}
                                        onChange={(e) => setPrimaryColor(e.target.value)}
                                        className="w-14 h-10 p-1 cursor-pointer"
                                    />
                                    <Input
                                        value={primaryColor}
                                        onChange={(e) => setPrimaryColor(e.target.value)}
                                        className="flex-1 font-mono"
                                    />
                                </div>
                            </div>

                            {/* Theme */}
                            <div className="space-y-2">
                                <Label>Theme</Label>
                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        variant={theme === "light" ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setTheme("light")}
                                        className="flex-1"
                                    >
                                        Light
                                    </Button>
                                    <Button
                                        type="button"
                                        variant={theme === "dark" ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setTheme("dark")}
                                        className="flex-1"
                                    >
                                        Dark
                                    </Button>
                                </div>
                            </div>

                            {/* Title */}
                            <div className="space-y-2">
                                <Label>Widget Title</Label>
                                <Input
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Chat with us"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Embed Code */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-base">Embed Code</CardTitle>
                            <Button variant="outline" size="sm" onClick={copyEmbedCode}>
                                {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                                {copied ? "Copied!" : "Copy"}
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="bg-muted rounded-lg p-4 overflow-x-auto">
                                <pre className="text-sm font-mono whitespace-pre-wrap">
                                    <code>{generateEmbedCode()}</code>
                                </pre>
                            </div>
                            <p className="text-sm text-muted-foreground mt-3">
                                Paste before the closing <code className="bg-muted px-1 rounded">&lt;/body&gt;</code> tag.
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Right: Live Preview */}
                <div className="lg:col-span-2 lg:sticky lg:top-4 lg:self-start">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Preview</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div
                                className="relative rounded-lg overflow-hidden border h-[300px]"
                                style={{ backgroundColor: theme === "dark" ? "#1a1a1a" : "#f5f5f5" }}
                            >
                                {/* Mock website content */}
                                <div className="p-4">
                                    <div
                                        className="h-4 w-32 rounded mb-3"
                                        style={{ backgroundColor: theme === "dark" ? "#333" : "#ddd" }}
                                    />
                                    <div
                                        className="h-3 w-48 rounded mb-2"
                                        style={{ backgroundColor: theme === "dark" ? "#333" : "#ddd" }}
                                    />
                                    <div
                                        className="h-3 w-40 rounded"
                                        style={{ backgroundColor: theme === "dark" ? "#333" : "#ddd" }}
                                    />
                                </div>

                                {/* Widget Button */}
                                <div
                                    className="absolute bottom-4 w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-white"
                                    style={{
                                        backgroundColor: primaryColor,
                                        [position === "bottom-right" ? "right" : "left"]: "16px"
                                    }}
                                >
                                    <MessageSquare className="h-6 w-6" />
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground mt-3">
                                Shows widget button placement and color.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
