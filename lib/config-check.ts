import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

export interface EnvCheckResult {
    isValid: boolean;
    missingVars: string[];
}

export interface ServiceStatus {
    database: boolean;
    qdrant: boolean;
    schemaReady: boolean;
}

export function validateEnv(): EnvCheckResult {
    const requiredVars = [
        "POSTGRES_URL",
        "AUTH_SECRET",
        "QDRANT_URL",
    ];

    const missingVars = requiredVars.filter(
        (key) => !process.env[key] || process.env[key]!.trim() === ""
    );

    return {
        isValid: missingVars.length === 0,
        missingVars,
    };
}

export async function checkServices(): Promise<ServiceStatus> {
    const status = {
        database: false,
        qdrant: false,
        schemaReady: false,
    };

    try {
        if (process.env.POSTGRES_URL) {
            await db.execute(sql`SELECT 1`);
            status.database = true;

            const result = await db.execute(sql`
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_schema = 'public' 
                    AND table_name = 'user'
                );
            `);
            status.schemaReady = !!result.rows[0].exists;
        }
    } catch (error) {
        console.error("Database connection check failed:", error);
    }

    try {
        const qdrantUrl = process.env.QDRANT_URL;
        if (qdrantUrl) {
            const response = await fetch(`${qdrantUrl}/healthz`);
            status.qdrant = response.ok;
        }
    } catch (error) {
        console.error("Qdrant connection check failed:", error);
    }

    return status;
}
