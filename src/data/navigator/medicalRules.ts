/**
 * Melanoma Navigator — medical rule sets for the Step 2 stage estimate.
 *
 * Reviewed and approved 2026-09-07 by Steven Q. Wang, MD (Editor-in-Chief,
 * board-certified dermatologist) against the AJCC 8th edition melanoma staging
 * system. `STAGING_RULES_ENABLED` is `true`: `estimateStageGroup()` below runs
 * at page time to show the patient an EDUCATIONAL Stage I/II sub-group on the
 * Step 2 summary, always alongside a review notice and "your physician confirms
 * the stage" copy (see step2Staging.ts `summary.stageEstimate`).
 *
 * Scope of what is computed is deliberately narrow (per
 * melanoma-navigator/MELANOMA_MEDICAL_GUARDRAILS.md §2, §4, §13):
 *   - T category from Breslow thickness + ulceration (AJCC 8th);
 *   - the Stage I/II sub-group for a patient with a negative sentinel node (or
 *     none needed) and no distant spread.
 * Everything else stays with the clinician and falls through to the coarse
 * worded band + an "ask your physician" message: a positive node (Stage III),
 * distant spread (Stage IV), the III/IV sub-groups, clinical-vs-pathologic, and
 * any case where Breslow or ulceration was not entered.
 *
 * If a newer AJCC edition supersedes the 8th, or the review lapses, set
 * `STAGING_RULES_ENABLED = false` and each `meta.status` back to `'draft'`
 * until a board dermatologist re-approves.
 */

export const NEEDS_MEDICAL_REVIEW = 'NEEDS_MEDICAL_REVIEW' as const;
export const MEDICAL_CONTENT_REQUIRES_CURRENT_REVIEW =
  'MEDICAL_CONTENT_REQUIRES_CURRENT_REVIEW' as const;

export interface MedicalRuleSetMetadata {
  source: string;
  edition: string;
  effectiveDate?: string;
  reviewedDate?: string;
  reviewedBy?: string;
  status: 'draft' | 'approved' | 'retired';
}

/**
 * Master switch. `true` only while every rule set below is `approved` with a
 * named reviewer and date, and that review still holds against the current AJCC
 * edition. Flip back to `false` (and `meta.status` to `'draft'`) the moment
 * either stops being true.
 */
export const STAGING_RULES_ENABLED = true;

/**
 * Book-derived T-category reference (MAD_RUSH_STEP2_DEEP_SPEC.md §12).
 * Reference only — NOT a live rule engine.
 */
export const T_CATEGORY_RULESET: {
  meta: MedicalRuleSetMetadata;
  rules: { id: string; breslow: string; ulceration: string; tCategory: string }[];
} = {
  meta: {
    source:
      'Beating Melanoma: The Ultimate Patient Resource, 2nd ed. (Wang SQ, 2024), reconciled to AJCC 8th edition.',
    edition: 'AJCC 8th edition',
    effectiveDate: '2024',
    reviewedDate: '2026-09-07',
    reviewedBy: 'Steven Q. Wang, MD',
    status: 'approved',
  },
  rules: [
    { id: 'T1a', breslow: '<0.8 mm', ulceration: 'absent', tCategory: 'T1a' },
    { id: 'T1b-thin-ulcerated', breslow: '<0.8 mm', ulceration: 'present', tCategory: 'T1b' },
    { id: 'T1b-0.8-1.0', breslow: '0.8–1.0 mm', ulceration: 'either', tCategory: 'T1b' },
    { id: 'T2a', breslow: '>1.0–2.0 mm', ulceration: 'absent', tCategory: 'T2a' },
    { id: 'T2b', breslow: '>1.0–2.0 mm', ulceration: 'present', tCategory: 'T2b' },
    { id: 'T3a', breslow: '>2.0–4.0 mm', ulceration: 'absent', tCategory: 'T3a' },
    { id: 'T3b', breslow: '>2.0–4.0 mm', ulceration: 'present', tCategory: 'T3b' },
    { id: 'T4a', breslow: '>4.0 mm', ulceration: 'absent', tCategory: 'T4a' },
    { id: 'T4b', breslow: '>4.0 mm', ulceration: 'present', tCategory: 'T4b' },
  ],
};

/**
 * Book-derived stage-grouping reference (MAD_RUSH_STEP2_DEEP_SPEC.md §23).
 * Reference only — the Navigator never publishes this as a computed stage.
 */
export const STAGE_GROUPING_REFERENCE: {
  meta: MedicalRuleSetMetadata;
  groups: { stage: string; description: string }[];
} = {
  meta: {
    source: 'Beating Melanoma: The Ultimate Patient Resource, 2nd ed. (Wang SQ, 2024).',
    edition: 'AJCC 8th edition',
    effectiveDate: '2024',
    reviewedDate: '2026-09-07',
    reviewedBy: 'Steven Q. Wang, MD',
    status: 'approved',
  },
  groups: [
    { stage: 'Stage 0', description: 'Melanoma in situ / lentigo maligna; N0, M0.' },
    { stage: 'Stage IA', description: 'T1a or T1b with N0, M0.' },
    { stage: 'Stage IB', description: 'T2a with N0, M0.' },
    { stage: 'Stage IIA', description: 'T2b or T3a with N0, M0.' },
    { stage: 'Stage IIB', description: 'T3b or T4a with N0, M0.' },
    { stage: 'Stage IIC', description: 'T4b with N0, M0.' },
    {
      stage: 'Stage III',
      description:
        'Regional nodal or regional/non-regional metastatic findings, with no distant organ involvement. Subgroups IIIA–IIID are determined by the clinician.',
    },
    { stage: 'Stage IV', description: 'Distant metastasis.' },
  ],
};

/* ==========================================================================
 * Live stage estimate (approved 2026-09-07 — see file header).
 *
 * The ONLY computation the Navigator performs. It maps to a Stage I/II
 * sub-group and nothing else; every other situation returns a non-I/II status
 * for the caller to hand off to the coarse worded band.
 * ====================================================================== */

export type UlcerationInput = 'present' | 'absent' | 'unknown';

export type TCategory =
  | 'T1a' | 'T1b' | 'T2a' | 'T2b' | 'T3a' | 'T3b' | 'T4a' | 'T4b';

export type StageGroupI_II =
  | 'Stage IA' | 'Stage IB' | 'Stage IIA' | 'Stage IIB' | 'Stage IIC';

export interface StageEstimateInput {
  invasion: 'in_situ' | 'invasive' | 'unknown';
  /** Breslow thickness in mm, or `null` when the patient did not enter it. */
  breslowMm: number | null;
  ulceration: UlcerationInput;
  /** A positive node, in-transit / satellite / microsatellite disease. */
  nodePositive: boolean;
  /** Distant metastasis reported. */
  distant: boolean;
  /**
   * Where the sentinel node stands. Only `'negative'` and `'not_needed'`
   * settle a Stage I/II sub-group; anything else keeps it provisional.
   */
  slnb: 'negative' | 'not_needed' | 'positive' | 'pending' | 'unknown';
}

export interface StageEstimateResult {
  /**
   * confirmed    – T known, nodes accounted for: a settled Stage I/II sub-group.
   * provisional  – T known, sentinel node result still outstanding.
   * regional     – positive node / in-transit disease → Stage III (coarse band).
   * distant      – distant spread → Stage IV (coarse band).
   * in_situ      – Stage 0 (coarse band).
   * insufficient – no Breslow, or ulceration unknown where it decides the
   *                sub-letter → coarse band + "ask your physician".
   */
  status:
    | 'confirmed'
    | 'provisional'
    | 'regional'
    | 'distant'
    | 'in_situ'
    | 'insufficient';
  tCategory: TCategory | null;
  stageGroup: StageGroupI_II | null;
}

/**
 * AJCC 8th edition T category from Breslow thickness (mm) + ulceration.
 *
 * T1 is ≤1.0 mm. Within T1, T1a = <0.8 mm without ulceration; T1b = <0.8 mm
 * with ulceration, OR 0.8–1.0 mm regardless of ulceration. From T2 up, the
 * sub-letter is purely ulceration (a = absent, b = present), so an unknown
 * ulceration status there returns `null` rather than a guess. Thickness is
 * taken as recorded (measured to the nearest 0.1 mm); boundary values 1.0 / 2.0
 * / 4.0 mm sit in the lower category.
 */
export function tCategoryFor(
  breslowMm: number | null,
  ulceration: UlcerationInput,
): TCategory | null {
  if (breslowMm == null || Number.isNaN(breslowMm) || breslowMm <= 0) return null;
  const ulcerated = ulceration === 'present';
  const ulcerationKnown = ulceration !== 'unknown';

  if (breslowMm < 0.8) {
    if (!ulcerationKnown) return null;
    return ulcerated ? 'T1b' : 'T1a';
  }
  if (breslowMm <= 1.0) return 'T1b';
  if (!ulcerationKnown) return null;
  if (breslowMm <= 2.0) return ulcerated ? 'T2b' : 'T2a';
  if (breslowMm <= 4.0) return ulcerated ? 'T3b' : 'T3a';
  return ulcerated ? 'T4b' : 'T4a';
}

/** AJCC 8th edition Stage I/II sub-group for a T category with N0, M0. */
const GROUP_BY_T: Record<TCategory, StageGroupI_II> = {
  T1a: 'Stage IA',
  T1b: 'Stage IA',
  T2a: 'Stage IB',
  T2b: 'Stage IIA',
  T3a: 'Stage IIA',
  T3b: 'Stage IIB',
  T4a: 'Stage IIB',
  T4b: 'Stage IIC',
};

/**
 * The educational Stage I/II estimate. Returns a non-I/II `status` (for the
 * caller to defer to the coarse band) whenever the case is Stage 0/III/IV or
 * the pathology entries are incomplete.
 */
export function estimateStageGroup(input: StageEstimateInput): StageEstimateResult {
  const none: StageEstimateResult = { status: 'insufficient', tCategory: null, stageGroup: null };
  if (!STAGING_RULES_ENABLED) return none;
  if (input.distant) return { status: 'distant', tCategory: null, stageGroup: null };
  if (input.nodePositive) return { status: 'regional', tCategory: null, stageGroup: null };
  if (input.invasion === 'in_situ') return { status: 'in_situ', tCategory: null, stageGroup: null };
  if (input.invasion !== 'invasive') return none;

  // As of 2026-09-08 the Navigator UI no longer offers an "I can't find it"
  // option for ulceration (step1 `c2`, step2 `k0c`, and the `k0` / step3 `t0`
  // recap edits), so
  // `input.ulceration` is 'present' or 'absent' for any entered case and `t`
  // resolves whenever a Breslow value was given. This `insufficient` fall-through
  // now covers only a missing Breslow (which can't be staged anyway); the
  // ulceration-'unknown' handling stays as a defensive default.
  const t = tCategoryFor(input.breslowMm, input.ulceration);
  if (!t) return none;

  const nodesSettled = input.slnb === 'negative' || input.slnb === 'not_needed';
  return {
    status: nodesSettled ? 'confirmed' : 'provisional',
    tCategory: t,
    stageGroup: GROUP_BY_T[t],
  };
}
