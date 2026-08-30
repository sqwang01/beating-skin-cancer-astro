# Question library answer ledger

Tracks on-page answer status for each section of `src/pages/questions-to-ask.astro`.
Status values:

- `not-started` — questions are still bare external links, no on-page answer.
- `drafted-pending-review — YYYY-MM-DD` — every question in the section converted to a
  collapsible answer (50–75 words, internal links, trailing Navigator link) and renders,
  but the section has NO `<MedicalReviewer />` byline and the page has NO `FAQPage`
  JSON-LD for it. Awaiting Dr. Wang's review.
- `published — YYYY-MM-DD` — reviewed by Dr. Wang; per-section byline added under the
  section intro and `FAQPage` JSON-LD for the section wired into the page `jsonLd` array.

Re-check this file at the start of every run; update it at the end.

| # | Section id | Questions | Status |
|---|---|---|---|
| 1 | `melanoma-diagnosed` | 25 | published — 2026-08-30 |
| 2 | `melanoma-living` | ~25 | not-started |
| 3 | `bcc-diagnosed` | ~25 | not-started |
| 4 | `bcc-living` | ~25 | not-started |
| 5 | `scc-diagnosed` | ~25 | not-started |
| 6 | `scc-living` | ~25 | not-started |
| 7 | `actinic-keratosis` | ~25 | not-started |
| 8 | `prevention` | ~25 | not-started |

## Notes

- 2026-08-30: skill created. `melanoma-diagnosed` (25 questions) drafted the same day —
  each `<li>` converted to a `<details class="group">` disclosure, `<ol>` switched from
  `list-decimal list-inside` to `space-y-4`, every question keeps its original
  `?prompt=` ChatGPT URL as a "Still need more clarity? Chat with the Navigator" link.
- 2026-08-30: `melanoma-diagnosed` reviewed and approved by Dr. Wang (EIC), published
  same day. Added `const melanomaDiagnosedReviewed = "2026-08-30"` +
  `<MedicalReviewer date={melanomaDiagnosedReviewed} tone="light" ... />` under the
  section intro, and `faqPageJsonLd(`${canonical}#melanoma-diagnosed`, melanomaDiagnosedFaq)`
  (25 Q&As, plain-text mirror in frontmatter) to the page `jsonLd` array. New helpers:
  `faqPageJsonLd` in `src/lib/seo.ts`; `tone?: 'dark' | 'light'` prop added to
  `src/components/MedicalReviewer.astro` ('dark' default keeps every existing hero
  usage unchanged). The page-level hero byline (`lastReviewed = "2026-08-22"`) is left
  as-is.
