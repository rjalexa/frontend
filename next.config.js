// next.config.ts
// next.config.js
const path = require('path')

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname),
      '@data': path.resolve(__dirname, '../data')
    }
    return config
  }
}

module.exports = nextConfig
