/**
 * Mad Rush — the merged Step 1 + Step 2 + Step 3 guided journey.
 *
 * Step 1 (pathology report), Step 2 (stage), and Step 3 (treatment options) are
 * rendered into a SINGLE page by NavJourney.astro. When a step's summary
 * "continue" is pressed the engine advances to the next step's first screen in
 * the same DOM, so every answer the patient recorded earlier is still in memory
 * for the later steps to read — no sessionStorage, no re-asking (GUARDRAILS §10).
 *
 * `/melanoma/navigator/mad-rush/pathology` renders this journey with
 * `entry="step1"`; `/melanoma/navigator/mad-rush/stage` with `entry="step2"`;
 * `/melanoma/navigator/mad-rush/treatment` with `entry="step3"`. Steps 2 and 3
 * both fall back to a short capture / general picture when entered cold (no
 * earlier answers present).
 */

import type { JourneyDef } from './types';
import { STEP1 } from './step1Pathology';
import { STEP2 } from './step2Staging';
import { STEP3 } from './step3Treatment';

export const MAD_RUSH_JOURNEY: JourneyDef = {
  id: 'mad-rush-diagnosis',
  steps: [STEP1, STEP2, STEP3],
};
