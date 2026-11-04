import type { NextConfig } from "next";
import path from "path";

const apiUrl = process.env.API_URL || (process.env.NODE_ENV === "development" ? "http://localhost:3001" : "");
if (!apiUrl) {
  throw new Error("Set the server-side API_URL environment variable to the Express API URL.");
}

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${apiUrl.replace(/\/$/, "")}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
