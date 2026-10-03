import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      // old shared links opened case studies in a modal via ?project=<slug>
      {
        source: "/",
        has: [{ type: "query", key: "project", value: "(?<slug>[a-z0-9-]+)" }],
        destination: "/work/:slug",
        permanent: true,
      },
      { source: "/work", destination: "/#work", permanent: true },
      // MYCES projects now live on one page
      { source: "/work/:slug(emars|agrofarm|ems)", destination: "/work/myces", permanent: true },
    ];
  },
};

export default nextConfig;
