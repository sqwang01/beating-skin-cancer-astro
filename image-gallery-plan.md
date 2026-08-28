# Image Gallery — Planning Notes

Brainstorm notes for a standalone clinical + dermoscopy image atlas
(BCC, melanoma, SCC, atypical nevi). Not a build spec — ideas to pull
from when ready to start.

---

## Vision / why do this

The web has *volume* of skin-cancer images but is thin on what makes an
atlas actually useful:

- **Verified provenance** — every image is one board-certified
  dermatologist's own biopsy-proven case. This is the "Experience" in
  Google E-E-A-T: first-hand, not aggregated.
- **Clinical + dermoscopy pair of the same lesion** — the high-value
  teaching unit, hard to find freely.
- **Consistency** — same photographer/technique, so variation seen is
  real biology (subtype, body site, skin tone), not camera noise.
- **Licensing gap** — DermNet has usage limits, textbook figures are
  copyrighted, ISIC is research-oriented. Students, illustrators,
  journalists, educators need images they're *allowed* to use.
- **Patient-facing framing** — plain language + links to the site's hub
  pages, instead of the algorithm feeding patients the scariest image.
- **Domain authority** — original images are content Google can't find
  elsewhere; lifts the whole site's rankings.

Honest caveat: without captions we compete on curation + trust only.
Value roughly doubles once teaching pearls are added later. Start anyway.

---

## Decisions made so far

- **Standalone gallery section** (not nested under each disease hub).
- **One page per disease** — no cross-disease comparison view.
- **No teaching captions in v1** — short label only; captions added later.
- Source material: **100+ images**, most embedded in **PowerPoint decks**,
  some loose **JPG**. All the user's own images / own patients.
- Still to decide: license, watermarking scope, embed-snippet in v1,
  disclaimer framing (see Open Questions).

---

## The 6-step image pipeline (PowerPoint → web-ready)

A `.pptx` is a zip archive; embedded images live in `ppt/media/` at the
resolution they were inserted — usually higher-res than right-click
"Save as Picture". If a slide has a crop applied, the media file is the
*uncropped* original (usually what we want).

1. **Copy the decks.** Work on copies, never originals. Gather every
   `.pptx` into one working folder.
2. **Extract media.** For each deck: rename `.pptx` → `.zip`, unzip, pull
   everything from `ppt/media/`. A small loop script does all decks into
   one dump folder. Filenames will be junk (`image17.jpeg`) with no
   ordering.
3. **Cull.** Delete logos, slide decorations, diagrams, duplicates of the
   same lesion you don't want, anything not a usable clinical/dermoscopy
   photo.
4. **Dedupe.** Same image often appears across multiple decks. Remove
   byte-identical and near-identical copies.
5. **Batch compress + strip metadata.** Resize to a sane master size,
   strip ALL EXIF (privacy — see below), land results in
   `src/images/gallery/<category>/`. Commands below.
6. **Rename via CSV.** Maintain a spreadsheet: one row per image with
   `filename, diagnosis, type (clinical/dermoscopy), site, subtype,
   phototype, consent-status, caption (later), credit`. A one-time script
   reads the CSV and (a) renames files to descriptive kebab-case
   (`nodular-bcc-nasal-ala-clinical-01.jpg`) and (b) generates the
   content-collection entries / data array. Add 40 images later = add 40
   rows, re-run. **This is the main efficiency lever** — never hand-author
   per-image entries.

### Privacy (clinical images)

- Strip all metadata — camera JPGs carry timestamps, sometimes GPS,
  sometimes patient identifiers.
- Check filenames and image edges for anything identifying.
- Crop tight by default. Faces, tattoos, distinctive marks = identifiable
  → needs consent that specifically covers publication/social use. Track
  in the CSV `consent-status` column.

### Batch compression commands (macOS)

Always work on a copy — these can be destructive.

`sips` (built into macOS, strips most metadata, resizes in place):

```
mkdir web && cp *.jpg web/ && cd web
sips -Z 2000 *.jpg
```

ImageMagick (`brew install imagemagick`) — resize only if larger,
quality 82, strip metadata, output to separate folder:

```
mogrify -path ./web -resize '2000x2000>' -quality 82 -strip *.jpg
```

Or `sharp-cli` (`npx sharp-cli`) — same engine Astro uses.

Sizing: clinical ~2000px longest edge (allows lightbox zoom); dermoscopy
1400–1600px is plenty. JPEG quality ~80–82, or WebP q75.

---

## Content architecture

Store images in `src/images/gallery/<category>/` — **not** `public/`.
Anything under `src/` goes through Astro's Sharp pipeline
(`astro:assets`). From one source file `<Picture>` generates:

- grid thumbnails (~500px)
- lightbox size (~1400–1600px)
- AVIF/WebP with JPG fallback
- automatic `width`/`height` (no layout shift), `loading="lazy"`

`public/` images are served untouched — would have to pre-generate every
size by hand. Only go external (Cloudinary / S3 + CDN, or Astro remote
image optimization) if hundreds of images make repo size / build time
painful. At ~100–200, `src/` is fine.

**Metadata store** — two options:

- **Astro content collection** (`src/content/gallery/`) — one YAML file
  per image, Zod schema validates every field, `image()` field so Astro
  optimizes it. Best for scale + consistency.
- **Single data file** (`src/data/gallery.ts`) — one array of objects,
  matches the existing `editorialBoard.ts` pattern. Fine for a few dozen;
  workable at 100+ if generated from the CSV.

Either way the CSV → generator script is what keeps it maintainable.

Per-image fields to capture: diagnosis (biopsy-proven?), image type
(clinical vs dermoscopic), anatomic site, subtype (nodular BCC,
superficial spreading melanoma…), Fitzpatrick phototype, dermoscopy
structures visible (later), teaching caption (later), credit / consent
tracking.

---

## Navigation & page structure

- **New top-level nav item:** "Image Gallery" (or "Photo Atlas") → `/gallery`.
- `/gallery` — landing page, 4 category cards (BCC, Melanoma, SCC,
  Atypical Nevi) + education-not-diagnosis disclaimer box in the site's
  existing style.
- `/gallery/basal-cell-carcinoma`, `/gallery/melanoma`,
  `/gallery/squamous-cell-carcinoma`, `/gallery/atypical-nevi` — one page
  per disease. Responsive grid
  (`grid-cols-2 md:grid-cols-3 lg:grid-cols-4`). Client-side filter
  buttons: Clinical / Dermoscopy / body site / subtype. Client-side
  filtering on one page per disease is simplest and fast at this volume.
- **Cross-link both ways:** add a "See clinical & dermoscopy images" card
  on each disease hub page → its gallery page, and link gallery pages back
  to the matching hub. Check `/questions-to-ask` TOC for cross-linking.
- Breadcrumbs following the deep-dive pattern in CLAUDE.md.

### Lightbox

- Dependency-light: native `<dialog>` element + ~30 lines JS for
  prev/next + Escape + focus trapping. Start here.
- PhotoSwipe if pinch-zoom / swipe gestures are wanted later.
- Accessibility: real descriptive alt text per image ("nodular basal cell
  carcinoma on the left nasal ala with rolled pearly border and
  telangiectasias"), keyboard nav, focus trap.

---

## SEO + medical-review requirements

Per CLAUDE.md these are medical pages, so every gallery page needs:

- `const canonical = "https://www.beatingskincancer.com/gallery/<path>"`
- `const lastReviewed = "YYYY-MM-DD"` (only once Dr. Wang has reviewed)
- import `MedicalReviewer` + `medicalReviewJsonLd` from `src/lib/seo.ts`
- `<MedicalReviewer date={lastReviewed} />` under the hero subtitle
- `canonical={canonical} jsonLd={jsonLd}` on `Layout`
- `medicalReviewJsonLd(canonical, lastReviewed)` in the `jsonLd` array
- Attribution defaults to Editor-in-Chief (Dr. Steven Q. Wang). Reviewer
  byline / two-phase review workflow: no byline or date at draft time,
  only after review.

Also:

- Exactly one `<h1>` per page; logical `<h2>`/`<h3>` nesting.
- Unique `title` (~50–60 chars, `"… | Beating Skin Cancer"`) and unique
  `description` (120–158 chars) per page.
- `ImageObject` JSON-LD per image (`caption`, `contentUrl`, `creator`,
  `license`).
- Descriptive kebab-case filenames.
- Enable image entries in the sitemap (Astro sitemap integration).
- Original images ranking in Google Images link to the *hosting page* —
  often a bigger practical win than backlinks.
- Avoid the known `sky` color issue — use `teal`/`ivory`/`navy` tokens.

---

## Social redistribution, licensing, backlinks

### How image reuse actually creates backlinks

A bare copied/re-hosted image gives nothing automatically — a backlink is
an HTML `<a href>`, and a JPEG has no link inside it. Backlinks only come
via:

1. **"Embed this image" snippet** we provide on each lightbox — a "copy
   embed code" button handing pre-written HTML: image + caption line where
   the name/site is a real `<a href>`. Opt-in; captures the conscientious
   minority. Main reuse→backlink path.
2. **CC BY attribution done properly** — license requires attribution;
   standard practice is a hyperlink to source. Compliant reusers link
   back; chasing non-compliant ones at scale isn't realistic.
3. **Editorial citation** — a news article / nursing-school page / health
   site cites the atlas as image source with a link. Highest value, but
   it's someone choosing to link, not automatic.

When there's no link at all: a visible watermark
(`© S.Q. Wang, MD · beatingskincancer.com` in a corner) still drives
direct/branded search traffic + trust signal. Reverse image search
(Google Lens, TinEye) traces copies back to the origin page.

Bottom line: "image theft builds my backlink profile" is mostly a myth.
Real value stack = original content raises domain authority + Google
Images discovery + embed snippet captures well-behaved reusers +
watermark converts silent reuse into brand awareness. Big backlinks come
from being a resource worth citing (→ curation + captions matter).

### Promoting it (you posting)

100+ images = 100+ evergreen posts. Instagram/Threads carousels
("clinical first, swipe for dermoscopy"), Pinterest (medical-image search
engine, long-tail traffic, each image → a Pin linking back), LinkedIn for
educators/clinicians, YouTube Shorts as narrated slideshows. The CSV
metadata later becomes the caption source — atlas + social share one
spreadsheet.

### Licensing options

- **CC BY 4.0** — reuse freely, attribution required. Maximizes spread +
  backlinks, always credited. Best fit for "I want this redistributed."
- **CC BY-NC** — blocks commercial reuse but also blocks legit uses,
  more friction.
- **All rights reserved / contact for permission** — max control, minimal
  spread.

If CC BY: (1) bake a subtle corner mark into the *social/redistributable*
versions so attribution survives out of context (keep on-site versions
clean or very lightly marked); (2) offer the embed snippet with
pre-filled attribution. Batch-apply watermark + generate 1080×1080 /
1080×1350 social crops with the same script that does compression.

### Consent

Even own patients: publication + social distribution of potentially
identifiable images (faces, tattoos, distinctive marks, wide shots) needs
consent specifically covering that use. Most tight close-ups are
non-identifiable. Add `consent-status` column to the CSV; crop tight by
default.

---

## Open questions still to decide

1. **License** — CC BY (spread + backlinks) or something more restrictive?
2. **Watermark** — on the on-site gallery images too, or only social
   versions?
3. **Embed-with-attribution snippet** — in scope for v1, or later with
   captions?
4. **Self-diagnosis liability framing** — same disclaimer style the site
   already uses, or something stronger for an image atlas?
5. **Metadata store** — Astro content collection vs single generated data
   file.
6. Does it grow well past ~200 images? If so, plan external image hosting
   from the start.
