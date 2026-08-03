/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  experimental: {
    optimizePackageImports: ["framer-motion", "lucide-react"],
  },

  images: {
    remotePatterns: [],
  },

  headers: async () => [
    {
      source: "/:path*",
      headers: [
        {
          key: "X-Content-Type-Options",
          value: "nosniff",
        },
        {
          key: "X-Frame-Options",
          value: "SAMEORIGIN",
        },
        {
          key: "X-XSS-Protection",
          value: "1; mode=block",
        },
      ],
    },
  ],

  typescript: {
    tsconfigPath: "./tsconfig.json",
  },

  eslint: {
    dirs: ["src"],
  },

  compress: true,
  productionBrowserSourceMaps: false,
};

module.exports = nextConfig;
