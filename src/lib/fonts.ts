import localFont from "next/font/local";

// Shared by the locale layout and app/global-not-found.tsx, which renders
// outside that layout and must load its own fonts.

// One variable file covers every weight the site uses (400-700), at half the
// size of the four static files it replaces.
export const ibmPlexSans = localFont({
  variable: "--font-plex-sans",
  src: "../../node_modules/@fontsource-variable/ibm-plex-sans/files/ibm-plex-sans-latin-wght-normal.woff2",
  weight: "100 700",
  style: "normal",
  display: "swap",
  preload: true,
  fallback: ["system-ui", "sans-serif"],
});

export const ibmPlexMono = localFont({
  variable: "--font-plex-mono",
  src: [
    {
      path: "../../node_modules/@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-400-normal.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../node_modules/@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-500-normal.woff2",
      weight: "500",
      style: "normal",
    },
  ],
  display: "swap",
  // Used above the fold (header, section labels), so fetch it early too.
  preload: true,
  fallback: ["ui-monospace", "SFMono-Regular", "monospace"],
});

export const fontVariables = `${ibmPlexSans.variable} ${ibmPlexMono.variable}`;
