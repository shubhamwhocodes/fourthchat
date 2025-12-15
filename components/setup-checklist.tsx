"use client";

import { Copy, RefreshCw, Check, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { AuthCard } from "@/components/auth/auth-card";
import { useRouter } from "next/navigation";

interface SetupChecklistProps {
    missingVars: string[];
    serviceStatus: {
        database: boolean;
        qdrant: boolean;
        schemaReady: boolean;
    } | null;
}

const onCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Command copied to clipboard");
};

const StatusItem = ({
    label,
    status,
    errorContent
}: {
    label: string;
    status: "success" | "error" | "pending";
    errorContent?: React.ReactNode;
}) => (
    <div className="py-3">
        <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{label}</span>
            {status === "success" && <Check className="h-4 w-4 text-green-500" />}
            {status === "error" && <X className="h-4 w-4 text-red-500" />}
            {status === "pending" && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        </div>
        {status !== "success" && errorContent && (
            <div className="mt-3 text-sm">
                {errorContent}
            </div>
        )}
    </div>
);

const CodeBlock = ({ command }: { command: string }) => (
    <div className="flex items-center justify-between rounded-md bg-muted px-3 py-2 font-mono text-xs">
        <span>{command}</span>
        <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 hover:bg-background"
            onClick={() => onCopy(command)}
        >
            <Copy className="h-3 w-3" />
        </Button>
    </div>
);

export default function SetupChecklist({ missingVars, serviceStatus }: SetupChecklistProps) {
    const router = useRouter();

    return (
        <div className="flex min-h-screen w-full items-center justify-center p-4 bg-background">
            <AuthCard
                title="System Check"
                description="Verifying system requirements."
                className="w-full max-w-sm border-border shadow-none"
            >
                <div className="divide-y divide-border">
                    {/* Environment Variables */}
                    <StatusItem
                        label="Environment Variables"
                        status={missingVars.length === 0 ? "success" : "error"}
                        errorContent={
                            <div className="space-y-3">
                                <p className="text-muted-foreground">Missing: <span className="text-red-500 font-mono">{missingVars.join(", ")}</span></p>
                                <CodeBlock command="cp .env.example .env.local" />
                            </div>
                        }
                    />

                    {/* PostgreSQL */}
                    {serviceStatus && (
                        <StatusItem
                            label="PostgreSQL Database"
                            status={serviceStatus.database ? "success" : "error"}
                            errorContent={
                                <p className="text-muted-foreground">
                                    Unable to connect to database. Check your <code className="bg-muted px-1 rounded">POSTGRES_URL</code>.
                                </p>
                            }
                        />
                    )}

                    {/* Database Schema */}
                    {serviceStatus?.database && (
                        <StatusItem
                            label="Database Schema"
                            status={serviceStatus.schemaReady ? "success" : "error"}
                            errorContent={
                                <div className="space-y-2">
                                    <p className="text-muted-foreground">Tables missing.</p>
                                    <CodeBlock command="npm run db:push" />
                                </div>
                            }
                        />
                    )}

                    {/* Qdrant */}
                    {serviceStatus && (
                        <StatusItem
                            label="Qdrant Vector DB"
                            status={serviceStatus.qdrant ? "success" : "error"}
                            errorContent={
                                <p className="text-muted-foreground">
                                    Connection refused at <code className="bg-muted px-1 rounded">localhost:6333</code>.
                                </p>
                            }
                        />
                    )}

                    <div className="pt-6">
                        <Button
                            className="w-full"
                            onClick={() => router.refresh()}
                        >
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Run Checks
                        </Button>
                    </div>
                </div>
            </AuthCard>
        </div>
    );
}