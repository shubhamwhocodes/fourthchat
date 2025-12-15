import { RegisterForm } from "@/components/auth/register-form"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"

// Force dynamic rendering - this page checks DB at runtime
export const dynamic = 'force-dynamic'

export default async function RegisterPage() {
    const existingUsers = await db.query.users.findMany({
        limit: 1,
    });
    if (existingUsers.length > 0) {
        redirect("/login");
    }
    return (
        <div className="flex h-screen w-full items-center justify-center">
            <RegisterForm />
        </div>
    )
}

