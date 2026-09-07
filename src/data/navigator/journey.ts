/**
 * Mad Rush — the merged Step 1 + Step 2 guided journey.
 *
 * Step 1 (pathology report) and Step 2 (stage) are rendered into a SINGLE page
 * by NavJourney.astro. When Step 1's summary "continue" is pressed the engine
 * advances to Step 2's first screen in the same DOM, so every pathology answer
 * the patient recorded in Step 1 is still in memory for Step 2 to read — no
 * sessionStorage, no re-asking (GUARDRAILS §10).
 *
 * `/melanoma/navigator/mad-rush/pathology` renders this journey with
 * `entry="step1"`; `/melanoma/navigator/mad-rush/stage` renders it with
 * `entry="step2"` (a cold entry — Step 2's recap screen falls back to a short
 * three-question capture when no Step 1 answers are present).
 */

import type { JourneyDef } from './types';
import { STEP1 } from './step1Pathology';
import { STEP2 } from './step2Staging';

export const MAD_RUSH_JOURNEY: JourneyDef = {
  id: 'mad-rush-diagnosis',
  steps: [STEP1, STEP2],
};
