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
│   ├── [locale]/              # Locale-based routing (no, en)
│   │   ├── cv/                # CV page, also the print/PDF layout
│   │   ├── layout.tsx         # Root layout: fonts, metadata, theme script
│   │   ├── opengraph-image.tsx # Link-preview image per locale
│   │   └── page.tsx           # Home page
│   ├── llms.txt/              # /llms.txt, generated from the CV messages
│   ├── globals.css            # Colour tokens and print styles
│   ├── robots.ts              # robots.txt
│   └── sitemap.ts             # sitemap.xml
├── components/
│   ├── hero.tsx               # Home intro: avatar, "# name", tagline
│   ├── home-overview.tsx      # Home "## experience" / "## skills" from the CV messages
│   ├── section-heading.tsx    # The markdown-style "## heading"
│   ├── skill-list.tsx         # Skill rows, shared by home and CV
│   ├── theme-toggle.tsx       # Light/dark button
│   ├── theme-sync.tsx         # Re-applies the theme after a language switch
│   ├── language-toggle.tsx    # The "no / en" switch
│   └── ...                    # Header, footer, CV entries, JSON-LD
├── i18n/
│   ├── config.ts              # Locales
│   ├── messages/              # Translations; all CV content lives here
│   └── ...                    # next-intl setup
├── lib/
│   ├── content-schemas.ts     # Runtime validation of CV content
│   ├── layout.ts              # The shared 720px reading column
│   ├── site.ts                # Canonical URLs and profile links
│   └── theme/                 # Theme colours + the inline no-flash script
└── proxy.ts                   # next-intl middleware (locale redirects)
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

The Playwright suite:

- `ui-regression.spec.ts`: screenshot diffs, with an absolute `maxDiffPixels`
  budget. A percentage budget large enough to absorb font antialiasing is also
  large enough to absorb whole lines of changed text, which is how a CV content
  change once passed CI untouched.
- `content.spec.ts`: asserts the rendered text of the home page and every CV
  entry in both locales, and that removed or unknown routes are 404s. Catches
  content drift that screenshots miss.
- `cv-print.spec.ts`: "Download PDF" is `window.print()`, so the print
  stylesheet is the CV's PDF layout. Guards that site chrome is gone, that every
  role prints (including the collapsed "earlier experience" section), that text
  stays dark on white in both themes, that the CV fits on one A4 page in both
  locales, and that Save as PDF suggests "Mats Tyldum – CV".
- `header-controls.spec.ts`: theme and language. The theme follows the OS until
  the visitor picks, the toggle flips light/dark and remembers it, and the
  choice survives a language switch.
- `theme-color.spec.ts`: the browser/status-bar colour matches the theme.

The **Performance Budget** workflow runs Lighthouse CI on every PR and push to
`main`. Besides score and Core Web Vitals thresholds, `lighthouserc.json` caps
the bytes a page may transfer: 205 KB of JavaScript and 330 KB in total, about
13% above what CI measures today (~180 KB JS, ~291 KB total, October 2026). The
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

## Design notes

Decisions that are easy to undo by accident:

- **Fully static.** `ensureStatic = "navigation"` on the locale layout fails
  the build if any page would render per request. The only time-dependent
  value, the footer year, is a `'use cache'` function refreshed daily.
- **Theme.** An inline script in `<head>` (`lib/theme/theme-meta.ts`) sets the
  theme before first paint: the stored choice if there is one, otherwise the
  OS preference, followed live. Switching language is a client-side navigation
  that remounts the root layout, and React resets `<html>`'s attributes on the
  way, so `ThemeSync` re-applies the theme before paint.
- **Caching.** Files in `public/` keep their names when they change, so they
  are cached for a day (plus a week of stale-while-revalidate), not as
  immutable. Hashed build output under `/_next/static` is immutable via Next.
- **CSP.** The `Content-Security-Policy` header deliberately has no
  `script-src`: a strict one needs a per-request nonce, which would make every
  page dynamic. It still sets `base-uri`, `object-src`, `frame-ancestors` and
  `form-action`.
- **Content.** All CV text lives in `src/i18n/messages/{no,en}.json`. The home
  page, CV, print layout, `llms.txt` and JSON-LD all read from there, and
  `pnpm check:i18n` keeps the two locales in step.

## Deployment

Every push to `main` deploys automatically to Vercel. Every pull request gets
its own preview deployment, linked from the PR, so changes can be checked on a
real URL before they merge.
