import path from 'path'
import { fileURLToPath } from 'url'
import { PrismaPlugin } from '@prisma/nextjs-monorepo-workaround-plugin'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@ivy/ui', '@ivy/db'],
  experimental: {
    outputFileTracingRoot: path.join(__dirname, '../../'),
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.plugins = [...config.plugins, new PrismaPlugin()]
    }
    return config
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
}

export default nextConfig
