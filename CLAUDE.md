## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

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
- Every medical/disease page (hub and deep-dive articles — anything giving health guidance, not utility pages like privacy/terms) needs a reviewer byline: define `const canonical = "https://www.beatingskincancer.com/<path>"` and `const lastReviewed = "YYYY-MM-DD"` (today's date, only once a board dermatologist has actually reviewed the content), import `MedicalReviewer` from `src/components/MedicalReviewer.astro` and `medicalReviewJsonLd` from `src/lib/seo.ts`, render `<MedicalReviewer date={lastReviewed} />` directly under the hero's subtitle `<p>`, pass `canonical={canonical} jsonLd={jsonLd}` to `Layout`, and include `medicalReviewJsonLd(canonical, lastReviewed)` in the page's `jsonLd` array (alongside any `Article`/`BreadcrumbList`/`FAQPage` blocks for deep-dive articles). When revising a page's medical content later, bump `lastReviewed` to that date.
  - Reviewer attribution defaults to the Editor-in-Chief (Dr. Steven Q. Wang). To attribute an article to another member of the medical editorial board, pass a matching `slug` from `src/data/editorialBoard.ts` to *both* calls: `<MedicalReviewer date={lastReviewed} reviewer="<slug>" />` and `medicalReviewJsonLd(canonical, lastReviewed, "<slug>")`. The byline links to `/editorial-board#<slug>`. Board members are defined only in `src/data/editorialBoard.ts` — that array feeds the byline, the JSON-LD, and the `/editorial-board` page.

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
