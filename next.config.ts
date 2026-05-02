import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { withBotId } from "botid/next/config";
import withBundleAnalyzer from "@next/bundle-analyzer";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ["lucide-react", "date-fns", "lodash", "@radix-ui/react-icons", "recharts", "lightweight-charts", "next-intl/server"],
  },

  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },

  async headers() {
    return [
      {
        source: "/(.*\\.(?:png|jpg|jpeg|webp|svg|ico|gif))",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, must-revalidate",
          },
        ],
      },
      {
        source: "/theme",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=3600",
          },
        ],
      },
      {
        source: "/theme/:id",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=3600",
          },
        ],
      },
      {
        source: "/report",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=3600",
          },
        ],
      },
      {
        source: "/screener",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=3600",
          },
        ],
      },
      {
        source: "/subscribe",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=3600",
          },
        ],
      },
      {
        source: "/",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=3600",
          },
        ],
      },
      {
        source: "/index",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=3600",
          },
        ],
      },
    ];
  },

  images: {
    minimumCacheTTL: 0,
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "randomuser.me" },
      { protocol: "https", hostname: "inlnpazfunssixvorztn.supabase.co" },
      { protocol: "https", hostname: "tycccztwtuaemnjxsprh.supabase.co" },
      { protocol: "https", hostname: "img.youtube.com" },
      { protocol: "https", hostname: "saras-alpha.s3.ap-northeast-1.amazonaws.com" },
      { protocol: "https", hostname: "img.logo.dev" },
      { protocol: "https", hostname: "yumisandbox-production.up.railway.app", pathname: "/api/ticket/get_attachment" },
      { protocol: "https", hostname: "yumisandboxstag-production.up.railway.app", pathname: "/api/ticket/get_attachment" },
      { protocol: "https", hostname: "yumisandboxprod-production.up.railway.app", pathname: "/api/ticket/get_attachment" },
      { protocol: "https", hostname: "orion-alpha.s3.ap-northeast-1.amazonaws.com" },
      { protocol: "https", hostname: "orion-alpha.s3.amazonaws.com" },
      { protocol: "https", hostname: "d2zcsk381dfhpi.cloudfront.net" },
      { protocol: "https", hostname: "cdn.aiwork.app", pathname: "/images/**" },
      { protocol: "https", hostname: "cdn.aiwork.app", pathname: "/ticker-logos/**" },
      { protocol: "https", hostname: "cdn.aiwork.app", pathname: "/covers/**" },
    ],
  },
};

const withNextIntl = createNextIntlPlugin();
const analyze = withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

export default analyze(withBotId(withNextIntl(nextConfig)));
