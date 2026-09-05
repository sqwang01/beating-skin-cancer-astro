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

## basal-cell-carcinoma / advanced-bcc (new sub-hub — pharma-sponsorship target)

Sub-hub at `/basal-cell-carcinoma/advanced-bcc/` covering locally advanced + metastatic BCC.
The sub-hub `index.astro` is a pattern-1 hub page. It was reviewed and approved by Dr. Wang on
2026-08-31: byline (`<MedicalReviewer date={lastReviewed} />`, default Editor-in-Chief) +
`lastReviewed = "2026-08-31"` + `medicalReviewJsonLd(canonical, lastReviewed)` added, and the
main BCC hub's placeholder `<div>` card converted to a real `<a href="/basal-cell-carcinoma/advanced-bcc">`
link. Its own Key Topics cards remain unlinked `<div>` placeholders until each spoke is drafted + reviewed.

| Slug / working title | Question the card promises to answer | Status |
|---|---|---|
| (sub-hub) index.astro | Advanced Basal Cell Carcinoma overview + laBCC vs mBCC | published — 2026-08-31 |
| what-advanced-bcc-means | What does "advanced" basal cell carcinoma mean? | published — 2026-08-31 |
| multidisciplinary-workup | How is advanced BCC evaluated before treatment? | published — 2026-08-31 |
| when-surgery-radiation-not-enough | When are surgery and radiation no longer enough? | published — 2026-08-31 |
| hedgehog-pathway-inhibitors | How do hedgehog pathway inhibitors treat advanced BCC? | published — 2026-08-31 |
| managing-hedgehog-inhibitor-side-effects | How are the side effects of hedgehog inhibitors managed? | published — 2026-08-31 |
| immunotherapy-for-advanced-bcc | When is immunotherapy used for advanced BCC? | published — 2026-08-31 |
| neoadjuvant-therapy-before-surgery | Can medication shrink a BCC before surgery? | published — 2026-08-31 |
| clinical-trials-for-advanced-bcc | How do I find a clinical trial for advanced BCC? | published — 2026-08-31 |
| gorlin-syndrome | What is Gorlin syndrome (basal cell nevus syndrome)? | published — 2026-08-31 |
| questions-to-ask-your-care-team | What should I ask my care team about advanced BCC? | published — 2026-08-31 |
| living-with-advanced-bcc | What is the outlook, and what support is available? | published — 2026-08-31 |

All 11 advanced-bcc spokes drafted 2026-08-31 (6 parallel writers, ~2 articles each), reviewed
and approved by Dr. Wang the same day, and published 2026-08-31: each gained
`import MedicalReviewer` + `import { medicalReviewJsonLd }`, `const lastReviewed = "2026-08-31"`,
`<MedicalReviewer date={lastReviewed} />` under the hero subtitle, and
`medicalReviewJsonLd(canonical, lastReviewed)` appended to the `jsonLd` array; the sub-hub
`index.astro`'s 11 placeholder `<div>` Key Topics cards were all converted to real
`<a href="/basal-cell-carcinoma/advanced-bcc/<slug>">` links. Full `astro build` passes; every
page renders the byline and MedicalWebPage JSON-LD.

## squamous-cell-carcinoma / advanced-scc (new sub-hub — built to imitate advanced-bcc)

Sub-hub at `/squamous-cell-carcinoma/advanced-scc/` covering locally advanced + metastatic cutaneous
SCC. Same shape as the advanced-bcc sub-hub: pattern-1 hub page, nested folder, intro splits
**locally advanced SCC** vs **metastatic SCC**, Key Topics card lists 14 planned spoke deep-dives.
The sub-hub `index.astro` was drafted 2026-08-31 in DRAFT phase, then reviewed and approved by
Dr. Wang the same day and published 2026-08-31: byline + `lastReviewed = "2026-08-31"` +
`medicalReviewJsonLd(canonical, lastReviewed)` added, a new linked Key Topics card added to the
main SCC hub (`src/pages/squamous-cell-carcinoma.astro`) pointing here (mirrors the
`basal-cell-carcinoma/index.astro` diff for advanced-bcc), and the 8 reviewed spokes' placeholder
`<div>` cards on the sub-hub converted to real `<a href>` links. The 6 remaining sub-hub cards
(neoadjuvant, transplant/immunosuppressed, chemo/EGFR, clinical trials, questions-to-ask,
living-with) were drafted 2026-09-01, then reviewed, approved, and published 2026-09-01: byline +
`lastReviewed = "2026-09-01"` + `medicalReviewJsonLd` added and their sub-hub cards linked. The
sub-hub is now 15/15 pages published (index + 14 spokes).

| Slug / working title | Question the card promises to answer | Status |
|---|---|---|
| (sub-hub) index.astro | Advanced Squamous Cell Carcinoma overview + laSCC vs mSCC | published — 2026-08-31 |
| what-advanced-scc-means | What does "advanced" squamous cell carcinoma mean? | published — 2026-08-31 |
| high-risk-features | What makes a squamous cell carcinoma "high-risk"? | published — 2026-08-31 |
| perineural-invasion | What does perineural invasion mean for my SCC? | published — 2026-08-31 |
| nodal-metastasis-and-sentinel-node | When does SCC spread to lymph nodes, and what is a sentinel node biopsy? | published — 2026-08-31 |
| multidisciplinary-workup | How is advanced SCC evaluated before treatment? | published — 2026-08-31 |
| when-surgery-radiation-not-enough | When are surgery and radiation no longer enough? | published — 2026-08-31 |
| immunotherapy-for-advanced-scc | How does immunotherapy treat advanced SCC? | published — 2026-08-31 |
| managing-immunotherapy-side-effects | How are the side effects of immunotherapy managed? | published — 2026-08-31 |
| neoadjuvant-immunotherapy-before-surgery | Can immunotherapy shrink an SCC before surgery? | published — 2026-09-01 |
| scc-in-transplant-and-immunosuppressed-patients | Advanced SCC in transplant recipients and immunosuppressed patients | published — 2026-09-01 |
| chemotherapy-and-egfr-targeted-therapy | Where do chemotherapy and EGFR-targeted therapy fit? | published — 2026-09-01 |
| clinical-trials-for-advanced-scc | How do I find a clinical trial for advanced SCC? | published — 2026-09-01 |
| questions-to-ask-your-care-team | What should I ask my care team about advanced SCC? | published — 2026-09-01 |
| living-with-advanced-scc | What is the outlook, and what support is available? | published — 2026-09-01 |

Every spoke: deep-dive pattern-2 shape, `../../../` imports, 4-level breadcrumb, "← Back to
Advanced Squamous Cell Carcinoma" hero link, `[articleJsonLd, breadcrumbsJsonLd, faqJsonLd]`
(no medicalReviewJsonLd), verified PubMed citations + patient resources.

First 8 spokes drafted 2026-08-31 (4 parallel writers, 2 articles each) — `what-advanced-scc-means`,
`high-risk-features`, `perineural-invasion`, `nodal-metastasis-and-sentinel-node`,
`multidisciplinary-workup`, `when-surgery-radiation-not-enough`, `immunotherapy-for-advanced-scc`,
`managing-immunotherapy-side-effects` — then reviewed, approved, and published the same day
(byline + `medicalReviewJsonLd` added, sub-hub cards linked, main SCC hub card added). Slug
note: the `high-risk-features` page ships `title` "What Makes an SCC Tumor High-Risk? | Beating
Skin Cancer" (the verbatim question is 68 chars, over the 60 limit) — full question kept as the H1.

Final 6 spokes drafted 2026-09-01 (3 parallel writers, 2 articles each) — `neoadjuvant-immunotherapy-before-surgery`,
`scc-in-transplant-and-immunosuppressed-patients`, `chemotherapy-and-egfr-targeted-therapy`,
`clinical-trials-for-advanced-scc`, `questions-to-ask-your-care-team`, `living-with-advanced-scc` —
then reviewed and approved by Dr. Wang and published 2026-09-01: each gained the two imports,
`const lastReviewed = "2026-09-01"`, `<MedicalReviewer date={lastReviewed} />` under the hero
subtitle, and `medicalReviewJsonLd(canonical, lastReviewed)` appended to `jsonLd`; the 6 matching
Key Topics cards on the sub-hub `index.astro` were converted to real `<a href>` links. The
advanced-scc sub-hub is now 15/15 pages published (index + 14 spokes). Citations verified via
NCBI efetch; patient-resource URLs curl-verified. `questions-to-ask-your-care-team` and
`living-with-advanced-scc` used the published `advanced-bcc` siblings as structural templates.
Slug/title notes: `neoadjuvant-immunotherapy-before-surgery` → title "Neoadjuvant Immunotherapy
for SCC | Beating Skin Cancer", H1 "Can Immunotherapy Shrink an SCC Before Surgery?";
`scc-in-transplant-and-immunosuppressed-patients` → title "Advanced SCC in Transplant Patients |
Beating Skin Cancer". `neoadjuvant-immunotherapy-before-surgery` and
`scc-in-transplant-and-immunosuppressed-patients` forward-link to `chemotherapy-and-egfr-targeted-therapy`
(sibling-page precedent for cross-linking not-yet-published sub-hub slugs).

PUBLISH phase for these 6 (when Dr. Wang signs off): to each page add
`import MedicalReviewer from '../../../components/MedicalReviewer.astro'`,
`import { medicalReviewJsonLd } from '../../../lib/seo'`, `const lastReviewed = "YYYY-MM-DD"`,
`<MedicalReviewer date={lastReviewed} />` under the hero subtitle `<p>`, and
`medicalReviewJsonLd(canonical, lastReviewed)` appended to the `jsonLd` array; then convert the 6
matching placeholder `<div class="block p-4 bg-sky/5 ...">` cards on the sub-hub `index.astro` to
real `<a href="/squamous-cell-carcinoma/advanced-scc/<slug>" class="block p-4 bg-sky/5 rounded-lg
border border-teal/10 hover:bg-sky/10 transition-colors">` links (keep inner markup). Done
2026-09-01 — the advanced-scc sub-hub is now 15/15 pages published (index + 14 spokes).

## melanoma / advanced-melanoma (new sub-hub — built to match advanced-bcc / advanced-scc)

Sub-hub at `/melanoma/advanced-melanoma/` covering regionally advanced (stage III) + metastatic
(stage IV) melanoma. Same shape as the advanced-bcc / advanced-scc sub-hubs: pattern-1 hub page,
nested folder, intro splits **regionally advanced melanoma (stage III)** vs **metastatic melanoma
(stage IV)**, Key Topics card lists 12 spoke deep-dives. All drafted 2026-08-31 in DRAFT phase,
then reviewed and approved by Dr. Wang and published 2026-09-01 (byline + `lastReviewed` +
`medicalReviewJsonLd` added to all 13 pages, all 12 sub-hub cards linked, and the
`src/pages/melanoma/index.astro` placeholder card converted to a real
`<a href="/melanoma/advanced-melanoma">` link). Spokes ship
`[articleJsonLd, breadcrumbsJsonLd, faqJsonLd, medicalReviewJsonLd(canonical, lastReviewed)]`,
`../../../` imports, 4-level breadcrumb, "← Back to Advanced Melanoma" hero link, verified PubMed
citations + verified patient resources. Full `astro build` passes (93 pages); every page renders
the byline and MedicalWebPage JSON-LD with exactly one `<h1>` and no `bg-sky/*` in the article body.

| Slug / working title | Question the card promises to answer | Status |
|---|---|---|
| (sub-hub) index.astro | Advanced Melanoma overview + stage III vs stage IV | published — 2026-09-01 |
| what-advanced-melanoma-means | What does "advanced" melanoma mean? | published — 2026-09-01 |
| staging-workup-and-imaging | How is advanced melanoma staged and worked up? | published — 2026-09-01 |
| immunotherapy-for-advanced-melanoma | How does immunotherapy treat advanced melanoma? | published — 2026-09-01 |
| targeted-therapy-braf-mek | When is BRAF/MEK targeted therapy used? | published — 2026-09-01 |
| adjuvant-therapy-after-surgery | What is adjuvant therapy, and do I need it after surgery? | published — 2026-09-01 |
| neoadjuvant-immunotherapy | Can immunotherapy be given before surgery? | published — 2026-09-01 |
| managing-immunotherapy-side-effects | How are the side effects of immunotherapy managed? | published — 2026-09-01 |
| melanoma-brain-metastases | What if melanoma has spread to the brain? | published — 2026-09-01 |
| til-therapy-and-newer-options | TIL therapy and other newer options | published — 2026-09-01 |
| clinical-trials-for-advanced-melanoma | How do I find a clinical trial for advanced melanoma? | published — 2026-09-01 |
| questions-to-ask-your-care-team | What should I ask my care team about advanced melanoma? | published — 2026-09-01 |
| living-with-advanced-melanoma | What is the outlook, and what support is available? | published — 2026-09-01 |

Drafting note: launched as 6 parallel writers (2 articles each). Writer A returned normally;
an API outage killed writers B–F mid-run, but 5 of their files had already been written to disk
(`what-advanced-melanoma-means`, `staging-workup-and-imaging`, `immunotherapy-for-advanced-melanoma`,
`managing-immunotherapy-side-effects`, `targeted-therapy-braf-mek`, `adjuvant-therapy-after-surgery`,
`melanoma-brain-metastases` — 7 total incl. Writer A's pair). A stray `</content></invoke>` tail on
`targeted-therapy-braf-mek.astro` was stripped. The remaining 5 spokes (`neoadjuvant-immunotherapy`,
`til-therapy-and-newer-options`, `clinical-trials-for-advanced-melanoma`,
`questions-to-ask-your-care-team`, `living-with-advanced-melanoma`) were written directly in the
main session. Every citation across all 13 pages was verified via NCBI efetch; every patient-resource
URL was fetched and confirmed. One agent cross-link was repointed from the hub to the
`melanoma-brain-metastases` spoke.

Reviewed and approved by Dr. Wang and published 2026-09-01: all 13 pages (index + 12 spokes)
gained `import MedicalReviewer from '../../../components/MedicalReviewer.astro'`,
`import { medicalReviewJsonLd } from '../../../lib/seo'` (the sub-hub `index.astro` uses the same
`../../../` prefix — it lives at `advanced-melanoma/index.astro`, three levels deep, NOT
`../../` as first assumed), `const lastReviewed = "2026-09-01"`,
`<MedicalReviewer date={lastReviewed} />` under the hero subtitle `<p>`, and
`medicalReviewJsonLd(canonical, lastReviewed)` appended to `jsonLd` (sub-hub `jsonLd` is now
`[breadcrumbsJsonLd, medicalReviewJsonLd(canonical, lastReviewed)]`). The sub-hub `index.astro`'s
12 `<div>` Key Topics cards were converted to real `<a href="/melanoma/advanced-melanoma/<slug>">`
links, and the placeholder `<div>` card in `src/pages/melanoma/index.astro` was converted to a real
`<a href="/melanoma/advanced-melanoma">` link (matching the site's `bg-sky/5 ... hover:border-teal/30`
hub-card pattern). Full `astro build` passes (93 pages); every page renders the byline and
MedicalWebPage JSON-LD with exactly one `<h1>`. The advanced-melanoma sub-hub is now 13/13 published.

## squamous-cell-carcinoma (8/8 slots real articles, all published and linked)

| Working title | Question the card promises to answer | Status |
|---|---|---|
| early-signs-vs-other-skin-cancers | What are the early signs of SCC and how is it different from other skin cancers? | published — 2026-08-26 |
| staging-and-grading | How do doctors grade or stage an SCC and why does that matter for treatment? | published — 2026-08-26 |
| treatment-options | What are the main treatment approaches for SCC, and what are the pros and cons of each? | published — 2026-08-26 |
| follow-up-care | What follow-up care is required after SCC treatment? | published — 2026-08-26 |
| recurrence-and-metastasis-risk | What increases the risk of SCC coming back or spreading to lymph nodes or other organs? | published — 2026-08-26 |
| self-skin-checks | How do I perform regular skin checks for SCC and what changes should alert me? | published — 2026-08-26 |
| high-risk-locations | Are there special considerations for SCC in high-risk areas (ears, lips, fingers)? | published — 2026-08-26 |
| prevention | What prevention steps and skin-care practices reduce my chance of getting another SCC? | published — 2026-08-26 |

## atypical-nevi (8/8 slots real articles, all published and linked)

| Working title | Question the card promises to answer | Status |
|---|---|---|
| what-makes-a-mole-atypical | What makes a mole "atypical," and how is it different from a normal mole? | published — 2026-08-27 |
| warning-signs-of-melanoma-change | How can I tell if an atypical mole might be turning into melanoma? | published — 2026-08-27 |
| dermatologist-evaluation-dermoscopy | What does a dermatologist look for when examining atypical moles? | published — 2026-08-27 |
| when-to-biopsy-or-remove | When does an atypical mole need to be biopsied or removed? | published — 2026-08-27 |
| surveillance-schedule | If I have atypical moles, how often should I get my skin checked? | published — 2026-08-27 |
| melanoma-risk-association | Does having atypical moles mean I'm at higher risk for melanoma? | published — 2026-08-27 |
| tracking-changes-over-time | What's the best way to track changes in my moles over time? | published — 2026-08-27 |
| prevention-and-sun-protection | How can I protect my skin and prevent new atypical moles from forming? | published — 2026-08-27 |

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

## actinic-keratosis / pdt (new sub-hub — pharma-sponsorship target, Biofrontera)

Sub-hub at `/actinic-keratosis/pdt/` covering photodynamic therapy (PDT) as an AK field
treatment: mechanism, candidacy, session mechanics, side effects, aftercare, and results.
Same shape as the advanced-bcc / advanced-scc / advanced-melanoma sub-hubs: pattern-1 hub page,
nested folder, Key Topics card lists 10 spoke deep-dives. Unlike the "advanced-X" sub-hubs this
one is NOT a disease-stage hub — it's a single-treatment-modality hub — so its intro splits the
two-step mechanism (photosensitizer application, then light activation) rather than two disease
subtypes. Long-term goal: Biofrontera (Ameluz + BF-RhodoLED, an ALA-PDT system for AK field
treatment) as sponsor. Keep content unbranded and editorially independent — describe "a
photosensitizing agent" and "a light source," never a product name — until the user gives an
explicit go-ahead to pursue sponsorship, per [[project-advanced-bcc-hub]]'s established posture.

The sub-hub `index.astro` was drafted 2026-09-04 in DRAFT phase (no `MedicalReviewer` import, no
`lastReviewed`, no `medicalReviewJsonLd` — `jsonLd` is just `[breadcrumbsJsonLd]`). Citations:
Eisen et al. 2021 AAD AK guidelines (PMID 33820677) and Wiegell et al. 2012 daylight-PDT
international consensus (PMID 22211665), both verified via NCBI efetch; AAD and MSKCC patient
resource URLs curl-verified and WebFetch-confirmed on-topic. Its own Key Topics cards are unlinked
`<div>` placeholders (10 slots) until each spoke is drafted + reviewed. The main AK hub
(`src/pages/actinic-keratosis.astro`) got a new 9th Key Topics card added as an unlinked `<div>`
placeholder pointing conceptually at this sub-hub (not yet a real `<a href>` — that happens at
PUBLISH phase, same as every other sub-hub-index card on this site). The AK hub's existing
"Photodynamic therapy (PDT)" bullet in its Treatment Options section was deliberately left as
plain text (not linked) for the same reason.

| Slug / working title | Question the card promises to answer | Status |
|---|---|---|
| (sub-hub) index.astro | What is PDT, how does it work, and is it right for me? | published — 2026-09-04 |
| what-is-pdt-and-how-it-works | What is photodynamic therapy and how does it work? | published — 2026-09-04 |
| why-choose-pdt | Why might my dermatologist recommend PDT over other AK treatments? | published — 2026-09-04 |
| am-i-a-candidate-for-pdt | Am I a good candidate for photodynamic therapy? | published — 2026-09-04 |
| what-happens-during-a-pdt-session | What happens during a PDT treatment session, step by step? | published — 2026-09-04 |
| preparing-for-your-pdt-appointment | How should I prepare for my PDT appointment? | published — 2026-09-04 |
| pdt-side-effects-and-downtime | What side effects and downtime should I expect after PDT? | published — 2026-09-04 |
| pdt-aftercare-and-recovery | How do I care for my skin after PDT? | published — 2026-09-04 |
| how-many-pdt-sessions-and-results | How many PDT sessions will I need, and what results can I expect? | published — 2026-09-04 |
| managing-discomfort-during-pdt | How is discomfort during PDT managed? | published — 2026-09-04 |
| pdt-safety-and-who-should-avoid-it | Is PDT safe, and who should avoid it? | published — 2026-09-04 |

Reviewed and approved by Dr. Wang and published 2026-09-04: all 11 pages (index + 10 spokes)
gained `import MedicalReviewer from '../../../components/MedicalReviewer.astro'`,
`import { medicalReviewJsonLd } from '../../../lib/seo'`, `const lastReviewed = "2026-09-04"`,
`<MedicalReviewer date={lastReviewed} />` under the hero subtitle `<p>`, and
`medicalReviewJsonLd(canonical, lastReviewed)` appended to `jsonLd`. The sub-hub `index.astro`'s
10 `<div>` Key Topics cards were converted to real `<a href="/actinic-keratosis/pdt/<slug>">`
links, and the AK hub's 9th placeholder `<div>` card in `src/pages/actinic-keratosis.astro` was
converted to a real `<a href="/actinic-keratosis/pdt">` link. Full `astro build` passes (105
pages); every page renders the byline and MedicalWebPage JSON-LD. The PDT sub-hub is now 11/11
published.

## Notes

- "Working title" slugs above are proposals, not committed filenames — fine to rename if a better
  slug fits once the article is drafted, just keep the ledger row in sync.
- The 5 original disease hubs are fully published (8/8 slots each, live and linked). All three
  advanced sub-hubs are now fully published too:
  - advanced-bcc — index + all 11 spokes, published 2026-08-31.
  - advanced-scc — index + all 14 spokes (15/15). First 8 published 2026-08-31; final 6
    (`neoadjuvant-immunotherapy-before-surgery`, `scc-in-transplant-and-immunosuppressed-patients`,
    `chemotherapy-and-egfr-targeted-therapy`, `clinical-trials-for-advanced-scc`,
    `questions-to-ask-your-care-team`, `living-with-advanced-scc`) reviewed, approved, and
    published 2026-09-01 — byline + `medicalReviewJsonLd` added, sub-hub cards linked.
  - advanced-melanoma — index + all 12 spokes (13/13), drafted 2026-08-31, reviewed, approved,
    and published 2026-09-01: byline + `lastReviewed = "2026-09-01"` + `medicalReviewJsonLd`
    added to every page, all 12 sub-hub Key Topics cards linked, and the
    `src/pages/melanoma/index.astro` placeholder card converted to a real
    `<a href="/melanoma/advanced-melanoma">` link.
- Nothing is `drafted-pending-review` anymore — every article across all hubs and sub-hubs is
  published, bylined, and linked, including the PDT sub-hub (11/11, published 2026-09-04). Full
  `astro build` passes at 105 pages.
- 0 pages remain not-started. Every hub is now fully published (8/8 slots live and linked).
  Atypical-nevi hub: all 8/8 drafted 2026-08-27, reviewed and approved by Dr. Wang the same day,
  and published 2026-08-27 — byline (`<MedicalReviewer date={lastReviewed} />`, default
  Editor-in-Chief) + `lastReviewed = "2026-08-27"` + `medicalReviewJsonLd(canonical, lastReviewed)`
  added to each article, and the hub's placeholder `<div>` Key Topics cards in
  `src/pages/atypical-nevi.astro` converted to real `<a href>` links (matching the site-wide
  `bg-sky/5 ... hover:bg-sky/10` hub-card pattern).
  BCC's hub is now fully published (all 8/8
  slots live and linked) as of 2026-08-24. Actinic-keratosis is now fully published (8/8 slots
  live and linked) as of 2026-08-25. Melanoma is now fully published (8/8 slots live and linked)
  as of 2026-08-25 — the 3 remaining cards (Breslow depth, finding a specialist, clinical trials)
  were drafted 2026-08-25, reviewed and approved by the user the same day, and published:
  byline/JSON-LD added and hub cards converted from external-navigator links to real internal
  links (this also fixed the `hhttps://` typo on the clinical trials card). SCC's hub is now fully
  published (8/8 slots live and linked) as of 2026-08-26 — all 8 cards were drafted the same day
  (4 parallel writers, 2 articles each), reviewed and approved by the user, then published:
  byline/JSON-LD added to each article and the hub's placeholder `<div>` cards converted to real
  `<a href>` links (matching the existing `bg-sky/5` hub-card pattern used site-wide).
