"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { type DashboardMetrics } from "@/app/actions/analytics"
import { Activity, MessageSquare, Database, Zap, TrendingUp, TrendingDown, Minus } from "lucide-react"

interface AnalyticsCardsProps {
    metrics: DashboardMetrics
}

export function AnalyticsCards({ metrics }: AnalyticsCardsProps) {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Total Messages
                    </CardTitle>
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{metrics.totalMessages}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                        {metrics.messageTrend === null ? (
                            "No historical data"
                        ) : metrics.messageTrend > 0 ? (
                            <span className="text-green-500 flex items-center">
                                <TrendingUp className="h-3 w-3 mr-1" /> +{metrics.messageTrend}% from last month
                            </span>
                        ) : metrics.messageTrend < 0 ? (
                            <span className="text-red-500 flex items-center">
                                <TrendingDown className="h-3 w-3 mr-1" /> {metrics.messageTrend}% from last month
                            </span>
                        ) : (
                            <span className="flex items-center">
                                <Minus className="h-3 w-3 mr-1" /> No change
                            </span>
                        )}
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Avg. Response Time
                    </CardTitle>
                    <Zap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{metrics.avgResponseTime}ms</div>
                    <p className="text-xs text-muted-foreground mt-1">
                        {metrics.responseTimeTrend === null ? (
                            "No historical data"
                        ) : (
                            <span>Latency metrics</span>
                        )}
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Active Chatbots
                    </CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{metrics.activeChatbots}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                        Deployed assistants
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Knowledge Sources
                    </CardTitle>
                    <Database className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{metrics.totalKnowledgeSources}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                        {metrics.sourceTrend > 0 ? (
                            <span className="text-green-500">+{metrics.sourceTrend} added this month</span>
                        ) : (
                            "No new sources this month"
                        )}
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
