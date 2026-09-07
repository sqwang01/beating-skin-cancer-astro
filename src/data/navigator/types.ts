/**
 * Shared types for the Melanoma Navigator.
 *
 * These describe the STRUCTURE of the guided journey (screens, choices, flow),
 * not clinical logic. All patient-facing copy lives in the sibling data files
 * (`journeyMap.ts`, `step1Pathology.ts`, `step2Staging.ts`); UI components and
 * the flow engine hold no medical strings.
 *
 * Source specs: melanoma-navigator/MELANOMA_NAVIGATOR_MASTER_SPEC.md,
 * MAD_RUSH_STEP1_DEEP_SPEC.md, MAD_RUSH_STEP2_DEEP_SPEC.md,
 * MELANOMA_MEDICAL_GUARDRAILS.md.
 */

export type Phase = 'mad-rush' | 'marathon';

/** Persisted step status (see MASTER_SPEC §4.H / §5). */
export type StepStatus =
  | 'not_started'
  | 'in_progress'
  | 'complete'
  | 'waiting'
  | 'needs_attention';

/** A note block revealed by a choice or shown inline on a screen. */
export interface Note {
  id: string;
  tone: 'info' | 'warn' | 'action';
  body: string[];
  /** Questions to carry into the Step summary if this note is shown. */
  doctorQuestions?: string[];
  /** Optional "continue" affordance when a note gates progress. */
  continue?: { label: string; next: string; event?: string };
  /** Always-visible supporting text (not revealed by a choice, never hidden). */
  static?: boolean;
}

/** One selectable answer on a decision screen. */
export interface Choice {
  value: string;
  label: string;
  /**
   * Optional muted helper text shown next to the label on the button only.
   * Not part of the recorded answer (the summary shows `label` alone).
   */
  hint?: string;
  /** Screen id to advance to, or the sentinels 'SUMMARY' / 'EXIT'. */
  next?: string;
  /** Allow-listed analytics event fired when chosen. */
  event?: string;
  /** Step status to record when chosen. */
  status?: StepStatus;
  /** Non-sensitive navigation flag to persist (boolean true). */
  flag?: string;
  /** Id of a Note on the same screen to reveal instead of / before advancing. */
  reveal?: string;
  /**
   * Summary answers to pre-fill when this choice is taken, as
   * `{ screenId: label }`. Used when a branch skips screens whose value is
   * known from the branch itself (e.g. invasive-only fields on an in-situ
   * diagnosis). Held in memory only, like every other recorded answer.
   */
  presetAnswers?: Record<string, string>;
}

export type ScreenKind = 'decision' | 'checklist' | 'field' | 'info' | 'recap';

/**
 * Navigation sentinels understood by the flow engine as a `next` target:
 *   'SUMMARY'   — the current step's own summary screen
 *   'EXIT'      — leave the Navigator (to the journey's exitHref)
 *   'NEXT_STEP' — advance to the next step's start screen (merged journey only)
 */
export const NEXT_STEP = 'NEXT_STEP' as const;

/**
 * A rule that re-routes based on answers recorded on EARLIER screens (possibly
 * in an earlier step). First matching rule wins. Used by `recap` confirm and by
 * `info` continue via `Screen.autoRoute` — never on a `decision` screen, which
 * branches through its choices.
 */
export interface RouteRule {
  when: Record<string, string[]>;
  next: string;
}

export interface Screen {
  id: string;
  kind: ScreenKind;
  /** Key into the step's sub-progress list. */
  spKey?: string;
  /** Allow-listed analytics event fired when the screen is shown. */
  viewEvent?: string;
  title: string;
  body?: string[];
  prompt?: string;
  hint?: string;

  /** kind: 'decision' */
  choices?: Choice[];

  /** kind: 'checklist' — plain checkbox labels, no interpretation. */
  checklist?: string[];
  checklistContinueLabel?: string;
  checklistNextAll?: string;
  checklistNextPartial?: string;
  checklistEvent?: string;
  checklistStatusPartial?: StepStatus;
  checklistMismatchNote?: Note;

  /** kind: 'field' — in-memory only, never persisted (GUARDRAILS §10). */
  field?: {
    key: string;
    label: string;
    type: 'text' | 'decimal';
    placeholder?: string;
    /** Shown under the input, e.g. "Copy the value exactly as written." */
    help?: string;
  };

  /**
   * kind: 'recap' — echoes answers recorded earlier back to the patient for a
   * single "yes, that's right / something's changed" confirmation, so a later
   * step never re-asks what an earlier step already captured. No medical logic:
   * it only reads recorded answer labels.
   */
  recap?: {
    rows: { label: string; from: string[] }[];
    /** Shown when NONE of the rows' `from` keys hold an answer (cold entry). */
    emptyNext: string;
    confirmLabel: string;
    confirmNext: string;
    changeLabel: string;
    changeNext: string;
  };

  /** kind: 'field' | 'info' */
  next?: string;
  continueLabel?: string;
  /** Event fired on the info/field continue button. */
  continueEvent?: string;
  /**
   * kind: 'info' | 'recap' — after the continue/confirm target is resolved,
   * re-route based on earlier answers. First matching rule wins; falls through
   * to `next` / `recap.confirmNext` when nothing matches.
   */
  autoRoute?: RouteRule[];

  notes?: Note[];
  /** Always-visible "Questions to ask your doctor" block on this screen. */
  doctorQuestions?: string[];
  learnMore?: { label: string; href: string }[];
  /** Renders <MedicalReviewNotice> with this token when set. */
  medicalReviewNotice?: string;
}

export interface SummarySection {
  heading: string;
  /**
   * Each row maps to one or more screen ids; the first recorded answer label
   * fills it in. A row with no recorded answer is hidden. An array lets one
   * logical row (e.g. "Breslow thickness") be fed by either the Step 1 field
   * or the Step 2 cold-entry field.
   */
  rows: { key: string | string[]; label: string }[];
}

/**
 * Optional worded stage band on the Step 2 summary (STEP2 spec §22, §24).
 * The engine picks the FIRST matching rule and renders `band` + the fixed
 * `notice`. Bands are deliberately coarse — "Stage 0", "Stage I–II",
 * "Stage III", "Stage IV" — the boundaries between those four are stable across
 * AJCC editions. No sub-stage, no threshold math, no survival. This is NOT the
 * gated T-category / stage-grouping engine in medicalRules.ts.
 */
export interface StageBand {
  heading: string;
  notice: string;
  rules: { when: Record<string, string[]>; band: string; note?: string }[];
  fallback: { band: string; note?: string };
}

export interface StepDef {
  id: 'step1' | 'step2';
  phase: Phase;
  number: number;
  total: number;
  slug: string;

  metaTitle: string;
  metaDescription: string;

  heroKicker: string; // e.g. "Mad Rush • Step 1 of 4"
  heroTitle: string;
  heroSubtitle: string;
  backHref: string;
  backLabel: string;
  /** Where "Back" from the first screen and EXIT sentinels go. */
  exitHref: string;

  whyItMatters: string;
  contextualDisclaimer?: string;
  /**
   * Optional "I'm further along — jump ahead" link shown under the hero subtitle.
   * Non-medical navigation only: it moves the user to the next guided step, it
   * does not skip or pre-fill any clinical content (MASTER_SPEC §3).
   */
  skipAhead?: { href: string; label: string };

  start: string;
  /**
   * Optional answer-driven entry gate (merged journey only). Evaluated by the
   * engine the moment this step is entered — a cold page load, or the previous
   * step's `completeNext: 'NEXT_STEP'`. First matching rule wins and its `next`
   * is shown in place of `start`; nothing matches → `start` as usual. `next`
   * must be a concrete screen id or a step-qualified summary sentinel
   * ('SUMMARY:step2') — never the bare 'SUMMARY', since the entering step is not
   * active yet when this runs. Non-medical routing only: it skips screens whose
   * outcome is already fixed by earlier answers; it never computes anything.
   */
  enterRoute?: RouteRule[];
  subProgress: { key: string; label: string }[];
  screens: Screen[];

  summary: {
    title: string;
    intro?: string;
    sections: SummarySection[];
    questionsHeading: string;
    /** Neutral UX-safety note (never says which entry is "wrong"). */
    consistencyNote?: string;
    /**
     * UX-safety consistency checks (STEP2 spec §28). If every screen id in a
     * rule's `when` map holds one of the listed answer values, the neutral
     * `consistencyNote` is revealed on the summary. Not diagnostic; never
     * corrects or names a "wrong" entry.
     */
    consistencyRules?: { id: string; when: Record<string, string[]> }[];
    /** Worded stage band (Step 2 only). Omit to show no band. */
    stageBand?: StageBand;
    /** Allow-listed analytics event fired when the summary is shown. */
    viewEvent?: string;
    printLabel: string;
    completeLabel: string;
    /** A route sentinel ('NEXT_STEP') or an href. */
    completeNext: string;
    completeEvent?: string;
    completeNote?: string;
  };
}

/**
 * A merged guided journey: several `StepDef`s rendered into ONE page so answers
 * recorded in an earlier step stay in memory and feed later steps with no
 * storage and no re-asking (GUARDRAILS §10). The flow engine walks `steps` in
 * order; a step's summary `completeNext: 'NEXT_STEP'` advances to the next
 * step's `start` screen in the same DOM.
 */
export interface JourneyDef {
  id: string;
  steps: StepDef[];
}

/* --------------------------------------------------------------------------
 * Carry-forward shapes (STEP1 spec §16, STEP2 spec §29). Held in memory for
 * the active session only in the MVP — NOT written to localStorage.
 * ---------------------------------------------------------------------- */

export type YesNoUnknown = 'yes' | 'no' | 'unknown';
export type PresentAbsentUnknown = 'present' | 'absent' | 'unknown';

export interface MelanomaPathologySummary {
  reportObtained: boolean;

  diagnosisClear: YesNoUnknown;
  diagnosisText?: string;

  invasionCategory: 'in_situ' | 'invasive' | 'unknown';

  breslowMm?: number;
  breslowStatus?: 'found' | 'not_found' | 'unknown';

  ulceration?: PresentAbsentUnknown;
  mitoticRateText?: string;
  lymphovascularInvasion?: PresentAbsentUnknown;
  regression?: PresentAbsentUnknown;
  neurotropism?: PresentAbsentUnknown;
  marginStatus?: string;

  pathologistName?: string;
  dermatopathologistStatus?: YesNoUnknown;

  secondOpinionDiscussionPlanned?: boolean;
  secondReportExists?: boolean;
  reportsAgree?: YesNoUnknown;

  status: 'complete' | 'waiting' | 'needs_attention';
}

export interface MelanomaStagingSummary {
  doctorReportedStage?: string;
  stageTypeKnown?: 'clinical' | 'pathologic' | 'unknown';
  definitiveSurgeryStatus?: 'completed' | 'not_completed' | 'unknown';
  invasionCategory?: 'in_situ' | 'invasive' | 'unknown';
  breslowMm?: number;
  ulceration?: PresentAbsentUnknown;
  tCategory?: string;
  tCategoryStatus?: 'doctor_confirmed' | 'navigator_educational_estimate' | 'unknown';
  slnbStatus?:
    | 'not_discussed'
    | 'not_needed_per_doctor'
    | 'considering'
    | 'scheduled'
    | 'negative'
    | 'positive'
    | 'unknown';
  clinicallyDetectedNode?: YesNoUnknown;
  regionalDiseaseTerms?: string[];
  distantMetastasisReported?: 'yes' | 'no' | 'unknown' | 'not_evaluated';
  distantSites?: string[];
  imagingStatus?: string[];
  navigatorStageEstimate?: string;
  navigatorStageEstimateStatus?: 'available' | 'incomplete' | 'not_enabled';
  outstandingQuestions?: string[];
  status:
    | 'complete'
    | 'waiting_for_staging_information'
    | 'needs_clinician_clarification';
}
