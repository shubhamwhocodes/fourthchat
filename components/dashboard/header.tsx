"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { User } from "next-auth"
import { useTheme } from "next-themes"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Settings, Sun, Moon } from "lucide-react"
import { FourthChatLogo } from "@/components/fourthchat-logo"

interface HeaderProps {
    user: User | undefined
}

export function Header({ user }: HeaderProps) {
    const { theme, setTheme } = useTheme()
    const router = useRouter()

    const toggleTheme = () => {
        setTheme(theme === "dark" ? "light" : "dark")
    }

    const handleAvatarClick = () => {
        router.push("/dashboard/settings?tab=profile")
    }

    return (
        <header className="flex h-16 items-center justify-between border-b px-6 bg-background">
            <div className="flex items-center gap-4">
                <Link href="/dashboard" className="flex items-center gap-2 font-semibold text-lg hover:text-primary transition-colors">
                    <FourthChatLogo size={28} />
                    FourthChat
                </Link>
            </div>

            <div className="flex items-center gap-2">
                {/* Theme Toggle */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleTheme}
                    className="h-9 w-9"
                >
                    <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">Toggle theme</span>
                </Button>

                {/* Settings */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9"
                    asChild
                >
                    <Link href="/dashboard/settings">
                        <Settings className="h-4 w-4" />
                        <span className="sr-only">Settings</span>
                    </Link>
                </Button>

                {/* User Avatar */}
                <Button
                    variant="ghost"
                    className="relative h-9 w-9 rounded-full p-0"
                    onClick={handleAvatarClick}
                >
                    <Avatar className="h-9 w-9">
                        <AvatarImage src={user?.image || ""} alt={user?.name || ""} />
                        <AvatarFallback>{user?.name?.[0] || "U"}</AvatarFallback>
                    </Avatar>
                </Button>
            </div>
        </header>
    )
}
