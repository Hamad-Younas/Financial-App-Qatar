const nextConfig = {
  basePath: '',
  assetPrefix: '/',
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        electron: false,
        fs: false,
        path: false,
        os: false,
      };
    }
    return config;
  },
  output: "standalone",
  reactStrictMode: true
};

export default nextConfig;
