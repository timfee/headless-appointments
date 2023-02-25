/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  transpilePackages: ["appoint"],
  experimental: {
    appDir: true,
  },
}
