/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    domains: ['via.placeholder.com', 'images.unsplash.com'],
    unoptimized: true, // For S3/CloudFront deployment
  },
  reactStrictMode: true,
}

export default nextConfig
