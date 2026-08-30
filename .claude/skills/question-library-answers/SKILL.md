---
name: question-library-answers
description: Draft short, on-page patient answers (50–75 words each) for the question lists in src/pages/questions-to-ask.astro, converting each linked question into an expandable answer with internal links, then hand the batch to Dr. Wang for review before the reviewer byline and FAQ schema go live. Use when the user asks to write, draft, or add answers for the questions-to-ask library (any of its 8 sections), or to continue that answer-writing effort.
---

# Question library answers

`src/pages/questions-to-ask.astro` holds 8 sections, each an `<ol>` of ~25 patient
questions. Today every question is only a link out to the "Beating Skin Cancer Navigator"
ChatGPT GPT. This skill drafts a concise on-page answer for each question so the page
stands on its own for readers and for search.

Scope: ~200 questions total across the 8 sections. Work **one section at a time** (or the
section(s) the user names). Sections and their `<section id>`:

| # | Section id | Heading |
|---|---|---|
| 1 | `melanoma-diagnosed` | Melanoma – If You've Just Been Diagnosed |
| 2 | `melanoma-living` | Melanoma – Living With a History |
| 3 | `bcc-diagnosed` | Basal Cell Carcinoma – If You've Just Been Diagnosed |
| 4 | `bcc-living` | Basal Cell Carcinoma – Living With a History |
| 5 | `scc-diagnosed` | Squamous Cell Carcinoma – If You've Just Been Diagnosed |
| 6 | `scc-living` | Squamous Cell Carcinoma – Living With a History |
| 7 | `actinic-keratosis` | Actinic Keratosis – Understanding and Managing |
| 8 | `prevention` | Skin Cancer Prevention & Healthy Skin Habits |

## Two-phase workflow (important — do not skip)

Dr. Wang reviews answers in **section-sized batches**, not one at a time. Drafting and
publishing are separate steps.

1. **DRAFT phase** (this skill's main output): write every answer in the section, add
   internal links, convert each `<li>` to the disclosure markup below, update the ledger
   row to `drafted-pending-review — YYYY-MM-DD`. **Do NOT** add or change a per-section
   `<MedicalReviewer />` byline or `lastReviewed` value, and **do NOT** add `FAQPage`
   JSON-LD for the section. Unreviewed medical claims stay out of the byline and out of
   schema.
2. **PUBLISH phase** (only on explicit instruction, e.g. "melanoma-diagnosed is reviewed,
   publish it"): for the approved section,
   - add `<MedicalReviewer date="YYYY-MM-DD" />` (today's real date) directly under that
     section's intro `<p>` — one byline per section. Default attribution is the
     Editor-in-Chief (Dr. Steven Q. Wang); pass `reviewer="<slug>"` only if the user
     names a different board member from `src/data/editorialBoard.ts`.
   - add a `FAQPage` JSON-LD block for that section's Q&As to the page's `jsonLd` array
     (build a `faqPageJsonLd(section)` helper in `src/lib/seo.ts` on first use — one
     `FAQPage` object whose `mainEntity` is an array of `Question`/`acceptedAnswer`
     pairs, answer text as plain text stripped of tags).
   - update the ledger row to `published — YYYY-MM-DD`.

   If the user gives edits instead of a flat approval, apply them and leave the row at
   `drafted-pending-review` for the next round.

Never set a reviewer date on a section Dr. Wang hasn't actually reviewed in the
conversation — CLAUDE.md requires `lastReviewed` to reflect a real review.

## Answer markup

Replace each `<li>…<a …>Question?</a>…</li>` with a disclosure that keeps the question's
existing external ChatGPT URL as the trailing "Navigator" link. Match the
`<details class="group">` pattern already used in `src/components/BoardMember.astro`.

```astro
<li>
  <details class="group border-b border-slate/10 pb-4">
    <summary class="flex items-start gap-2 cursor-pointer list-none [&::-webkit-details-marker]:hidden font-medium text-navy hover:text-teal transition-colors">
      <Icon name="lucide:chevron-right" size={18} class="mt-0.5 shrink-0 text-teal transition-transform group-open:rotate-90" aria-hidden="true" />
      <span>What exactly is melanoma, and how is it different from other skin cancers?</span>
    </summary>
    <div class="mt-3 ml-7 space-y-3">
      <p>50–75 word answer, plain language, with an internal link such as
        <a href="/melanoma" class="text-teal hover:text-teal/80 hover:underline transition-colors">the melanoma overview</a>
        where it genuinely helps.</p>
      <p class="text-sm">
        <a
          href="https://chatgpt.com/g/g-69045e9a6ad8819192dbd404ede6db6d-beating-skin-cancer-navigator?prompt=<same encoded prompt as before>"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-1 text-teal hover:text-teal/80 hover:underline transition-colors"
        >
          Still need more clarity? Chat with the Navigator <Icon name="lucide:arrow-right" size={14} aria-hidden="true" />
        </a>
      </p>
    </div>
  </details>
</li>
```

- Change the section's `<ol class="space-y-3 list-decimal list-inside text-slate leading-relaxed">`
  to `<ol class="space-y-4 text-slate leading-relaxed">` — the chevron replaces the number.
- Keep the section's existing intro `<p>` and the footer "Ask these in our AI guide" /
  "Back to top" row untouched.
- Preserve each question's original `?prompt=` query string exactly.

## Writing the answers

- **Length: 50–75 words per answer.** Verify with a word count, don't eyeball. This is the
  Google-favored range for a direct answer — long enough to actually explain, short enough
  to be a featured-snippet candidate.
- Plain language for a layperson with no medical background. Define any term you must use.
- Medically accurate and current; educational, not directive. Describe how things
  generally work ("doctors usually…", "most people…") rather than telling the reader what
  to do with their own case. No alarmism.
- **Internal links:** link to the site's existing pages where genuinely on-topic — never
  force one. Use root-relative paths. Available targets:
  - Hubs: `/melanoma`, `/basal-cell-carcinoma`, `/squamous-cell-carcinoma`,
    `/actinic-keratosis`, `/atypical-nevi`, `/prevention`
  - Melanoma deep-dives: `/melanoma/melanoma-stage-meaning`,
    `/melanoma/breslow-depth-explained`, `/melanoma/sentinel-lymph-node-biopsy`,
    `/melanoma/melanoma-treatment-options`, `/melanoma/pathology-report`,
    `/melanoma/what-to-expect-after-diagnosis`, `/melanoma/finding-a-melanoma-specialist`,
    `/melanoma/melanoma-clinical-trials`
  - BCC deep-dives: `/basal-cell-carcinoma/types`, `/basal-cell-carcinoma/biopsy-meaning`,
    `/basal-cell-carcinoma/treatment-options`, `/basal-cell-carcinoma/recovery-after-surgery`,
    `/basal-cell-carcinoma/recurrence-prevention`, `/basal-cell-carcinoma/spread-and-seriousness`,
    `/basal-cell-carcinoma/self-exam-when-to-see-doctor`, `/basal-cell-carcinoma/lifestyle-prevention`
  - SCC deep-dives: `/squamous-cell-carcinoma/early-signs-vs-other-skin-cancers`,
    `/squamous-cell-carcinoma/staging-and-grading`, `/squamous-cell-carcinoma/treatment-options`,
    `/squamous-cell-carcinoma/follow-up-care`, `/squamous-cell-carcinoma/recurrence-and-metastasis-risk`,
    `/squamous-cell-carcinoma/self-skin-checks`, `/squamous-cell-carcinoma/high-risk-locations`,
    `/squamous-cell-carcinoma/prevention`
  - AK deep-dives: `/actinic-keratosis/what-is-ak-vs-skin-cancer`,
    `/actinic-keratosis/treat-now-vs-watch`, `/actinic-keratosis/treatment-options`,
    `/actinic-keratosis/progression-risk-untreated`, `/actinic-keratosis/monitoring-schedule`,
    `/actinic-keratosis/prevention-and-sun-protection`, `/actinic-keratosis/field-therapy-multiple-aks`,
    `/actinic-keratosis/talking-to-your-doctor`
  - Atypical-nevi deep-dives: `/atypical-nevi/what-makes-a-mole-atypical`,
    `/atypical-nevi/warning-signs-of-melanoma-change`, `/atypical-nevi/dermatologist-evaluation-dermoscopy`,
    `/atypical-nevi/when-to-biopsy-or-remove`, `/atypical-nevi/surveillance-schedule`,
    `/atypical-nevi/melanoma-risk-association`, `/atypical-nevi/tracking-changes-over-time`,
    `/atypical-nevi/prevention-and-sun-protection`
  - Other in-section answers on the same page: `/questions-to-ask#<section-id>`
  Confirm any path against `src/pages/` before using it; don't invent routes.
- Aim for 1 internal link per answer on average — some will have two, several will have
  none. Don't repeat the same link in back-to-back answers if a different one fits.
- No external citations in these answers (the deep-dive pages carry the Sources boxes).

## Style guardrails

- Never introduce new `bg-sky/*` / `text-sky` / `from-sky/*` usage — those utilities
  generate no CSS (see CLAUDE.md). Use `teal` / `navy` / `slate` / `ivory`.
- Keep `import` lines intact; `Icon` from `astro-icon/components` is already imported.

## Verify render

1. `npx astro dev status` for the running port (do **not** assume 4321 — it may be 4323).
   Start with `npx astro dev --background` only if nothing is running.
2. `curl -s -o /dev/null -w "%{http_code}\n" http://localhost:<port>/questions-to-ask`
3. `curl -s http://localhost:<port>/questions-to-ask | grep -c "Still need more clarity"`
   — expect the count to equal the number of questions you converted.
4. Spot-check that one answer's text and one internal `href` are present in the HTML.

## Ledger

Re-read `.claude/skills/question-library-answers/ledger.md` at the start of every run and
update it at the end. One row per section; note the per-question count and status
(`not-started` / `drafted-pending-review — DATE` / `published — DATE`).

## Report

Tell the user: which section, how many answers drafted, the URL
(`/questions-to-ask#<section-id>`), that the answers are collapsible and each keeps its
Navigator link, and that the section is awaiting review — no per-section byline or FAQ
schema yet. Don't ask if they want to review now; state it's ready.
