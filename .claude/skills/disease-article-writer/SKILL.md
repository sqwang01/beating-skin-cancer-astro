---
name: disease-article-writer
description: Draft new deep-dive patient-education articles for the placeholder "Key Topics" cards on this Astro site's hub pages (basal-cell-carcinoma, squamous-cell-carcinoma, atypical-nevi, actinic-keratosis, melanoma), with verified peer-reviewed + patient-resource citations. Use when the user asks to write, draft, or add content for a missing/placeholder topic page, or to continue the site's content-expansion effort.
---

# Disease article writer

Drafts new "deep-dive article" pages (CLAUDE.md pattern 2) for the unlinked placeholder cards
sitting in each hub page's "Key Topics" section, matching the site's existing style, structure,
and citation format — then hands them to Dr. Wang for review before they go live.

## Two-phase workflow (important — do not skip)

Dr. Wang reviews content in batches, not one page at a time as it's written. That means drafting
and publishing are two separate steps:

1. **DRAFT phase** (this skill's main output): write the full page, verify citations, update the
   pipeline ledger to `drafted-pending-review`. **Do NOT** add `<MedicalReviewer />`, a `lastReviewed`
   const, or `medicalReviewJsonld()` to the page, and **do NOT** convert the hub's placeholder
   `<div class="block p-4 bg-sky/5 ...">` card into a real `<a href="...">` link. The page file
   exists at its URL but stays unlinked from navigation and unreviewed — this is deliberate, so
   unreviewed medical content isn't surfaced to patients or crawlers.
2. **PUBLISH phase** (only on explicit instruction, e.g. "I've reviewed X and Y, publish them"):
   for each approved page, add `<MedicalReviewer date={lastReviewed} />` right under the hero's
   subtitle `<p>`, add `const lastReviewed = "YYYY-MM-DD"` (today's actual date), add
   `medicalReviewJsonld(canonical, lastReviewed)` to the page's `jsonLd` array, convert the hub's
   placeholder `<div>` into a real `<a href="/hub/slug" class="block p-4 bg-sky/5 rounded-lg
   border border-teal/10 hover:bg-sky/10 transition-colors">` (keep the existing inner markup),
   and update the ledger row to `published — YYYY-MM-DD`. If the user gives edits/feedback instead
   of a flat approval, apply them to the draft and leave it at `drafted-pending-review` for the
   next review round.

Never set a real reviewer name/date on a page that hasn't actually been reviewed by Dr. Wang in
this conversation — CLAUDE.md requires `lastReviewed` to reflect an actual review.

## Process

1. **Read the ledger**: `.claude/skills/disease-article-writer/pipeline-ledger.md` in this skill's
   own folder. It lists every hub's Key Topics slots with current status. Pick the next
   `not-started` row (or the one(s) the user names). If the user doesn't specify how many, draft
   one at a time unless they ask for a batch.
2. **Study the pattern**: read the closest matching already-published deep-dive article in the
   same hub (e.g. `melanoma/pathology-report.astro`, `basal-cell-carcinoma/treatment-options.astro`)
   for structure, tone, and Tailwind class usage. Follow CLAUDE.md's deep-dive shape: hero with
   "← Back to [Hub]" link → Introduction → topic/step sections → "What to Ask Your Doctor" →
   Conclusion → Sources box → disclaimer box → closing CTA.
3. **Draft the content**: scientifically accurate, plain-language, patient-facing. Use the exact
   question text from the hub's placeholder card as the article's core angle/H1 subject — patients
   were promised an answer to that specific question.
4. **Sources box** — two subsections, AMA/Vancouver style for the first:
   - `Clinical Guidelines & Peer-Reviewed Literature`: `Author AB, et al. Title. Journal.
     Year;Vol(Issue):pages.` linked to PubMed or DOI. Find real PMIDs via WebSearch, then fetch
     accurate metadata with `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id={PMID}&rettype=abstract&retmode=text`
     — **do not WebFetch `pubmed.ncbi.nlm.nih.gov` directly**, it serves a cookie-consent wall
     instead of content. PMC links sometimes 301-redirect from `ncbi.nlm.nih.gov/pmc/...` to
     `pmc.ncbi.nlm.nih.gov/...`; follow the redirect. Avoid `documents.cap.org` — the domain no
     longer resolves.
   - `Patient Resources`: org name — deep-linked to the *specific* relevant page (NCI, ACS, AAD,
     NCCN patient guidelines, disease-specific foundations), never just the homepage. Verify every
     URL actually resolves (WebFetch or WebSearch) before inserting it — never guess a URL.
   - Dr. Wang's own books are a valid patient resource when topically relevant (precedent:
     `basal-cell-carcinoma/types.astro` cites *Beating Basal Cell Cancer*; `melanoma/pathology-report.astro`
     cites *Beating Melanoma: The Ultimate Patient Resource*, Johns Hopkins University Press, 2nd ed.,
     2024, ISBN 1421449876). Ask the user if it's unclear which book fits.
5. **JSON-LD**: build `articleJsonLd`, `breadcrumbsJsonLd`, and (if the content supports 2-3 genuine
   Q&As) `faqJsonLd`, same as existing deep-dives. Skip `medicalReviewJsonld` — that's PUBLISH phase.
6. **SEO checklist**: one `<h1>`; unique `title` 50-60 chars as `"Page Name | Beating Skin Cancer"`;
   unique `description` 120-158 chars (verify with a character count, don't eyeball it); explicit
   `canonical` const `https://www.beatingskincancer.com/hub/slug` reused in the canonical tag,
   `mainEntityOfPage`, and breadcrumb's last item; real `alt` on any `<img>`, `aria-hidden="true"`
   on purely decorative icons.
7. **Style guardrails**: use `bg-ivory` / `from-teal/10 to-teal/5` — never introduce new `bg-sky/*`
   usage (known dead-CSS bug, see CLAUDE.md). Cross-link to other existing articles in the same
   hub where genuinely relevant (e.g. stage meaning, biopsy pages).
8. **Verify render**: confirm the dev server is up (`astro dev status`; start with `astro dev
   --background` if not), then `curl -s -o /dev/null -w "%{http_code}\n" http://localhost:4321/hub/slug`
   and grep the rendered HTML for a couple of expected strings (title, a Sources citation) to
   confirm it actually built.
9. **Update the ledger**: set the row to `drafted-pending-review — YYYY-MM-DD` (date drafted).
   Leave the hub's placeholder card exactly as-is (still an unlinked `<div>`).
10. **Report**: tell the user the page is live at its URL (unlinked from nav), summarize what it
    covers, and note it's awaiting review — don't ask if they want to review now, just state it's
    ready whenever they are.

## Publishing a reviewed batch

When the user says a page (or set of pages) has been reviewed and approved: for each one, do the
PUBLISH-phase edits described above, then re-verify the render and report back which pages are now
live and linked from their hub.
