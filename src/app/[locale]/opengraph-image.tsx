import { readFile } from "node:fs/promises";
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
export const dynamic = "force-static";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

// Literal paths keep build tracing to exactly these files.
const readAsset = {
  // Satori reads TTF/OTF/WOFF only, so these are the static Plex files rather
  // than the variable woff2 the site itself serves.
  regular: () => readFile(join(process.cwd(), "node_modules/@fontsource/ibm-plex-sans/files/ibm-plex-sans-latin-400-normal.woff")),
  semibold: () => readFile(join(process.cwd(), "node_modules/@fontsource/ibm-plex-sans/files/ibm-plex-sans-latin-600-normal.woff")),
  photo: () => readFile(join(process.cwd(), "public/images/profile.jpg")),
  mark: () => readFile(join(process.cwd(), "public/favicon.svg")),
};

function dataUrl(data: Buffer, type: string): string {
  return `data:${type};base64,${data.toString("base64")}`;
}

export default async function OpenGraphImage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const hero = await getTranslations({ locale, namespace: "hero" });
  const cv = await getTranslations({ locale, namespace: "cv" });

  const [regular, semibold, photo, mark] = await Promise.all([
    readAsset.regular(),
    readAsset.semibold(),
    readAsset.photo().then((data) => dataUrl(data, "image/jpeg")),
    readAsset.mark().then((data) => dataUrl(data, "image/svg+xml")),
  ]);

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
          backgroundColor: "#08090a",
          backgroundImage:
            "radial-gradient(circle at 85% 10%, rgba(78,167,252,0.28) 0%, transparent 45%), radial-gradient(circle at 10% 95%, rgba(47,185,255,0.16) 0%, transparent 45%)",
          color: "#f4f7ff",
          fontFamily: "IBM Plex Sans",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <img src={mark} width={56} height={56} style={{ borderRadius: 13, border: "1px solid #242933" }} alt="" />
          <div style={{ display: "flex", fontSize: 30, fontWeight: 600, letterSpacing: -0.5 }}>
            tyldum<span style={{ color: "#94a0b6" }}>.dev</span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 56 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 700 }}>
            <div style={{ fontSize: 84, fontWeight: 600, letterSpacing: -2.5, lineHeight: 1 }}>{hero("name")}</div>
            <div style={{ fontSize: 40, color: "#d6deee" }}>{hero("tagline")}</div>
            <div style={{ fontSize: 26, color: "#94a0b6", lineHeight: 1.4 }}>{cv("summary")}</div>
          </div>
          <img
            src={photo}
            width={240}
            height={240}
            alt=""
            style={{ borderRadius: 36, border: "2px solid #242933", boxShadow: "0 30px 80px -30px rgba(47,185,255,0.6)" }}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 24, color: "#94a0b6" }}>
          <div style={{ width: 10, height: 10, borderRadius: 999, backgroundColor: "#4ea7fc" }} />
          {cv("contact.location")}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "IBM Plex Sans", data: regular, weight: 400, style: "normal" },
        { name: "IBM Plex Sans", data: semibold, weight: 600, style: "normal" },
      ],
    },
  );
}
