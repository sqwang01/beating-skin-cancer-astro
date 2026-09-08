/**
 * Mad Rush — Step 2: Confirm Your Melanoma Stage.
 *
 * The second half of the merged Mad Rush journey (see journey.ts). Step 1 and
 * Step 2 render into one page, so every pathology answer the patient recorded in
 * Step 1 is still in memory here. Step 2 does NOT re-ask the diagnosis, Breslow
 * thickness, or ulceration — it opens with a `recap` screen that echoes those
 * Step 1 answers back for a single confirmation.
 *
 * Flow shape (simplified 2026-09-07, Dr. Wang):
 *   k0    recap of the Step 1 pathology answers. "Yes — that matches my report"
 *         (or an inline correction saved) routes straight to the "Your stage
 *         picture" summary. Cold entry with no Step 1 answers → k0cold capture.
 *   k0cold / k0a / k0b / k0c   short three-item capture for a cold entry
 *         (diagnosis, Breslow thickness, ulceration), then straight to the
 *         summary.
 *   S     "Your stage picture": the coarse worded band, the educational IA–IIC
 *         estimate for a node-negative Stage I/II case, and the questions to
 *         confirm the exact stage with the treating physician.
 *
 * What was removed 2026-09-07 (Dr. Wang):
 *   - The "Has a doctor already told you your melanoma stage?" screen (`k1`).
 *     The clinician-assigned stage is deferred to on the summary; the Navigator
 *     no longer asks.
 *   - The `k2` bridge and the entire N (lymph node) and M (distant spread)
 *     question track (`N1`–`N3`, `M1`–`M3`).
 *   - The T1a / T2a–T4b early-exit routing that lived on `k2.autoRouteByTCat`.
 *     The summary still shows the educational Stage I/II sub-group for an
 *     invasive, node-negative case straight from the Step 1 pathology answers.
 *   - Earlier still (also 2026-09-07): the standalone "T — your original tumor"
 *     screen, and the `k1a` / `k1b` doctor-stage detail screens with the
 *     `STEP2_CONSISTENCY_RULES` that compared against them.
 *
 * Stage 0 skip (`k0.autoRoute` + the k0a routing below): an in-situ / lentigo
 * maligna diagnosis is already effectively Stage 0 — the patient still sees the
 * k0 recap to confirm or inline-correct what Step 1 recorded, then lands on the
 * "Your stage picture" summary like every other case.
 *
 * Guardrails (GUARDRAILS §2, §4, §6, §13 / STEP2 spec §2, §23, §30):
 *   - The summary shows a COARSE worded band — Stage 0 / Stage I–II — from the
 *     broad answer pattern, always with a review notice and "your physician
 *     confirms the exact stage."
 *   - For an invasive melanoma with a Breslow thickness and ulceration on file,
 *     the summary additionally shows an EDUCATIONAL sub-group (IA–IIC) from
 *     `estimateStageGroup()` in medicalRules.ts — approved 2026-09-07 against
 *     AJCC 8th, gated behind `STAGING_RULES_ENABLED`, and always labelled an
 *     estimate your physician confirms. A sentinel lymph node biopsy is still
 *     expected for most invasive melanomas, so the sub-group is shown
 *     PROVISIONAL: a negative node keeps it, a positive node moves it to Stage
 *     III, and distant spread moves it to Stage IV. A missing pathology detail
 *     falls back to the coarse band.
 *   - The summary carries an educational `beyondStage` explainer (Stage III /
 *     Stage IV, in words only — no data collected, no sub-group, no computation)
 *     so a node-positive or metastatic patient is not left with just the Stage
 *     I/II picture. Gated to an invasive diagnosis. Copy reviewed by Steven Q.
 *     Wang, MD, 2026-09-07.
 *   - "Unknown" is first-class everywhere; never read as N0 or M0.
 *   - Non-cutaneous melanoma left Step 1 already; if a user still reaches here
 *     with an unclear diagnosis they are routed to confirm it with a clinician.
 */

import type { StepDef } from './types';

/**
 * Shared answer→estimate-input mappings, used by the summary `stageEstimate`
 * block. Each is an array of `when` maps, OR-matched, so a Step 1 answer
 * (`b3` / `c1` / `c2`) or its Step 2 cold-entry equivalent (`k0a` / `k0b` /
 * `k0c`) can feed the same input.
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
const INSITU_NA = 'N/A';
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

export const STEP2: StepDef = {
  id: 'step2',
  phase: 'mad-rush',
  number: 2,
  total: 4,
  slug: 'stage',

  metaTitle: 'Step 2: Confirm Your Melanoma Stage | Beating Skin Cancer',
  metaDescription:
    'Building on your pathology report, this step recaps the diagnosis, Breslow thickness, and ulceration, then shows the educational stage range your melanoma most likely falls in and the questions to confirm it with your doctor.',

  heroKicker: 'Mad Rush • Step 2 of 4',
  heroTitle: 'Step 2 — Confirm Your Melanoma Stage',
  heroSubtitle:
    'Your pathology report already describes the original tumor. This step recaps what it shows and points you to the stage range that follows from it — the exact stage is your physician’s to confirm.',
  backHref: '/melanoma/navigator',
  backLabel: '← Back to the Navigator',
  exitHref: '/melanoma/navigator',

  contextualDisclaimer:
    'This Navigator does not diagnose or stage melanoma. Every stage, sub-stage, and range shown here — including the Stage I/II estimate on this summary — is educational only and may not be correct for your case. Only your treating physician can assign your actual stage, its sub-stage, and whether it is clinical or pathologic. Confirm anything you see here with your medical team before you rely on it.',

  start: 'k0',

  // Stage 0 skip: an in-situ / lentigo maligna diagnosis still sees the k0
  // verification recap first (so the patient can confirm or correct what Step 1
  // recorded, using the same inline edit window as every other case); on confirm
  // — or after an inline correction — k0's `autoRoute` sends it straight to the
  // stage picture. (Cold entry with no Step 1 answers is handled on k0a.)

  subProgress: [
    { key: 'report', label: 'Your report' },
    { key: 'picture', label: 'Your stage picture' },
  ],

  screens: [
    /* ------------------------------------------------ RECAP OF STEP 1 */
    {
      id: 'k0',
      kind: 'recap',
      spKey: 'report',
      viewEvent: 'melanoma_step2_started',
      // Every confirmed (or inline-corrected) recap routes straight to the stage
      // picture. The two in-situ rules are kept explicit so an in-situ pick made
      // inline still lands on the summary; every other case falls through to
      // `recap.confirmNext` / `recap.editSaveNext`, which also point at the
      // summary. Evaluated on the confirm and Save buttons, never on entry, so
      // the recap always paints first.
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
        confirmNext: 'SUMMARY:step2',
        changeLabel: 'I need to correct something',
        editSaveNext: 'SUMMARY:step2',
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
          continue: { label: 'Continue', next: 'SUMMARY' },
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
      next: 'SUMMARY',
    },
  ],

  summary: {
    title: 'Your stage picture',

    stageBand: {
      heading: 'Where your melanoma most likely falls',
      notice:
        'This is an educational range, not a diagnosis or an official stage. It uses only the broad pattern from your pathology report — the diagnosis, Breslow thickness, and ulceration. On its own it does not work out a number and letter (such as IB or IIC). Your physician confirms the exact stage, its sub-stage, and whether it is clinical or pathologic.',
      rules: [
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
      ],
      fallback: {
        band: 'Stage I or II — not yet complete',
        note: 'There isn’t enough detail here to place your melanoma in a sub-group — the diagnosis, Breslow thickness, or ulceration status is missing or unconfirmed. For an invasive, node-negative melanoma these usually fall in the Stage I–II range; a lymph node with melanoma moves it to Stage III, and distant spread moves it to Stage IV. Your physician confirms the exact stage.',
      },
    },

    stageEstimate: {
      heading: 'Your most likely stage',
      breslowKeys: BRESLOW_KEYS,
      invasionInSitu: INVASION_IN_SITU,
      invasionInvasive: INVASION_INVASIVE,
      ulcerationPresent: ULCERATION_PRESENT,
      ulcerationAbsent: ULCERATION_ABSENT,
      copy: {
        // Kept for completeness; with no lymph-node answers collected the
        // estimate for an invasive case is always `provisional`.
        confirmed:
          'From what you entered — a {t} tumor, no lymph node involvement, and no distant spread — your melanoma most likely falls in {stage}. Your physician confirms this, and whether it is a clinical or a pathologic stage.',
        provisional:
          'From your tumor alone ({t}), a negative sentinel lymph node would place you at {stage}. This is not final until the rest of the workup is in: a positive sentinel node moves the stage to Stage III, and melanoma found in a distant part of the body on imaging moves it to Stage IV. Ask your medical team to confirm once the node result is back.',
      },
      notice:
        'This estimate is generated from the Breslow thickness and ulceration you entered, using AJCC 8th edition stage groupings. It is educational — not a diagnosis, and not a substitute for staging by your treating physician, who confirms the stage, its sub-stage, and whether it is clinical or pathologic. It covers Stage I and II only; a positive node, distant spread, or a missing pathology detail is left to your physician.',
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

    // Educational Stage III / IV explainer. Step 2 collects no lymph-node or
    // distant-spread answers (simplified 2026-09-07, Dr. Wang), so nothing here
    // routes a patient to a Stage III/IV picture — this block is the worded
    // stand-in: what regional and distant spread mean, framed as a care-team
    // finding, with no sub-group and no computation. Gated to an invasive
    // diagnosis so a Stage 0 in-situ case never sees it. Copy reviewed by
    // Steven Q. Wang, MD, 2026-09-07.
    beyondStage: {
      heading: 'If melanoma is found beyond the skin',
      intro:
        'The range and estimate above describe melanoma that is still limited to the skin where it started. Part of the workup for an invasive melanoma is checking whether any cells have traveled beyond it — through a sentinel lymph node biopsy, a physical exam, and sometimes imaging. If something is found, the stage is higher than what is shown above. Here is what the two higher categories mean.',
      parts: [
        {
          heading: 'Stage III — regional spread',
          body: 'Stage III means melanoma cells have been found near the original tumor but not in a distant organ. Most often this is in a nearby lymph node, or in the skin or tissue in the path between the tumor and those nodes (your report or your doctor may call this satellite, microsatellite, or in-transit disease). It is usually discovered during the workup, not from the original pathology report. A lymph node with melanoma moves the stage to III regardless of Breslow thickness or ulceration. Stage III has sub-groups — IIIA through IIID — that depend on how many nodes are involved and other details; your physician assigns the sub-group and explains what it means for the plan from here.',
        },
        {
          heading: 'Stage IV — distant spread (metastasis)',
          body: 'Stage IV means melanoma has been found in a part of the body away from the original tumor and its nearby lymph nodes — for example the lung, liver, brain, bone, or lymph nodes or skin in another region. It is usually identified on imaging, such as CT or PET scan, and sometimes confirmed with a biopsy of the new site. Like Stage III, this is a finding from your care team’s workup, not something the original pathology report shows. Your physician confirms it, explains where the melanoma has been found, and goes over the treatment options that apply.',
        },
      ],
      closing:
        'If a doctor has already told you that melanoma was found in a lymph node or in another part of your body, the range and estimate above do not apply to your case — ask your medical team which stage you are and to walk you through what it means.',
      when: [{ b3: ['invasive'] }, { k0a: ['invasive'] }],
    },

    sections: [
      {
        heading: 'From your pathology report',
        placement: 'withEstimate',
        rows: [
          { key: ['b3', 'k0a'], label: 'Diagnosis' },
          { key: ['c1', 'k0b'], label: 'Breslow thickness (mm)' },
          { key: ['c2', 'k0c'], label: 'Ulceration' },
          { key: 'c7', label: 'Biopsy margins' },
        ],
      },
    ],
    viewEvent: 'step2_staging_summary_viewed',
    printLabel: 'Print my stage picture',
    completeLabel: 'I’ve reviewed this — finish the Mad Rush',
    completeNext: '/melanoma/navigator',
    completeEvent: 'melanoma_step2_completed',
    completeNote:
      '“Complete” means you finished this educational step. It does not mean your melanoma stage is medically finalized.',
  },
};
