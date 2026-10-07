# tyldum.dev 🌐

Personal site and CV for Mats Tyldum. Live at **[tyldum.dev](https://tyldum.dev)**.

## Tech stack

- **Framework:** Next.js 16 with App Router and Cache Components — every page is
  prerendered, and `ensureStatic` fails the build if one stops being static
- **Styling:** Tailwind CSS 4, IBM Plex Sans + Mono; no component library
- **i18n:** next-intl — Norwegian and English
- **Deployment:** Vercel

## Project structure

```
src/
├── app/
│   ├── [locale]/          # Locale-based routing (no, en)
│   │   ├── cv/            # CV page — also the print/PDF layout
│   │   ├── layout.tsx     # Root layout with providers
│   │   ├── opengraph-image.tsx # Link-preview image per locale
│   │   └── page.tsx       # Home page
│   ├── globals.css        # Theme tokens + custom animations
│   ├── robots.ts          # robots.txt
│   └── sitemap.ts         # sitemap.xml
├── components/
│   ├── hero.tsx           # Home intro: avatar, "# name", tagline
│   ├── home-overview.tsx  # Home "## experience" / "## skills" from the CV messages
│   ├── section-heading.tsx # The markdown-style "## heading"
│   ├── header.tsx         # Site header
│   ├── footer.tsx         # Site footer
│   └── ...                # Theme toggle, "no / en" switch, CV entries
├── i18n/
│   ├── config.ts          # Locale config
│   ├── messages/          # Translation JSON files
│   └── ...                # next-intl setup
├── lib/
│   ├── content-schemas.ts # Runtime validation of CV content
│   ├── site.ts            # Canonical URLs and profile links
│   ├── layout.ts          # The shared 720px reading column
│   ├── theme/             # Theme colour tokens + no-flash bootstrap
└── proxy.ts               # next-intl middleware
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

The **Performance Budget** workflow runs Lighthouse CI on every PR and push to
`main`. Besides score and Core Web Vitals thresholds, `lighthouserc.json` caps
the bytes a page may transfer: 205 KB of JavaScript and 330 KB in total, about
7% above what the home page measures today (~191 KB JS, ~302 KB total). The
JS figure is mostly React and the Next.js runtime, and Lighthouse also counts
the CV route Next prefetches and the two Vercel analytics scripts (which 404
outside Vercel). A new client-side dependency will trip the budget unless it
is loaded on demand, as the theme toggle's confetti is.

Visual snapshot policy:

- Use `pnpm test:ui:update` only after manual visual review of diffs.
- Do not update snapshots to silence unexpected regressions.

Baselines are platform specific. CI compares the `chromium-linux` set, which
cannot be produced on macOS — run the **Refresh UI Snapshots** workflow
(`workflow_dispatch`), download the artifact, and commit the PNGs. Regenerate
the `chromium-darwin` set locally with `pnpm test:ui:update`.

## Deployment

Every push to `main` deploys automatically to Vercel.
