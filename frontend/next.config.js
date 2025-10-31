/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizeCss: false, // Fix for lightningcss issues
  },
};

module.exports = nextConfig;
