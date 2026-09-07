/**
 * Melanoma Navigator — gated medical rule sets.
 *
 * ⚠️  Nothing in this file is executed to produce a patient-facing T category
 *     or overall stage in the MVP. `STAGING_RULES_ENABLED` is `false` and every
 *     rule set below carries `status: 'draft'`.
 *
 * Per melanoma-navigator/MELANOMA_MEDICAL_GUARDRAILS.md §2, §4, §13 and
 * MAD_RUSH_STEP2_DEEP_SPEC.md §12, §16, §23, §35:
 *   - the source book (2024) predates the current guideline era;
 *   - a board dermatologist must compare each rule against the CURRENT AJCC
 *     edition and current NCCN (or chosen) guideline;
 *   - until then the Navigator shows `NEEDS_MEDICAL_REVIEW` / an "ask your
 *     physician" message instead of a computed result.
 *
 * Do NOT flip `STAGING_RULES_ENABLED` to `true`, and do NOT import these tables
 * into UI code for computation, until `meta.status === 'approved'` with a named
 * reviewer and review date on every set used.
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

/** Master switch. Keep `false` until every rule set below is `approved`. */
export const STAGING_RULES_ENABLED = false;

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
      'Beating Melanoma: The Ultimate Patient Resource, 2nd ed. (Wang SQ, 2024). Book cites AJCC 8th edition.',
    edition: 'AJCC 8th (per book) — NOT verified against the current edition',
    effectiveDate: '2024',
    reviewedDate: undefined,
    reviewedBy: undefined,
    status: 'draft',
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
    edition: 'AJCC 8th (per book) — NOT verified against the current edition',
    effectiveDate: '2024',
    status: 'draft',
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

/**
 * The ONLY function the Navigator calls for a T category in the MVP.
 * Intentionally performs no computation.
 */
export function tCategoryForPatient(): typeof NEEDS_MEDICAL_REVIEW {
  return NEEDS_MEDICAL_REVIEW;
}

/**
 * The ONLY function the Navigator calls for an overall stage in the MVP.
 * Intentionally performs no computation.
 */
export function overallStageForPatient(): typeof NEEDS_MEDICAL_REVIEW {
  return NEEDS_MEDICAL_REVIEW;
}
