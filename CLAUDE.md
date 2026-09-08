## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Melanoma Navigator

The guided patient journey under `/melanoma/navigator` (entry page) and `/melanoma/navigator/mad-rush/{pathology,stage,treatment}` (Mad Rush Steps 1–3). The entry page routes straight into Step 1 (or a later step on resume); the standalone `/melanoma/navigator/mad-rush` journey-map page and the `JourneyProgress` component were removed 2026-09-07 (Dr. Wang — the map and the "Your Mad Rush progress" list on the entry page were confusing). Step back/exit/complete links now target `/melanoma/navigator`. `journey.ts` merges `STEP1` + `STEP2` + `STEP3` into one page so every recorded answer stays in memory for the later steps (no re-asking, nothing persisted). Specs live in [melanoma-navigator/](melanoma-navigator/) — read `MELANOMA_MEDICAL_GUARDRAILS.md` before touching any Navigator file.

**Content / UI split (do not break this):**

- All patient-facing copy, screen flow, choices, branch routing, and doctor-question lists live in `src/data/navigator/` (`journeyMap.ts`, `step1Pathology.ts`, `step2Staging.ts`, `types.ts`). Components and scripts hold **zero** medical strings.
- `src/data/navigator/medicalRules.ts` holds the T-category / stage-grouping tables. As of 2026-09-07 they are **approved** (reviewed by Steven Q. Wang, MD against AJCC 8th; `status: 'approved'`, `STAGING_RULES_ENABLED = true`) for a narrow use: `estimateStageGroup()` computes an **educational Stage I/II sub-group (IA–IIC)**, shown on the Step 2 summary via `summary.stageEstimate` + `renderStageEstimate()` in `flow.js`, always labelled an estimate the physician confirms and never overwriting a doctor-reported stage. Step 2 no longer collects lymph-node / distant-spread answers, so an invasive case always resolves `provisional` (a sentinel node biopsy is still expected: negative keeps the sub-group, a positive node → Stage III, distant spread → Stage IV). A missing pathology value defers to the coarse worded `stageBand`. Do **not** widen the computed scope, and roll the switch back to `false` / `status: 'draft'` if a newer AJCC edition supersedes the 8th or the review lapses. **Update 2026-09-08 (Dr. Wang):** the ulceration question (Step 1 `c2`, Step 2 `k0c`, and the Step 2 `k0` / Step 3 `t0` recap edits) no longer offers an "I cannot find it" option — ulceration is a mandatory synoptic-report element, so an unmentioned ulceration is recorded as "Absent / not identified." An entered invasive case therefore always resolves a T category once a Breslow value is present, so `estimateStageGroup()` returns a sub-group (and Step 3 routes to a `tx_*` screen) unless the Breslow thickness itself is missing; the `insufficient` result / coarse `stageBand` now signals only a missing Breslow. The `ulceration: 'unknown'` code path stays as a defensive default.
- **Step 3 (treatment) — `step3Treatment.ts` + `/melanoma/navigator/mad-rush/treatment` (`entry="step3"`)** (added 2026-09-07, Dr. Wang; content reviewed — see `MAD_RUSH_STEP3_DEEP_SPEC.md`). Flow: `t0` recap of the carried diagnosis / Breslow / ulceration (editable inline, same `DIAGNOSIS_PRESETS` pattern as Step 2's `k0`) → an in-situ answer routes straight to `tx_stage0`; everyone else goes to `t1`, a **computed bridge** carrying `autoRouteByTCat` that maps Breslow + ulceration to an AJCC 8th T category (the already-approved `tCategoryFor()`) and forwards **invisibly** to the matching `tx_IA` / `tx_IB` / `tx_IIA` / `tx_IIB` / `tx_IIC` `info` screen. When thickness/ulceration aren't both known, `t1` renders as itself — the general, non-stage-specific picture. `t0cold` handles a cold direct load. **The `t0` recap is skipped on the main flow** (2026-09-07, Dr. Wang — Step 2 just confirmed the same three fields): `STEP3.enterRoute` routes the Step 2 → Step 3 `NEXT_STEP` jump straight past `t0` — `b3` / `k0a` in situ | lentigo maligna → `tx_stage0`, `b3` / `k0a` invasive → `t1` (which then computes and forwards as above). `t0` stays as `start` for a cold direct load with no answers, whose recap fills nothing and falls through `recap.emptyNext` → `t0cold` → `t1`; `melanoma_step3_started` lives on `t1` and `tx_stage0` (not `t0`, which the main flow skips and the cold flow passes straight through) so it fires exactly once per path. **Step 3 has no summary screen** (removed 2026-09-07, Dr. Wang — "just end it at the treatment-options page"): `StepDef.summary` is now optional, `NavJourney.astro` renders a `[data-summary-block]` only for steps that define it, and every `tx_*` / `t1` screen is **terminal** — its continue button is a "Finish the Mad Rush" action (`FINISH_LABEL` / `FINISH_EVENT` in `step3Treatment.ts`) wired to `next: 'EXIT'` (back to `/melanoma/navigator`) that fires `melanoma_step3_completed` + `navigator_completed_mad_rush`. **Two small `flow.js` changes** for this: the `StepDef.enterRoute` gate is now read from each step's `[data-subprogress]` list (always rendered) instead of `[data-summary-block]`; and the `autoRouteByTCat` invisible-forward no longer fires the bridge screen's continue-button event (only its `viewEvent`), so `t1`'s finish events fire only when `t1` is the terminal screen the patient actually sees. Otherwise re-uses the generic `autoRouteByTCat` / `resolveComputedRoute()` engine support, recap-confirm's `autoRoute` for the in-situ jump, and the `entryTargetForScreen()` gate. **No new rule set** in `medicalRules.ts` — Step 3 only *routes* on `tCategoryFor()`, it computes/publishes no stage. Treatment copy is third-person education throughout (GUARDRAILS §5: "your care team may discuss…", never "you need" / "you do not need"); each stage screen closes on `CONFIRM_LINE`. (The per-screen print-only "Questions to ask your doctor" lists were removed 2026-09-07, Dr. Wang — every `tx_*` / `t1` screen now has no `doctorQuestions` / `printLabel`.) Time-sensitive content per GUARDRAILS §11 — `TREATMENT_CONTENT_META` at the top of the file records `source_guideline` / `source_date` / `last_medical_reviewed` (2026-09-07) / `reviewed_by` (Steven Q. Wang, MD) / `status: 'approved'`; roll to a `MEDICAL_CONTENT_REQUIRES_CURRENT_REVIEW` placeholder + `'draft'` if that review lapses.
- **Step 3 has no Stage III / IV content** — it used to carry a worded `summary.beyondStage` Stage III / IV explainer ("If melanoma is found in lymph nodes or beyond"), but that was removed 2026-09-07 (Dr. Wang) along with the whole Step 3 summary. It was physician-reviewed copy; if it needs to come back, put it on `t1` (the general-picture screen) and/or the `tx_*` screens, or restore a Step 3 summary. Step 2's summary keeps its own `beyondStage` explainer (below).
- **Step 2's summary completes to `NEXT_STEP`** (was `/melanoma/navigator`) — it advances into Step 3 in the same page, and `STEP3.enterRoute` sends it past the `t0` recap straight to the terminal treatment screen (`tx_stage0` for in situ / lentigo maligna, else `t1` → the computed `tx_*` forward, or `t1` itself as the general picture). The `navigator_completed_mad_rush` extra event in `NavJourney.astro:completeEventsFor` covers `step.id === 'step3'` but Step 3 has no summary, so the two Mad Rush finish events (`melanoma_step3_completed` + `navigator_completed_mad_rush`) fire from each terminal screen's continue button (`FINISH_EVENT`) instead. `analytics.js` allow-lists `melanoma_step3_started` / `melanoma_step3_completed` (the old `step3_treatment_summary_viewed` is gone).
- **Step 2 is recap → summary only** (simplified 2026-09-07, Dr. Wang). `step2Staging.ts` keeps just the `k0` pathology recap (plus the `k0cold`/`k0a`/`k0b`/`k0c` cold-entry capture) and the "Your stage picture" summary. "Yes — that matches my report" (or an inline correction saved) on `k0` routes straight to `SUMMARY:step2`. **Removed:** the `k1` "Has a doctor already told you your melanoma stage?" screen (the clinician-assigned stage is deferred to on the summary, not asked); the `k2` bridge and the entire N (`N1`–`N3`) and M (`M1`–`M3`) question track; and the T1a / T2a–T4b `k2.autoRouteByTCat` early-exit routing. `flow.js` keeps the generic `autoRouteByTCat` / `resolveComputedRoute()` engine support (now dormant — no screen emits `data-auto-route-by-tcat`). Earlier removals still stand: the standalone "T — your original tumor" screen, the `k1a` / `k1b` doctor-stage detail screens, and `STEP2_CONSISTENCY_RULES` / the summary `consistencyNote`.
- **Neither Step 1 nor Step 2 summary has a "Questions for my doctor" list** (Step 1 removed 2026-09-07, Step 2 removed 2026-09-07, Dr. Wang). Both `step1Pathology.ts` and `step2Staging.ts` omit `summary.questionsHeading`; `NavJourney.astro` only renders the questions block when that key is set. `summary.questionsHeading` stays optional in `types.ts`, and the `[data-summary-questions]` / "No extra questions were flagged" fallback in `flow.js` is dormant (guarded by element presence).
- **The Step 2 summary has no "Learn more" CTA** (removed 2026-09-07, Dr. Wang). `step2Staging.ts` omits `summary.learnMore`; `NavJourney.astro` only renders the `details[data-learn-more]` block when that key is set. `summary.learnMore` stays optional in `types.ts`. (The journey-map `learnMore` in `journeyMap.ts` is a separate, unrelated field.)
- **Step 1 "None of these / I'm not sure" on the diagnosis screen is a dead end, by design** (2026-09-07, Dr. Wang — guardrails §3). `b3.unclear` routes to `b3unclear`, a terminal `info` screen: it shows the "ask your medical team" copy + three doctor questions, a `printLabel` "Print these questions" button (`data-print` → `window.print()`), and a "Back to the Navigator" button wired to `next: 'EXIT'`. It does **not** go to the Step 1 summary or on into Step 2 — a patient who can't confirm the diagnosis has nothing useful to do in the rest of the flow. `Screen.printLabel` is a new optional field in `types.ts`; `NavJourney.astro` renders the print button only for `kind: 'info'` screens that set it, and `[data-info-next]` is now also hidden in the `@media print` block.
- **The Step 2 summary has an educational Stage III / IV explainer** (`summary.beyondStage`, added 2026-09-07, Dr. Wang — copy reviewed). Because Step 2 collects no lymph-node / distant-spread answers, nothing routes a node-positive or metastatic patient to a Stage III/IV picture; this is the worded stand-in — Stage III (regional spread) and Stage IV (distant spread) in plain language, framed as a care-team finding, **no sub-group (IIIA–IIID), no computation, no data collected, no doctor-questions list**. `BeyondStageInfo` in `types.ts` (`heading` / `intro` / `parts[]` / optional `closing` / optional `when` OR-list); `NavJourney.astro` renders `[data-beyond-stage]` only when the key is set; `flow.js:renderSummary` toggles visibility via the `when` OR-list (`anyRule`) — Step 2 gates it to `b3: ['invasive']` / `k0a: ['invasive']` so a Stage 0 in-situ case never sees it. It carries no print-suppressed control classes, so it prints with the summary.
- **Step 1 summary "Margin status" placement is branch-dependent** (2026-09-07, Dr. Wang). For `in_situ` / `lentigo_maligna` the `c7` row renders under **Diagnosis**; for `invasive` it renders in the **"Key pathology information (for invasive melanoma ONLY)"** block. Done with a per-row `when?: Record<string,string[]>` gate on `SummarySection.rows` (`data-summary-when` → `ruleMatches()` in `flow.js:renderSummary`) — the same `when` shape as route rules.
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
