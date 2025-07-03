import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',

  // typescript: {
  //   ignoreBuildErrors: true, // Ignores TypeScript errors during build
  // },
  // eslint: {
  //   ignoreDuringBuilds: true, // Ignores ESLint errors during build
  // },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "tdrlshwtrcqxqzzqehxu.supabase.co",
        pathname: "/storage/v1/object/public/frames/**", // Specific to "frames" bucket
      },

    ],
  },
  /* config options here */
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },
};

export default nextConfig;
