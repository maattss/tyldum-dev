import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  // Disabled for build stability across restricted CI/build environments.
  reactCompiler: false,
  // No reason to advertise the framework and version to scanners.
  poweredByHeader: false,
  images: {
    // The only images are the profile avatar at 112px (CV) and 144/176px
    // (hero). Generate just those at 1x-3x DPI rather than the defaults, which
    // go up to 3840px and bloat every srcset and preload tag. The source is
    // 384px, so nothing larger is ever useful.
    deviceSizes: [384],
    imageSizes: [112, 144, 176, 224, 288, 336, 352],
    formats: ["image/avif", "image/webp"],
  },
  // Compression and caching headers
  async headers() {
    return [
      {
        source: "/:all*(svg|jpg|jpeg|png|webp|avif|ico|woff|woff2)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/:path*",
        headers: [
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
