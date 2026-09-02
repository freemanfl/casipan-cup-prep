import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [{ source: "/", destination: "/caspian", permanent: false }];
  },
};

export default nextConfig;
