/**
 * Mad Rush — Step 3: Understand Treatment Options.
 *
 * The third leg of the merged Mad Rush journey (see journey.ts). Steps 1–3 render
 * into one page, so every answer the patient recorded in Step 1 (diagnosis,
 * Breslow thickness, ulceration) and confirmed in Step 2 is still in memory here.
 * Step 3 does NOT re-ask any of it — it opens with a `recap` screen that echoes
 * those answers back for a single confirmation, then shows the treatment picture
 * that follows from the stage.
 *
 * Step 3 has NO summary screen (removed 2026-09-07, Dr. Wang — "just end it at
 * the treatment-options page"). Every `tx_*` / `t1` screen is terminal: its
 * continue button is a "Finish the Mad Rush" action wired to `next: 'EXIT'`
 * (back to /melanoma/navigator) that fires `melanoma_step3_completed` +
 * `navigator_completed_mad_rush`. `StepDef.summary` is optional; NavJourney
 * renders no `[data-summary-block]` for this step.
 *
 * Flow shape:
 *   t0    recap of the diagnosis / Breslow / ulceration carried from Steps 1–2.
 *         "Yes — that's right" routes to a computed bridge (t1); an in-situ /
 *         lentigo maligna answer routes straight to the Stage 0 screen. Cold
 *         entry with no carried answers → t0cold.
 *   t1    a non-medical computed bridge. `autoRouteByTCat` maps the recorded
 *         Breslow + ulceration to an AJCC 8th T category (via the approved
 *         `tCategoryFor()` in medicalRules.ts) and forwards INVISIBLY to the
 *         matching stage screen. It computes and displays NO stage. When the
 *         thickness/ulceration are not both known, t1 has nothing to compute and
 *         renders as its own screen — the general, non-stage-specific picture,
 *         and is itself terminal.
 *   tx_*  one terminal `info` screen per Stage 0 / IA / IB / IIA / IIB / IIC: the
 *         surgical margin, the sentinel-node discussion, imaging, and adjuvant
 *         therapy in plain language, always framed as education for a
 *         conversation with the care team, plus questions to take to that
 *         conversation.
 *
 * Guardrails (MELANOMA_MEDICAL_GUARDRAILS.md §2, §5, §11, §13):
 *   - Treatment copy is EDUCATION for a clinician conversation. Third-person
 *     framing throughout ("your care team may discuss…", "guidelines generally
 *     do not call for…"); never "you need" / "you do not need" / "the correct
 *     treatment is". Every stage screen closes on "Your treating physician
 *     confirms what applies to you."
 *   - No new clinical COMPUTATION. Step 3 only *routes* on the AJCC 8th
 *     `tCategoryFor()` rule that was reviewed and approved 2026-09-07 for Step 2;
 *     it publishes no stage and adds no rule set to medicalRules.ts.
 *   - This is time-sensitive content (surgical margins, SLNB thresholds, imaging,
 *     systemic/adjuvant therapy, drug names). It ships as reviewed content —
 *     see `TREATMENT_CONTENT_META` below — always alongside "confirm with your
 *     care team". Roll back to a `MEDICAL_CONTENT_REQUIRES_CURRENT_REVIEW`
 *     placeholder if that review lapses or a newer guideline supersedes it.
 *
 * Copy is concise and original, derived from the stage-by-stage treatment
 * guidance in "Beating Melanoma: The Ultimate Patient Resource" (Wang SQ, 2024),
 * supplied and reviewed by the Editor-in-Chief.
 */

import type { StepDef } from './types';

/**
 * Review metadata for the treatment content in this file (GUARDRAILS §11).
 * Documentation only — not read by the engine. The content renders live while
 * `status` is `'approved'`; if the review lapses, swap the stage screens for a
 * `MEDICAL_CONTENT_REQUIRES_CURRENT_REVIEW` placeholder and set this to
 * `'draft'`.
 */
export const TREATMENT_CONTENT_META = {
  source_guideline:
    'Beating Melanoma: The Ultimate Patient Resource, 2nd ed. (Wang SQ, 2024) — stage-by-stage treatment guidance, supplied and reviewed by the Editor-in-Chief.',
  source_date: '2024',
  last_medical_reviewed: '2026-09-07',
  reviewed_by: 'Steven Q. Wang, MD',
  status: 'approved' as const,
};

/**
 * Answer keys the computed bridge (`t1.autoRouteByTCat`) reads. Identical to the
 * mappings Step 2 uses for its stage estimate, so a Step 1 answer (`b3` / `c1` /
 * `c2`) or its Step 2 cold-entry equivalent (`k0a` / `k0b` / `k0c`) feeds the
 * same T-category input.
 */
const BRESLOW_KEYS = ['c1', 'k0b'];
const INVASION_INVASIVE = [{ b3: ['invasive'] }, { k0a: ['invasive'] }];
const ULCERATION_PRESENT = [{ c2: ['present'] }, { k0c: ['present'] }];
const ULCERATION_ABSENT = [{ c2: ['absent'] }, { k0c: ['absent'] }];

/**
 * Inline diagnosis correction on the t0 recap, mirroring Step 2's `k0`: the
 * dropdown writes `b3`, and because in situ vs invasive changes which pathology
 * fields apply, an in-situ / lentigo maligna pick presets the invasive-only
 * fields to "N/A" while an invasive pick clears them (`null`).
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

/** Shared closing line for every stage screen (GUARDRAILS §5). */
const CONFIRM_LINE =
  'Your treating physician confirms what applies to your melanoma — the details of your pathology, your health, and your preferences all weigh into the plan.';

/**
 * Every treatment-options screen is terminal — there is no Step 3 summary. Its
 * continue button finishes the Mad Rush: back to /melanoma/navigator, firing the
 * two allow-listed completion events (analytics.js).
 */
const FINISH_LABEL = 'Finish the Mad Rush';
const FINISH_EVENT = 'melanoma_step3_completed navigator_completed_mad_rush';

export const STEP3: StepDef = {
  id: 'step3',
  phase: 'mad-rush',
  number: 3,
  total: 4,
  slug: 'treatment',

  metaTitle: 'Step 3: Understand Melanoma Treatment Options | Beating Skin Cancer',
  metaDescription:
    'Educational overview of melanoma treatment by stage: wider excision and surgical margins, sentinel lymph node biopsy, imaging, and immunotherapy or targeted therapy.',

  heroKicker: 'Mad Rush • Step 3 of 4',
  heroTitle: 'Step 3 — Understand Treatment Options',
  heroSubtitle:
    'Your diagnosis and stage point to a general treatment path. This step walks through what that path usually looks like so you can talk it through with the team planning your care.',
  backHref: '/melanoma/navigator',
  backLabel: '← Back to the Navigator',
  exitHref: '/melanoma/navigator',

  contextualDisclaimer:
    'This step explains the kinds of treatment that generally follow from each melanoma stage. It is educational — a starting point for the conversation with your care team. It does not tell you which treatment you need or should avoid, and it cannot account for the details of your health, your pathology, and your preferences that your treating physicians weigh. Confirm any treatment decision with them.',

  start: 't0',

  // The "your stage picture" (Step 2) completion routes here via NEXT_STEP. The
  // t0 recap of the carried diagnosis / Breslow / ulceration is redundant on that
  // path — Step 2 just confirmed all three — so skip it: an in-situ / lentigo
  // maligna answer goes straight to the Stage 0 screen; every invasive case goes
  // to the computed bridge t1, which maps Breslow + ulceration to a T category
  // and forwards INVISIBLY to the matching tx_* screen (or renders itself, the
  // general picture, when they aren't both known). A cold direct load of
  // /mad-rush/treatment has no recorded answers, so nothing matches here and the
  // flow falls back to `start: 't0'` → its recap → `t0cold`.
  enterRoute: [
    { when: { b3: ['in_situ'] }, next: 'tx_stage0' },
    { when: { b3: ['lentigo_maligna'] }, next: 'tx_stage0' },
    { when: { k0a: ['in_situ'] }, next: 'tx_stage0' },
    { when: { b3: ['invasive'] }, next: 't1' },
    { when: { k0a: ['invasive'] }, next: 't1' },
  ],

  subProgress: [{ key: 'options', label: 'Treatment options' }],

  screens: [
    /* ------------------------------------------------ RECAP OF STEPS 1–2 */
    {
      id: 't0',
      kind: 'recap',
      spKey: 'options',
      // No `viewEvent` here — t0 is only reached on a cold direct load (the main
      // flow skips it via `enterRoute`), where its recap fills nothing and
      // forwards to `t0cold` → `t1`. `melanoma_step3_started` fires on `t1` /
      // `tx_stage0` instead, so it still lands exactly once on every path.
      // An in-situ / lentigo maligna answer (from Step 1 `b3`, or corrected
      // inline, or from the Step 2 cold entry `k0a`) goes straight to the Stage 0
      // screen. Every other case falls through to `recap.confirmNext` — the
      // computed bridge `t1`. Evaluated on the confirm and Save buttons only, so
      // the recap always paints first.
      autoRoute: [
        { when: { b3: ['in_situ'] }, next: 'tx_stage0' },
        { when: { b3: ['lentigo_maligna'] }, next: 'tx_stage0' },
        { when: { k0a: ['in_situ'] }, next: 'tx_stage0' },
      ],
      title: 'What your melanoma treatment starts from',
      body: [
        'Treatment planning works from the same three things staging does — the diagnosis, the Breslow thickness, and whether the tumor is ulcerated. These are the answers you recorded earlier. Check they still match, then we’ll walk through what usually follows.',
      ],
      recap: {
        rows: [
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
              ],
            },
          },
        ],
        emptyNext: 't0cold',
        confirmLabel: 'Yes — that’s right',
        confirmNext: 't1',
        changeLabel: 'I need to correct something',
        editSaveNext: 't1',
        editSaveLabel: 'Save changes',
        editCancelLabel: 'Cancel',
      },
    },

    /* -------------------------------------------- COLD ENTRY (no answers) */
    {
      id: 't0cold',
      kind: 'info',
      spKey: 'options',
      title: 'Start from your diagnosis and stage',
      body: [
        'You haven’t recorded a diagnosis or pathology details in this Navigator yet, so this step can only show the general shape of melanoma treatment rather than the picture for your stage.',
        'To get the most from this step, work through Step 1 (your pathology report) and Step 2 (your stage) first, or bring your pathology report and any stage your doctor has given you to your next visit and ask the care team to walk you through the plan.',
      ],
      continueLabel: 'Show me the general picture',
      // No Step 3 summary — the general, non-stage-specific picture is t1 itself
      // (it renders as its own screen when Breslow / ulceration aren't both
      // known, which is always true on a cold load), and t1 is terminal.
      next: 't1',
    },

    /* --------------------------------- COMPUTED BRIDGE + GENERAL PICTURE
     * `autoRouteByTCat` maps the recorded Breslow + ulceration to an AJCC 8th T
     * category and forwards INVISIBLY to the matching stage screen (flow.js
     * resolveComputedRoute / applyComputedRoute — same engine the removed Step 2
     * `k2` bridge used). It computes and shows NO stage. When thickness /
     * ulceration are not both known no T resolves, and this screen renders as
     * itself: the general, non-stage-specific treatment picture. */
    {
      id: 't1',
      kind: 'info',
      spKey: 'options',
      // Fires here too: when Step 2 completion skips t0 via `enterRoute`, this is
      // the first Step 3 screen an invasive case reaches (flow.js fires a
      // screen's viewEvent even when its autoRouteByTCat forwards invisibly).
      viewEvent: 'melanoma_step3_started',
      title: 'The general shape of melanoma treatment',
      body: [
        'Treatment for an invasive melanoma is planned around the Breslow thickness and whether the melanoma is ulcerated — the same details that set the stage. Those aren’t both recorded here, so this is the general picture rather than the one for a specific stage.',
        'For nearly every invasive melanoma, the first step is a <strong>wider excision</strong>: removing more tissue around the biopsy site, with a margin of normal-looking skin. The margin is usually somewhere between 1 and 2 cm and larger for thicker melanomas; your surgeon sets it from your pathology.',
        'A <strong>sentinel lymph node biopsy</strong> — sampling the first lymph node the area drains to — is commonly discussed for melanomas thicker than about 0.8–1 mm, and is often done at the same time as the wider excision.',
        'Whether imaging, blood tests, or drug treatments such as immunotherapy or targeted therapy are part of the plan depends on the thickness, the lymph node result, and other findings. Your care team builds the plan around your specific case.',
      ],
      autoRouteByTCat: {
        breslowKeys: BRESLOW_KEYS,
        invasionInvasive: INVASION_INVASIVE,
        ulcerationPresent: ULCERATION_PRESENT,
        ulcerationAbsent: ULCERATION_ABSENT,
        routes: [
          { tCategory: ['T1a', 'T1b'], next: 'tx_IA' },
          { tCategory: ['T2a'], next: 'tx_IB' },
          { tCategory: ['T2b', 'T3a'], next: 'tx_IIA' },
          { tCategory: ['T3b', 'T4a'], next: 'tx_IIB' },
          { tCategory: ['T4b'], next: 'tx_IIC' },
        ],
      },
      // Terminal when it renders as itself (Breslow / ulceration not both known).
      // When `autoRouteByTCat` forwards it invisibly to a tx_* screen, that
      // screen carries the finish action instead — flow.js does NOT fire this
      // button's event on an invisible forward.
      continueLabel: FINISH_LABEL,
      continueEvent: FINISH_EVENT,
      next: 'EXIT',
    },

    /* ---------------------------------------------------- STAGE SCREENS */
    {
      id: 'tx_stage0',
      kind: 'info',
      spKey: 'options',
      // First Step 3 screen an in-situ / lentigo maligna case reaches when Step 2
      // completion skips t0 via `enterRoute`.
      viewEvent: 'melanoma_step3_started',
      title: 'Treatment for melanoma in situ (Stage 0)',
      body: [
        'For melanoma in situ, treatment is usually a single procedure: surgically removing the area where the melanoma was found, along with a margin of normal-looking skin around it.',
        'Guidelines describe a standard surgical margin of about <strong>0.5 to 1 cm</strong> — “standard surgical margin” meaning the amount of normal surrounding skin taken with the melanoma. Your surgeon confirms the margin from the size and location of the melanoma and what the pathology showed.',
        'For a melanoma at this stage, guidelines generally do not call for routine imaging (such as X-rays or CT scans) or blood tests. Your care team confirms what, if anything, applies to you.',
        'Surgery is not always the right fit — most often for a subtype of melanoma in situ called <strong>lentigo maligna</strong>. It can be too large to remove completely, the first surgery can come back with melanoma still at the edge, or a person’s overall health can make an operation inadvisable.',
        'In those situations a care team may discuss a skin cream called <strong>imiquimod (Aldara)</strong>, which prompts the immune system to attack the abnormal cells; it is not FDA-approved for this use, though studies have reported high rates of clearance and low recurrence. <strong>Radiation</strong> to the area is another option a team may raise.',
        CONFIRM_LINE,
      ],
      continueLabel: FINISH_LABEL,
      continueEvent: FINISH_EVENT,
      next: 'EXIT',
    },
    {
      id: 'tx_IA',
      kind: 'info',
      spKey: 'options',
      title: 'Treatment for a thin invasive melanoma (Stage IA range)',
      body: [
        'For a thin invasive melanoma in the Stage IA range, treatment is usually a <strong>wider excision</strong> of the site with a standard surgical margin of about <strong>1 cm</strong> of normal-looking skin. Your surgeon confirms the exact margin.',
        'A <strong>sentinel lymph node biopsy</strong> (a procedure that samples the first lymph node the area drains to) is often not recommended at this stage.',
        'Some surgeons do discuss it when certain features are present — for example a Breslow thickness close to 0.8 mm, a biopsy that was cut off at its deep edge so the true thickness isn’t certain, or a high number of dividing (mitotic) cells. Ask your team whether any of these apply to you.',
        'Guidelines generally do not call for routine imaging or blood tests for a melanoma at this stage, and additional drug treatments such as immunotherapy or targeted therapy are generally not part of the plan. Your care team confirms what applies to your situation.',
        CONFIRM_LINE,
      ],
      continueLabel: FINISH_LABEL,
      continueEvent: FINISH_EVENT,
      next: 'EXIT',
    },
    {
      id: 'tx_IB',
      kind: 'info',
      spKey: 'options',
      title: 'Treatment for a Stage IB-range melanoma',
      body: [
        'For a melanoma in the Stage IB range, treatment is usually a <strong>wider excision</strong> with a standard surgical margin of about <strong>1 to 2 cm</strong> (often 1 cm). Your surgeon confirms the margin for your case.',
        'Because the melanoma is deeper than a Stage IA melanoma, a <strong>sentinel lymph node biopsy</strong> is usually discussed and offered. It is typically done at the same time as the wider excision and shows whether any melanoma cells have reached the first draining lymph node.',
        'Routine imaging and blood tests are usually not recommended at this stage, and additional drug treatments are generally not part of the plan unless the lymph node result or other findings change the picture. Your care team confirms what applies to you.',
        CONFIRM_LINE,
      ],
      continueLabel: FINISH_LABEL,
      continueEvent: FINISH_EVENT,
      next: 'EXIT',
    },
    {
      id: 'tx_IIA',
      kind: 'info',
      spKey: 'options',
      title: 'Treatment for a Stage IIA-range melanoma',
      body: [
        'For a melanoma in the Stage IIA range, treatment is a <strong>wider excision</strong>.',
        'Guidelines describe a standard surgical margin of about <strong>1 to 2 cm</strong> for a melanoma up to 2 mm thick and <strong>2 cm or more</strong> for a melanoma between 2 and 4 mm thick. Your surgeon confirms the exact margin.',
        'A <strong>sentinel lymph node biopsy</strong> is discussed and offered, usually at the same time as the wider excision.',
        'Routine imaging and blood tests are usually not recommended at this stage, and additional drug treatments are generally not part of the plan unless the lymph node result or other findings change the picture. Your care team confirms what applies to you.',
        CONFIRM_LINE,
      ],
      continueLabel: FINISH_LABEL,
      continueEvent: FINISH_EVENT,
      next: 'EXIT',
    },
    {
      id: 'tx_IIB',
      kind: 'info',
      spKey: 'options',
      title: 'Treatment for a Stage IIB-range melanoma',
      body: [
        'For a melanoma in the Stage IIB range, treatment is a <strong>wider excision</strong>.',
        'Guidelines describe a standard surgical margin of about <strong>1 to 2 cm</strong>, and <strong>2 cm or more</strong> for the thickest melanomas in this range. Your surgeon confirms the exact margin.',
        'A <strong>sentinel lymph node biopsy</strong> is discussed and offered, usually at the same time as the wider excision.',
        'Routine imaging and blood tests are generally not recommended at this stage.',
        'In some cases the <strong>medical oncologists</strong> on your team may discuss <strong>adjuvant treatment</strong> — drug treatment given after surgery to lower the chance the melanoma comes back. Your care team confirms whether this applies to you.',
        CONFIRM_LINE,
      ],
      continueLabel: FINISH_LABEL,
      continueEvent: FINISH_EVENT,
      next: 'EXIT',
    },
    {
      id: 'tx_IIC',
      kind: 'info',
      spKey: 'options',
      title: 'Treatment for a Stage IIC-range melanoma',
      body: [
        'For a melanoma in the Stage IIC range, treatment is a <strong>wider excision</strong> with a standard surgical margin of about <strong>2 cm</strong>. Your surgeon confirms the margin for your case.',
        'A <strong>sentinel lymph node biopsy</strong> is discussed and offered.',
        'At this stage, <strong>imaging</strong> (such as CT or PET scans) or blood tests may be recommended as part of the workup.',
        'The <strong>medical oncologists</strong> on your team may also discuss <strong>adjuvant treatment</strong> — drug treatment after surgery aimed at lowering the chance of recurrence. Your care team confirms what applies to you.',
        CONFIRM_LINE,
      ],
      continueLabel: FINISH_LABEL,
      continueEvent: FINISH_EVENT,
      next: 'EXIT',
    },
  ],

  // No summary — Step 3 ends on its treatment-options screens (removed
  // 2026-09-07, Dr. Wang). Each `tx_*` / `t1` screen's continue button is the
  // finish action (FINISH_LABEL / FINISH_EVENT → next: 'EXIT'). The educational
  // Stage III / IV explainer that lived on the old summary (`beyondStage`) was
  // removed with it.
};
