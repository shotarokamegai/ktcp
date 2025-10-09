/** @type {import('next').NextConfig} */
const nextConfig = {
images: {
  remotePatterns: [{ protocol: "https", hostname: "xs849487.xsrv.jp" }],
},

  experimental: {
    turbo: { rules: {} },
  },
};

export default nextConfig;
