import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["x402-next", "@coinbase/cdp-sdk"],
  turbopack: {
    root: "/Users/nihalsoncul/Desktop/base-daily-brief",
  },
};

export default nextConfig;
