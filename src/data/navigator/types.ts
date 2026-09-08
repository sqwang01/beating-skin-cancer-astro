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

/**
 * Mid-flow Stage I/II readout rendered at the top of a note (STEP2 spec §23).
 * Same rule as the summary's `StageEstimateConfig`, but the lymph nodes and
 * distant spread are not known yet at this point in the flow, so the result is
 * always shown provisional-framed. `{stage}` / `{t}` are substituted into
 * `copy`; `fallback` shows when Breslow or ulceration is insufficient.
 */
export interface NoteEstimateConfig {
  breslowKeys: string[];
  invasionInSitu: Record<string, string[]>[];
  invasionInvasive: Record<string, string[]>[];
  ulcerationPresent: Record<string, string[]>[];
  ulcerationAbsent: Record<string, string[]>[];
  copy: string;
  /**
   * Optional alternate `copy` used only when the resolved T category is `T1a`.
   * The T1a path routes straight from this screen to the stage picture (no lymph
   * node / distant screens), so the generic "the lymph node check is still
   * ahead" wording in `copy` does not apply. Falls back to `copy` when unset.
   */
  t1aCopy?: string;
  fallback: string;
  /**
   * Optional readout of the patient's OWN recorded values, shown between the
   * estimate value and `body`. Reads the recorded answer labels verbatim (no
   * interpretation): the first non-empty label among `breslowKeys` /
   * `ulcerationKeys`, or `missingText` when none is recorded.
   */
  patientEntries?: {
    heading: string;
    breslowLabel: string;
    ulcerationLabel: string;
    breslowKeys: string[];
    ulcerationKeys: string[];
    missingText: string;
  };
}

/** A note block revealed by a choice or shown inline on a screen. */
export interface Note {
  id: string;
  tone: 'info' | 'warn' | 'action';
  body: string[];
  /** Computed Stage I/II readout shown above `body` (see NoteEstimateConfig). */
  estimate?: NoteEstimateConfig;
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
   * it only reads and re-writes recorded answer labels. "I need to correct
   * something" opens an inline edit mode: each row with an `edit` block turns
   * into an input written straight back to `edit.key`. A `select` row may also
   * carry `presetsByValue` to write (or clear) sibling answers when a given
   * value is picked — the diagnosis row uses it to preset the invasive-only
   * pathology fields to "N/A" for an in-situ pick and clear them for an
   * invasive pick, so nothing has to route off the page to re-collect them.
   */
  recap?: {
    rows: {
      label: string;
      from: string[];
      /**
       * Makes this row an input in edit mode. `key` is the answer id the new
       * value is written to (overwriting whatever `from` was reading).
       * `control: 'text'` is a free-text field — blank clears the answer;
       * `control: 'select'` needs `options` and a blank pick leaves the answer
       * unchanged.
       */
      edit?: {
        key: string;
        control: 'text' | 'select';
        placeholder?: string;
        options?: { value: string; label: string }[];
        /**
         * `control: 'select'` only. When the saved value is a key in this map,
         * each `answerId → value` pair is also written back (a `null` value
         * deletes that answer instead of setting it). Lets one pick reset
         * sibling rows: an in-situ diagnosis presets the invasive-only pathology
         * fields to "N/A", an invasive diagnosis clears them so the T screens
         * re-collect Breslow + ulceration.
         */
        presetsByValue?: Record<string, Record<string, string | null>>;
      };
    }[];
    /** Shown when NONE of the rows' `from` keys hold an answer (cold entry). */
    emptyNext: string;
    confirmLabel: string;
    confirmNext: string;
    /** Label on the button that opens inline edit mode. */
    changeLabel: string;
    /** Where "Save changes" routes once the edited answers are written. */
    editSaveNext: string;
    editSaveLabel?: string;
    editCancelLabel?: string;
  };

  /** kind: 'field' | 'info' */
  next?: string;
  continueLabel?: string;
  /** Event fired on the info/field continue button. */
  continueEvent?: string;
  /**
   * kind: 'info' — renders a "print" button (window.print()) above the continue
   * button. Used by a terminal screen that hands the patient a list of questions
   * to take to their care team instead of routing on into the summary.
   */
  printLabel?: string;
  /**
   * kind: 'info' | 'recap' — after the continue/confirm target is resolved,
   * re-route based on earlier answers. First matching rule wins; falls through
   * to `next` / `recap.confirmNext` when nothing matches.
   */
  autoRoute?: RouteRule[];
  /**
   * kind: 'info' — computed re-route keyed on the AJCC 8th T category (from the
   * approved `tCategoryFor()` in medicalRules.ts) derived from the recorded
   * Breslow thickness + ulceration. Evaluated by the engine AFTER `autoRoute`
   * and BEFORE `next`. This is non-medical navigation only: it picks which
   * screen to show next (and may `record` a state token / add `questions`); it
   * computes and displays no stage. Used for the early exits (product decision
   * 2026-09-07, Dr. Wang; see MAD_RUSH_STEP2_DEEP_SPEC.md §16):
   *   - T1a — a thin (<0.8 mm), non-ulcerated invasive melanoma; records
   *     `{ T1a: 'seen' }`; the summary shows Stage IA (settled) + its caveat.
   *   - T2a–T4b — a thicker invasive melanoma with Breslow + ulceration known;
   *     records `{ earlyStage: 'seen' }`; the summary shows the IB/IIA/IIB/IIC
   *     sub-group as PROVISIONAL (a sentinel node biopsy is still expected).
   * Both skip the lymph node and distant-spread screens and route straight to
   * the stage picture. `unless` (matched on recorded answer values, like
   * `RouteRule.when`) suppresses the route — e.g. a doctor-reported Stage III/IV
   * keeps the patient on the full flow so the consistency checks apply.
   */
  autoRouteByTCat?: {
    breslowKeys: string[];
    invasionInvasive: Record<string, string[]>[];
    ulcerationPresent: Record<string, string[]>[];
    ulcerationAbsent: Record<string, string[]>[];
    routes: {
      tCategory: string[];
      unless?: Record<string, string[]>;
      next: string;
      /**
       * Answers to synthesize when this computed route is taken (screen id →
       * value). Lets summary rules keyed on a screen the route SKIPS still
       * resolve: the T1a early exit routes straight to the stage picture and
       * records `{ T1a: 'seen' }` so the summary shows its T1a band note and
       * caveat without a standalone screen. A state token only — no clinical
       * string, and it computes nothing.
       */
      record?: Record<string, string>;
      /**
       * Doctor questions to add to the running list when this route is taken
       * (the questions the skipped screen would have carried).
       */
      questions?: string[];
    }[];
  };

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
  rows: {
    key: string | string[];
    label: string;
    /**
     * Optional visibility gate. When set, the row shows only if every screen id
     * in the map holds one of the listed answer values (same shape as a route
     * `when`). Lets one logical field render in different sections by branch —
     * e.g. Step 1 "Margin status" sits under Diagnosis for in-situ / lentigo
     * maligna but under the invasive-fields block for invasive melanoma.
     */
    when?: Record<string, string[]>;
  }[];
  /**
   * Where the section renders on the summary. `'withEstimate'` pulls it inside
   * the stage-estimate block, directly under the estimate prose and above its
   * caveat (Step 2: "What your doctor has told you" + "From your pathology
   * report"). Omitted → the section renders in the default position, after the
   * stage-estimate block.
   */
  placement?: 'withEstimate';
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

/**
 * Step 2 summary — the educational Stage I/II estimate block (STEP2 spec §23,
 * "Product decision 2026-09-07"). The engine reads the patient's recorded
 * answers through these rule lists, calls `estimateStageGroup()` in
 * medicalRules.ts, and — only for a `confirmed` / `provisional` Stage I/II
 * result — renders `copy` (with `{stage}` / `{t}` substituted) plus the
 * `tableRows` breakdown with the matching row marked. Every other result hides
 * this block and lets `StageBand` show the coarse worded band instead.
 *
 * Each field that maps answers to one estimate input is an ARRAY of `when`
 * maps, OR-matched (any map fully satisfied → that input is set); this is how
 * one logical input (e.g. "ulceration present") can be fed by either the Step 1
 * or the Step 2 cold-entry screen.
 */
export interface StageEstimateConfig {
  heading: string;
  /** Screen ids whose recorded LABEL holds the raw Breslow value in mm. */
  breslowKeys: string[];
  invasionInSitu: Record<string, string[]>[];
  invasionInvasive: Record<string, string[]>[];
  ulcerationPresent: Record<string, string[]>[];
  ulcerationAbsent: Record<string, string[]>[];
  /**
   * Optional lymph-node / distant-spread answer mappings. Step 2 no longer asks
   * the N / M questions (simplified 2026-09-07, Dr. Wang), so these are omitted
   * there and every invasive case resolves `provisional`; kept optional for any
   * future summary that does collect them.
   */
  nodePositive?: Record<string, string[]>[];
  distant?: Record<string, string[]>[];
  slnbNegative?: Record<string, string[]>[];
  slnbNotNeeded?: Record<string, string[]>[];
  /** Plain text; `{stage}` and `{t}` are replaced with the computed values. */
  copy: { confirmed: string; provisional: string };
  /**
   * Optional extra caveat paragraphs shown under the estimate `copy`. The engine
   * shows the FIRST entry whose `when` list is satisfied (OR-matched on recorded
   * answer values); plain text with `{stage}` / `{t}` substituted. Unused since
   * the T1a / T2a–T4b early exits were removed 2026-09-07.
   */
  caveats?: { when: Record<string, string[]>[]; text: string }[];
  /** Fixed caveat under the estimate value. */
  notice: string;
  /** Sentence above the breakdown table. */
  tableIntro: string;
  /**
   * One row of the IA–IIC breakdown. `t` must equal a `TCategory` string so the
   * engine can mark the patient's row; `group` is the displayed stage group.
   */
  tableRows: { shows: string; t: string; group: string }[];
}

/**
 * Optional educational "what a higher stage means" block on the Step 2 summary
 * (added 2026-09-07, Dr. Wang). Pure worded explanation: no data is collected
 * for it and it computes nothing — it exists because Step 2 no longer asks the
 * N / M questions, so a node-positive or metastatic patient would otherwise see
 * nothing about Stage III / IV. `parts` are the Stage III and Stage IV
 * paragraphs; `when` is an OR-matched visibility gate on recorded answer values
 * (shown only when some map is satisfied — Step 2 gates it to an invasive
 * diagnosis so a Stage 0 in-situ patient never sees it). Rendered after the
 * stage-estimate block; it carries none of the print-suppressed control classes,
 * so it prints with the rest of the summary.
 */
export interface BeyondStageInfo {
  heading: string;
  intro: string;
  parts: { heading: string; body: string }[];
  closing?: string;
  when?: Record<string, string[]>[];
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

  whyItMatters?: string;
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
    /** Heading for the "questions to ask" list. Omit to hide the list entirely. */
    questionsHeading?: string;
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
    /**
     * Educational Stage I/II sub-group estimate (Step 2 only). When it produces
     * a result it supersedes `stageBand`; otherwise `stageBand` shows.
     */
    stageEstimate?: StageEstimateConfig;
    /**
     * Educational Stage III / IV explainer (Step 2 only). Rendered after the
     * stage-estimate block when its `when` gate matches. Omit to render nothing.
     */
    beyondStage?: BeyondStageInfo;
    /** Optional "Learn more" links shown on the summary (Step 2 only). */
    learnMore?: { label: string; href: string }[];
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
