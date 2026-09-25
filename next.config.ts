import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  serverExternalPackages: ["x402-next", "@coinbase/cdp-sdk"],
};

export default nextConfig;
