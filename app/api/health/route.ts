import { NextResponse } from "next/server";
import { checkServices, validateEnv } from "@/lib/config-check";

export async function GET() {
    try {
        const env = validateEnv();
        if (!env.isValid) {
            return NextResponse.json(
                { status: "error", message: "Missing environment variables", detail: env.missingVars },
                { status: 500 }
            );
        }

        const services = await checkServices();
        const isHealthy = services.database && services.qdrant && services.schemaReady;

        return NextResponse.json(
            {
                status: isHealthy ? "healthy" : "unhealthy",
                services,
                timestamp: new Date().toISOString()
            },
            { status: isHealthy ? 200 : 503 }
        );
    } catch (error) {
        return NextResponse.json(
            { status: "error", message: error instanceof Error ? error.message : "Internal Server Error" },
            { status: 500 }
        );
    }
}
