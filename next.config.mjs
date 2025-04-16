/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.googleusercontent.com',
      }
    ],
  },
};
// https://lh3.googleusercontent.com/a/ACg8ocIlxn4mqgEje-4D9bciH-piuW_pSJQK6Q_qaR3MrkAAaQT_eyc=s96-c
export default nextConfig;
