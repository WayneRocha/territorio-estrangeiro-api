/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  resolve: {
    mainFields: ["browser", "main"]
  },
}

module.exports = nextConfig
