import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    /* config options here */
    async rewrites() {
        return [
            {
                source: "/unsplash/:path*",
                destination: "https://images.unsplash.com/:path*",
            },
            {
                source: "/mydramalist/:path*",
                destination: "https://i.mydramalist.com/:path*",
            },
        ];
    },
};

export default nextConfig;
