/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['swagger-ui-react'],
  typescript: {
    ignoreBuildErrors: true
  },
  output: 'export'
}

module.exports = nextConfig