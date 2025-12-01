/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL}/:path*`,
      },
    ];
  },
  // Skip build errors for error pages during static generation
  // This allows the build to complete despite prerender errors
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
}

module.exports = nextConfig
