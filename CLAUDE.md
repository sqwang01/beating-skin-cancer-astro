## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Melanoma Navigator

The guided patient journey under `/melanoma/navigator` (entry page) and `/melanoma/navigator/mad-rush/{pathology,stage}` (Mad Rush Steps 1–2). The entry page routes straight into Step 1 (or Step 2 on resume); the standalone `/melanoma/navigator/mad-rush` journey-map page and the `JourneyProgress` component were removed 2026-09-07 (Dr. Wang — the map and the "Your Mad Rush progress" list on the entry page were confusing). Step back/exit/complete links now target `/melanoma/navigator`. Specs live in [melanoma-navigator/](melanoma-navigator/) — read `MELANOMA_MEDICAL_GUARDRAILS.md` before touching any Navigator file.

**Content / UI split (do not break this):**

- All patient-facing copy, screen flow, choices, branch routing, and doctor-question lists live in `src/data/navigator/` (`journeyMap.ts`, `step1Pathology.ts`, `step2Staging.ts`, `types.ts`). Components and scripts hold **zero** medical strings.
- `src/data/navigator/medicalRules.ts` holds the T-category / stage-grouping tables. As of 2026-09-07 they are **approved** (reviewed by Steven Q. Wang, MD against AJCC 8th; `status: 'approved'`, `STAGING_RULES_ENABLED = true`) for a narrow use: `estimateStageGroup()` computes an **educational Stage I/II sub-group (IA–IIC)**, shown on the Step 2 summary via `summary.stageEstimate` + `renderStageEstimate()` in `flow.js`, always labelled an estimate the physician confirms and never overwriting a doctor-reported stage. Step 2 no longer collects lymph-node / distant-spread answers, so an invasive case always resolves `provisional` (a sentinel node biopsy is still expected: negative keeps the sub-group, a positive node → Stage III, distant spread → Stage IV). A missing pathology value defers to the coarse worded `stageBand`. Do **not** widen the computed scope, and roll the switch back to `false` / `status: 'draft'` if a newer AJCC edition supersedes the 8th or the review lapses.
- **Step 2 is recap → summary only** (simplified 2026-09-07, Dr. Wang). `step2Staging.ts` keeps just the `k0` pathology recap (plus the `k0cold`/`k0a`/`k0b`/`k0c` cold-entry capture) and the "Your stage picture" summary. "Yes — that matches my report" (or an inline correction saved) on `k0` routes straight to `SUMMARY:step2`. **Removed:** the `k1` "Has a doctor already told you your melanoma stage?" screen (the clinician-assigned stage is deferred to on the summary, not asked); the `k2` bridge and the entire N (`N1`–`N3`) and M (`M1`–`M3`) question track; and the T1a / T2a–T4b `k2.autoRouteByTCat` early-exit routing. `flow.js` keeps the generic `autoRouteByTCat` / `resolveComputedRoute()` engine support (now dormant — no screen emits `data-auto-route-by-tcat`). Earlier removals still stand: the standalone "T — your original tumor" screen, the `k1a` / `k1b` doctor-stage detail screens, and `STEP2_CONSISTENCY_RULES` / the summary `consistencyNote`.
- Never infer a *new* clinical rule from the source book. If a UI behavior needs medical logic that is not in an `approved` rule set, render the `NEEDS_MEDICAL_REVIEW` / `MEDICAL_CONTENT_REQUIRES_CURRENT_REVIEW` placeholder instead.

**Runtime:** `src/scripts/navigator/flow.js` is a generic attribute-driven screen engine rendered by `src/components/navigator/NavStep.astro`. `store.js` persists only non-sensitive progress (phase, step, status, opened-section flags) to `localStorage`; pathology/staging field values stay in memory for the session only — never persisted. `analytics.js` sends flow events to GA4 through two allow-lists (event name + property key/value); no pathology value, stage, or free text can reach analytics.

**Not wired into the reviewed-PDF pipeline:** Navigator "questions to ask" lists are unreviewed content, so they are print-only (`window.print()`), not added to `hubChecklists.ts` / `careTeamQuestions.ts`.

## Design system

Tokens live in [src/styles/global.css](src/styles/global.css) under `@theme` (Tailwind v4):

- Colors: `navy` `#0A2342`, `teal` `#0FB8AD`, `coral` `#FF7A59`, `ivory` `#FAF9F6`, `slate` `#25313B`. Used as `bg-navy`, `text-teal`, `border-coral/10`, etc.
- Fonts: `font-serif` → DM Serif Display (all headings), `font-sans` → Inter (body, default).
- Page wrapper: `bg-ivory` on the outer `<div class="min-h-screen ...">`.

**Known issue — don't copy this pattern:** many pages use a `sky` color (`bg-sky/5`, `from-sky/10`, `text-sky`, etc.) that was never added to `@theme`. Those utilities currently generate no CSS at all. Until `--color-sky` is added to global.css (or these are swapped to `teal`/`ivory`), don't introduce new `sky` usages.

## Adding a new page

Copy the closest matching existing page as your starting point rather than writing from scratch — it's the most reliable way to inherit spacing, component structure, and color usage. Two established shapes:

1. **Hub/overview page** (e.g. `melanoma/index.astro`, `basal-cell-carcinoma/index.astro`, `actinic-keratosis.astro`): hero (gradient `from-navy to-slate`) → intro card → CTA box ("Need More Information?") → "Key Topics" card → Warning Signs → Risk Factors / Prevention (2-col grid) → Treatment Options → closing CTA.
2. **Deep-dive article** (e.g. `melanoma/melanoma-stage-meaning.astro`, `basal-cell-carcinoma/types.astro`): hero with a "← Back to [Hub]" link → Introduction → topic/step sections → "What to Ask Your Doctor" → Conclusion → disclaimer box → closing CTA. These also define an explicit `canonical` and `Article`/`BreadcrumbList`/`FAQPage` JSON-LD — see below.

### SEO checklist for every new page

- Exactly one `<h1>`; nest `<h2>`/`<h3>` logically (don't skip levels).
- `title`: unique across the site, ~50–60 characters, format `"Page Name | Beating Skin Cancer"`.
- `description`: unique across the site, 120–158 characters, describes *this* page's content — never reuse another page's description or a placeholder like an effective date.
- `canonical`: omit the prop for ordinary pages — `Layout.astro` auto-generates it from `Astro.site` + the live path. Only pass an explicit `canonical` const for cornerstone articles that also ship JSON-LD (pattern 2 above), and reuse that same string in the canonical tag, `mainEntityOfPage`, and the breadcrumb's last item.
- Any `<img>` needs a real `alt`. Decorative `astro-icon` icons don't need alt text but should get `aria-hidden="true"` if they're purely decorative next to visible text.
- Check `/questions-to-ask`'s table of contents if the new page should be cross-linked from the question library.
- If the page is a hub sub-page with a "What to Ask Your Doctor" list, add/update its entry in the checklist data file so the printable PDFs regenerate — see **Discussion-guide PDFs** below.
- Every medical/disease page (hub and deep-dive articles — anything giving health guidance, not utility pages like privacy/terms) needs a reviewer byline: define `const canonical = "https://www.beatingskincancer.com/<path>"` and `const lastReviewed = "YYYY-MM-DD"` (today's date, only once a board dermatologist has actually reviewed the content), import `MedicalReviewer` from `src/components/MedicalReviewer.astro` and `medicalReviewJsonLd` from `src/lib/seo.ts`, render `<MedicalReviewer date={lastReviewed} />` directly under the hero's subtitle `<p>`, pass `canonical={canonical} jsonLd={jsonLd}` to `Layout`, and include `medicalReviewJsonLd(canonical, lastReviewed)` in the page's `jsonLd` array (alongside any `Article`/`BreadcrumbList`/`FAQPage` blocks for deep-dive articles). When revising a page's medical content later, bump `lastReviewed` to that date.
  - Reviewer attribution defaults to the Editor-in-Chief (Dr. Steven Q. Wang). To attribute an article to another member of the medical editorial board, pass a matching `slug` from `src/data/editorialBoard.ts` to *both* calls: `<MedicalReviewer date={lastReviewed} reviewer="<slug>" />` and `medicalReviewJsonLd(canonical, lastReviewed, "<slug>")`. The byline links to `/editorial-board#<slug>`. Board members are defined only in `src/data/editorialBoard.ts` — that array feeds the byline, the JSON-LD, and the `/editorial-board` page.

### Discussion-guide PDFs (keep in sync when a hub page changes)

Every hub sub-page's "What to Ask Your Doctor" list is the single source for a build-time PDF: one per-page checklist at `/downloads/<hub>/<slug>-checklist.pdf` and one combined "complete `<hub>` discussion guide" at `/downloads/<hub>/complete-<hub>-discussion-guide.pdf`. `integrations/checklist-pdfs.mjs` regenerates **all** of them from two data files each time the dev server starts (`astro dev`) and on every `astro build` — it never reads the `.astro` pages, so a page change reaches the PDFs **only if you also edit the matching data file**:

- **Non-advanced disease hubs** — BCC, SCC, melanoma, actinic keratosis, the AK/PDT sub-hub, atypical nevi: [src/data/hubChecklists.ts](src/data/hubChecklists.ts).
- **Advanced hubs** — advanced BCC, advanced SCC, advanced melanoma: [src/data/careTeamQuestions.ts](src/data/careTeamQuestions.ts).

These files are not optional metadata: the page itself renders its "What to Ask Your Doctor" section and its "Download printable checklist (PDF)" button from its data entry (`getHubChecklistByPath(...)` + `QuestionList` / `ChecklistDownloadButton`), and each hub landing page links the combined guide via `hubBundlePdfPath(...)`.

- **Adding a hub sub-page:** add a matching entry — `slug` (= route segment), `hub`, `pageTitle` (= the page's `<h1>`), `pagePath` (= the site-relative route), `order` (position within the hub), `lastReviewed`, and `groups` (the question text, copied verbatim from the page's list). A new hub id also needs a row in `hubChecklistHubs` / `hubs`.
- **Editing an existing hub sub-page:** mirror any change to its questions, `pageTitle`, or `lastReviewed` into that entry. `lastReviewed` **must equal** the page's `const lastReviewed`; a `reviewer` slug, if set, must resolve in `src/data/reviewerDirectory.ts`. `assertHubChecklistsValid()` / `assertChecklistsValid()` run in the PDF build step and **fail the build** on missing/malformed metadata.
- **Draft (pre-review) articles:** hold the data-file entry until the PUBLISH phase, when the page gets its real `lastReviewed` — an entry requires a valid review date and would render a live checklist/PDF for unreviewed content.
- After the edit, restart `astro dev` (or run `astro build`) and confirm the log line `generated N checklist PDFs`, then spot-check the affected `/downloads/...pdf`.

## Image gallery

Gallery data lives in [src/data/gallery.ts](src/data/gallery.ts) — one `GalleryCase` per lesion, each holding a `clinical` and a `dermoscopy` image. Every image carries its own `alt` (required) plus an optional `caption` (the lightbox teaching pearl). Pages under `src/pages/gallery/` render from `getGalleryCases(category)`.

### Alt-text format

Write both alt strings to this template so the whole gallery reads consistently and each image can rank for its own long-tail query:

- **Clinical:** `<Diagnosis> (<ABBR>) on the <site> in Fitzpatrick type <phototype> skin, biopsy-proven — clinical photo of lesion <n>`
  e.g. `Squamous cell carcinoma (SCC) on the arm in Fitzpatrick type II skin, biopsy-proven — clinical photo of lesion 3`
- **Dermoscopy, caption already written:** `Dermoscopy of a biopsy-proven <diagnosis> (<ABBR>) on the <site> showing <the findings named in the caption>`
  e.g. `Dermoscopy of a biopsy-proven squamous cell carcinoma (SCC) on the arm showing crystalline structures and linear-dotted vessels`
- **Dermoscopy, no caption yet:** `Dermoscopy of a biopsy-proven <diagnosis> (<ABBR>) on the <site> from a real patient case, lesion <n>`

Rules:

- Front-load the diagnosis and its abbreviation (`SCC`, `BCC`, `AK`…).
- Include `site` and `phototype` whenever the case records them; include "biopsy-proven" only when `biopsyProven: true`.
- Every alt string on a page must be unique. Dermoscopy findings usually differentiate; when two clinical photos share the same site + phototype, the `lesion <n>` suffix (n = the number shown as "Lesion N" on the card) is the differentiator.
- Roughly 100–155 characters, natural phrasing, no keyword stuffing.
- Do **not** describe how the lesion itself looks (colour, border, texture) unless that description has been verified against the actual photo. Dermoscopy structures are safe to name because they come straight from the reviewed `caption`.

### Workflow: image first, caption later

New images are normally committed before their teaching caption is written, so keep the alt/caption pair in sync in two passes:

1. **On upload** — add the `GalleryCase` with both alt strings, using the **"no caption yet"** dermoscopy form above. `caption` is left off.
2. **When a `caption` is added or later edited** — immediately update that image's `dermoscopy.alt`: replace the `from a real patient case, lesion <n>` tail with a `showing <findings>` clause built from the new caption. If the caption corrects the site or names a subtype, fix `clinical.alt` to match. The `caption` is the source of truth for the findings clause on every later revision.

To retrofit a batch after captions land, re-read `src/data/gallery.ts`, and for each case whose `dermoscopy.caption` is set but whose `dermoscopy.alt` still ends in `from a real patient case`, rewrite that alt from the caption per the format above.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
