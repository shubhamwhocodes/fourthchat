import { auth } from "@/auth"
import { Header } from "@/components/dashboard/header"
import { SessionProvider } from "next-auth/react"

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await auth()

    return (
        <SessionProvider session={session}>
            <div className="min-h-screen flex flex-col">
                <Header user={session?.user} />
                <main className="flex-1 bg-muted/5">
                    <div className="container mx-auto py-6 max-md:px-4">
                        {children}
                    </div>
                </main>
            </div>
        </SessionProvider>
    )
}
