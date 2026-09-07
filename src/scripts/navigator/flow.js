/**
 * Melanoma Navigator — generic screen-flow engine.
 *
 * Drives the merged Mad Rush journey (Step 1 + Step 2) from data attributes
 * emitted by `src/components/navigator/NavJourney.astro`. It holds NO medical
 * copy: every string the patient sees is server-rendered from the step data
 * files. This engine only shows/hides screens, records answers IN MEMORY for
 * the session (so Step 1 answers feed Step 2 with no storage), persists
 * non-sensitive progress via store.js, and fires allow-listed analytics via
 * analytics.js.
 *
 * DOM contract (see NavJourney.astro):
 *   [data-nav-flow]                     root; data-phase, data-start,
 *                                       data-exit-href
 *   [data-hero-for="stepId"]            hero block; shown for the active step
 *   [data-why-for] / [data-notice-for]  ditto for the "why" + footer blocks
 *   [data-subprogress][data-step-id]    one sub-progress list per step
 *     [data-sp="key"]                   sub-progress items
 *   [data-screen="id"]                  a screen; data-step-id, data-view-event,
 *                                       data-sp-key, data-screen-next,
 *                                       data-auto-route, data-recap-empty-next
 *   [data-choice]                       decision button; data-value, data-label,
 *                                       data-next, data-event, data-status,
 *                                       data-flag, data-reveal, data-preset-answers
 *   [data-recap] [data-recap-row]       recap rows; data-recap-from (JSON array
 *                                       of answer screen ids), .r-value
 *   [data-recap-confirm] / [-change]    recap buttons; data-next
 *   [data-note="id"]                    hidden note block; may contain ul[data-dq]
 *                                       and a [data-info-next] continue button
 *   [data-checklist-continue]           data-next, data-next-partial, data-event,
 *                                       data-status-partial
 *   [data-field-input] / [data-field-continue]   data-next, data-event
 *   [data-info-next]                    data-next, data-event (auto-routes when
 *                                       not inside a [data-note])
 *   [data-nav-back]                     history back
 *   [data-summary-block][data-step-id]  one summary per step; id
 *                                       "nav-summary-<stepId>",
 *                                       data-summary-view-event,
 *                                       data-consistency-rules,
 *                                       data-next-step-start
 *   [data-stage-band]                   optional; data-stage-band-rules,
 *                                       data-stage-band-fallback, .band-value,
 *                                       .band-note
 *   [data-summary][data-summary-keys]   row; .s-value filled from first
 *                                       recorded answer among the keys
 *   [data-summary-questions]            <ul> filled with collected questions
 *   [data-consistency-note]             hidden; revealed when a rule trips
 *   [data-complete-step]               data-next ('NEXT_STEP' or href), data-event
 *   [data-print]                        window.print()
 *
 * Navigation sentinels as a `next` target: 'SUMMARY' (current step's summary),
 * 'EXIT' (leave to exitHref), 'NEXT_STEP' (next step's start screen).
 */

import { track } from './analytics.js';
import * as store from './store.js';

function parseJSON(raw, fallback) {
  try {
    return JSON.parse(raw);
  } catch (_) {
    return fallback;
  }
}

function fireEvents(spec, base) {
  (spec || '')
    .split(/\s+/)
    .filter(Boolean)
    .forEach((name) => track(name, base));
}

export function initFlow(root) {
  if (!root) return;

  const phase = root.dataset.phase;
  const startId = root.dataset.start;
  const exitHref = root.dataset.exitHref || '/melanoma/navigator';

  const screens = new Map();
  root.querySelectorAll('[data-screen]').forEach((el) => screens.set(el.dataset.screen, el));

  const summaries = new Map();
  root.querySelectorAll('[data-summary-block]').forEach((el) => summaries.set(el.dataset.stepId, el));

  const subLists = new Map();
  root.querySelectorAll('[data-subprogress]').forEach((el) => subLists.set(el.dataset.stepId, el));

  // stepId -> { start, rules } for the answer-driven entry gate (StepDef.enterRoute).
  const stepEntry = new Map();
  root.querySelectorAll('[data-summary-block]').forEach((el) => {
    stepEntry.set(el.dataset.stepId, {
      start: el.dataset.stepStart,
      rules: parseJSON(el.dataset.enterRoute, []),
    });
  });

  const answers = {}; // screenId -> { value, label }
  const doctorQuestions = new Set();
  const history = [];
  let currentStepId = null;

  function baseFor(el) {
    return {
      phase,
      step_id: el ? el.dataset.stepId : currentStepId,
      screen_id: el ? el.dataset.screen || el.id : undefined,
    };
  }

  /** True if `rule.when` is fully satisfied by recorded answer VALUES. */
  function ruleMatches(when) {
    return Object.entries(when || {}).every(([sid, allowed]) => {
      const a = answers[sid];
      return a && allowed.includes(a.value);
    });
  }

  function resolveRoute(rules) {
    const list = Array.isArray(rules) ? rules : [];
    const hit = list.find((r) => ruleMatches(r.when));
    return hit ? hit.next : null;
  }

  /**
   * Where a step actually opens: an `enterRoute` rule that already matches the
   * recorded answers wins (e.g. an in-situ diagnosis jumps straight to the Step 2
   * stage picture); otherwise the step's own `start` screen.
   */
  function entryTargetForScreen(startScreenId) {
    const sc = startScreenId && screens.get(startScreenId);
    const meta = sc && stepEntry.get(sc.dataset.stepId);
    if (!meta || !Array.isArray(meta.rules) || !meta.rules.length) return startScreenId;
    return resolveRoute(meta.rules) || startScreenId;
  }

  function firstAnswerLabel(keys) {
    for (const k of keys) {
      if (answers[k] && answers[k].label) return answers[k].label;
    }
    return null;
  }

  function currentId() {
    for (const [id, el] of summaries) {
      if (!el.hidden) return `SUMMARY:${id}`;
    }
    let id = null;
    screens.forEach((el, key) => {
      if (!el.hidden) id = key;
    });
    return id;
  }

  function updateSubProgress(spKey) {
    const list = subLists.get(currentStepId);
    if (!list) return;
    const items = Array.from(list.querySelectorAll('[data-sp]'));
    if (!items.length) return;
    if (spKey === '__done__') {
      items.forEach((li) => {
        li.dataset.state = 'done';
      });
      return;
    }
    const idx = items.findIndex((li) => li.dataset.sp === spKey);
    items.forEach((li, i) => {
      li.dataset.state =
        idx < 0 ? li.dataset.state || 'todo' : i < idx ? 'done' : i === idx ? 'current' : 'todo';
    });
  }

  function setActiveStep(stepId) {
    if (!stepId || stepId === currentStepId) return;
    currentStepId = stepId;
    subLists.forEach((el, id) => {
      el.hidden = id !== stepId;
    });
    document.querySelectorAll('[data-hero-for]').forEach((el) => {
      el.hidden = el.dataset.heroFor !== stepId;
    });
    document.querySelectorAll('[data-why-for]').forEach((el) => {
      el.hidden = el.dataset.whyFor !== stepId;
    });
    document.querySelectorAll('[data-notice-for]').forEach((el) => {
      el.hidden = el.dataset.noticeFor !== stepId;
    });
    store.markViewed(stepId);
    store.setCurrentStep(stepId);
    track('journey_step_viewed', { phase, step_id: stepId });
  }

  function collectDoctorQuestions(scope) {
    if (!scope) return;
    scope.querySelectorAll('ul[data-dq]').forEach((ul) => {
      if (ul.closest('[hidden]')) return;
      ul.querySelectorAll('li').forEach((li) => {
        const text = li.textContent.trim();
        if (text) doctorQuestions.add(text);
      });
    });
  }

  /** Fill a recap screen's rows. Returns false when nothing could be filled. */
  function fillRecap(screenEl) {
    let filled = 0;
    screenEl.querySelectorAll('[data-recap-row]').forEach((row) => {
      const keys = parseJSON(row.dataset.recapFrom, []);
      const label = firstAnswerLabel(keys);
      const valueEl = row.querySelector('.r-value');
      if (label) {
        if (valueEl) valueEl.textContent = label;
        row.hidden = false;
        filled += 1;
      } else {
        row.hidden = true;
      }
    });
    return filled > 0;
  }

  function hideAll() {
    screens.forEach((el) => {
      el.hidden = true;
    });
    summaries.forEach((el) => {
      el.hidden = true;
    });
  }

  function show(id) {
    if (!id) return;
    if (id === 'EXIT') {
      window.location.href = exitHref;
      return;
    }

    let target = null;
    let isSummary = false;
    if (id === 'SUMMARY') {
      target = summaries.get(currentStepId);
      isSummary = true;
    } else if (id === 'NEXT_STEP') {
      const nextStart = summaries.get(currentStepId)?.dataset.nextStepStart;
      return show(entryTargetForScreen(nextStart));
    } else if (id.startsWith('SUMMARY:')) {
      target = summaries.get(id.slice(8));
      isSummary = true;
    } else {
      target = screens.get(id);
    }
    if (!target) return;

    hideAll();
    target.querySelectorAll('[data-note]').forEach((n) => {
      n.hidden = true;
    });
    target.hidden = false;

    // A recap screen with no carried answers forwards to its cold-capture path.
    if (!isSummary && target.dataset.screen && target.querySelector('[data-recap]')) {
      const any = fillRecap(target);
      if (!any && target.dataset.recapEmptyNext) {
        fireEvents(target.dataset.viewEvent, baseFor(target));
        setActiveStep(target.dataset.stepId);
        return show(target.dataset.recapEmptyNext);
      }
    }

    try {
      root.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (_) {
      window.scrollTo(0, 0);
    }

    setActiveStep(target.dataset.stepId);

    if (isSummary) {
      renderSummary(target);
      updateSubProgress('__done__');
      fireEvents(target.dataset.summaryViewEvent, { phase, step_id: target.dataset.stepId, screen_id: 'summary' });
    } else {
      fireEvents(target.dataset.viewEvent, baseFor(target));
      updateSubProgress(target.dataset.spKey || '');
    }
  }

  function goTo(next) {
    if (!next) return;
    const cur = currentId();
    if (cur) history.push(cur);
    show(next);
  }

  function recordAnswer(screenEl, value, label) {
    answers[screenEl.dataset.screen] = { value, label: (label || '').trim() };
  }

  /* ----------------------------------------------------- decision buttons */
  root.querySelectorAll('[data-choice]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const screenEl = btn.closest('[data-screen]');
      const stepId = screenEl.dataset.stepId;
      recordAnswer(screenEl, btn.dataset.value, btn.dataset.label || btn.textContent);
      if (btn.dataset.presetAnswers) {
        const preset = parseJSON(btn.dataset.presetAnswers, null);
        if (preset) {
          Object.entries(preset).forEach(([sid, label]) => {
            answers[sid] = { value: 'preset', label: String(label).trim() };
          });
        }
      }
      fireEvents(btn.dataset.event, { phase, step_id: stepId, screen_id: screenEl.dataset.screen });
      if (btn.dataset.status) store.setStepStatus(stepId, btn.dataset.status);
      if (btn.dataset.flag) store.setFlag(btn.dataset.flag, true);

      collectDoctorQuestions(screenEl);

      if (btn.dataset.reveal) {
        const note = screenEl.querySelector(`[data-note="${btn.dataset.reveal}"]`);
        if (note) {
          note.hidden = false;
          collectDoctorQuestions(note);
          try {
            note.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          } catch (_) {
            /* no-op */
          }
          // A note with its own continue button drives the next step; a note
          // without one is informational and the screen's flow proceeds.
          if (note.querySelector('[data-info-next]')) return;
        }
      }
      goTo(btn.dataset.next || screenEl.dataset.screenNext);
    });
  });

  /* ------------------------------------------------------- recap buttons */
  root.querySelectorAll('[data-recap-confirm]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const screenEl = btn.closest('[data-screen]');
      collectDoctorQuestions(screenEl);
      const forced = resolveRoute(parseJSON(screenEl.dataset.autoRoute, []));
      goTo(forced || btn.dataset.next);
    });
  });
  root.querySelectorAll('[data-recap-change]').forEach((btn) => {
    btn.addEventListener('click', () => {
      goTo(btn.dataset.next);
    });
  });

  /* ---------------------------------------------------- checklist screens */
  root.querySelectorAll('[data-checklist-continue]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const screenEl = btn.closest('[data-screen]');
      const stepId = screenEl.dataset.stepId;
      const boxes = Array.from(screenEl.querySelectorAll('input[type="checkbox"]'));
      const allChecked = boxes.length > 0 && boxes.every((b) => b.checked);
      recordAnswer(
        screenEl,
        allChecked ? 'all_confirmed' : 'partly_confirmed',
        allChecked ? 'All items confirmed' : 'Not all items confirmed',
      );
      fireEvents(btn.dataset.event, { phase, step_id: stepId, screen_id: screenEl.dataset.screen });

      const note = screenEl.querySelector('[data-note="mismatch"]');
      if (!allChecked) {
        if (btn.dataset.statusPartial) store.setStepStatus(stepId, btn.dataset.statusPartial);
        if (note) {
          note.hidden = false;
          collectDoctorQuestions(note);
        }
      }
      goTo(allChecked ? btn.dataset.next : btn.dataset.nextPartial || btn.dataset.next);
    });
  });

  /* -------------------------------------------------------- field screens */
  root.querySelectorAll('[data-field-continue]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const screenEl = btn.closest('[data-screen]');
      const stepId = screenEl.dataset.stepId;
      const input = screenEl.querySelector('[data-field-input]');
      const raw = ((input && input.value) || '').trim();
      recordAnswer(screenEl, raw ? 'entered' : 'not_recorded', raw || 'Not recorded');
      if (!raw) {
        const note = screenEl.querySelector('[data-note]');
        if (note) {
          note.hidden = false;
          collectDoctorQuestions(note);
        }
      }
      fireEvents(btn.dataset.event, { phase, step_id: stepId, screen_id: screenEl.dataset.screen });
      collectDoctorQuestions(screenEl);
      goTo(btn.dataset.next);
    });
  });

  /* --------------------------------------------- info / note continue */
  root.querySelectorAll('[data-info-next]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const screenEl = btn.closest('[data-screen]');
      fireEvents(btn.dataset.event, { phase, step_id: screenEl.dataset.stepId, screen_id: screenEl.dataset.screen });
      collectDoctorQuestions(screenEl);
      // Auto-route only from a screen-level continue, never a note's own button.
      const inNote = btn.closest('[data-note]');
      const forced = inNote ? null : resolveRoute(parseJSON(screenEl.dataset.autoRoute, []));
      goTo(forced || btn.dataset.next);
    });
  });

  /* -------------------------------------------------------------- back */
  root.querySelectorAll('[data-nav-back]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const prev = history.pop();
      if (prev) show(prev);
      else window.location.href = exitHref;
    });
  });

  /* ----------------------------------------------- learn-more analytics */
  root.querySelectorAll('details[data-learn-more]').forEach((d) => {
    d.addEventListener('toggle', () => {
      if (!d.open) return;
      const sc = d.closest('[data-screen]');
      track('learn_more_opened', {
        phase,
        step_id: (sc && sc.dataset.stepId) || currentStepId,
        screen_id: (sc && sc.dataset.screen) || 'summary',
      });
      store.markOpened(currentStepId, 'learn_more');
    });
  });
  root.querySelectorAll('details[data-doctor-questions-toggle]').forEach((d) => {
    d.addEventListener('toggle', () => {
      if (!d.open) return;
      track('doctor_questions_opened', { phase, step_id: currentStepId });
      store.markOpened(currentStepId, 'doctor_questions');
    });
  });

  /* ----------------------------------------------------------- summary */
  function renderSummary(summaryEl) {
    if (!summaryEl) return;

    summaryEl.querySelectorAll('[data-summary]').forEach((row) => {
      const keys = parseJSON(row.dataset.summaryKeys, []);
      const label = firstAnswerLabel(keys);
      const valueEl = row.querySelector('.s-value');
      if (label) {
        if (valueEl) valueEl.textContent = label;
        row.hidden = false;
      } else {
        row.hidden = true;
      }
    });

    // Drop a section heading whose rows are all empty (e.g. the in-situ path,
    // which records nothing under "lymph nodes and spread").
    summaryEl.querySelectorAll('[data-summary-section]').forEach((sec) => {
      const rows = Array.from(sec.querySelectorAll('[data-summary]'));
      sec.hidden = rows.length > 0 && rows.every((r) => r.hidden);
    });

    const band = summaryEl.querySelector('[data-stage-band]');
    if (band) {
      const rules = parseJSON(band.dataset.stageBandRules, []);
      const fallback = parseJSON(band.dataset.stageBandFallback, { band: '', note: '' });
      const hit = rules.find((r) => ruleMatches(r.when)) || fallback;
      const v = band.querySelector('.band-value');
      const n = band.querySelector('.band-note');
      if (v) v.textContent = hit.band || '';
      if (n) n.textContent = hit.note || '';
      band.hidden = false;
    }

    const list = summaryEl.querySelector('[data-summary-questions]');
    if (list) {
      list.textContent = '';
      const items = Array.from(doctorQuestions);
      if (!items.length) {
        const li = document.createElement('li');
        li.textContent = 'No extra questions were flagged during this step.';
        list.appendChild(li);
      } else {
        items.forEach((q) => {
          const li = document.createElement('li');
          li.textContent = q;
          list.appendChild(li);
        });
      }
    }

    maybeShowConsistencyNote(summaryEl);

    root.dispatchEvent(
      new CustomEvent('nav:summary', {
        detail: { answers: { ...answers }, doctorQuestions: Array.from(doctorQuestions) },
      }),
    );
  }

  /**
   * UX-safety consistency guard (STEP2 spec §28). Reveals the neutral
   * "confirm with your doctor" note when patient-entered answers don't fit
   * together the usual way. Never says which entry is wrong; never edits data.
   */
  function maybeShowConsistencyNote(summaryEl) {
    const note = summaryEl.querySelector('[data-consistency-note]');
    if (!note) return;
    const rules = parseJSON(summaryEl.dataset.consistencyRules, []);
    const tripped = rules.some((rule) => ruleMatches(rule.when));
    if (tripped) note.hidden = false;
  }

  root.querySelectorAll('[data-complete-step]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const summaryEl = btn.closest('[data-summary-block]');
      const stepId = summaryEl ? summaryEl.dataset.stepId : currentStepId;
      store.setStepStatus(stepId, 'complete');
      track('journey_step_completed', { phase, step_id: stepId, completion_status: 'complete' });
      fireEvents(btn.dataset.event, { phase, step_id: stepId });
      const next = btn.dataset.next;
      if (!next) return;
      if (next === 'NEXT_STEP') {
        goTo('NEXT_STEP');
      } else {
        window.location.href = next;
      }
    });
  });

  root.querySelectorAll('[data-print]').forEach((btn) => {
    btn.addEventListener('click', () => window.print());
  });

  show(entryTargetForScreen(startId));
}
