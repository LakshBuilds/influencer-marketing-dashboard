/** @type {import('next').NextConfig} */
const nextConfig = {
  // Extend serverless function timeout to 30s so slow Supabase queries don't
  // cause empty 500s. (Vercel hobby plan max is 60s.)
  serverExternalPackages: [],
  experimental: {
    serverComponentsExternalPackages: [],
  },
}

module.exports = nextConfig
