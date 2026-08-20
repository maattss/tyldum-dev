# 🌐 tyldum.dev

Hey there! 👋 **Check out the site:** [tyldum.dev](https://tyldum.dev)

## 🚀 Tech Stack (aka the fun stuff)

- **Framework:** Next.js 16 with App Router ⚡ (because life's too short for slow websites)
- **Styling:** Tailwind CSS 4 + custom animations 🎨 (making pixels dance since 2024)
- **UI Components:** Radix UI primitives 🧩 (accessible AND beautiful)
- **i18n:** next-intl 🇳🇴🇬🇧 (Norwegian/English - because why pick one?)
- **Blog:** MDX with gray-matter 📝 (markdown on steroids)
- **Deployment:** Vercel 🚢 (push to main and watch the magic happen)

## 📂 Project Structure (aka where the magic lives)

```
src/
├── app/
│   ├── [locale]/          # 🌍 Locale-based routing (no, en)
│   │   ├── blog/          # 📰 Blog pages (hiding until I have time to write)
│   │   ├── layout.tsx     # 🎯 Root layout with providers
│   │   └── page.tsx       # 🏠 Home sweet home page
│   └── globals.css        # 🎨 Theme + custom animations (the secret sauce)
├── components/
│   ├── ui/                # 🧱 Radix-based UI primitives
│   ├── hero.tsx           # 🦸 Main hero section (not all heroes wear capes)
│   ├── header.tsx         # 📍 Site header
│   ├── footer.tsx         # 👟 Site footer (the unsung hero)
│   └── ...                # 🌓 Theme/language toggles, social links
├── i18n/
│   ├── config.ts          # 🗺️ Locale config
│   ├── messages/          # 💬 Translation JSON files
│   └── ...                # 🔧 next-intl setup
├── lib/
│   ├── blog.ts            # 📚 Blog post utilities
│   ├── content-schemas.ts # 🔍 Runtime validation of CV/blog content
│   ├── site.ts            # 🔗 Canonical URLs and profile links
│   ├── theme/             # 🌓 Theme colour tokens + no-flash bootstrap
│   └── utils.ts           # 🛠️ cn() helper (the real MVP)
└── proxy.ts               # 🚦 next-intl middleware

content/
└── blog/
    ├── en/                # 🇬🇧 English blog posts (.mdx)
    └── no/                # 🇳🇴 Norwegian blog posts (.mdx)
```

## 🛠️ Development (let's get this party started)

```bash
pnpm install  # Install all the goodies
pnpm dev      # Fire up the dev server 🔥
```

Then head over to [http://localhost:3000](http://localhost:3000) and watch the magic unfold! ✨

## ✅ Quality checks

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

## ✍️ Adding Blog Posts (when inspiration strikes)

Drop an `.mdx` file in `content/blog/{locale}/` with this simple frontmatter:

```mdx
---
title: "Post Title"
description: "Short description"
date: "2026-01-09"
---

Your brilliant thoughts here... 💭
```

## 🚀 Deployment (set it and forget it)

Every push to `main` triggers an automatic deployment to Vercel. It's like having a robot butler for your code! 🤖
