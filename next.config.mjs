/** @type {import('next').NextConfig} */
const nextConfig = {
images: {
    remotePatterns: [
      { protocol: "https", hostname: "xs849487.xsrv.jp" },
      { protocol: "https", hostname: "**" }, // ACFのCDNなどを使う可能性があるなら
    ],
  },

  // public/pdf/ 配下のPDFはブラウザで開かずダウンロードさせる。
  // 検索エンジンにもインデックスさせない。
  async headers() {
    return [
      {
        source: "/pdf/:file*",
        headers: [
          { key: "Content-Disposition", value: "attachment" },
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
    ];
  },

  experimental: {
    turbo: { rules: {} },
  },
};

export default nextConfig;
