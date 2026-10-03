import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      // legacy case-study URLs — the site is single-page now; ?project=
      // auto-opens the matching case study panel
      {
        source: "/work/:slug",
        destination: "/?project=:slug",
        permanent: true,
      },
      { source: "/work", destination: "/#work", permanent: true },
    ];
  },
};

export default nextConfig;
