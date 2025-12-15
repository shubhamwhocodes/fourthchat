import { cn } from "@/lib/utils"

interface FourthChatLogoProps {
    className?: string
    size?: number
}

export function FourthChatLogo({ className, size = 24 }: FourthChatLogoProps) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            width={size}
            height={size}
            className={cn("", className)}
        >
            {/* Antenna stem */}
            <line x1="12" y1="2" x2="12" y2="6" />
            {/* Antenna circle */}
            <circle cx="12" cy="2" r="1.5" fill="currentColor" stroke="none" />
            {/* Main head - rounded rectangle */}
            <rect x="4" y="8" width="16" height="12" rx="5" ry="5" />
            {/* Left ear */}
            <circle cx="3" cy="14" r="1.5" fill="currentColor" />
            {/* Right ear */}
            <circle cx="21" cy="14" r="1.5" fill="currentColor" />
            {/* Left eye */}
            <circle cx="9" cy="14" r="2" fill="currentColor" stroke="none" />
            {/* Right eye */}
            <circle cx="15" cy="14" r="2" fill="currentColor" stroke="none" />
        </svg>
    )
}
