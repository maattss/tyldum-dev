import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { getTranslations } from "next-intl/server";
import { locales } from "@/i18n/config";
import { PERSON_NAME, SITE_NAME } from "@/lib/site";

// Link preview for LinkedIn, Slack, iMessage and friends: 1200x630 is the size
// every major unfurler shows uncropped. Rendered once per locale at build time.
export const alt = `${PERSON_NAME} · ${SITE_NAME}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

// Literal paths keep build tracing to exactly these files. Synchronous reads:
// with Cache Components, async I/O during render marks the route dynamic.
const readAsset = {
  // Satori reads TTF/OTF/WOFF only, so these are the static Plex files rather
  // than the variable woff2 the site itself serves.
  regular: () => readFileSync(join(process.cwd(), "node_modules/@fontsource/ibm-plex-sans/files/ibm-plex-sans-latin-400-normal.woff")),
  semibold: () => readFileSync(join(process.cwd(), "node_modules/@fontsource/ibm-plex-sans/files/ibm-plex-sans-latin-600-normal.woff")),
  photo: () => readFileSync(join(process.cwd(), "public/images/profile.jpg")),
  mark: () => readFileSync(join(process.cwd(), "public/favicon.svg")),
  mono: () => readFileSync(join(process.cwd(), "node_modules/@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-400-normal.woff")),
};

function dataUrl(data: Buffer, type: string): string {
  return `data:${type};base64,${data.toString("base64")}`;
}

export default async function OpenGraphImage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const hero = await getTranslations({ locale, namespace: "hero" });

  const regular = readAsset.regular();
  const semibold = readAsset.semibold();
  const mono = readAsset.mono();
  const photo = dataUrl(readAsset.photo(), "image/jpeg");
  const mark = dataUrl(readAsset.mark(), "image/svg+xml");

  // Same flat look as the site: one ground, hairlines, a single blue accent.
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          backgroundColor: "#0a0b0d",
          color: "#eef1f6",
          fontFamily: "IBM Plex Sans",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontFamily: "IBM Plex Mono", fontSize: 28 }}>
          <img src={mark} width={48} height={48} style={{ borderRadius: 11 }} alt="" />
          <div style={{ display: "flex" }}>
            <span style={{ color: "#969fae" }}>~/</span>tyldum.dev
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 56 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div style={{ display: "flex", alignItems: "baseline", fontSize: 92, fontWeight: 600, letterSpacing: -3, lineHeight: 1 }}>
              <span style={{ fontFamily: "IBM Plex Mono", fontWeight: 400, color: "#4ea7fc", marginRight: 28 }}>#</span>
              {hero("name")}
            </div>
            <div style={{ fontSize: 40, color: "#969fae" }}>{`${hero("tagline")}.`}</div>
          </div>
          <img src={photo} width={220} height={220} alt="" style={{ borderRadius: 32, border: "2px solid #22262e" }} />
        </div>

        <div style={{ height: 1, backgroundColor: "#22262e" }} />
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "IBM Plex Sans", data: regular, weight: 400, style: "normal" },
        { name: "IBM Plex Sans", data: semibold, weight: 600, style: "normal" },
        { name: "IBM Plex Mono", data: mono, weight: 400, style: "normal" },
      ],
    },
  );
}
