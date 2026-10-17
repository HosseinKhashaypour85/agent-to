import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    cpus: 1,
  },

  env: {
    NEXT_PUBLIC_API_URL: "https://agentto.jorluma.ir/api/v1",
    API_URL: "https://agentto.jorluma.ir/api/v1",
  },
};

export default nextConfig;
