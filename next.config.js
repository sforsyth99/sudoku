/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['swagger-ui-react'],
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: true
  }
}

module.exports = nextConfig