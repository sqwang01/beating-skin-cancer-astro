# Mad Rush Step 3 — Deep Build Specification
## Understand Treatment Options

**Project:** Beating Skin Cancer — Melanoma Navigator
**Source framework:** *Beating Melanoma*, Second Edition (Wang SQ, 2024)
**Role of this module:** Turn Step 3 of the book (MR-3, *Understand Treatment
Options*) into a guided, stage-aware treatment-education experience.

Read `MELANOMA_MEDICAL_GUARDRAILS.md` first — §5 (treatment framing), §2 / §11
(time-sensitive content), §13 (never infer a new clinical rule).

---

# 1. What Step 3 is (and is not)

Step 3 explains **the kind of treatment that generally follows from each melanoma
stage** — surgical margin, sentinel-node discussion, imaging, adjuvant/systemic
therapy — as education for a conversation with the care team.

It does **not**: recommend a treatment, tell a patient a treatment is required or
unnecessary based on their entered data, compute or publish a stage, or add any
clinical rule set. It re-uses the AJCC 8th `tCategoryFor()` rule (approved
2026-09-07 for Step 2) **only to pick which educational screen to show** — same
mechanism, no new computation.

**No summary screen** (removed 2026-09-07, Dr. Wang — "just end it at the
treatment-options page"). Every `tx_*` / `t1` screen is terminal: its continue
button finishes the Mad Rush (`next: 'EXIT'` → `/melanoma/navigator`, firing
`melanoma_step3_completed` + `navigator_completed_mad_rush`). The old summary's
`beyondStage` Stage III / IV explainer was removed with it (it was
physician-reviewed copy — see §4; relocate to `t1` / `tx_*` if it must return).

---

# 2. Files

| File | Role |
| --- | --- |
| `src/data/navigator/step3Treatment.ts` | `STEP3: StepDef` — all copy, flow, routing, doctor questions, `TREATMENT_CONTENT_META`. |
| `src/data/navigator/journey.ts` | `steps: [STEP1, STEP2, STEP3]`. |
| `src/pages/melanoma/navigator/mad-rush/treatment.astro` | renders `<NavJourney journey={MAD_RUSH_JOURNEY} entry="step3" />`. |
| `src/data/navigator/types.ts` | `StepDef.id` widened to include `'step3'`. |
| `src/data/navigator/step2Staging.ts` | Step 2 summary `completeNext: 'NEXT_STEP'` (was `/melanoma/navigator`). |
| `src/data/navigator/types.ts` | `StepDef.summary` made optional (Step 3 has none). |
| `src/components/navigator/NavJourney.astro` | renders `[data-summary-block]` only when `step.summary` is set; per-step `data-enter-route` / `data-step-start` moved onto the `[data-subprogress]` list. |
| `src/scripts/navigator/flow.js` | `stepEntry` read from `[data-subprogress]` (not `[data-summary-block]`); `autoRouteByTCat` invisible-forward no longer fires the bridge screen's continue-button event. |
| `src/scripts/navigator/analytics.js` | allow-lists `melanoma_step3_started`, `melanoma_step3_completed` (dropped `step3_treatment_summary_viewed`). |

**No change** to `store.js` or `medicalRules.ts`.

---

# 3. Flow

```
STEP3.enterRoute — skips t0 on the Step 2 → Step 3 NEXT_STEP jump (Step 2 just
             confirmed the same three fields). First match wins, on recorded
             answer VALUES only (no T-category math here):
               b3 / k0a  in situ | lentigo maligna → tx_stage0
               b3 / k0a  invasive                  → t1
             Nothing recorded (cold direct load) → no match → start: 't0'.

t0  recap  — REACHED ONLY on a cold direct load now. Diagnosis / Breslow (mm) /
             Ulceration, carried from Steps 1–2, editable inline (DIAGNOSIS_PRESETS:
             an in-situ pick sets the invasive-only fields to "N/A", an invasive
             pick clears them — identical to Step 2 k0).
             recap.autoRoute:   b3 / k0a in situ | lentigo maligna → tx_stage0
             recap.emptyNext:   t0cold          (cold direct load, no answers)
             recap.confirmNext / editSaveNext:  t1

t1  info    — carries autoRouteByTCat { breslowKeys, invasionInvasive,
             ulcerationPresent, ulcerationAbsent, routes }. On arrival flow.js
             maps Breslow + ulceration → T category and, if one resolves,
             forwards INVISIBLY:
               T1a, T1b        → tx_IA
               T2a             → tx_IB
               T2b, T3a        → tx_IIA
               T3b, T4a        → tx_IIB
               T4b             → tx_IIC
             If no T resolves, t1 RENDERS AS ITSELF: the general,
             non-stage-specific treatment picture — TERMINAL (finish action
             below). As of 2026-09-08 the ulceration question offers only
             Present / Absent (the "I cannot find it" option was removed — see
             STEP1 spec §C2 / STEP2 spec §11), so for an entered invasive case
             this fall-through now means the Breslow thickness is blank; an
             entered Breslow always resolves a T category and forwards.

t0cold info — "work through Steps 1–2 first / bring your report to your visit".
             Continue → t1 (which renders as the general picture, then finishes).

tx_stage0 / tx_IA / tx_IB / tx_IIA / tx_IIB / tx_IIC
     info   — body paragraphs (margin, SLNB, imaging, adjuvant), CONFIRM_LINE
             closer, print-only doctorQuestions, printLabel. TERMINAL.

TERMINAL (every tx_* and t1-as-itself)
     - continue button = FINISH_LABEL "Finish the Mad Rush", continueEvent
       FINISH_EVENT "melanoma_step3_completed navigator_completed_mad_rush",
       next: 'EXIT' → /melanoma/navigator.
     - No summary screen. The old SUMMARY:step3 ("Your treatment picture" recap +
       beyondStage Stage III/IV explainer) was removed 2026-09-07 (Dr. Wang).
```

`subProgress`: **Treatment options** (single chip; "Your treatment picture" removed).

Engine facts this relies on:
`[data-recap-confirm]` / `[data-recap-edit-save]` run `resolveRoute(autoRoute)`
before `confirmNext` / `editSaveNext`; `[data-info-next]` **and** on-arrival
`show()` run `resolveComputedRoute()` for `autoRouteByTCat`; `NEXT_STEP` resolves
via the (Step 2) summary's `data-next-step-start` **and then through
`entryTargetForScreen()`, which applies the entering step's `data-enter-route`
(`StepDef.enterRoute`) — now read from the `[data-subprogress]` list since Step 3
has no `[data-summary-block]` — this is what carries the Step 2 → Step 3 jump past
`t0`**. `t1` / `tx_stage0` carry `viewEvent: 'melanoma_step3_started'` (NOT `t0` — the
main flow skips it, the cold flow passes t0 → t0cold → t1 straight through) so
the event fires exactly once on every path; the `autoRouteByTCat`
invisible-forward fires only that `viewEvent`, not `t1`'s continue-button
`FINISH_EVENT`.

---

# 4. Approved source mapping (educational — physician confirms)

From the stage-by-stage treatment guidance in *Beating Melanoma* 2nd ed.,
supplied and reviewed by the Editor-in-Chief 2026-09-07. Wording in the UI is
third-person education (GUARDRAILS §5) — never "you need" / "you do not need".

| Screen | Stage / T | Surgical margin | Sentinel node | Imaging / labs | Systemic / adjuvant |
| --- | --- | --- | --- | --- | --- |
| `tx_stage0` | Melanoma in situ (0) | 0.5–1 cm | — | not routinely | — (lentigo maligna alt: imiquimod / radiation when surgery unsuitable) |
| `tx_IA` | T1a / T1b (IA) | ~1 cm | usually not offered; discuss if Breslow ≈0.8 mm, truncated base, or high mitoses | not routinely | none |
| `tx_IB` | T2a (IB) | 1–2 cm (often 1) | discussed & offered | usually not | none |
| `tx_IIA` | T2b / T3a (IIA) | ~1–2 cm (up to 2 mm) / 2 cm or more (2–4 mm) | discussed & offered | usually not | none |
| `tx_IIB` | T3b / T4a (IIB) | ~1–2 cm / 2 cm or more | discussed & offered | generally not | medical oncologist may discuss adjuvant |
| `tx_IIC` | T4b (IIC) | ~2 cm | discussed & offered | **may be recommended** | medical oncologist may discuss adjuvant |

Stage III / IV was covered by the old `summary.beyondStage` block (wide excision
of primary + node surveillance/dissection tradeoff; med-onc-led immunotherapy /
targeted BRAF+MEK / palliative radiation / trials). That block was removed with
the summary on 2026-09-07 (Dr. Wang). The reviewed copy still exists in git
history if it needs to be relocated onto `t1` / the `tx_*` screens.

> **Known wrinkle:** the source text gives ">2 cm" for T3a / T4a but "2 cm" for
> T4b. The UI renders the T3a/T4a figure as "2 cm or more" rather than reproduce a
> figure that reads as inconsistent with T4b. Revisit if the source is corrected.

---

# 5. Guardrail checklist for future edits

- [ ] All treatment strings live in `step3Treatment.ts`; components / `flow.js`
      stay medical-string-free.
- [ ] No screen states "you need" / "you do not need" / "the correct treatment
      is". Negatives are third-person ("guidelines generally do not call for…").
- [ ] Every stage screen ends on `CONFIRM_LINE`.
- [ ] No new rule set in `medicalRules.ts`; Step 3 routes on `tCategoryFor()`
      only and publishes no stage.
- [ ] `TREATMENT_CONTENT_META.status === 'approved'` with a current
      `last_medical_reviewed` + `reviewed_by`. If the review lapses or a newer
      guideline supersedes it → swap the stage screens for a
      `MEDICAL_CONTENT_REQUIRES_CURRENT_REVIEW` placeholder and set `'draft'`.
- [ ] Doctor-question lists stay print-only (`window.print()`), NOT added to
      `hubChecklists.ts` / `careTeamQuestions.ts` (unreviewed for the PDF
      pipeline).
- [ ] No pathology value, stage, or free text reaches `analytics.js` — only the
      allow-listed `melanoma_step3_started` / `melanoma_step3_completed` (plus
      `navigator_completed_mad_rush`) event names.
- [ ] Step 3 stays summary-less: every `tx_*` / `t1` screen is terminal
      (`FINISH_LABEL` / `FINISH_EVENT` → `next: 'EXIT'`). If a Step 3 summary is
      reintroduced, restore `StepDef.summary` as required or keep the
      `NavJourney.astro` presence guard.
