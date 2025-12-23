import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["pdf-parse", "keyv", "@cacheable/utils", "@cacheable/memory", "cacheable", "pino", "thread-stream"],
};

export default nextConfig;
