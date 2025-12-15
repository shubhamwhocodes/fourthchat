import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

if (!process.env.POSTGRES_URL) {
    dotenv.config({
        path: ".env.local",
    });
}

export default defineConfig({
    schema: "./lib/schema.ts",
    out: "./drizzle",
    dialect: "postgresql",
    dbCredentials: {
        url: process.env.POSTGRES_URL!,
    },
});

