/**
 * Mad Rush — Step 2: Confirm Your Melanoma Stage.
 *
 * Rebuilt as the second half of the merged Mad Rush journey (see journey.ts).
 * Step 1 and Step 2 render into one page, so every pathology answer the patient
 * recorded in Step 1 is still in memory here. Step 2 therefore does NOT re-ask
 * the diagnosis, Breslow thickness, or ulceration — it opens with a `recap`
 * screen that echoes those Step 1 answers back for a single confirmation, then
 * spends its screens on the two things the pathology report does not cover:
 * the lymph nodes (N) and distant spread (M).
 *
 * Stage 0 skip (`k0.autoRoute` + the k0a routing below): when Step 1's diagnosis
 * is melanoma in situ / lentigo maligna the patient is already effectively Stage
 * 0 — they still see the k0 recap to confirm or inline-correct what Step 1
 * recorded, then every Step 2 question screen is bypassed and they land straight
 * on the "Your stage picture" summary. There is nothing for N or M to add once
 * the disease is in situ.
 *
 * No "T — your original tumor" education screen (removed 2026-09-07, Dr. Wang):
 * the recap (k0) and the summary already carry what Breslow thickness and
 * ulceration do; there is no standalone T screen. The IA–IIC breakdown table
 * lives on the summary (`summary.stageEstimate`).
 *
 * T1a early exit (product decision 2026-09-07, Dr. Wang; k2's `autoRouteByTCat`):
 * a thin (<0.8 mm), non-ulcerated invasive melanoma is T1a → Stage IA, and a
 * sentinel lymph node biopsy is generally not part of its staging. The flow
 * shows the recap and the doctor-stage anchor, then routes straight to the stage
 * picture — skipping the k2 bridge and the N and M screens. The route is
 * resolved on entry to `k2` so that screen never paints for a T1a case. The
 * route `record`s `{ T1a: 'seen' }` so the summary's stage band + estimate
 * resolve to Stage IA and add the near-cutoff / transected-base sentinel-node
 * caveat, and carries the three T1a doctor questions on its `questions`.
 * Suppressed when a doctor has reported Stage II or higher, so a conflicting
 * case still walks the full flow.
 *
 * T2a–T4b early exit (product decision 2026-09-07, Dr. Wang; STEP2 spec §16):
 * the same early exit for a thicker invasive melanoma once Breslow thickness and
 * ulceration are known — T2a/T2b/T3a/T3b/T4a/T4b → an educational Stage
 * IB/IIA/IIB/IIC. It also skips the k2 bridge and the N and M screens.
 * The route `record`s `{ earlyStage: 'seen' }`. The one difference from T1a: a
 * sentinel lymph node biopsy IS usually part of staging here, so the summary
 * shows the sub-group as PROVISIONAL (`estimateStageGroup()` with slnb unknown)
 * with a caveat — a negative sentinel node keeps the stage, a positive node
 * moves it to Stage III, and distant spread found on imaging moves it to Stage
 * IV. Suppressed when a doctor has reported Stage III or IV.
 *
 * "Yes, a doctor told me my stage" early exit (product decision 2026-09-07,
 * Dr. Wang): if the patient answers "Yes" on k1, that clinician-assigned stage
 * is the one that counts and the Navigator does not try to re-work it — the flow
 * goes straight from k1 to the "Your stage picture" summary, skipping the whole
 * k2 → N → M track. The standalone "what stage were you told?" (`k1a`) and
 * "clinical or pathologic?" (`k1b`) screens were removed with it: the summary
 * tells the patient their physician confirms the exact stage, its sub-stage, and
 * whether it is clinical or pathologic. "No" / "I'm not sure" still walk the
 * full k2 → N → M flow.
 *
 * Flow shape:
 *   k0    recap of the Step 1 pathology answers  (cold entry → k0cold capture)
 *   k1    the anchor: has a doctor already given a stage? "Yes" → straight to the
 *         stage picture; "No" / "I'm not sure" → k2
 *   k2    bridge — what is left to confirm (invasive, no early exit). Carries
 *         `autoRouteByTCat`: a T1a case, or a T2a–T4b case once Breslow +
 *         ulceration are known, is routed past k2 on entry — the k2 screen
 *         never paints — straight to the stage picture, also skipping N/M.
 *         The summary carries the sub-stage readout. T1a → Stage IA (settled)
 *         with the near-cutoff / transected-base caveat; T2a–T4b → Stage
 *         IB/IIA/IIB/IIC (provisional) with the "negative keeps it, positive →
 *         III, distant on imaging → IV" caveat.
 *   N1–N3 invasive node track: node found? → sentinel node status → nearby skin
 *   M1–M3 distant-spread track: distant spread? → imaging
 *   S     "Your stage picture": the worded band, the educational IA–IIC estimate
 *         for a node-negative Stage I/II case, the two-box summary + questions
 *
 * Guardrails (GUARDRAILS §2, §4, §6, §13 / STEP2 spec §2, §16, §23, §30):
 *   - The summary shows a COARSE worded band — Stage 0 / Stage I–II / Stage III
 *     / Stage IV — from the broad answer pattern, always with a review notice
 *     and "your physician confirms the exact stage."
 *   - For a node-negative (or node-not-needed) Stage I/II case with a Breslow
 *     thickness and ulceration on file, the summary additionally shows an
 *     EDUCATIONAL sub-group (IA–IIC) from `estimateStageGroup()` in
 *     medicalRules.ts — approved 2026-09-07 against AJCC 8th, gated behind
 *     `STAGING_RULES_ENABLED`, and always labelled an estimate your physician
 *     confirms. Every other case (Stage 0/III/IV, missing pathology detail)
 *     falls back to the coarse band. See `summary.stageEstimate`.
 *   - The T1a early-exit summary uses the same `estimateStageGroup()` result
 *     (slnb treated as not-needed → `confirmed` Stage IA) plus one extra
 *     `caveats` line: a sentinel lymph node biopsy may still be discussed near
 *     the 0.8 mm cutoff or with a transected biopsy base — negative keeps it
 *     Stage IA, positive moves it to Stage III. No new medical rule: the T
 *     category and Stage IA come from the already-approved AJCC 8th tables.
 *   - The T2a–T4b early-exit summary uses the same `estimateStageGroup()` result
 *     with slnb left unknown → `provisional` Stage IB/IIA/IIB/IIC, plus a
 *     `caveats` line that a sentinel lymph node biopsy is usually part of
 *     staging so the sub-stage is not final: negative keeps it, a positive node
 *     moves it to Stage III, distant spread on imaging to Stage IV. Same
 *     already-approved AJCC 8th tables; no new rule.
 *   - A stage a doctor has already assigned is deferred to: answering "Yes" on
 *     k1 routes straight to the summary with no further staging questions. The
 *     Navigator no longer records which stage was given (the k1a / k1b screens
 *     were removed 2026-09-07); the summary still shows the coarse worded band /
 *     educational estimate from the Step 1 pathology answers, always labelled an
 *     estimate the physician confirms, and never claims to be the doctor's stage.
 *   - "Unknown" is first-class everywhere; never read as N0 or M0.
 *   - Non-cutaneous melanoma left Step 1 already; if a user still reaches here
 *     with an unclear diagnosis they are routed to confirm it with a clinician.
 */

import type { StepDef } from './types';
import { MEDICAL_CONTENT_REQUIRES_CURRENT_REVIEW } from './medicalRules';

/**
 * Shared answer→estimate-input mappings, used by the summary `stageEstimate`
 * block and the `k2.autoRouteByTCat` early-exit gate. Each is an array of
 * `when` maps, OR-matched, so a Step 1 answer (`b3` / `c1` / `c2`) or its Step 2
 * cold-entry equivalent (`k0a` / `k0b` / `k0c`) can feed the same input.
 */
const BRESLOW_KEYS = ['c1', 'k0b'];
const INVASION_IN_SITU = [{ b3: ['in_situ', 'lentigo_maligna'] }, { k0a: ['in_situ'] }];
const INVASION_INVASIVE = [{ b3: ['invasive'] }, { k0a: ['invasive'] }];
const ULCERATION_PRESENT = [{ c2: ['present'] }, { k0c: ['present'] }];
const ULCERATION_ABSENT = [{ c2: ['absent'] }, { k0c: ['absent'] }];

/**
 * Inline diagnosis correction on the k0 recap (product decision 2026-09-07,
 * Dr. Wang — supersedes the earlier "Change the diagnosis" link that routed the
 * patient back through k0a and off this page). The diagnosis dropdown writes
 * `b3`; because in situ vs invasive changes which pathology fields apply, the
 * pick also runs these presets: an in-situ / lentigo maligna pick sets the
 * invasive-only fields (`c1`–`c4`, `c6`) to "N/A" — mirroring Step 1's
 * `IN_SITU_FIELD_PRESETS` — and an invasive pick clears them (`null`) so the
 * recap's Breslow + ulceration rows are re-entered here. The Stage 0 skip still
 * runs off `k0.autoRoute` on Save, exactly as the confirm button does.
 */
const INSITU_NA = 'N/A — melanoma in situ';
const INSITU_PATH_PRESETS: Record<string, string | null> = {
  c1: INSITU_NA,
  c2: INSITU_NA,
  c3: INSITU_NA,
  c4: INSITU_NA,
  c6: INSITU_NA,
};
const DIAGNOSIS_PRESETS: Record<string, Record<string, string | null>> = {
  in_situ: INSITU_PATH_PRESETS,
  lentigo_maligna: INSITU_PATH_PRESETS,
  invasive: { c1: null, c2: null, c3: null, c4: null, c6: null },
};

/**
 * The neutral UX-safety consistency checks (STEP2 spec §28) were removed
 * 2026-09-07 (Dr. Wang) together with the k1a / k1b doctor-stage screens: every
 * rule compared a doctor-reported stage (`k1a`) against the pathology / node /
 * spread answers, and answering "Yes" on k1 now routes straight to the summary
 * without capturing that stage, so there is nothing left for the checks to
 * compare.
 */

const STAGE3_NODE_NOTE =
  'A lymph node with melanoma places staging in the Stage III group when there is no distant spread. Your melanoma specialist determines the subgroup (IIIA–IIID) from the tumor and node details together.';

export const STEP2: StepDef = {
  id: 'step2',
  phase: 'mad-rush',
  number: 2,
  total: 4,
  slug: 'stage',

  metaTitle: 'Step 2: Confirm Your Melanoma Stage | Beating Skin Cancer',
  metaDescription:
    'Building on your pathology report, this step confirms the two pieces it does not cover — lymph nodes and distant spread — and shows the stage range your melanoma most likely falls in, with the questions to confirm it with your doctor.',

  heroKicker: 'Mad Rush • Step 2 of 4',
  heroTitle: 'Step 2 — Confirm Your Melanoma Stage',
  heroSubtitle:
    'Your pathology report already describes the original tumor. This step confirms what it does not cover — the lymph nodes and any distant spread — and shows the stage range that points to.',
  backHref: '/melanoma/navigator/mad-rush',
  backLabel: '← Back to the Mad Rush map',
  exitHref: '/melanoma/navigator/mad-rush',

  contextualDisclaimer:
    'This Navigator does not diagnose or stage melanoma. Every stage, sub-stage, and range shown here — including the Stage I/II estimate on this summary — is educational only and may not be correct for your case. Only your treating physician can assign your actual stage, its sub-stage, and whether it is clinical or pathologic. Confirm anything you see here with your medical team before you rely on it.',

  start: 'k0',

  // Stage 0 skip: an in-situ / lentigo maligna diagnosis still sees the k0
  // verification recap first (so the patient can confirm or correct what Step 1
  // recorded, using the same inline edit window as every other case); on confirm
  // — or after an inline correction — k0's `autoRoute` sends it straight to the
  // stage picture, past every question screen. (Cold entry with no Step 1
  // answers is handled on k0a.)

  subProgress: [
    { key: 'report', label: 'Your report' },
    { key: 'anchor', label: 'Stage from your doctor' },
    { key: 'nodes', label: 'Lymph nodes (N)' },
    { key: 'distant', label: 'Distant spread (M)' },
    { key: 'picture', label: 'Your stage picture' },
  ],

  screens: [
    /* ------------------------------------------------ RECAP OF STEP 1 */
    {
      id: 'k0',
      kind: 'recap',
      spKey: 'report',
      viewEvent: 'melanoma_step2_started',
      // In-situ / lentigo maligna is Stage 0 — nothing for N or M to add — so a
      // confirmed (or inline-corrected) recap routes straight to the stage
      // picture instead of the doctor-stage anchor. Evaluated on the confirm and
      // Save buttons, never on entry, so the recap always paints first.
      autoRoute: [
        { when: { b3: ['in_situ'] }, next: 'SUMMARY:step2' },
        { when: { b3: ['lentigo_maligna'] }, next: 'SUMMARY:step2' },
        { when: { k0a: ['in_situ'] }, next: 'SUMMARY:step2' },
      ],
      title: 'What your pathology report shows',
      body: [
        'These are the answers you recorded in Step 1 from your pathology report. The diagnosis, Breslow thickness, and ulceration set the <strong>T</strong> part of staging; the rest are extra detail. Check they still match before we continue.',
      ],
      recap: {
        rows: [
          // Diagnosis is corrected inline like every other row: the dropdown
          // writes `b3`, `DIAGNOSIS_PRESETS` keeps the invasive-only fields
          // consistent with the pick, and `k0.autoRoute` still sends an in-situ
          // pick straight to the stage picture on Save. (Supersedes the earlier
          // "Change the diagnosis" link, which routed back through k0a and pulled
          // the patient off this page.)
          {
            label: 'Diagnosis',
            from: ['b3', 'k0a'],
            edit: {
              key: 'b3',
              control: 'select',
              options: [
                { value: 'in_situ', label: 'Melanoma in situ' },
                { value: 'lentigo_maligna', label: 'Lentigo maligna' },
                { value: 'invasive', label: 'Invasive melanoma' },
              ],
              presetsByValue: DIAGNOSIS_PRESETS,
            },
          },
          {
            label: 'Breslow thickness (mm)',
            from: ['c1', 'k0b'],
            edit: { key: 'c1', control: 'text', placeholder: 'e.g. 1.2' },
          },
          {
            label: 'Ulceration',
            from: ['c2', 'k0c'],
            edit: {
              key: 'c2',
              control: 'select',
              options: [
                { value: 'present', label: 'Present' },
                { value: 'absent', label: 'Absent / not identified' },
                { value: 'unknown', label: 'I can’t find it' },
              ],
            },
          },
          {
            label: 'Mitotic rate',
            from: ['c3'],
            edit: { key: 'c3', control: 'text', placeholder: 'e.g. 2/mm²' },
          },
          {
            label: 'Lymphovascular invasion',
            from: ['c4'],
            edit: {
              key: 'c4',
              control: 'select',
              options: [
                { value: 'present', label: 'Yes' },
                { value: 'absent', label: 'No' },
                { value: 'unknown', label: 'I don’t know' },
              ],
            },
          },
          {
            label: 'Nerve involvement / neurotropism',
            from: ['c6'],
            edit: {
              key: 'c6',
              control: 'select',
              options: [
                { value: 'present', label: 'Yes' },
                { value: 'absent', label: 'No' },
                { value: 'unknown', label: 'I don’t know' },
              ],
            },
          },
          {
            label: 'Biopsy margins',
            from: ['c7'],
            edit: {
              key: 'c7',
              control: 'select',
              options: [
                { value: 'positive', label: 'Positive / involved' },
                { value: 'negative', label: 'Negative / clear' },
                { value: 'transected', label: 'Transected / extends to an edge' },
                { value: 'cannot_tell', label: 'I cannot tell' },
                { value: 'not_stated', label: 'The report does not say' },
              ],
            },
          },
        ],
        emptyNext: 'k0cold',
        confirmLabel: 'Yes — that matches my report',
        confirmNext: 'k1',
        changeLabel: 'I need to correct something',
        editSaveNext: 'k1',
        editSaveLabel: 'Save changes',
        editCancelLabel: 'Cancel',
      },
    },
    {
      id: 'k0cold',
      kind: 'info',
      spKey: 'report',
      title: 'Let’s capture three things from your report',
      body: [
        'We need three items from your pathology report: the diagnosis, the Breslow thickness, and whether the tumor is ulcerated. Have the report handy and we’ll go through them one at a time.',
      ],
      continueLabel: 'Start',
      next: 'k0a',
    },
    {
      id: 'k0a',
      kind: 'decision',
      spKey: 'report',
      title: 'Diagnosis',
      prompt: 'Does your report describe melanoma in situ or invasive melanoma?',
      choices: [
        { value: 'in_situ', label: 'Melanoma in situ / lentigo maligna', next: 'SUMMARY' },
        { value: 'invasive', label: 'Invasive melanoma', next: 'k0b' },
        { value: 'unknown', label: 'I’m not sure', reveal: 'k0a_unknown' },
      ],
      notes: [
        {
          id: 'k0a_unknown',
          tone: 'action',
          body: [
            'Ask your dermatologist to confirm whether the melanoma is in situ or invasive — it changes which staging path applies. You can keep going with what you know.',
          ],
          doctorQuestions: ['Is my melanoma in situ or invasive?'],
          continue: { label: 'Continue', next: 'k1' },
        },
      ],
    },
    {
      id: 'k0b',
      kind: 'field',
      spKey: 'report',
      title: 'Breslow thickness',
      body: ['Look for “Breslow thickness” or “Breslow depth,” written in millimeters.'],
      field: {
        key: 'breslow',
        label: 'Breslow thickness (mm) — leave blank if you don’t have it',
        type: 'decimal',
        placeholder: 'e.g. 1.2',
        help: 'The Navigator uses this, with ulceration, only for an educational Stage I/II estimate on the summary. Your physician assigns the official stage.',
      },
      notes: [
        {
          id: 'k0b_missing',
          tone: 'action',
          body: ['If you can’t find it, note it as a question for your doctor and continue.'],
          doctorQuestions: ['What is my Breslow thickness, and what T category does it fall into?'],
        },
      ],
      continueLabel: 'Continue',
      next: 'k0c',
    },
    {
      id: 'k0c',
      kind: 'decision',
      spKey: 'report',
      title: 'Ulceration',
      prompt: 'What does your report say about ulceration?',
      choices: [
        { value: 'present', label: 'Present' },
        { value: 'absent', label: 'Absent / not identified' },
        { value: 'unknown', label: 'I can’t find it' },
      ],
      next: 'k1',
    },

    /* ---------------------------------------------------- THE ANCHOR */
    {
      id: 'k1',
      kind: 'decision',
      spKey: 'anchor',
      title: 'Has a doctor already told you your melanoma stage?',
      body: [
        'If so, that stage is the one that counts — the Navigator never tries to re-work it. Answer “Yes” and we take you straight to your stage picture; the exact stage, its sub-stage, and whether it is clinical or pathologic are all things your physician confirms with you.',
      ],
      choices: [
        { value: 'yes', label: 'Yes', next: 'SUMMARY', event: 'step2_doctor_stage_question_completed' },
        { value: 'no', label: 'No', next: 'k2', event: 'step2_doctor_stage_question_completed', status: 'waiting' },
        { value: 'unsure', label: 'I’m not sure', next: 'k2', event: 'step2_doctor_stage_question_completed', status: 'waiting' },
      ],
    },

    /* ----------------------------------------------------
     * EARLY EXITS — no standalone screen. `k2.autoRouteByTCat` routes a T1a case
     * (records `{ T1a: 'seen' }`) or a T2a–T4b case (records `{ earlyStage:
     * 'seen' }`) straight to the stage picture. The summary's stage band +
     * estimate resolve from that token — Stage IA (settled) for T1a, Stage
     * IB/IIA/IIB/IIC (provisional) for T2a–T4b — and show the matching
     * `stageEstimate.caveats` entry; each route's doctor questions ride along on
     * its `questions`. The IA–IIC breakdown table and the T explainer that once
     * lived on a standalone "T — your original tumor" screen now live only on
     * the summary (`summary.stageEstimate`), removed 2026-09-07 (Dr. Wang).
     * ---------------------------------------------------- */

    /* ---------------------------------------------------- BRIDGE (invasive only) */
    {
      id: 'k2',
      kind: 'info',
      spKey: 'nodes',
      title: 'What’s left to confirm',
      body: [
        'Your pathology report already describes the original tumor (<strong>T</strong>) — its <strong>Breslow thickness</strong> (how deep the melanoma reaches) and whether the surface is <strong>ulcerated</strong>. Two things it doesn’t cover still shape the overall stage:',
        '<strong>N — the lymph nodes.</strong> Whether melanoma has reached a nearby lymph node or the skin around it.',
        '<strong>M — metastasis.</strong> Whether melanoma has been found in a distant part of the body.',
        'For most invasive melanomas — anything but the very thinnest — a sentinel lymph node biopsy is part of staging, and <strong>your Stage I or II is not final until that node is confirmed clear</strong>. A positive node moves the stage to III.',
        'We’ll go through those now, then show you the range they point to.',
      ],
      // Early exits: an invasive melanoma whose Breslow thickness + ulceration
      // resolve to a T category skips this bridge and the N and M screens,
      // routing straight to the stage picture. `flow.js` resolves the route on
      // ENTRY to k2 (as well as on the Continue button), so k2 never paints for
      // an early-exit case; the IA–IIC table + T explainer are reproduced on the
      // summary. Two routes:
      //   T1a (<0.8 mm, no ulceration) → records `{ T1a: 'seen' }`; summary
      //     shows Stage IA (settled) + the near-cutoff / transected-base caveat.
      //   T2a–T4b → records `{ earlyStage: 'seen' }`; summary shows Stage
      //     IB/IIA/IIB/IIC (provisional) + the "a sentinel node biopsy is still
      //     expected; negative keeps it, positive → III, distant → IV" caveat.
      // Each route's `questions` folds in what a standalone screen would ask.
      // (A doctor-reported stage no longer suppresses these routes: as of
      // 2026-09-07 answering "Yes" on k1 routes straight to the summary and k2 is
      // never reached, so the `unless: { k1a: … }` guards were dropped with the
      // k1a / k1b screens.)
      autoRouteByTCat: {
        breslowKeys: BRESLOW_KEYS,
        invasionInvasive: INVASION_INVASIVE,
        ulcerationPresent: ULCERATION_PRESENT,
        ulcerationAbsent: ULCERATION_ABSENT,
        routes: [
          {
            tCategory: ['T1a'],
            next: 'SUMMARY',
            record: { T1a: 'seen' },
            questions: [
              'My melanoma is T1a — do you recommend a sentinel lymph node biopsy, or is it thin enough that one is not needed?',
              'Was the base of my biopsy transected, and does that change whether a sentinel lymph node biopsy should be considered?',
              'If I had a sentinel lymph node biopsy and it came back negative, would my stage stay IA?',
            ],
          },
          {
            // T2a–T4b early exit (product decision 2026-09-07, Dr. Wang; STEP2
            // spec §16). A thicker invasive melanoma with a known Breslow
            // thickness + ulceration status resolves to T2a/T2b/T3a/T3b/T4a/T4b
            // → an educational Stage IB/IIA/IIB/IIC. As with T1a, the N and M
            // question screens add nothing the summary cannot state, so route
            // straight to the stage picture. The difference from T1a: for these
            // tumors a sentinel lymph node biopsy is usually part of staging, so
            // the summary shows the sub-stage as PROVISIONAL (estimateStageGroup
            // with slnb unknown) with the "negative → same stage, positive →
            // Stage III, distant spread on imaging → Stage IV" caveat. No new
            // medical rule — the T category and the IB–IIC groupings are the
            // already-approved AJCC 8th tables in medicalRules.ts.
            tCategory: ['T2a', 'T2b', 'T3a', 'T3b', 'T4a', 'T4b'],
            next: 'SUMMARY',
            record: { earlyStage: 'seen' },
            questions: [
              'Based on my melanoma’s Breslow thickness and ulceration, what stage am I right now, and is it a clinical or a pathologic stage?',
              'Do you recommend a sentinel lymph node biopsy to complete my staging, and when would it happen?',
              'If the sentinel lymph node is negative, does my stage stay the same? If it is positive, does it become Stage III?',
              'Do I need imaging such as a CT or PET/CT scan, and would melanoma found elsewhere make this Stage IV?',
            ],
          },
        ],
      },
      continueLabel: 'Continue',
      continueEvent: 'step2_t_section_completed',
      doctorQuestions: [
        'Is my stage settled now, or does it only become final after the sentinel lymph node result?',
      ],
      learnMore: [{ label: 'What your melanoma stage means', href: '/melanoma/melanoma-stage-meaning' }],
      next: 'N1',
    },

    /* ------------------------------------------- INVASIVE — NODES (N) */
    {
      id: 'N1',
      kind: 'decision',
      spKey: 'nodes',
      title: 'N — lymph nodes',
      body: [
        'Melanoma can travel from the original tumor to a nearby lymph node. That can show up on a physical exam, on imaging, or only under the microscope after a sentinel lymph node biopsy.',
      ],
      prompt: 'Has a doctor told you that melanoma was found in a lymph node?',
      choices: [
        { value: 'yes', label: 'Yes', next: 'N1how' },
        { value: 'no', label: 'No', next: 'N2' },
        { value: 'unsure', label: 'I’m not sure', next: 'N2' },
      ],
    },
    {
      id: 'N1how',
      kind: 'decision',
      spKey: 'nodes',
      title: 'How was the lymph node finding made?',
      body: ['Recorded as background information. The Navigator does not assign an N category from it.'],
      choices: [
        { value: 'slnb', label: 'Sentinel lymph node biopsy', next: 'Npos' },
        { value: 'palpable', label: 'A lymph node I or my doctor could feel', next: 'Npos' },
        { value: 'imaging', label: 'Imaging', next: 'Npos' },
        { value: 'other_surgery', label: 'Another biopsy or surgery', next: 'Npos' },
        { value: 'unsure', label: 'I’m not sure', next: 'Npos' },
      ],
    },
    {
      id: 'Npos',
      kind: 'info',
      spKey: 'nodes',
      title: 'A positive lymph node moves staging to the Stage III range',
      body: [
        'Melanoma found in a regional lymph node means the disease involves the lymphatic system near the original tumor. In the staging framework described in the book, this corresponds to <strong>Stage III</strong> when there is no distant spread — regardless of how thick the original tumor was.',
        'Stage III has four subgroups (IIIA–IIID). The Navigator does not work out the subgroup — that depends on details of the tumor and the nodes that your melanoma specialist puts together.',
      ],
      medicalReviewNotice: MEDICAL_CONTENT_REQUIRES_CURRENT_REVIEW,
      doctorQuestions: [
        'Which Stage III subgroup (IIIA–IIID) am I, and what determines that?',
        'What treatment options — including adjuvant therapy — apply to my situation?',
        'What follow-up and imaging schedule do you recommend?',
      ],
      learnMore: [{ label: 'What your melanoma stage means', href: '/melanoma/melanoma-stage-meaning' }],
      continueLabel: 'Continue to distant spread',
      continueEvent: 'step2_n_section_completed',
      next: 'M1',
    },
    {
      id: 'N2',
      kind: 'decision',
      spKey: 'nodes',
      title: 'Sentinel lymph node biopsy',
      body: [
        'A sentinel lymph node biopsy checks the first lymph node(s) melanoma would be most likely to reach. It is how melanoma in a node is often found when nothing could be felt on an exam.',
      ],
      prompt: 'Where are you with a sentinel lymph node biopsy?',
      choices: [
        { value: 'negative', label: 'It was done and was negative', next: 'N2neg' },
        { value: 'positive', label: 'It was done and was positive', next: 'Npos' },
        { value: 'scheduled', label: 'It is scheduled', next: 'N2pending', status: 'waiting' },
        { value: 'considering', label: 'My team and I are still deciding', next: 'N2pending', status: 'waiting' },
        { value: 'not_needed', label: 'My doctor said I do not need one', next: 'N2none' },
        { value: 'not_discussed', label: 'It hasn’t been discussed yet', next: 'N2explain' },
        { value: 'dont_know', label: 'I don’t know what this is', next: 'N2explain' },
      ],
    },
    {
      id: 'N2explain',
      kind: 'info',
      spKey: 'nodes',
      viewEvent: 'step2_slnb_education_viewed',
      title: 'What a sentinel lymph node biopsy is',
      body: [
        'When melanoma cells leave the original tumor, the first place they usually travel is a nearby lymph node — the “sentinel” node. A sentinel lymph node biopsy removes that node, or a small group, so a pathologist can look for melanoma cells under the microscope.',
        'It is usually done at the same time as the definitive surgery. It is mainly a staging test: it does not treat the melanoma, but a positive result changes the stage and the options your team discusses.',
        'Not everyone with melanoma needs one. Whether it applies to you depends on the tumor’s thickness and other features — that is a conversation for your surgeon or melanoma specialist. If it is recommended and done, your Stage I or II is not considered final until that node comes back clear.',
      ],
      medicalReviewNotice: MEDICAL_CONTENT_REQUIRES_CURRENT_REVIEW,
      learnMore: [{ label: 'Sentinel lymph node biopsy', href: '/melanoma/sentinel-lymph-node-biopsy' }],
      doctorQuestions: [
        'Given my melanoma’s thickness and features, do you recommend a sentinel lymph node biopsy?',
        'What would a positive or a negative result change?',
      ],
      continueLabel: 'Continue',
      next: 'N3',
    },
    {
      id: 'N2neg',
      kind: 'info',
      spKey: 'nodes',
      title: 'A negative sentinel lymph node',
      body: [
        'A negative sentinel lymph node means melanoma was not found in the node(s) that were sampled. That is reassuring — it means the disease most likely has not reached the regional lymph nodes.',
        'Your overall stage still depends on the original tumor’s features (thickness, ulceration). A negative node generally keeps staging in the <strong>Stage I–II</strong> range described in the book, which your physician confirms.',
      ],
      medicalReviewNotice: MEDICAL_CONTENT_REQUIRES_CURRENT_REVIEW,
      continueLabel: 'Continue',
      next: 'N3',
    },
    {
      id: 'N2pending',
      kind: 'info',
      spKey: 'nodes',
      title: 'Your stage is still provisional',
      body: [
        'Until the sentinel lymph node result is back, part of the staging picture is missing. Doctors call this a <strong>clinical</strong> stage — the working stage before surgery and node results are in.',
        'If the sentinel node is negative, staging usually stays in the Stage I–II range based on the tumor. If it is positive, staging moves to <strong>Stage III</strong>. Your physician sets the final (pathologic) stage afterward.',
      ],
      medicalReviewNotice: MEDICAL_CONTENT_REQUIRES_CURRENT_REVIEW,
      doctorQuestions: [
        'After my sentinel lymph node biopsy, what will my stage be if it is negative, and if it is positive?',
        'When will the result be back, and who will go over it with me?',
      ],
      continueLabel: 'Continue',
      next: 'N3',
    },
    {
      id: 'N2none',
      kind: 'info',
      spKey: 'nodes',
      title: 'No sentinel lymph node biopsy planned',
      body: [
        'Your doctor has decided a sentinel lymph node biopsy is not needed in your case — often because the tumor is thin enough that the chance of a positive node is low, or because another factor makes it unhelpful.',
        'This is most common for the thinnest melanomas — under about 0.8 mm with no ulceration. If your Breslow thickness is close to that cutoff, or your biopsy report notes the deep edge was transected or a deep margin was involved, it is reasonable to ask whether a sentinel lymph node biopsy should still be considered.',
        'Staging then rests on the original tumor’s features, your physical exam, and any imaging. A case with no lymph node involvement and no distant spread sits in the <strong>Stage I–II</strong> range, which your physician confirms.',
      ],
      medicalReviewNotice: MEDICAL_CONTENT_REQUIRES_CURRENT_REVIEW,
      doctorQuestions: [
        'Why is a sentinel lymph node biopsy not recommended for me?',
        'Given my exact Breslow thickness and biopsy margins, is a sentinel lymph node biopsy still worth considering?',
      ],
      continueLabel: 'Continue',
      next: 'N3',
    },
    {
      id: 'N3',
      kind: 'decision',
      spKey: 'nodes',
      title: 'Melanoma in nearby skin or tissue',
      body: [
        'Sometimes melanoma shows up in the skin or tissue between the original tumor and the lymph nodes, separate from the main spot.',
      ],
      prompt:
        'Has a doctor told you there are melanoma deposits in nearby skin or tissue — using a term like in-transit, satellite, or microsatellite?',
      choices: [
        { value: 'yes', label: 'Yes', reveal: 'N3_yes' },
        { value: 'no', label: 'No', next: 'M1', event: 'step2_n_section_completed' },
        { value: 'unsure', label: 'I’m not sure', next: 'M1', event: 'step2_n_section_completed' },
      ],
      notes: [
        {
          id: 'N3_yes',
          tone: 'info',
          body: [
            'These findings are also part of the <strong>Stage III</strong> group in the staging framework described in the book. The Navigator does not work out the exact stage — your melanoma specialist does, using the tumor and node details together.',
          ],
          doctorQuestions: [
            'I was told there is in-transit / satellite / microsatellite disease — how does that affect my stage and treatment?',
          ],
          continue: { label: 'Continue to distant spread', next: 'M1', event: 'step2_n_section_completed' },
        },
      ],
    },

    /* ------------------------------------------- DISTANT SPREAD (M) */
    {
      id: 'M1',
      kind: 'info',
      spKey: 'distant',
      title: 'M — distant spread',
      body: [
        'M describes whether melanoma has been found in a distant part of the body — for example distant skin or soft tissue, lung, liver or another organ, or brain.',
        'Not having had imaging does not by itself mean there is no distant spread. Only a clinical evaluation can establish that.',
      ],
      continueLabel: 'Continue',
      next: 'M2',
    },
    {
      id: 'M2',
      kind: 'decision',
      spKey: 'distant',
      title: 'Has distant spread been found?',
      prompt: 'Has a doctor told you that melanoma has spread to a distant organ or distant part of the body?',
      choices: [
        { value: 'yes', label: 'Yes', reveal: 'M2_yes' },
        { value: 'no', label: 'No', next: 'M3' },
        { value: 'unsure', label: 'I’m not sure', next: 'M3' },
        { value: 'not_evaluated', label: 'I have not had this evaluated', next: 'M3' },
      ],
      notes: [
        {
          id: 'M2_yes',
          tone: 'info',
          body: [
            'In the staging framework described in the book, distant metastasis corresponds to <strong>Stage IV</strong>. Your oncology team determines the detailed M category and the treatment plan — the Navigator does not.',
          ],
          doctorQuestions: [
            'Where has melanoma been found, and what is my M category?',
            'What treatment options apply to my situation?',
          ],
          continue: { label: 'Continue', next: 'M3' },
        },
      ],
    },
    {
      id: 'M3',
      kind: 'decision',
      spKey: 'distant',
      title: 'Imaging',
      body: ['Informational. “No imaging” is not used to infer anything about spread.'],
      prompt: 'Have you had imaging as part of melanoma staging?',
      choices: [
        { value: 'ct', label: 'CT', next: 'SUMMARY', event: 'step2_m_section_completed' },
        { value: 'pet_ct', label: 'PET/CT', next: 'SUMMARY', event: 'step2_m_section_completed' },
        { value: 'mri', label: 'MRI', next: 'SUMMARY', event: 'step2_m_section_completed' },
        { value: 'multiple', label: 'More than one of these', next: 'SUMMARY', event: 'step2_m_section_completed' },
        { value: 'none', label: 'No', next: 'SUMMARY', event: 'step2_m_section_completed' },
        { value: 'unsure', label: 'I’m not sure', next: 'SUMMARY', event: 'step2_m_section_completed' },
      ],
      notes: [
        {
          id: 'M3_always',
          tone: 'info',
          static: true,
          body: [
            'Your doctor decides whether imaging is appropriate based on your stage, examination, symptoms, and other clinical factors.',
          ],
        },
      ],
    },
  ],

  summary: {
    title: 'Your stage picture',

    stageBand: {
      heading: 'Where your melanoma most likely falls',
      notice:
        'This is an educational range, not a diagnosis or an official stage. It uses only the broad pattern — the tumor, whether a lymph node was involved, and whether there is distant spread. On its own it does not work out a number and letter (such as IB or IIIC); that is why a positive node or distant spread is shown only as a range here. Your physician confirms the exact stage, its sub-stage, and whether it is clinical or pathologic.',
      rules: [
        {
          when: { M2: ['yes'] },
          band: 'Stage IV',
          note: 'A distant site has been reported to you. In the staging framework, distant spread is Stage IV. Your oncology team sets the detailed category and the treatment plan.',
        },
        { when: { N1: ['yes'] }, band: 'Stage III', note: STAGE3_NODE_NOTE },
        { when: { N2: ['positive'] }, band: 'Stage III', note: STAGE3_NODE_NOTE },
        {
          when: { N3: ['yes'] },
          band: 'Stage III',
          note: 'In-transit, satellite, or microsatellite disease is part of the Stage III group when there is no distant spread. Your specialist determines the subgroup.',
        },
        {
          when: { b3: ['in_situ', 'lentigo_maligna'] },
          band: 'Stage 0',
          note: 'Melanoma in situ with no spread corresponds to Stage 0 — the earliest category. Your physician confirms it and goes over removing the area completely.',
        },
        {
          when: { k0a: ['in_situ'] },
          band: 'Stage 0',
          note: 'Melanoma in situ with no spread corresponds to Stage 0 — the earliest category. Your physician confirms it and goes over removing the area completely.',
        },
        {
          when: { T1a: ['seen'] },
          band: 'Stage IA',
          note: 'Your report describes a T1a invasive melanoma — up to 0.8 mm thick with no ulceration — with no lymph node involvement and no distant spread. That corresponds to Stage IA, the earliest invasive stage; your physician confirms it. If your thickness is near the 0.8 mm cutoff or the biopsy base was transected, ask whether a sentinel lymph node biopsy still applies: a negative result keeps it Stage IA, a positive result moves it to Stage III.',
        },
        {
          // T2a–T4b early exit: the node picture is still ahead, so the band is
          // provisional. In practice the estimate block below renders (it returns
          // `provisional` for a known T2a–T4b) and supersedes this note; it is
          // here as a fallback if the Breslow value cannot be parsed.
          when: { earlyStage: ['seen'] },
          band: 'Stage I or II — not yet final',
          note: 'Your report describes an invasive melanoma thicker than the thinnest group, with no lymph node involvement or distant spread recorded here. That points to the Stage I–II range (IB, IIA, IIB, or IIC). A sentinel lymph node biopsy is usually part of staging for these tumors: a negative node keeps it in that range, a positive node moves it to Stage III, and distant spread found on imaging moves it to Stage IV. Your physician confirms the exact stage.',
        },
        {
          when: { N2: ['negative'] },
          band: 'Stage I or II',
          note: 'An invasive melanoma with a negative sentinel lymph node and no distant spread sits in the Stage I–II range — IA, IB, IIA, IIB, or IIC. Which one depends on the Breslow thickness and ulceration; your physician confirms it.',
        },
        {
          when: { N2: ['not_needed'] },
          band: 'Stage I or II',
          note: 'An invasive melanoma with no lymph node involvement and no distant spread sits in the Stage I–II range — IA, IB, IIA, IIB, or IIC. Your physician confirms which one from the Breslow thickness and ulceration.',
        },
      ],
      fallback: {
        band: 'Stage I or II — not yet complete',
        note: 'Your report points to an invasive melanoma, but the lymph node picture is still open — a sentinel lymph node biopsy pending, still being decided, or not yet discussed. Until it is settled the stage is provisional: a negative node keeps it in the Stage I–II range, a positive node moves it to Stage III.',
      },
    },

    stageEstimate: {
      heading: 'Your most likely stage',
      breslowKeys: BRESLOW_KEYS,
      invasionInSitu: INVASION_IN_SITU,
      invasionInvasive: INVASION_INVASIVE,
      ulcerationPresent: ULCERATION_PRESENT,
      ulcerationAbsent: ULCERATION_ABSENT,
      nodePositive: [{ N1: ['yes'] }, { N2: ['positive'] }, { N3: ['yes'] }],
      distant: [{ M2: ['yes'] }],
      slnbNegative: [{ N2: ['negative'] }],
      // `T1a` here is the T1a early-exit token: a T1a melanoma whose staging
      // does not routinely include a sentinel lymph node biopsy, so the sub-group
      // (Stage IA) is treated as settled, with the T1a `caveats` entry added.
      // `earlyStage` (the T2a–T4b early exit) is deliberately NOT listed here —
      // a sentinel node biopsy is still expected for those, so the sub-group is
      // shown `provisional` with its own `caveats` entry.
      slnbNotNeeded: [{ N2: ['not_needed'] }, { T1a: ['seen'] }],
      copy: {
        confirmed:
          'From what you entered — a {t} tumor, no lymph node involvement, and no distant spread — your melanoma most likely falls in {stage}. Your physician confirms this, and whether it is a clinical or a pathologic stage.',
        provisional:
          'From your tumor alone ({t}), a negative sentinel lymph node would place you at {stage}. This is not final until the rest of the workup is in: a positive sentinel node moves the stage to Stage III, and melanoma found in a distant part of the body on imaging moves it to Stage IV. Ask your medical team to confirm once the node result is back.',
      },
      caveats: [
        {
          // T1a early exit — a sentinel lymph node biopsy is generally not done.
          when: [{ T1a: ['seen'] }],
          text: 'At this Breslow thickness with no ulceration, a sentinel lymph node biopsy is generally not performed. If the Breslow thickness is near 0.8 mm (for example, 0.7 mm) or the biopsy base was transected, your doctor may discuss the potential need for a sentinel lymph node biopsy. If a sentinel lymph node biopsy is done and is negative, the stage stays Stage IA; if it is positive, the stage becomes Stage III.',
        },
        {
          // T2a–T4b early exit — a sentinel lymph node biopsy is usually part of
          // staging, so {stage} is provisional until it (and any imaging) is done.
          when: [{ earlyStage: ['seen'] }],
          text: 'Because this Breslow thickness of your melanoma, a sentinel lymph node biopsy is usually recommended to complete staging — most people in this range have one. Until it is done, {stage} is a clinical stage that can still change: a negative sentinel node keeps it at {stage}, a positive sentinel node moves it to Stage III, and melanoma found in a distant part of the body on imaging moves it to Stage IV. Ask your surgeon or melanoma specialist whether a sentinel lymph node biopsy applies to you and when it would happen.',
        },
      ],
      notice:
        'This estimate is generated from the Breslow thickness, ulceration, and lymph node and spread answers you entered, using AJCC 8th edition stage groupings. It is educational — not a diagnosis, and not a substitute for staging by your treating physician, who confirms the stage, its sub-stage, and whether it is clinical or pathologic. It covers Stage I and II only; a positive node, distant spread, or a missing pathology detail is left to your physician.',
      tableIntro:
        'Every row above assumes the lymph nodes are clear (negative) and there is no distant spread (metastasis). A positive lymph node moves any of these to Stage III, and the presence of metastasis moves any of these to Stage IV, regardless of the Breslow thickness or ulceration status.',
      tableRows: [
        { shows: 'Up to 0.8 mm, no ulceration', t: 'T1a', group: 'Stage IA' },
        { shows: 'Under 0.8 mm with ulceration, or 0.8–1.0 mm', t: 'T1b', group: 'Stage IA' },
        { shows: 'Over 1.0–2.0 mm, no ulceration', t: 'T2a', group: 'Stage IB' },
        { shows: 'Over 1.0–2.0 mm with ulceration', t: 'T2b', group: 'Stage IIA' },
        { shows: 'Over 2.0–4.0 mm, no ulceration', t: 'T3a', group: 'Stage IIA' },
        { shows: 'Over 2.0–4.0 mm with ulceration', t: 'T3b', group: 'Stage IIB' },
        { shows: 'Over 4.0 mm, no ulceration', t: 'T4a', group: 'Stage IIB' },
        { shows: 'Over 4.0 mm with ulceration', t: 'T4b', group: 'Stage IIC' },
      ],
    },

    learnMore: [
      { label: 'What your melanoma stage means', href: '/melanoma/melanoma-stage-meaning' },
      { label: 'Sentinel lymph node biopsy', href: '/melanoma/sentinel-lymph-node-biopsy' },
    ],

    sections: [
      {
        heading: 'What your doctor has told you',
        placement: 'withEstimate',
        rows: [
          { key: 'k1', label: 'Has a doctor assigned a stage?' },
        ],
      },
      {
        heading: 'From your pathology report',
        placement: 'withEstimate',
        rows: [
          { key: ['b3', 'k0a'], label: 'Diagnosis' },
          { key: ['c1', 'k0b'], label: 'Breslow thickness' },
          { key: ['c2', 'k0c'], label: 'Ulceration' },
          { key: 'c7', label: 'Biopsy margins' },
        ],
      },
      {
        heading: 'Lymph nodes and spread (recorded here)',
        rows: [
          { key: 'N1', label: 'Melanoma found in a lymph node' },
          { key: 'N1how', label: 'How the node finding was made' },
          { key: 'N2', label: 'Sentinel lymph node biopsy status' },
          { key: 'N3', label: 'Nearby skin / tissue deposits' },
          { key: 'M2', label: 'Distant spread reported' },
          { key: 'M3', label: 'Imaging for staging' },
        ],
      },
    ],
    questionsHeading: 'Questions for my doctor',
    viewEvent: 'step2_staging_summary_viewed',
    printLabel: 'Print my stage picture and questions',
    completeLabel: 'I’ve reviewed this — finish the Mad Rush',
    completeNext: '/melanoma/navigator/mad-rush',
    completeEvent: 'melanoma_step2_completed',
    completeNote:
      '“Complete” means you finished this educational step. It does not mean your melanoma stage is medically finalized.',
  },
};
