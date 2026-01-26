import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Configuration options */
  reactStrictMode: true, // Recommended: enables extra checks and warnings
  
  // Example: Configure allowed image domains if you use next/image
  /*
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'example.com',
      },
    ],
  },
  */

  // Example: Enable logging for fetch requests in development
  /*
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  */
};

export default nextConfig;
