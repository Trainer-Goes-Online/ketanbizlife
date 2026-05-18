import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  experimental: {
    optimizePackageImports: ["motion"],
  },
  // Skip Next's own TS validator during dev/build. Use `npm run typecheck`
  // separately when you want a full check. Keeps dev compilation fast.
  typescript: {
    ignoreBuildErrors: true,
  },
  // Same for ESLint — not blocking dev/build.
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
