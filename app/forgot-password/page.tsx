import { AuthCard } from "@/components/auth/auth-card"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function ForgotPasswordPage() {
    return (
        <div className="flex h-screen w-full items-center justify-center">
            <AuthCard
                title="Reset Password"
                description="Admin Password Reset"
                footerContent={
                    <p className="text-sm text-muted-foreground w-full text-center">
                        Remembered your password?{" "}
                        <Link href="/login" className="underline underline-offset-4 hover:text-primary">
                            Login
                        </Link>
                    </p>
                }
            >
                <div className="space-y-4">
                    <div className="bg-muted/50 p-4 rounded-md text-sm text-muted-foreground">
                        <p>
                            Since this is a self-hosted single-admin instance, automatic password reset via email is disabled.
                        </p>
                        <p className="mt-2 text-sm">
                            Use the following command to generate a new random password:
                        </p>
                        <p className="mt-2 font-mono bg-black/5 p-2 rounded border border-border/50">
                            npm run reset-password
                        </p>
                    </div>
                    <Button asChild className="w-full">
                        <Link href="/login">Back to Login</Link>
                    </Button>
                </div>
            </AuthCard>
        </div>
    )
}
