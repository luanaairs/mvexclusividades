import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  api: {
    bodyParser: {
        sizeLimit: '260mb',
    },
  },
  serverActions: {
    bodySizeLimit: '260mb',
  },
};

export default nextConfig;
