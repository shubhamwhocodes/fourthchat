
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Bot, Zap, Clock } from "lucide-react";

const features = [
    {
        title: "Automated Support",
        description: "Handle common customer queries instantly without human intervention.",
        icon: Bot,
    },
    {
        title: "Lead Qualification",
        description: "Intelligent filtering to identify and prioritize your hottest leads.",
        icon: Zap,
    },
    {
        title: "24/7 Availability",
        description: "Your AI agent never sleeps, ensuring you never miss a customer.",
        icon: Clock,
    },
];

export function Features() {
    return (
        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-slate-50 dark:bg-transparent">
            <div className="container mx-auto px-4 md:px-6">
                <div className="flex flex-col items-center justify-center space-y-4 text-center">
                    <div className="space-y-2">
                        <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">
                            Key Features
                        </div>
                        <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                            Everything you need to scale
                        </h2>
                        <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                            Powerful tools designed to automate your customer interactions and drive growth.
                        </p>
                    </div>
                </div>
                <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
                    {features.map((feature, index) => (
                        <Card key={index} className="flex flex-col items-center text-center h-full border-none shadow-md">
                            <CardHeader className="flex flex-col items-center">
                                <div className="p-2 bg-primary/10 rounded-full mb-2">
                                    <feature.icon className="h-6 w-6 text-primary" />
                                </div>
                                <CardTitle className="text-xl">{feature.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <CardDescription className="text-base">{feature.description}</CardDescription>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}
