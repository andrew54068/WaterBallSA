/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
  // Rewrites removed - browser will call backend directly via NEXT_PUBLIC_API_URL
  // This prevents 508 loop on Vercel when calling external backend (ngrok/deployed)
}

module.exports = nextConfig
