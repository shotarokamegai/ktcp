/** @type {import('next').NextConfig} */
const nextConfig = {
images: {
    remotePatterns: [
      { protocol: "https", hostname: "xs849487.xsrv.jp" },
      { protocol: "https", hostname: "**" }, // ACFのCDNなどを使う可能性があるなら
    ],
  },

  experimental: {
    turbo: { rules: {} },
  },
};

export default nextConfig;
