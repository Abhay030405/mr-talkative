import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required for the multi-stage Docker build (copies only the minimal output)
  output: "standalone",
};

export default nextConfig;
