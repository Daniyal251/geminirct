/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@rct/ui', '@rct/lib', '@rct/db', '@rct/ai'],
}

module.exports = nextConfig
