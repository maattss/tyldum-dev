# tyldum.dev

Personal website for Mats Tyldum — [tyldum.dev](https://tyldum.dev)

## Tech Stack

- **Framework:** Next.js 16 with App Router
- **Styling:** Tailwind CSS 4 + custom animations
- **UI Components:** Radix UI primitives
- **i18n:** next-intl (Norwegian/English)
- **Blog:** MDX with gray-matter
- **Deployment:** Vercel

## Project Structure

```
src/
├── app/
│   ├── [locale]/          # Locale-based routing (no, en)
│   │   ├── blog/          # Blog pages (hidden for now)
│   │   ├── layout.tsx     # Root layout with providers
│   │   └── page.tsx       # Home page
│   └── globals.css        # Theme + custom animations
├── components/
│   ├── ui/                # Radix-based UI primitives
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

Open [http://localhost:3000](http://localhost:3000)

## Adding Blog Posts

Create an `.mdx` file in `content/blog/{locale}/`:

```mdx
---
title: "Post Title"
description: "Short description"
date: "2026-01-09"
---

Your content here...
```

## Deployment

Deployed automatically to Vercel on push to `main`.
