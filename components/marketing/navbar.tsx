
import { Button } from "@/components/ui/button";
import { signOut } from "@/auth";
import Link from "next/link";
import { type Session } from "next-auth";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";

interface NavbarProps {
    session: Session | null;
}

export function Navbar({ session }: NavbarProps) {
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto flex h-14 items-center justify-between px-4 md:px-6">
                <Link className="flex items-center space-x-2 font-bold" href="/">
                    <span className="text-xl">Chatbot AI</span>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-4">
                    {session ? (
                        <div className="flex items-center gap-4">
                            <ModeToggle />
                            <span className="text-sm font-medium">
                                {session.user?.name || session.user?.email}
                            </span>
                            <Link href="/dashboard">
                                <Button size="sm">Dashboard</Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <ModeToggle />
                            <Link href="/login">
                                <Button variant="ghost" size="sm">
                                    Login
                                </Button>
                            </Link>
                            <Link href="/register">
                                <Button size="sm">Get Started</Button>
                            </Link>
                        </div>
                    )}
                </nav>

                {/* Mobile Navigation */}
                <div className="md:hidden">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="md:hidden">
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">Toggle menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-full sm:w-full border-l-0 px-6 py-12">
                            <SheetHeader>
                                <SheetTitle className="text-left text-2xl font-bold">Menu</SheetTitle>
                            </SheetHeader>
                            <div className="flex flex-col gap-6 mt-8">
                                {session ? (
                                    <>
                                        <span className="text-sm font-medium">
                                            {session.user?.name || session.user?.email}
                                        </span>
                                        <Link href="/dashboard">
                                            <Button className="w-full">Dashboard</Button>
                                        </Link>
                                        <form
                                            action={async () => {
                                                "use server";
                                                await signOut();
                                            }}
                                            className="w-full"
                                        >
                                            <Button variant="outline" className="w-full">
                                                Sign Out
                                            </Button>
                                        </form>
                                    </>
                                ) : (
                                    <>
                                        <Link href="/login">
                                            <Button variant="ghost" className="w-full justify-start">
                                                Login
                                            </Button>
                                        </Link>
                                        <Link href="/register">
                                            <Button className="w-full">Get Started</Button>
                                        </Link>
                                    </>
                                )}
                                <div className="flex justify-center mt-4">
                                    <ModeToggle />
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header >
    );
}
