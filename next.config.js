/** @type {import('next').NextConfig} */
const webpack = require('webpack');

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      }
    ],
    unoptimized: false,
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },
  env: {
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  },
  optimizeFonts: true,
  experimental: {
    optimizeCss: false,
    scrollRestoration: true,
    serverComponentsExternalPackages: ['@prisma/client']
  },
  webpack: (config, { isServer }) => {
    // Define global polyfills
    config.plugins.push(
      new webpack.DefinePlugin({
        'global': 'globalThis'
      })
    )

    // Browser polyfills configuration
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        // Disable Node.js core modules
        fs: false,
        net: false,
        tls: false,
        http: false,
        https: false,
        crypto: false,
        stream: false,
        vm: false,
        zlib: false,
        path: false,
        url: false,
        // Add querystring polyfill
        querystring: require.resolve('querystring-es3')
      }
    }

    return config
  },
  staticPageGenerationTimeout: 120,
  typescript: {
    ignoreBuildErrors: false,
  },
  // Add service worker configuration
  async headers() {
    return [
      {
        source: '/service-worker.js',
        headers: [
          {
            key: 'Service-Worker-Allowed',
            value: '/'
          }
        ]
      }
    ]
  },
  // Register service worker
  async rewrites() {
    return [
      {
        source: '/service-worker.js',
        destination: '/_next/static/service-worker.js'
      }
    ]
  }
}

module.exports = nextConfig 