import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  // Cache Components: caching is explicit ('use cache') and every page is
  // prerendered unless it opts out. The default from Next.js 17.
  cacheComponents: true,
  partialPrefetching: true,
  // Disabled for build stability across restricted CI/build environments.
  reactCompiler: false,
  // No reason to advertise the framework and version to scanners.
  poweredByHeader: false,
  images: {
    // The only image is the 88px profile avatar (home and CV). Generate it at
    // 1x-3x DPI rather than the defaults, which go up to 3840px and bloat
    // every srcset and preload tag. The source is 384px.
    deviceSizes: [384],
    imageSizes: [88, 176, 264],
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    // Files in /public keep their names when they change, so they must not be
    // cached as immutable (a new favicon or photo would be stuck for a year).
    // A day plus a week of stale-while-revalidate keeps repeat visits instant.
    // Hashed build output under /_next/static is already immutable via Next.
    const publicAssetCaching = [
      {
        key: "Cache-Control",
        value: "public, max-age=86400, stale-while-revalidate=604800",
      },
    ];

    return [
      { source: "/images/:path*", headers: publicAssetCaching },
      {
        source:
          "/:file(favicon\\.ico|favicon\\.svg|favicon-16x16\\.png|favicon-32x32\\.png|apple-touch-icon\\.png|android-chrome-192x192\\.png|android-chrome-512x512\\.png|site\\.webmanifest)",
        headers: publicAssetCaching,
      },
      {
        source: "/:path*",
        headers: [
          {
            // A baseline CSP without script-src: a strict script policy needs a
            // per-request nonce, which would make every page dynamic and break
            // ensureStatic. These directives still shut off common injection
            // and framing vectors at no cost. (No upgrade-insecure-requests: HSTS
            // already covers production, and it would break http://localhost.)
            key: "Content-Security-Policy",
            value:
              "base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self'",
          },
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            // The site needs none of these; deny them explicitly.
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=()",
          },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
