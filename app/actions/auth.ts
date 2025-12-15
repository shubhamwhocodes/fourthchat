"use server"

import { db } from "@/lib/db"
import { users } from "@/lib/schema"
import { loginSchema, registerSchema, type LoginInput, type RegisterInput } from "@/lib/validations/auth"
import bcrypt from "bcryptjs"
import { eq } from "drizzle-orm"
import { signIn } from "@/auth"
import { AuthError } from "next-auth"

export async function registerAction(data: RegisterInput) {
    const result = registerSchema.safeParse(data)

    if (!result.success) {
        return { error: "Invalid data" }
    }

    const { email, password, name } = result.data

    try {
        const existingUsersCount = await db.query.users.findMany({
            limit: 1,
        });
        if (existingUsersCount.length > 0) {
            return { error: "Registration is disabled. Admin account already exists." }
        }

        const existingUser = await db.query.users.findFirst({
            where: eq(users.email, email),
        })

        if (existingUser) {
            return { error: "User already exists" }
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        await db.insert(users).values({
            email,
            name,
            password: hashedPassword,
        })

        await signIn("credentials", {
            email,
            password,
            redirectTo: "/dashboard",
        })

        return { success: "User created successfully" }

    } catch (error) {
        if (error instanceof AuthError) {
            return { error: "Something went wrong during auto-login" }
        }
        if ((error as { digest?: string }).digest?.startsWith("NEXT_REDIRECT")) {
            throw error;
        }
        console.error("Registration error:", error)
        return { error: "Something went wrong" }
    }
}

export async function loginAction(data: LoginInput) {
    const result = loginSchema.safeParse(data)

    if (!result.success) {
        return { error: "Invalid fields" }
    }

    const { email, password } = result.data

    try {
        await signIn("credentials", {
            email,
            password,
            redirectTo: "/dashboard",
        })
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case "CredentialsSignin":
                    return { error: "Invalid credentials" }
                default:
                    return { error: "Something went wrong" }
            }
        }
        if ((error as { digest?: string }).digest?.startsWith("NEXT_REDIRECT")) {
            throw error;
        }
        console.error("Login error:", error)
        return { error: "Connection error. Please try again later." }
    }
}
