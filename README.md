# tyldum.dev

Personal site and blog for Mats Tyldum. Live at **[tyldum.dev](https://tyldum.dev)**.

## Tech stack

- **Framework:** Next.js 16 with App Router
- **Styling:** Tailwind CSS 4 plus custom animations
- **UI components:** Radix UI primitives
- **i18n:** next-intl — Norwegian 🇳🇴 and English 🇬🇧
- **Blog:** MDX with gray-matter
- **Deployment:** Vercel

## Project structure

```
src/
├── app/
│   ├── [locale]/          # Locale-based routing (no, en)
│   │   ├── blog/          # Blog index and post pages
│   │   ├── cv/            # CV page — also the print/PDF layout
│   │   ├── layout.tsx     # Root layout with providers
│   │   └── page.tsx       # Home page
│   ├── globals.css        # Theme tokens + custom animations
│   ├── robots.ts          # robots.txt
│   └── sitemap.ts         # sitemap.xml
├── components/
│   ├── ui/                # Radix-based UI primitives
│   ├── brand-icons.tsx    # GitHub/LinkedIn marks, vendored from lucide 0.577
│   ├── hero.tsx           # Main hero section
│   ├── header.tsx         # Site header
│   ├── footer.tsx         # Site footer
│   └── ...                # Theme/language toggles, social links
├── i18n/
│   ├── config.ts          # Locale config
│   ├── messages/          # Translation JSON files
│   └── ...                # next-intl setup
├── lib/
│   ├── blog.ts            # Blog post utilities
│   ├── content-schemas.ts # Runtime validation of CV/blog content
│   ├── site.ts            # Canonical URLs and profile links
│   ├── theme/             # Theme colour tokens + no-flash bootstrap
│   └── utils.ts           # cn() helper
└── proxy.ts               # next-intl middleware

content/
└── blog/
    ├── en/                # English blog posts (.mdx)
    └── no/                # Norwegian blog posts (.mdx)
```

## Development

```bash
pnpm install
pnpm dev
```

Then head over to [http://localhost:3000](http://localhost:3000).

## Quality checks

```bash
pnpm check:i18n   # Ensure no/en translation structure stays in sync
pnpm lint         # ESLint checks
pnpm typecheck    # tsc --noEmit (run after `pnpm build`, it needs .next/types)
pnpm test:ui      # Build + Playwright (screenshots, content, print, theme)
```

The Playwright suite has three kinds of test:

- `ui-regression.spec.ts` — screenshot diffs, with an absolute `maxDiffPixels`
  budget. A percentage budget large enough to absorb font antialiasing is also
  large enough to absorb whole lines of changed text, which is how a CV content
  change once passed CI untouched.
- `content.spec.ts` — asserts the rendered text of the hero and every CV entry,
  in both locales. Catches content drift that screenshots miss.
- `cv-print.spec.ts` — "Download PDF" is `window.print()`, so the print
  stylesheet is the CV's PDF layout. Guards that site chrome is gone, that every
  role prints (including the collapsed "earlier experience" section), and that
  text stays dark on white in both themes.

Visual snapshot policy:

- Use `pnpm test:ui:update` only after manual visual review of diffs.
- Do not update snapshots to silence unexpected regressions.

Baselines are platform specific. CI compares the `chromium-linux` set, which
cannot be produced on macOS — run the **Refresh UI Snapshots** workflow
(`workflow_dispatch`), download the artifact, and commit the PNGs. Regenerate
the `chromium-darwin` set locally with `pnpm test:ui:update`.

## Adding blog posts

Drop an `.mdx` file in `content/blog/{locale}/` with this frontmatter:

```mdx
---
title: "Post Title"
description: "Short description"
date: "2026-01-09"
---

Your thoughts here.
```

## Deployment

Every push to `main` deploys automatically to Vercel.
