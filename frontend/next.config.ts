import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.AWS_BACKEND_URL || "http://localhost:8000"}/api/:path*/`,
      },
      {
        source: "/media/:path*",
        destination: `${process.env.AWS_BACKEND_URL || "http://localhost:8000"}/media/:path*/`,
      },
    ];
  },
};

export default nextConfig;
