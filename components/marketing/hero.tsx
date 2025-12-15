
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function Hero() {
    return (
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 border-b">
            <div className="container mx-auto px-4 md:px-6">
                <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
                    <div className="flex flex-col justify-center space-y-4 items-center lg:items-start text-center lg:text-left">
                        <div className="space-y-2">
                            <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                                Your Business, on Autopilot.
                            </h1>
                            <p className="max-w-[600px] text-muted-foreground md:text-xl">
                                Deploy an intelligent AI agent that handles customers, qualifies leads, and automates support 24/7.
                            </p>
                        </div>
                        <div className="flex flex-col gap-2 min-[400px]:flex-row">
                            <Link href="/register">
                                <Button size="lg" className="px-8">
                                    Get Your Agent
                                </Button>
                            </Link>
                            <Link href="#features">
                                <Button variant="outline" size="lg" className="px-8">
                                    Learn More
                                </Button>
                            </Link>
                        </div>
                    </div>
                    <div className="mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full lg:order-last">
                        {/* Placeholder for a hero image or animation */}
                        <div className="w-full h-full bg-muted/50 flex items-center justify-center border rounded-xl">
                            <p className="text-muted-foreground">AI Simulation UI</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
