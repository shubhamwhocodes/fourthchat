"use client"

import NextImage from "next/image"

import { useState, useEffect, useCallback } from "react"
import QRCode from "qrcode"
import { Button } from "@/components/ui/button"
import { AlertCircle, CheckCircle2, Loader2, RefreshCw } from "lucide-react"

interface WhatsAppConnectorProps {
    connectionId: string
}

export function WhatsAppConnector({ connectionId }: WhatsAppConnectorProps) {
    const [status, setStatus] = useState<string>("disconnected")
    const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchStatus = useCallback(async () => {
        try {
            const res = await fetch(`/api/whatsapp/session?connectionId=${connectionId}`)
            if (res.ok) {
                const data = await res.json()
                setStatus(data.status)

                if (data.lastError) {
                    setError(data.lastError)
                } else if (data.status === 'connected') {
                    setError(null)
                }

                if (data.qrCode) {
                    const url = await QRCode.toDataURL(data.qrCode)
                    setQrCodeUrl(url)
                } else {
                    setQrCodeUrl(null)
                }
            }
        } catch (err) {
            console.error("Failed to fetch WhatsApp status", err)
        }
    }, [connectionId])

    const handleConnect = useCallback(async () => {
        setIsLoading(true)
        setError(null)
        try {
            const res = await fetch("/api/whatsapp/session", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ connectionId })
            })

            if (!res.ok) {
                throw new Error("Failed to start connection")
            }

            fetchStatus()
        } catch (err) {
            setError(err instanceof Error ? err.message : "Connection failed")
        } finally {
            setIsLoading(false)
        }
    }, [connectionId, fetchStatus])

    const handleLogout = async () => {
        setIsLoading(true)
        try {
            await fetch(`/api/whatsapp/session?connectionId=${connectionId}`, { method: "DELETE" })
            setStatus("disconnected")
            setQrCodeUrl(null)
        } catch (err) {
            console.error(err)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (status === 'disconnected' && !error) {
            handleConnect()
        }
    }, [status, error, handleConnect])

    useEffect(() => {
        fetchStatus()
        const interval = setInterval(fetchStatus, 3000)
        return () => clearInterval(interval)
    }, [fetchStatus])

    return (
        <div className="flex flex-col md:flex-row items-start justify-between gap-6 px-4 py-2">

            <div className="flex-1 space-y-4">
                <div className="flex items-start gap-4">
                    <div className={`flex items-center justify-center shrink-0 ${status === "connected" ? "text-green-500" :
                        status === "connecting" || status === "qr_ready" ? "text-yellow-500" :
                            "text-muted-foreground"
                        }`}>
                        {status === "connected" ? <CheckCircle2 className="h-6 w-6" /> :
                            status === "connecting" || status === "qr_ready" ? <Loader2 className="h-6 w-6 animate-spin" /> :
                                <AlertCircle className="h-6 w-6" />}
                    </div>
                    <div>
                        <h3 className="font-medium">
                            {status === "connected" ? "Connected" :
                                status === "connecting" ? "Connecting..." :
                                    status === "qr_ready" ? "Scan QR Code" :
                                        "Disconnected"}
                        </h3>

                        {status === "qr_ready" ? (
                            <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                                <p className="font-medium text-foreground">Steps to log in:</p>
                                <ol className="space-y-2 list-decimal list-inside">
                                    <li>Open WhatsApp on your phone</li>
                                    <li>
                                        Tap <strong>Menu</strong> <span className="inline-flex items-center justify-center w-5 h-5 bg-muted rounded text-xs select-none">⋮</span> on Android, or <strong>Settings</strong> <span className="inline-flex items-center justify-center w-5 h-5 bg-muted rounded text-xs select-none">⚙️</span> on iPhone
                                    </li>
                                    <li>Tap <strong>Linked devices</strong>, then <strong>Link a device</strong></li>
                                    <li>Scan the QR code to confirm</li>
                                </ol>
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground mt-1">
                                {status === "connected" ? "Your WhatsApp is active and ready." :
                                    status === "connecting" ? "Initializing connection..." :
                                        "Connect your WhatsApp account to start."}
                            </p>
                        )}
                    </div>
                </div>

                {error && (
                    <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                        {error}
                        <Button variant="link" onClick={handleConnect} className="pl-2 h-auto p-0 text-destructive underline">Retry</Button>
                    </div>
                )}

                <div className="flex items-center gap-2">
                    {status === "connected" && (
                        <Button variant="outline" size="sm" onClick={handleLogout} disabled={isLoading}>
                            Disconnect
                        </Button>
                    )}
                    {status === "disconnected" && (
                        <Button size="sm" onClick={handleConnect} disabled={isLoading}>
                            {error ? "Retry Connection" : "Start Connection"}
                        </Button>
                    )}
                </div>
            </div>

            <div className="shrink-0">
                {status === "qr_ready" && qrCodeUrl ? (
                    <div className="flex flex-col items-center justify-center p-4 bg-white rounded-lg border w-[200px] h-[200px]">
                        <NextImage src={qrCodeUrl} alt="WhatsApp QR Code" width={180} height={180} className="w-full h-full" unoptimized />
                    </div>
                ) : status === "connecting" ? (
                    <div className="flex items-center justify-center w-[200px] h-[200px] rounded-lg border border-dashed bg-muted/20">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : null}
                {status === "qr_ready" && (
                    <div className="mt-2 text-center">
                        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                            <RefreshCw className="h-3 w-3 animate-spin" />
                            <span>Refreshes automatically</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
