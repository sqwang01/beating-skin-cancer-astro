---
name: meta-description-audit
description: Audit and rewrite <meta name="description"> content across this Astro site's pages to meet 2026 Google SEO length/keyword guidelines. Use when the user asks to audit, fix, improve, or rewrite meta descriptions (or SEO descriptions) for one page or the whole site.
---

# Meta description audit

Audits the `const description = "..."` values in `src/pages/**/*.astro` and rewrites the ones that fail SEO guidelines, while leaving good ones alone.

## Where descriptions live in this codebase

Every page sets `const description = "...";` in its frontmatter (sometimes as a multi-line
`const description =\n  "...";`) and passes it to `<Layout title={title} description={description}>`.
Cornerstone/deep-dive articles also feed the same `description` variable into `articleJsonLd.description`
— editing the const updates both automatically, no need to touch the JSON-LD block separately.

## Guidelines to check each description against

- **Length**: target 150–160 characters (desktop truncates ~155–160). Flag anything under ~120 or over ~160.
- **Front-loading**: the core value proposition + primary keyword should land in the first ~120 characters — mobile and AI/SGE snippets truncate there.
- **One primary keyword**, used naturally — no stuffing.
- **Unique per page** — no duplicates, no reused boilerplate (e.g. "Effective Date: ..." on legal pages is a known anti-pattern already flagged in this repo's CLAUDE.md — treat any placeholder-style description the same way even if short character-count alone wouldn't flag it).
- **Matches actual page content and search intent** — summarizing isn't enough, it should earn the click. Google may rewrite descriptions that don't genuinely reflect the page, so base every rewrite on the page's real h1/intro copy, not just the title.

## Process

1. **Read the ledger**: read `.claude/skills/meta-description-audit/audited-pages.md` in this skill's own folder. Every page path listed there has already been audited (rewritten, confirmed already-good, or explicitly excluded) — skip it entirely this run, even if you'd otherwise flag its current length. Only a page missing from the ledger is a candidate.
2. **Inventory**: `grep -rn "const description" src/pages/ --include="*.astro"` to find every page's description, then drop any path already in the ledger. If nothing remains, tell the user everything is already audited and stop.
3. **Measure**: for the remaining candidates, compute character counts (a quick Python or Node one-liner is fine) and flag which are out of the 120–160 range. Also flag any exact duplicates against each other or against descriptions already in the ledger's "rewritten" entries.
4. **Read for content**: for each candidate, read enough of the body (h1, first intro paragraph(s), any hero subtitle) to know what's actually on the page — don't invent claims not supported by the content.
5. **Draft**: for pages that fail the guidelines, write a replacement per the guidelines above, then re-measure length and iterate until every draft lands in 150–160 (a couple points either side is fine; just stay out of the <120 and >165 zones). A candidate that already meets every guideline gets no edit, just a ledger entry.
6. **Apply**: edit only the `const description = ...` line(s) per page that needed a rewrite — preserve the existing single-line vs. multi-line formatting and quote style already used in that file. Don't touch `title`, `canonical`, JSON-LD structure, or on-page visible copy (e.g. hero `<p>` text) unless the user separately asks for that. Utility/non-indexable pages (e.g. meta-refresh redirect stubs) get skipped and logged as "excluded," not rewritten.
7. **Update the ledger**: append one line per candidate processed this run — `- <path> — <today's date> — rewritten` / `reviewed, already good (N chars)` / `excluded (<reason>)` — to `audited-pages.md`, in the same format as the existing entries.
8. **Report**: summarize as a before/after table (chars before → chars after) for anything rewritten, plus a short list of what was skipped via the ledger and what was newly reviewed this run.
