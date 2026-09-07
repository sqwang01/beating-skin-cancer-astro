/**
 * Melanoma Navigator progress store (MVP).
 *
 * localStorage only, anonymous, no account (MASTER_SPEC §6, GUARDRAILS §10).
 * What is persisted: current phase, current step, per-step status, which
 * learn-more / doctor-question sections were opened, and non-sensitive
 * navigation flags.
 *
 * What is NOT persisted: any pathology value, stage, node status, organ site,
 * or free text. Those live in memory for the active session only (handled by
 * flow.js, never written here).
 *
 * Every access is wrapped in try/catch so the Navigator still works when
 * storage is unavailable (private mode, blocked cookies, etc.).
 */

const KEY = 'bsc.melanoma.navigator.v1';
const SCHEMA = 1;

function safeUUID() {
  try {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  } catch (_) {
    /* fall through */
  }
  return 'sid-' + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function blank() {
  return {
    schema: SCHEMA,
    sessionId: safeUUID(),
    phase: null,
    currentStep: null,
    entryPoint: null,
    /** stepId -> { status, viewed, opened: {} } */
    steps: {},
    /** non-sensitive navigation flags */
    flags: {},
    updatedAt: Date.now(),
  };
}

export function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return blank();
    const data = JSON.parse(raw);
    if (!data || data.schema !== SCHEMA) return blank();
    return { ...blank(), ...data, steps: data.steps || {}, flags: data.flags || {} };
  } catch (_) {
    return blank();
  }
}

export function save(state) {
  try {
    state.updatedAt = Date.now();
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch (_) {
    /* storage unavailable — session continues in memory */
  }
}

export function update(fn) {
  const s = load();
  fn(s);
  save(s);
  return s;
}

function ensureStep(s, stepId) {
  s.steps[stepId] = s.steps[stepId] || { status: 'not_started', viewed: false, opened: {} };
  return s.steps[stepId];
}

export function setPhase(phase) {
  return update((s) => {
    s.phase = phase;
  });
}

export function setEntryPoint(entryPoint) {
  return update((s) => {
    s.entryPoint = entryPoint;
  });
}

export function setCurrentStep(stepId) {
  return update((s) => {
    s.currentStep = stepId;
  });
}

export function markViewed(stepId) {
  return update((s) => {
    const step = ensureStep(s, stepId);
    step.viewed = true;
    if (step.status === 'not_started') step.status = 'in_progress';
  });
}

export function setStepStatus(stepId, status) {
  return update((s) => {
    ensureStep(s, stepId).status = status;
  });
}

export function markOpened(stepId, key) {
  return update((s) => {
    ensureStep(s, stepId).opened[key] = true;
  });
}

export function setFlag(name, value = true) {
  return update((s) => {
    s.flags[name] = value;
  });
}

export function getStepStatus(stepId) {
  const s = load();
  return s.steps[stepId] ? s.steps[stepId].status : 'not_started';
}

export function hasProgress() {
  const s = load();
  return Boolean(s.phase || s.currentStep || Object.keys(s.steps).length);
}

export function clear() {
  try {
    localStorage.removeItem(KEY);
  } catch (_) {
    /* no-op */
  }
}
