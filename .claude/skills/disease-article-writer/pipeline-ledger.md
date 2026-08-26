# Content pipeline ledger

Tracks every hub's "Key Topics" slot. Status values:

- `not-started` — still an unlinked placeholder `<div>` on the hub page, no article file exists.
- `drafted-pending-review` — article file exists and renders, but is NOT linked from the hub yet
  and has no `<MedicalReviewer />` / `lastReviewed` / `medicalReviewJsonld`. Awaiting Dr. Wang's review.
- `published — YYYY-MM-DD` — reviewed by Dr. Wang, byline + JSON-LD added, hub card linked live.

Re-check this file at the start of every disease-article-writer run; update it at the end.

## melanoma (8/8 slots real articles, all published and linked)

| Slug / working title | Status |
|---|---|
| melanoma-treatment-options | published (pre-existing) |
| melanoma-stage-meaning | published (pre-existing) |
| sentinel-lymph-node-biopsy | published (pre-existing) |
| what-to-expect-after-diagnosis | published (pre-existing) |
| pathology-report | published — 2026-08-22 |
| breslow-depth-explained | published — 2026-08-25 |
| finding-a-melanoma-specialist | published — 2026-08-25 |
| melanoma-clinical-trials | published — 2026-08-25 |

## basal-cell-carcinoma

| Slug / working title | Question the card promises to answer | Status |
|---|---|---|
| biopsy-meaning | (pre-existing) | published (pre-existing) |
| types | (pre-existing) | published (pre-existing) |
| treatment-options | (pre-existing) | published — 2026-08-22 |
| recovery-after-surgery | What should I expect during recovery after BCC surgery? | published — 2026-08-24 |
| recurrence-prevention | Can basal cell carcinoma come back after treatment — and how do I prevent it? | published — 2026-08-24 |
| spread-and-seriousness | What is the risk of BCC spreading or becoming serious? | published — 2026-08-24 |
| self-exam-when-to-see-doctor | How do I check my skin for basal cell carcinoma — and when should I see a doctor? | published — 2026-08-24 |
| lifestyle-prevention | What lifestyle or skin-care habits help reduce the chance of another basal cell carcinoma? | published — 2026-08-24 |

## squamous-cell-carcinoma (all 8 slots not-started)

| Working title | Question the card promises to answer | Status |
|---|---|---|
| early-signs-vs-other-skin-cancers | What are the early signs of SCC and how is it different from other skin cancers? | not-started |
| staging-and-grading | How do doctors grade or stage an SCC and why does that matter for treatment? | not-started |
| treatment-options | What are the main treatment approaches for SCC, and what are the pros and cons of each? | not-started |
| follow-up-care | What follow-up care is required after SCC treatment? | not-started |
| recurrence-and-metastasis-risk | What increases the risk of SCC coming back or spreading to lymph nodes or other organs? | not-started |
| self-skin-checks | How do I perform regular skin checks for SCC and what changes should alert me? | not-started |
| high-risk-locations | Are there special considerations for SCC in high-risk areas (ears, lips, fingers)? | not-started |
| prevention | What prevention steps and skin-care practices reduce my chance of getting another SCC? | not-started |

## atypical-nevi (all 8 slots not-started)

| Working title | Question the card promises to answer | Status |
|---|---|---|
| what-makes-a-mole-atypical | What makes a mole "atypical," and how is it different from a normal mole? | not-started |
| warning-signs-of-melanoma-change | How can I tell if an atypical mole might be turning into melanoma? | not-started |
| dermatologist-evaluation-dermoscopy | What does a dermatologist look for when examining atypical moles? | not-started |
| when-to-biopsy-or-remove | When does an atypical mole need to be biopsied or removed? | not-started |
| surveillance-schedule | If I have atypical moles, how often should I get my skin checked? | not-started |
| melanoma-risk-association | Does having atypical moles mean I'm at higher risk for melanoma? | not-started |
| tracking-changes-over-time | What's the best way to track changes in my moles over time? | not-started |
| prevention-and-sun-protection | How can I protect my skin and prevent new atypical moles from forming? | not-started |

## actinic-keratosis (all 8 slots not-started)

| Working title | Question the card promises to answer | Status |
|---|---|---|
| what-is-ak-vs-skin-cancer | What is an actinic keratosis and how is it different from skin cancer? | published — 2026-08-24 |
| treat-now-vs-watch | How do I know whether an AK needs treatment now or can be watched safely? | published — 2026-08-25 |
| treatment-options | What are the treatment options for actinic keratoses and how do I pick the right one? | published — 2026-08-25 |
| progression-risk-untreated | What are the risks of leaving AK untreated — can it turn into skin cancer? | published — 2026-08-25 |
| monitoring-schedule | How often should I get skin exams when I have AKs? | published — 2026-08-25 |
| prevention-and-sun-protection | What skin-care and sun-protection habits help reduce new AKs? | published — 2026-08-25 |
| field-therapy-multiple-aks | What do I do when I have many AKs — does the approach differ? | published — 2026-08-25 |
| talking-to-your-doctor | How do I talk to my doctor about managing AKs over time and monitoring changes? | published — 2026-08-25 |

## Notes

- "Working title" slugs above are proposals, not committed filenames — fine to rename if a better
  slug fits once the article is drafted, just keep the ledger row in sync.
- 16 pages remain not-started across 2 hubs (8 SCC + 8 atypical-nevi). BCC's hub is now fully
  published (all 8/8 slots live and linked) as of 2026-08-24. Actinic-keratosis is now fully
  published (8/8 slots live and linked) as of 2026-08-25. Melanoma is now fully published (8/8
  slots live and linked) as of 2026-08-25 — the 3 remaining cards (Breslow depth, finding a
  specialist, clinical trials) were drafted 2026-08-25, reviewed and approved by the user the same
  day, and published: byline/JSON-LD added and hub cards converted from external-navigator links
  to real internal links (this also fixed the `hhttps://` typo on the clinical trials card).
