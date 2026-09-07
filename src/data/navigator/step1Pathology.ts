/**
 * Mad Rush — Step 1: Understand Your Pathology Report.
 *
 * Screen flow and all patient-facing copy, derived from
 * melanoma-navigator/MAD_RUSH_STEP1_DEEP_SPEC.md and
 * MELANOMA_JOURNEY_CONTENT.md (MR-1). Copy is concise and original while
 * preserving the book's framework.
 *
 * Guardrails honoured here (MELANOMA_MEDICAL_GUARDRAILS.md / STEP1 spec §17):
 *   - Step 1 helps the patient LOCATE and RECORD pathology fields. It never
 *     interprets them, never assigns a stage, never recommends treatment.
 *   - "Unknown" / "I can't find it" is always an allowed answer and is stored
 *     as unknown, never as absent.
 *   - Identity check is checkboxes only — no typed name / DOB (privacy §10).
 *   - Field values entered here are held in memory for the session only; they
 *     are NOT written to localStorage in the MVP.
 */

import type { StepDef } from './types';

/**
 * When the diagnosis is melanoma in situ / lentigo maligna, the invasive-only
 * pathology fields (Breslow thickness, ulceration, mitotic rate, lymphovascular
 * invasion, regression, neurotropism) do not apply, so the flow skips those
 * screens (b3 → margin status) and the Step 1 summary shows "N/A" for them
 * rather than a blank row. Margin status still applies and is asked normally.
 */
const IN_SITU_FIELD_PRESETS: Record<string, string> = {
  c1: 'N/A — melanoma in situ',
  c2: 'N/A — melanoma in situ',
  c3: 'N/A — melanoma in situ',
  c4: 'N/A — melanoma in situ',
  c5: 'N/A — melanoma in situ',
  c6: 'N/A — melanoma in situ',
};

export const STEP1: StepDef = {
  id: 'step1',
  phase: 'mad-rush',
  number: 1,
  total: 4,
  slug: 'pathology',

  metaTitle: 'Step 1: Understand Your Pathology Report | Beating Skin Cancer',
  metaDescription:
    'A calm, step-by-step guide to obtaining your melanoma pathology report and finding the key terms so you can talk them through with your doctor.',

  heroKicker: 'Mad Rush • Step 1 of 4',
  heroTitle: 'Step 1 — Understand Your Pathology Report',
  heroSubtitle:
    'Your pathology report holds the information your doctors use to understand your melanoma and plan the next steps.',
  backHref: '/melanoma/navigator',
  backLabel: '← Back to the Navigator',
  exitHref: '/melanoma/navigator',
  skipAhead: {
    href: '/melanoma/navigator/mad-rush/stage',
    label: 'I’ve already been through my pathology report — skip to Step 2, stage',
  },

  whyItMatters:
    'This step is not a long article. It is a short sequence of small tasks: get the report, find the diagnosis, and note the key terms so you can go over them with your care team.',
  contextualDisclaimer:
    'This step helps you find and record what your report says. It does not confirm the report is correct, assign a stage, or recommend treatment. Your treating clinicians do that.',

  start: 'b0',

  subProgress: [
    { key: 'get', label: 'Get the report' },
    { key: 'diagnosis', label: 'Confirm the diagnosis' },
    { key: 'fields', label: 'Find key information' },
    { key: 'summary', label: 'Review summary' },
  ],

  screens: [
    /* ---------------------------------------------------------------- ENTRY */
    {
      id: 'b0',
      kind: 'decision',
      spKey: 'get',
      viewEvent: 'melanoma_step1_started',
      title: 'Do you have a copy of your melanoma pathology report?',
      body: [
        'The pathology report is the document a pathologist writes after looking at your biopsy under a microscope.',
      ],
      prompt: 'Choose what fits your situation:',
      choices: [
        { value: 'has', label: 'Yes, I have it', next: 'b3', event: 'pathology_report_has_copy', status: 'in_progress' },
        { value: 'need', label: 'No, I need to get it', next: 'a1', event: 'pathology_report_needs_copy', status: 'in_progress' },
        { value: 'unsure', label: 'I’m not sure what this is', next: 'a1', event: 'pathology_report_needs_copy', status: 'in_progress' },
      ],
    },

    /* ------------------------------------------------ BRANCH A — NO REPORT */
    {
      id: 'a1',
      kind: 'info',
      spKey: 'get',
      title: 'How to get your pathology report',
      body: [
        'The pathology report documents the diagnosis, helps your doctors understand the melanoma, supports staging, helps plan treatment, and becomes part of your record for future care.',
        'Practical ways to get it:',
      ],
      notes: [
        {
          id: 'how',
          tone: 'info',
          static: true,
          body: [
            '• Download it from your patient portal — reports are often posted there.',
            '• Call the dermatologist or clinician who performed the biopsy and ask the office for a copy.',
            '• Ask them to send it electronically, and keep your own copy for future care.',
            'A short script you can use: “I was recently diagnosed with melanoma. Could you please send me a copy of my pathology report?”',
          ],
        },
      ],
      continueLabel: 'I’ve tried — what next?',
      next: 'a2',
    },
    {
      id: 'a2',
      kind: 'decision',
      spKey: 'get',
      title: 'Were you able to request or get the report?',
      choices: [
        { value: 'got_it', label: 'Yes — I have it now', next: 'b3', status: 'in_progress' },
        {
          value: 'requested',
          label: 'I requested it but don’t have it yet',
          next: 'a3wait',
          status: 'waiting',
        },
        {
          value: 'need_help',
          label: 'I need help figuring out whom to contact',
          reveal: 'whom',
          status: 'waiting',
        },
      ],
      notes: [
        {
          id: 'whom',
          tone: 'action',
          body: [
            'Start with the office that took the biopsy — usually a dermatologist. If a different clinic did the biopsy, call that clinic’s medical records line. Your referring doctor’s office can also point you to the right place.',
          ],
          continue: { label: 'Save my progress for now', next: 'a3wait' },
        },
      ],
    },
    {
      id: 'a3wait',
      kind: 'info',
      spKey: 'get',
      title: 'Your progress is saved',
      body: [
        'You don’t need to continue through the report until you have it in front of you. This step is marked “waiting for your pathology report.” You can return on this device and pick up where you left off.',
        'When you have the report, come back and choose “Yes, I have it.”',
      ],
      continueLabel: 'Review my Step 1 summary',
      next: 'SUMMARY',
    },

    /* ------------------------------------------ BRANCH B — HAS THE REPORT */
    {
      id: 'b3',
      kind: 'decision',
      spKey: 'diagnosis',
      title: 'Confirm the diagnosis',
      body: [
        'Look for a section labeled something like <em>Diagnosis</em>, <em>Final Diagnosis</em>, or <em>Pathologic Diagnosis</em>.',
      ],
      prompt: 'Does the report clearly say:',
      choices: [
        {
          value: 'in_situ',
          label: 'Melanoma in situ',
          next: 'c7',
          flag: 'invasion_in_situ',
          event: 'pathology_diagnosis_reviewed',
          presetAnswers: IN_SITU_FIELD_PRESETS,
        },
        {
          value: 'lentigo_maligna',
          label: 'Lentigo maligna',
          next: 'c7',
          flag: 'invasion_in_situ',
          event: 'pathology_diagnosis_reviewed',
          presetAnswers: IN_SITU_FIELD_PRESETS,
        },
        {
          value: 'invasive',
          label: 'Invasive melanoma',
          hint: 'Look for “Breslow thickness” followed by a measurement, e.g. 0.4 mm.',
          next: 'c1',
          flag: 'invasion_invasive',
          event: 'pathology_diagnosis_reviewed',
        },
        {
          value: 'unclear',
          label: 'None of these / I’m not sure',
          reveal: 'unclear',
          event: 'pathology_diagnosis_reviewed',
        },
      ],
      notes: [
        {
          id: 'both_invasive_and_in_situ',
          tone: 'warn',
          static: true,
          body: [
            '<strong class="text-navy">Important:</strong> when invasive melanoma is present anywhere in the specimen, that is the part your care team uses for the key pathology fields and for staging, so it is the answer to record here. Only choose “Melanoma in situ” or “Lentigo maligna” if the report describes the melanoma as entirely in situ, with no invasive component.',
            'If you cannot tell whether an invasive component is reported, choose “None of these / I’m not sure” and ask your dermatologist to confirm.',
          ],
        },
        {
          id: 'unclear',
          tone: 'action',
          body: [
            'When the diagnosis section isn’t clear — or you don’t see any of these terms — the book’s advice is to ask the dermatologist to explain the report rather than guessing.',
          ],
          doctorQuestions: [
            'Can you walk me through exactly what my pathology report says the diagnosis is?',
            'Is my melanoma in situ (confined to the surface) or invasive?',
          ],
          continue: { label: 'Continue', next: 'SUMMARY' },
        },
      ],
    },

    /* -------------------------------- INVASIVE — KEY PATHOLOGY FIELDS (C) */
    {
      id: 'c1',
      kind: 'field',
      spKey: 'fields',
      title: 'Breslow thickness',
      body: [
        'Look for “Breslow thickness” or “Breslow depth.” It is written in millimeters, such as 0.5 mm, 1.2 mm, or 2.0 mm.',
      ],
      field: {
        key: 'breslow',
        label: 'Breslow thickness (mm) — leave blank if you can’t find it',
        type: 'decimal',
        placeholder: 'e.g. 1.2',
        help: 'Copy the value exactly as written. Do not round. The Navigator does not assign a stage from this number.',
      },
      notes: [
        {
          id: 'no_breslow',
          tone: 'action',
          body: ['If you can’t find it, that’s fine — note it as a question for your doctor and continue.'],
          doctorQuestions: ['Where on my report is the Breslow thickness listed, and what is it?'],
        },
      ],
      continueLabel: 'Continue',
      next: 'c2',
    },
    {
      id: 'c2',
      kind: 'decision',
      spKey: 'fields',
      title: 'Ulceration',
      prompt: 'What does the report say about ulceration?',
      choices: [
        { value: 'present', label: 'Present' },
        { value: 'absent', label: 'Absent / not identified' },
        { value: 'unknown', label: 'I cannot find it' },
      ],
      next: 'c3',
    },
    {
      id: 'c3',
      kind: 'field',
      spKey: 'fields',
      title: 'Mitotic rate',
      prompt: 'Do you see a mitotic rate or mitotic index? If so, copy it as written.',
      field: {
        key: 'mitotic',
        label: 'Mitotic rate as written (e.g. “2/mm²”) — leave blank if not listed',
        type: 'text',
        placeholder: 'e.g. 2/mm²',
        help: 'Labs format this differently, so it is stored as text. The Navigator does not use it to classify risk.',
      },
      continueLabel: 'Continue',
      next: 'c4',
    },
    {
      id: 'c4',
      kind: 'decision',
      spKey: 'fields',
      title: 'Lymphovascular invasion',
      prompt: 'Does the report mention lymphovascular invasion?',
      choices: [
        { value: 'present', label: 'Present' },
        { value: 'absent', label: 'Not identified / absent' },
        { value: 'unknown', label: 'I cannot find it' },
      ],
      next: 'c5',
    },
    {
      id: 'c5',
      kind: 'decision',
      spKey: 'fields',
      title: 'Regression',
      prompt: 'Does the report mention regression?',
      body: ['This is informational only in Step 1.'],
      choices: [
        { value: 'present', label: 'Present' },
        { value: 'absent', label: 'Absent' },
        { value: 'unknown', label: 'I cannot find it' },
      ],
      next: 'c6',
    },
    {
      id: 'c6',
      kind: 'decision',
      spKey: 'fields',
      title: 'Nerve involvement / neurotropism',
      prompt: 'Does the report mention nerve involvement or neurotropism?',
      body: ['This is informational only in Step 1.'],
      choices: [
        { value: 'present', label: 'Present' },
        { value: 'absent', label: 'Absent / not identified' },
        { value: 'unknown', label: 'I cannot find it' },
      ],
      next: 'c7',
    },
    {
      id: 'c7',
      kind: 'decision',
      spKey: 'fields',
      title: 'Margin status',
      prompt: 'What does the report say about the biopsy margins?',
      choices: [
        { value: 'positive', label: 'Positive / involved', event: 'pathology_invasive_fields_reviewed' },
        { value: 'negative', label: 'Negative / clear', event: 'pathology_invasive_fields_reviewed' },
        { value: 'transected', label: 'Transected / extends to an edge', event: 'pathology_invasive_fields_reviewed' },
        { value: 'cannot_tell', label: 'I cannot tell', event: 'pathology_invasive_fields_reviewed' },
        { value: 'not_stated', label: 'The report does not say', event: 'pathology_invasive_fields_reviewed' },
      ],
      notes: [
        {
          id: 'margin_always',
          tone: 'info',
          static: true,
          body: [
            'The biopsy margin is not the same as the final surgical treatment margin. Your treating clinician decides what additional procedure, if any, is needed.',
          ],
        },
      ],
      next: 'SUMMARY',
    },
  ],

  summary: {
    title: 'Your pathology report summary',
    intro:
      'This shows only what you entered. It is a starting point for a conversation with your care team — not a medical assessment. Bring it, or print it, to your next visit.',
    sections: [
      {
        heading: 'Report',
        rows: [
          { key: 'b0', label: 'Do you have the report?' },
          { key: 'a2', label: 'Status of getting the report' },
        ],
      },
      {
        heading: 'Diagnosis',
        rows: [
          { key: 'b3', label: 'Diagnosis on the report' },
        ],
      },
      {
        heading: 'Key pathology information (for invasive melanoma)',
        rows: [
          { key: 'c1', label: 'Breslow thickness' },
          { key: 'c2', label: 'Ulceration' },
          { key: 'c3', label: 'Mitotic rate' },
          { key: 'c4', label: 'Lymphovascular invasion' },
          { key: 'c5', label: 'Regression' },
          { key: 'c6', label: 'Neurotropism' },
          { key: 'c7', label: 'Margin status' },
        ],
      },
    ],
    questionsHeading: 'Questions for my doctor',
    printLabel: 'Print my summary and questions',
    completeLabel: 'I’ve reviewed this — continue to Step 2',
    // Merged journey: advance to Step 2 in the same page so the pathology
    // answers stay in memory and Step 2 opens already knowing them.
    completeNext: 'NEXT_STEP',
    completeEvent: 'melanoma_step1_completed',
    completeNote:
      '“Complete” means you finished this educational step. It does not mean your diagnosis or treatment is settled.',
  },
};
