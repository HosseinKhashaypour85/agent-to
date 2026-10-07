import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    cpus: 2,
  },

  env: {
    NEXT_PUBLIC_API_URL: "https://agent-to.darkube.ir/api/v1",
  },
};

export default nextConfig;