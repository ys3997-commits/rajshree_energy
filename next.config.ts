import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "15mb",
    },
  },
  turbopack: {
    root: path.join(__dirname),
  },
  // Keep serverless bundles small so Next can pack routes into ≤12 Hobby functions.
  // Prisma engines + CLI must not be traced into every lambda.
  outputFileTracingExcludes: {
    "*": [
      "src/generated/prisma/query_engine-windows.dll.node",
      "src/generated/prisma/libquery_engine-darwin*",
      "src/generated/prisma/*.tmp*",
      "node_modules/@prisma/engines/**",
      "node_modules/prisma/libquery_engine-*",
      "node_modules/prisma/query_engine-*",
      "node_modules/prisma/schema-engine-*",
      "node_modules/@prisma/client/runtime/query_engine_bg.mysql*",
      "node_modules/@prisma/client/runtime/query_engine_bg.sqlite*",
      // Keep lambdas lean — not needed at runtime
      "prisma/seed.ts",
      "prisma/backfill-*.ts",
      "**/*.test.ts",
      "README.md",
      "AGENTS.md",
      "CLAUDE.md",
      "build-out.txt",
    ],
  },
  outputFileTracingIncludes: {
    "/**": [
      "./src/generated/prisma/libquery_engine-rhel-openssl-3.0.x.so.node",
      "./src/generated/prisma/schema.prisma",
    ],
  },
  async redirects() {
    return [
      { source: "/orders/new", destination: "/orders", permanent: false },
      {
        source: "/reports/profit-analysis/monthly-wise",
        destination: "/reports/profit-analysis/month-wise",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
