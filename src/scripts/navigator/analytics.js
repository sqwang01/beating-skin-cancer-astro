/**
 * Melanoma Navigator analytics.
 *
 * Sends anonymous product-flow events to GA4 (window.gtag, loaded globally in
 * Layout.astro). Per MELANOMA_MEDICAL_GUARDRAILS.md §10 and the Step specs:
 * NO pathology values, stage, node status, organ sites, or free text may ever
 * reach analytics. This module enforces that with two allow-lists — unknown
 * event names and unknown / unsafe property values are dropped silently.
 */

const ALLOWED_EVENTS = new Set([
  // navigator-level
  'melanoma_navigator_started',
  'journey_phase_selected',
  'journey_step_viewed',
  'journey_step_completed',
  'learn_more_opened',
  'doctor_questions_opened',
  'navigator_resumed',
  'navigator_completed_mad_rush',
  // step 1
  'melanoma_step1_started',
  'pathology_report_has_copy',
  'pathology_report_needs_copy',
  'pathology_diagnosis_reviewed',
  'pathology_invasive_fields_reviewed',
  'melanoma_step1_completed',
  // step 2 (N / M question track removed 2026-09-07 — recap → summary only)
  'melanoma_step2_started',
  'step2_staging_summary_viewed',
  'melanoma_step2_completed',
  // step 3 (treatment options — recap → computed bridge → terminal stage screen;
  // no summary. Each stage screen's "finish" fires melanoma_step3_completed +
  // navigator_completed_mad_rush)
  'melanoma_step3_started',
  'melanoma_step3_completed',
]);

const ALLOWED_PROP_KEYS = new Set([
  'phase',
  'step_id',
  'entry_point',
  'screen_id',
  'completion_status',
]);

/** Only short, opaque identifiers — never free text or medical values. */
const SAFE_VALUE = /^[a-z0-9_-]{1,40}$/i;

export function track(name, props = {}) {
  if (!ALLOWED_EVENTS.has(name)) return;

  const clean = {};
  for (const key of Object.keys(props || {})) {
    if (!ALLOWED_PROP_KEYS.has(key)) continue;
    const value = props[key];
    if (typeof value !== 'string' || !SAFE_VALUE.test(value)) continue;
    clean[key] = value;
  }

  try {
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', name, clean);
    }
  } catch (_) {
    /* analytics must never break the Navigator */
  }
}
