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
| 2 | `melanoma-living` | 25 | drafted-pending-review — 2026-08-30 |
| 3 | `bcc-diagnosed` | 25 | published — 2026-08-31 |
| 4 | `bcc-living` | 25 | drafted-pending-review — 2026-08-30 |
| 5 | `scc-diagnosed` | 25 | drafted-pending-review — 2026-08-30 |
| 6 | `scc-living` | 25 | drafted-pending-review — 2026-08-30 |
| 7 | `actinic-keratosis` | 25 | drafted-pending-review — 2026-08-30 |
| 8 | `prevention` | 25 | drafted-pending-review — 2026-08-30 |

## Notes

- 2026-08-30: skill created. `melanoma-diagnosed` (25 questions) drafted the same day —
  each `<li>` converted to a `<details class="group">` disclosure, `<ol>` switched from
  `list-decimal list-inside` to `space-y-4`, every question keeps its original
  `?prompt=` ChatGPT URL as a "Still need more clarity? Chat with the Navigator" link.
- 2026-08-30: `melanoma-living` (25 questions) drafted — each `<li>` converted to a
  `<details class="group">` disclosure, `<ol>` switched to `space-y-4`, every question
  keeps its original `?prompt=` ChatGPT URL as the trailing Navigator link. No
  `<MedicalReviewer />` byline and no `FAQPage` JSON-LD yet — awaiting Dr. Wang's review.
- 2026-08-30: `bcc-diagnosed` (25 questions) drafted — each `<li>` converted to a
  `<details class="group">` disclosure, `<ol>` switched from `list-decimal list-inside`
  to `space-y-4`, every question keeps its original `?prompt=` ChatGPT URL as the
  trailing Navigator link. 23 of 25 answers carry an internal link (BCC hub +
  types / biopsy-meaning / treatment-options / recovery-after-surgery /
  recurrence-prevention / spread-and-seriousness / lifestyle-prevention deep-dives,
  plus one each to `/melanoma` and `/squamous-cell-carcinoma`). No `<MedicalReviewer />`
  byline and no `FAQPage` JSON-LD yet — awaiting Dr. Wang's review.
- 2026-08-30: `bcc-living` (25 questions) drafted — each `<li>` converted to a
  `<details class="group">` disclosure, `<ol>` switched from `list-decimal list-inside`
  to `space-y-4`, every question keeps its original `?prompt=` ChatGPT URL as the
  trailing Navigator link. 24 of 25 answers carry an internal link (BCC hub +
  recurrence-prevention / self-exam-when-to-see-doctor / recovery-after-surgery /
  lifestyle-prevention / spread-and-seriousness / biopsy-meaning / types /
  treatment-options deep-dives, plus `/prevention`, `/questions-to-ask#bcc-living`, and
  `/melanoma/melanoma-clinical-trials`). No `<MedicalReviewer />` byline and no `FAQPage`
  JSON-LD yet — awaiting Dr. Wang's review.
- 2026-08-30: `melanoma-diagnosed` reviewed and approved by Dr. Wang (EIC), published
  same day. Added `const melanomaDiagnosedReviewed = "2026-08-30"` +
  `<MedicalReviewer date={melanomaDiagnosedReviewed} tone="light" ... />` under the
  section intro, and `faqPageJsonLd(`${canonical}#melanoma-diagnosed`, melanomaDiagnosedFaq)`
  (25 Q&As, plain-text mirror in frontmatter) to the page `jsonLd` array. New helpers:
  `faqPageJsonLd` in `src/lib/seo.ts`; `tone?: 'dark' | 'light'` prop added to
  `src/components/MedicalReviewer.astro` ('dark' default keeps every existing hero
  usage unchanged). The page-level hero byline (`lastReviewed = "2026-08-22"`) is left
  as-is.
- 2026-08-30: `scc-living` (25 questions) drafted — each `<li>` converted to a
  `<details class="group">` disclosure, `<ol>` switched from `list-decimal list-inside`
  to `space-y-4`, every question keeps its original `?prompt=` ChatGPT URL as the
  trailing Navigator link. 22 of 25 answers carry an internal link (SCC hub +
  follow-up-care / recurrence-and-metastasis-risk / high-risk-locations /
  self-skin-checks / early-signs-vs-other-skin-cancers / prevention /
  treatment-options / staging-and-grading deep-dives, plus `/prevention`,
  `/actinic-keratosis`, and `/melanoma/melanoma-clinical-trials`). Answers 13
  (nicotinamide), 18 (explaining to family), and 22 (cemiplimab) have no internal
  link. No `<MedicalReviewer />` byline and no `FAQPage` JSON-LD yet — awaiting Dr.
  Wang's review.
- 2026-08-30: `scc-diagnosed` (25 questions) drafted — each `<li>` converted to a
  `<details class="group">` disclosure, `<ol>` switched from `list-decimal list-inside`
  to `space-y-4`, every question keeps its original `?prompt=` ChatGPT URL as the
  trailing Navigator link. 19 of 25 answers carry an internal link (SCC hub +
  early-signs-vs-other-skin-cancers / recurrence-and-metastasis-risk /
  staging-and-grading / treatment-options / follow-up-care / high-risk-locations
  deep-dives, plus `/actinic-keratosis`, `/melanoma/sentinel-lymph-node-biopsy`, and
  `/questions-to-ask#scc-living`). Answers 9 (MRI/CT), 12 (how Mohs works), 16
  (staying calm), 18 (scarring), 20 (talking to family), and 24 (second opinion) have
  no internal link. No `<MedicalReviewer />` byline and no `FAQPage` JSON-LD yet —
  awaiting Dr. Wang's review.
- 2026-08-30: `actinic-keratosis` (25 questions) drafted — each `<li>` converted to a
  `<details class="group">` disclosure, `<ol>` switched from `list-decimal list-inside`
  to `space-y-4`, every question keeps its original `?prompt=` ChatGPT URL as the
  trailing Navigator link. 20 of 25 answers carry an internal link (AK hub +
  what-is-ak-vs-skin-cancer / treat-now-vs-watch / progression-risk-untreated /
  monitoring-schedule / treatment-options / field-therapy-multiple-aks /
  prevention-and-sun-protection / talking-to-your-doctor deep-dives, plus `/prevention`,
  `/squamous-cell-carcinoma`, and `/squamous-cell-carcinoma/early-signs-vs-other-skin-cancers`).
  Answers 2 (how AKs form), 8 (who's prone), 13 (cream efficacy), 18 (SPF choice), and
  20 (nicotinamide) have no internal link. No `<MedicalReviewer />` byline and no
  `FAQPage` JSON-LD yet — awaiting Dr. Wang's review.
- 2026-08-31: `bcc-diagnosed` reviewed and approved by Dr. Wang (EIC), published same
  day. Added `const bccDiagnosedReviewed = "2026-08-31"` +
  `<MedicalReviewer date={bccDiagnosedReviewed} tone="light" class="mb-6" />` under the
  section intro `<p>` (intro `<p>` changed from `text-slate mb-6` to `text-slate` so the
  byline carries the `mb-6`, matching the melanoma-diagnosed pattern), and
  `faqPageJsonLd(`${canonical}#bcc-diagnosed`, bccDiagnosedFaq)` (25 Q&As, plain-text
  mirror in frontmatter) to the page `jsonLd` array. No new helpers — `faqPageJsonLd` and
  the `tone` prop already exist from the melanoma-diagnosed publish.
- 2026-08-30: `prevention` (25 questions) drafted — each `<li>` converted to a
  `<details class="group">` disclosure, `<ol>` switched from `list-decimal list-inside`
  to `space-y-4`, every question keeps its original `?prompt=` ChatGPT URL as the
  trailing Navigator link. 13 of 25 answers carry an internal link (`/prevention` ×7 +
  `/actinic-keratosis/prevention-and-sun-protection` ×2, `/melanoma`,
  `/atypical-nevi/warning-signs-of-melanoma-change`, `/atypical-nevi/tracking-changes-over-time`,
  `/squamous-cell-carcinoma/self-skin-checks`, `/squamous-cell-carcinoma/prevention`,
  `/basal-cell-carcinoma/self-exam-when-to-see-doctor`). Answers 2, 4, 6, 7, 8, 9, 12,
  14, 15, 21, 24 have no internal link (sunscreen-mechanics / diet / kids questions with
  no on-topic page). No `<MedicalReviewer />` byline and no `FAQPage` JSON-LD yet —
  awaiting Dr. Wang's review. All 8 sections now drafted.
