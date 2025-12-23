import type { NextAuthConfig } from "next-auth"

export const authConfig = {
    pages: {
        signIn: '/login',
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user
            const isOnDashboard = nextUrl.pathname.startsWith('/dashboard')

            if (isOnDashboard) {
                if (isLoggedIn) return true
                const callbackUrl = nextUrl.pathname + nextUrl.search;
                const loginUrl = new URL('/login', nextUrl.origin);
                loginUrl.searchParams.set('callbackUrl', callbackUrl);
                return Response.redirect(new URL(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`, nextUrl.origin));
            } else if (isLoggedIn && (nextUrl.pathname === '/login' || nextUrl.pathname === '/register')) {
                return Response.redirect(new URL('/dashboard', nextUrl))
            }
            return true
        },
        async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
            if (url.startsWith("/")) return `${baseUrl}${url}`
            else if (new URL(url).origin === baseUrl) return url
            return baseUrl
        }
    },
    providers: [],
} satisfies NextAuthConfig
