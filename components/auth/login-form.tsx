"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { loginSchema, type LoginInput } from "@/lib/validations/auth"
import { loginAction } from "@/app/actions/auth"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useTransition } from "react"
import Link from "next/link"
import { AuthCard } from "./auth-card"

export function LoginForm() {
    const [isPending, startTransition] = useTransition()
    const [error, setError] = React.useState<string | undefined>("")

    const form = useForm<LoginInput>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    })

    function onSubmit(values: LoginInput) {
        setError("")
        startTransition(async () => {
            const result = await loginAction(values)
            if (result && result.error) {
                setError(result.error)
            }
        })
    }

    return (
        <AuthCard
            title="Login"
            description="Enter your email below to login to your account"
            footerContent={
                <p className="text-sm text-muted-foreground w-full text-center">
                    Don&apos;t have an account?{" "}
                    <Link href="/register" className="underline underline-offset-4 hover:text-primary">
                        Sign up
                    </Link>
                </p>
            }
        >
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" method="post">
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input placeholder="user@example.com" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <div className="flex items-center justify-between">
                                    <FormLabel>Password</FormLabel>
                                    <Link
                                        href="/forgot-password"
                                        className="text-sm text-muted-foreground underline-offset-4 hover:underline"
                                    >
                                        Forgot password?
                                    </Link>
                                </div>
                                <FormControl>
                                    <Input type="password" placeholder="******" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    {error && (
                        <div className="bg-destructive/15 p-3 rounded-md flex items-center gap-x-2 text-sm text-destructive">
                            <p>{error}</p>
                        </div>
                    )}
                    <Button type="submit" className="w-full" disabled={isPending}>
                        {isPending ? "Logging in..." : "Login"}
                    </Button>
                </form>
            </Form>
        </AuthCard>
    )
}
