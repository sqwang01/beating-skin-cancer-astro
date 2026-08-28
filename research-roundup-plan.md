# Research Roundup — Planning Doc

A timely, news-driven section for **beatingskincancer.com** covering new publications,
clinical trial results, and major skin cancer news — written for the general public and
interpreted by our dermatologists. Companion to the existing evergreen guides, not a
replacement for them.

Status: **planning only — do not build yet.** This doc is the brief for when we start.

---

## 1. Concept

- **Evergreen content** = a *tree*: hubs → deep-dive articles, organized by topic, no visible dates.
- **Research Roundup** = a *stream*: reverse-chronological, every entry stamped with a visible
  publish date, each post standalone.
- The date is a **feature** here, not something to hide.
- Main risk to manage: a timely section that looks abandoned in a year is worse than no
  section at all. Cadence discipline and a draft buffer are non-negotiable.

---

## 2. Name

**Chosen direction: "Research Roundup"** — honest about what it is, implies a recurring
digest, pairs naturally with monthly cadence.

Fixed tagline to do the interpretive framing every month:

> *Research Roundup — new studies, clinical trial results, and skin cancer news, explained by our dermatologists.*

Backup name if we want more personality: **"Beyond the Headlines"** (signals we cut through
hype-y mainstream skin cancer coverage), same tagline.

Other options considered: What's New in Skin Cancer, The Monthly Briefing, Research Explained,
Making Sense of the Research, Advances, Progress Report.

- **Nav label:** Research Roundup
- **URL:** `/research-roundup` (posts at `/research-roundup/<slug>`)
- **Post titles:** monthly digest → "Research Roundup: August 2026"; rare breaking item →
  specific headline ("FDA Approves [drug] for Advanced Melanoma — What It Means").

---

## 3. Cadence

- **Monthly digest**, ~3 items per issue.
- **Strict monthly**, not "monthly + breaking." Genuinely major news (e.g. a big FDA
  approval) is the rare exception and still uses the same issue format.
- If a big item misses the review window, it rolls into next month's issue.

---

## 4. Content model (Astro)

Use an **Astro content collection** — e.g. `src/content/roundup/` — not one hand-built
`.astro` file per page. Authoring becomes "write Markdown + frontmatter," which is what
makes a monthly cadence sustainable.

- One dynamic route renders all posts; one index page lists them; date sorting is automatic.
- Typed frontmatter schema (draft — refine at build time):

```yaml
title: "Research Roundup: August 2026"
description: "..."            # unique, 120–158 chars, per site SEO checklist
pubDate: 2026-08-15
updatedDate: 2026-09-02       # optional; only for running-status topics
cancerTypes: [melanoma]       # required, closed vocab, 1–2 max
category: new-research        # optional, closed vocab (see below)
reviewer: "steven-q-wang"     # slug from src/data/editorialBoard.ts
video:                        # optional block — present only for video posts
  youtubeId: "abc123"
  orientation: vertical       # vertical | horizontal
  title: "..."
  duration: "PT2M14S"
```

- Coexists with the current setup — an additional collection, not a rewrite.
- Reuse the existing `MedicalReviewer` component + review-byline pattern from CLAUDE.md.

---

## 5. Taxonomy — two closed vocabularies, no freeform tags

Freeform tags spawn thin archive pages, hurt SEO, and become maintenance debt. Instead:

1. **Cancer type** (required, 1–2 max): `melanoma`, `basal-cell-carcinoma`,
   `squamous-cell-carcinoma`, `actinic-keratosis`, `atypical-nevi`, `general-prevention`.
2. **Category** (optional): `new-research` / `clinical-trial` · `drug-fda-news` ·
   `guideline-update` · `screening-prevention` · `awareness-seasonal` · `conference-coverage`.

Filtered views like `/research-roundup/melanoma/` are built from axis 1. Categories can be
added later; they should rarely be removed.

---

## 6. Cross-linking with evergreen content (the main payoff)

- Each hub page (melanoma, BCC, SCC, AK, atypical nevi) gets a **"Latest research & updates"**
  module showing the 3 most recent roundup posts tagged with that cancer type. Evergreen
  pages stay fresh-looking without being edited.
- Every roundup post links **back into** the evergreen guides for background.
- **Process link (don't forget):** when a roundup item eventually becomes standard of care,
  it must be folded into the relevant evergreen guide. Make this a step in the workflow, or
  the two sections slowly contradict each other.

---

## 7. Aging & trust mechanics

- Show "Published August 2026" prominently + the `MedicalReviewer` byline.
- Posts older than ~12 months get an **automatic banner**: "Reflects evidence available as of
  [date]; standards may have changed."
- Default rule: posts are **superseded** by newer posts (link forward), not edited in place.
  - Exception: a deliberate running-status topic (e.g. "where mRNA melanoma vaccines stand")
    that we keep updating via `updatedDate`.
- **Corrections policy:** when a result gets walked back or a trial fails, append a visible,
  dated "**Update: [date]**" block. Never silently edit. (News content hits this far more
  often than evergreen — have the convention ready before post #1.)

---

## 8. SEO

- JSON-LD: `NewsArticle` or `BlogPosting` for posts (not `MedicalWebPage`/`Article`).
  Breadcrumb into the section root.
- Video posts also get **`VideoObject`** JSON-LD (name, description, `thumbnailUrl`,
  `uploadDate`, `embedUrl`, `duration`) — makes the page eligible for video rich results and
  is a real reason to host the canonical version on our own site, not just YouTube.
- One unique title/description per post, per the existing site SEO checklist.
- **RSS feed** — nearly free in Astro, worth having; structure it so a newsletter can pull
  from it later.
- Durable ranking assets = the index page + per-cancer-type filtered pages. Individual posts
  rank fast and decay.

---

## 9. Video integration

Short videos recorded for social channels (Shorts / Reels / TikTok) can live in this section.

- **Host on YouTube, embed — never self-host** (bandwidth, no adaptive quality, slow pages).
- Record vertical for social reach, but embed via the standard `youtube.com/embed/<id>` form,
  not the `/shorts/` URL — behaves predictably in an iframe regardless of YouTube's
  classification.
- Create a **"Research Roundup" YouTube playlist**; point social bios at it.
- **Facade embed, not a raw iframe.** Use the **`astro-embed`** package's `<YouTube>`
  component — thumbnail + play button, loads the real player only on click, uses
  `youtube-nocookie.com`. Protects Core Web Vitals and avoids cookie/privacy issues.
- **Vertical video layout:** constrain to ~360–400px max-width, centered, `aspect-ratio: 9/16`
  so it reads as an intentional Reel. Horizontal (16:9) fills the column normally.
- **Two post shapes**, same monthly feed:
  - *Video-first*: the clip is the post + 150–300 word written summary + citations.
  - *Video-enhanced*: mostly written, clip is a bonus.
- Give video posts a small "▶ Watch" badge in the feed listing.
- **Always pair video with text on the page:** written takeaway summary, the citations
  (study / trial links, same standard as written posts), ideally a transcript or bulleted key
  points (accessibility + SEO; many watch muted). Turn on captions in the YouTube video.
- **Social → site funnel:** the site post is home base (full context + citations); every
  social caption drives back to it.

---

## 10. Editorial standards (write down once, before post #1)

- **Evidence bar:** peer-reviewed publication preferred. Conference abstracts / preprints /
  company press releases covered only with an explicit "preliminary, not yet peer-reviewed"
  flag; prefer waiting for the full paper.
- **Scope discipline:** not every dermatology paper. Criteria: *practice-changing,
  patient-relevant, or something patients will walk in asking about.* Write the criteria down
  so monthly selection isn't ad hoc.
- **Always link the primary source** — PubMed/DOI, ClinicalTrials.gov ID — not just news
  coverage.
- **No off-label implications:** covering a not-yet-approved drug is fine; language must not
  read as a treatment recommendation.
- **Disclosure / COI:** when a post covers a company, drug, or device Dr. Wang is connected
  to, include a disclosure line, backed by a standing disclosure-policy page. Set the policy
  before the first post.
- **Images:** don't reproduce figures from papers; use our own graphics or licensed stock.
  Clinical photos need consent.
- **Comments:** disabled — patients post personal medical questions we can't answer. Standard
  "not medical advice, see your doctor" footer on every post.
- **Byline:** personally "Dr. Steven Q. Wang" for video (stronger E-E-A-T); "our
  dermatologists" acceptable for team-written digests.

---

## 11. Per-issue template

Lock a repeating structure — readers know what to expect, drafting and review go faster.
For each of ~3 monthly items:

- **What happened** — 2–3 sentences.
- **What it means for patients.**
- **What to do, if anything** — often "nothing yet — ask your dermatologist if…".
- **Source** — primary link (PubMed/DOI, ClinicalTrials.gov ID).

---

## 12. Workflow — same two-phase draft-then-review

Per existing project workflow: no reviewer byline/date at draft time; added only after
Dr. Wang reviews.

- **Written posts:** draft → batch review → add `reviewer` + `lastReviewed` → publish.
- **Video posts:** review the **script in phase 1, before recording** (re-shooting after a
  review note is expensive). Phase 2 reviews the published page (summary + citations + final
  cut).
- **Buffer:** keep 2–3 issues drafted and in the queue so a review slip never breaks the
  monthly streak.

---

## 13. Launch plan

- Have **2–3 issues fully drafted and through review** before publishing issue one.
- Seed with a couple of "the last year in skin cancer research" retro posts so the section
  isn't empty on day one.
- Ship the RSS feed with launch even if the newsletter comes later.
- Decide the success metric up front (see open questions).

---

## 14. Open decisions (still yours to make)

- [ ] Final name: **Research Roundup** vs. **Beyond the Headlines**.
- [ ] Final URL slug: `/research-roundup` vs. `/roundup`.
- [ ] Newsletter — build an email list now, or just structure RSS for it later?
- [ ] Success metric: organic traffic to roundup pages? returning visitors? newsletter
      signups? video watch time? Pick before launch.
- [ ] Archive style once volume grows: single infinite feed vs. year-based archive pages
      (`/research-roundup/2026/`).
- [ ] Who drafts the roundups (Dr. Wang directly, given it's commentary — vs. drafted by
      writer then reviewed like the evergreen articles).
- [ ] Standing disclosure-policy page — draft content.

---

## 15. Build checklist (for when we start — not now)

- [ ] `npm i astro-embed` (facade YouTube component).
- [ ] Create `src/content/roundup/` collection + schema in the content config.
- [ ] Closed vocab constants for `cancerTypes` and `category`.
- [ ] Index page (reverse-chron list, ▶ badge for video posts).
- [ ] Per-cancer-type filtered pages via `getStaticPaths`.
- [ ] Post template: `NewsArticle`/`BlogPosting` JSON-LD, optional `VideoObject`, breadcrumb,
      `MedicalReviewer` byline, >12-month "evidence as of" banner, no-comments footer.
- [ ] "Latest research & updates" module component; embed on the 5 hub pages.
- [ ] RSS feed for the collection.
- [ ] Nav entry.
- [ ] Disclosure-policy page + link from post footer.
- [ ] Add section to `/questions-to-ask` cross-links if relevant.
