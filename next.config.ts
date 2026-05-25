import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000", "spendlens.ai"],
    },
  },
  images: {
    remotePatterns: [],
  },
};

export default nextConfig;
