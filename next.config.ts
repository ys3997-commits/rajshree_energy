import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname),
  },
  async redirects() {
    return [
      { source: "/orders/new", destination: "/orders", permanent: false },
      {
        source: "/dispatches/new",
        destination: "/dispatches",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
