import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { FourthChatLogo } from "@/components/fourthchat-logo"

interface AuthCardProps extends React.HTMLAttributes<HTMLDivElement> {
    title: string
    description: string
    footerContent?: React.ReactNode
    children: React.ReactNode
}

export function AuthCard({
    title,
    description,
    footerContent,
    children,
    className,
    ...props
}: AuthCardProps) {
    return (
        <Card className={cn("w-[350px] sm:w-[400px]", className)} {...props}>
            <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                    <FourthChatLogo size={48} className="text-primary" />
                </div>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>{children}</CardContent>
            {footerContent && <CardFooter>{footerContent}</CardFooter>}
        </Card>
    )
}
