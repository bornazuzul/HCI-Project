/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    // Prevent dev overlay from crashing on Node warnings
    serverComponentsExternalPackages: ["contentful"],
  },
  webpack: (config, { isServer }) => {
    // Only ignore fs module on client-side
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        os: false,
        path: false,
      };
    }
    return config;
  },
  turbopack: {},
};

export default nextConfig;
