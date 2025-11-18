import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
   experimental: {
    serverComponentsExternalPackages: ['sqlite3', 'fs-extra'],
    staleTimes: {
      dynamic: 0, // No stale time for dynamic pages - shows loader immediately
      static: 60, // 1 minute for static pages
    },
  },
  eslint: {
    ignoreDuringBuilds: true, // ignore ESLint errors during production build
  },
  images: {
    domains: ['res.cloudinary.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
};

export default nextConfig;
