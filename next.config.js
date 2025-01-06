/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['swagger-ui-react'],
  typescript: {
    ignoreBuildErrors: true
  },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false
    };
    return config;
  }
}

module.exports = nextConfig