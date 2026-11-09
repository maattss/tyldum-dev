# Improvement plan

From a repo review on 2026-11-09, against `main` at `bfed740`. Lint, typecheck,
the i18n parity check and the build all pass. Nothing below is a broken
feature; the first section is the only part that is urgent.

## 1. Do now

### Upgrade Next.js off 16.4.0

`pnpm audit` reports three advisories against `next` 16.4.0, all fixed in
16.4.1:

| Severity | Advisory |
| --- | --- |
| Critical | Unauthenticated RCE in the Image Optimization API when SVG files are used (GHSA-2464-fhr4-w9xw) |
| Critical | Unauthenticated RCE in `use cache` functions returning typed arrays (GHSA-673q-mjm6-r5xr) |
| High | Denial of service in App Router using Server Actions (GHSA-p3m5-59mp-jv5r) |

Real exposure is probably low: the only `use cache` function returns a year
(`src/components/footer.tsx`), and the only image is a JPG. That is an
assumption, not something verified against the advisories.

- [ ] Merge Dependabot PR #61 (next + eslint-config-next to 16.4.2, CI green,
      no conflicts, open since 2026-10-22), or bump straight to 16.4.6, the
      latest at the time of review.
- [ ] Re-run `pnpm audit` and confirm the `next` and `sharp` findings are gone.

### Clear the Dependabot backlog

Seven Dependabot PRs are open (#58, #61, #62, #65, #66, #67, #68). The limit in
`.github/dependabot.yml` is 10, and that file already records that Dependabot
went quiet the last time the limit was reached.

- [ ] Merge or close the six besides #61.
- [ ] Enable auto-merge for patch and minor updates with green CI, so a
      security patch does not wait on a manual click again.

## 2. Small improvements

### A real 404 page

`/no/finnes-ikke` returns the default Next.js 404: unstyled, English only, no
header, no theme, no `lang` attribute.

- [ ] Add `src/app/[locale]/not-found.tsx` with translated text and a link
      home, plus a catch-all route that calls `notFound()` so unknown paths
      under a locale render it inside the locale layout.
- [ ] Add `notFound` strings to `src/i18n/messages/{no,en}.json`.
- [ ] Extend `tests/content.spec.ts` to assert the 404 page keeps the header
      and the right language.

### Content that can drift from the messages

The README says all CV content is read from `src/i18n/messages/`. These are
hard-coded instead:

- [ ] `JOB_TITLE` and the Bergen `ADDRESS` in `src/components/json-ld.tsx`.
- [ ] The description "CTO at Outlet Group" in `public/site.webmanifest`.
      Either generate the manifest from the messages (`src/app/manifest.ts`)
      or drop the description.

### CI runs the same steps twice

`performance-budget.yml` and `ui-regression.yml` both install, check i18n,
lint, build and typecheck on every PR.

- [ ] Move the shared checks into one job (or one workflow with two jobs that
      reuse a build artifact). Cosmetic: it saves minutes, not correctness.

## 3. No action needed

- The remaining `pnpm audit` findings (brace-expansion, minimatch, zod,
  source-map-js) are in dev-only dependency chains under eslint and
  tailwind, and do not reach production. They clear as those packages update.
- TypeScript 7 and ESLint 10 are deliberately held back; the reasons are in
  `.github/dependabot.yml` and still apply.

## Notes from the review

- 30 of 38 Playwright tests passed locally. The 8 failures were all
  screenshot comparisons in `tests/ui-regression.spec.ts`, most likely
  rendering differences between the review container and the CI runner (the
  same job was green in CI on 2026-10-22). Not confirmed; worth a glance if
  the next CI run is red.
