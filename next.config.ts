import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    if (!process.env.VERCEL) return [];
    return [{ source: "/", destination: "/caspian", permanent: false }];
  },
};

export default nextConfig;
