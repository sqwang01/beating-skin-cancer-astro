/**
 * Melanoma Navigator — journey structure and entry routing.
 *
 * Durable content only (MELANOMA_MEDICAL_GUARDRAILS.md §11): the shape of the
 * Mad Rush / Marathon journey, the entry-screen choices, and links to existing
 * reviewed articles. No staging, treatment, or prognosis logic lives here.
 */

import type { Phase } from './types';

export interface JourneyStepMeta {
  id: string;
  phase: Phase;
  number: number;
  /** Short label for the progress list. */
  label: string;
  /** Set only when the guided module exists. */
  route?: string;
  status: 'available' | 'coming_soon';
  /** Existing reviewed pages that cover this step's ground. */
  learnMore: { label: string; href: string }[];
}

/**
 * The newly-diagnosed spine is a single linear sequence of four steps. Everyone
 * enters at Step 1; a "skip ahead" link inside each guided step lets people who
 * are further along jump forward without a separate entry point (MASTER_SPEC §3,
 * "do not force every user to begin at Step 1" — handled in-step, not on entry).
 * Prognosis / survival statistics are deliberately NOT a spine step; they live
 * in OPTIONAL_MODULES and are only reached by an explicit opt-in (MASTER_SPEC §8).
 */
export const MAD_RUSH_STEPS: JourneyStepMeta[] = [
  {
    id: 'pathology',
    phase: 'mad-rush',
    number: 1,
    label: 'Pathology report',
    route: '/melanoma/navigator/mad-rush/pathology',
    status: 'available',
    learnMore: [
      { label: 'Understanding your melanoma pathology report', href: '/melanoma/pathology-report' },
      { label: 'Breslow depth explained', href: '/melanoma/breslow-depth-explained' },
    ],
  },
  {
    id: 'stage',
    phase: 'mad-rush',
    number: 2,
    label: 'Stage',
    route: '/melanoma/navigator/mad-rush/stage',
    status: 'available',
    learnMore: [
      { label: 'What your melanoma stage means', href: '/melanoma/melanoma-stage-meaning' },
      { label: 'Sentinel lymph node biopsy', href: '/melanoma/sentinel-lymph-node-biopsy' },
    ],
  },
  {
    id: 'treatment',
    phase: 'mad-rush',
    number: 3,
    label: 'Treatment options for your stage',
    status: 'coming_soon',
    learnMore: [
      { label: 'Melanoma treatment options by stage', href: '/melanoma/melanoma-treatment-options' },
      { label: 'Melanoma clinical trials', href: '/melanoma/melanoma-clinical-trials' },
    ],
  },
  {
    id: 'find-experts',
    phase: 'mad-rush',
    number: 4,
    label: 'Build your care team',
    status: 'coming_soon',
    learnMore: [
      { label: 'Finding a melanoma specialist', href: '/melanoma/finding-a-melanoma-specialist' },
    ],
  },
];

/**
 * Off-spine modules the user chooses to open. Prognosis sits here rather than in
 * the four-step spine so survival statistics are never shown by default — the
 * Mad Rush map links it as an optional aside (MASTER_SPEC §8, GUARDRAILS).
 */
export const OPTIONAL_MODULES: JourneyStepMeta[] = [
  {
    id: 'prognosis',
    phase: 'mad-rush',
    number: 0,
    label: 'Understand prognosis (optional)',
    status: 'coming_soon',
    learnMore: [
      { label: 'What to expect after a melanoma diagnosis', href: '/melanoma/what-to-expect-after-diagnosis' },
    ],
  },
];

export interface EntryChoice {
  id: string;
  label: string;
  target:
    | { kind: 'route'; href: string }
    | { kind: 'coming-soon' }
    | { kind: 'concern' };
  phase?: Phase;
}

/**
 * Entry-screen choices (MASTER_SPEC §3). Reduced to the two journeys that
 * matter: newly diagnosed (where patients spend most of their time) and
 * long-term monitoring. The middle "further along" cases (understanding stage,
 * deciding treatment, finding a specialist) all live inside the newly-diagnosed
 * spine, reached by the skip-ahead links inside each step rather than by their
 * own entry point.
 */
export const ENTRY_CHOICES: EntryChoice[] = [
  {
    id: 'just_diagnosed',
    label: 'I was recently diagnosed and I’m trying to understand what it means.',
    target: { kind: 'route', href: '/melanoma/navigator/mad-rush/pathology' },
    phase: 'mad-rush',
  },
  {
    id: 'in_followup',
    label: 'I was treated for melanoma and now I’m being monitored.',
    target: { kind: 'coming-soon' },
    phase: 'marathon',
  },
];

/** Contextual notice (GUARDRAILS §12). Shown on every Navigator page. */
export const FOOTER_NOTICE =
  'This Navigator provides educational information and helps you organize questions and next steps. It does not diagnose melanoma or replace the recommendations of your treating clinicians.';

/** "I'm worried about a spot" — safety path, not a stubbed module (GUARDRAILS §7). */
export const CONCERN_MESSAGE = {
  title: 'A new or changing spot should be looked at by a clinician',
  body: [
    'This Navigator cannot look at a lesion or tell you whether a spot is melanoma. Its purpose is to help you organize information and questions.',
    'If you have a spot that is new, changing, growing, itching, bleeding, or that looks different from your other spots, contact a dermatologist and ask to be seen. If a lesion is changing rapidly, or a clinician has told you to seek urgent care, do not wait for a routine appointment.',
  ],
  cta: {
    label: 'Learn which changes matter',
    href: '/atypical-nevi/warning-signs-of-melanoma-change',
  },
};

/** Shared "coming soon" copy for the 7 not-yet-built entry choices. */
export const COMING_SOON_MESSAGE = {
  title: 'This part of the Navigator is coming soon',
  body: [
    'We are still building the guided module for this step. In the meantime, these reviewed articles cover the same ground:',
  ],
  /** Which learn-more link sets to surface, by Mad Rush step id. */
  stepIds: ['treatment', 'prognosis', 'find-experts'] as const,
  marathon: [
    { label: 'What to expect after a melanoma diagnosis', href: '/melanoma/what-to-expect-after-diagnosis' },
    { label: 'Finding a melanoma specialist', href: '/melanoma/finding-a-melanoma-specialist' },
    { label: '200 questions to ask your care team', href: '/questions-to-ask' },
  ],
};
