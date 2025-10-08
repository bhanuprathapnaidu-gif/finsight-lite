/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    // Ignore pdfjs-dist worker files
    config.resolve.alias.canvas = false
    config.resolve.alias.encoding = false
    return config
  },
}

module.exports = nextConfig
