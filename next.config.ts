import { type NextConfig } from 'next'
import path from 'path'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname),
      '@data': path.resolve(__dirname, '../data')
    }
    return config
  },
  typescript: {
    ignoreBuildErrors: true
  },
  eslint: {
    ignoreDuringBuilds: true
  },
  // Updated from experimental.serverComponentsExternalPackages to serverExternalPackages
  serverExternalPackages: ['path']
}

export default nextConfig
