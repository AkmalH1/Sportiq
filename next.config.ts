import type { NextConfig } from "next";

// The Content-Security-Policy is set per request (with a script nonce) in proxy.ts.

const security = [
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
];

const nextConfig: NextConfig = {
  // Admin uploads (CSV files, banner and product images) go through server actions.
  experimental: { serverActions: { bodySizeLimit: "6mb" } },
  poweredByHeader: false,
  async headers() {
    return [
      { source: "/:path*", headers: security },
      // Order pages carry the customer's email in the URL: never send it on as a referrer, never cache it.
      // Fingerprinted build files and fonts never change: cache them for a year so repeat visits on mobile data are instant.
      { source: "/_next/static/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }] },
      { source: "/track-order/:path*", headers: [{ key: "Referrer-Policy", value: "no-referrer" }, { key: "Cache-Control", value: "no-store" }] },
      { source: "/pay/:path*", headers: [{ key: "Referrer-Policy", value: "no-referrer" }, { key: "Cache-Control", value: "no-store" }] },
    ];
  },
};

export default nextConfig;
