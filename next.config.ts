import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Cross-Origin-Embedder-Policy",
            value: "require-corp",
          },
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
          {
            key: "Content-Security-Policy",
            value: "worker-src 'self' blob:",
          },
        ],
      },
      {
        source: "/stockfish/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=2592000",
          },
        ],
      },
      {
        source: "/sounds/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=2592000",
          },
        ],
      },
      {
        source: "/moveTypes/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=2592000",
          },
        ],
      },
      {
        source: "/gameStats/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=2592000",
          },
        ],
      },
      {
        source: "/chessPieces/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=2592000",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
