import type { NextConfig } from "next";

const API_DESTINATION = process.env.NODE_ENV === 'production'
  ? "https://node-js-web-app.onrender.com/api/v1/:path*"
  : "http://localhost:3000/api/v1/:path*";

const nextConfig: NextConfig = {
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: API_DESTINATION,
      },
    ];
  },
};

export default nextConfig;
