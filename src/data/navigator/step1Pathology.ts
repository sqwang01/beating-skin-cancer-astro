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
  c1: 'N/A',
  c2: 'N/A',
  c3: 'N/A',
  c4: 'N/A',
  c5: 'N/A',
  c6: 'N/A',
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
        { value: 'unsure', label: 'I’m not sure what this is', next: 'a0what', event: 'pathology_report_needs_copy', status: 'in_progress' },
      ],
    },

    /* ------------------------------------------------ BRANCH A — NO REPORT */
    {
      id: 'a0what',
      kind: 'info',
      spKey: 'get',
      title: 'What a pathology report is',
      body: [
        'A pathology report is the document a pathologist writes after examining your biopsy tissue under a microscope. It is where the melanoma diagnosis is actually made and described.',
        'Why it matters:',
      ],
      notes: [
        {
          id: 'why',
          tone: 'info',
          static: true,
          body: [
            '• It states the diagnosis in the pathologist’s own words.',
            '• It records the details your care team uses to understand the melanoma and support staging — such as whether it is in situ or invasive, the Breslow thickness, and the margins.',
            '• It guides the plan for what happens next, including any further surgery.',
            '• It becomes a permanent part of your medical record for future care and second opinions.',
            'You do not need to interpret it yourself. The goal here is simply to get a copy and find the key terms so you can go over them with your doctor.',
          ],
        },
      ],
      continueLabel: 'How do I get my copy?',
      next: 'a1',
    },
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
      continueLabel: 'Start Step 1 again once you have your pathology report',
      next: 'EXIT',
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
          next: 'b3unclear',
          event: 'pathology_diagnosis_reviewed',
        },
      ],
      notes: [
        {
          id: 'both_invasive_and_in_situ',
          tone: 'warn',
          static: true,
          body: [
            '<strong class="text-navy">Important:</strong> only choose “Melanoma in situ” or “Lentigo maligna” if the pathology report describes the melanoma as entirely in situ, with no invasive component. If the report includes both an in situ and an invasive component, choose “Invasive melanoma.”',
          ],
        },
      ],
    },

    /* ---------------------- UNCLEAR DIAGNOSIS — TERMINAL: ASK THE MEDICAL TEAM
     * Guardrails §3: if the diagnosis can't be found or the patient is unsure,
     * route to a conversation with the treating clinician — do NOT walk them on
     * through the summary and into staging. This screen ends the step: print the
     * questions, exit to the Navigator, come back once the diagnosis is known. */
    {
      id: 'b3unclear',
      kind: 'info',
      spKey: 'diagnosis',
      title: 'Ask your medical team to confirm the diagnosis',
      body: [
        'If the report doesn’t clearly state one of those terms — or you’re not sure which one applies — don’t try to work it out from the report yourself. Ask the dermatologist or clinician who did your biopsy to go through it with you.',
        'This comes before everything else. What happens next — whether more surgery is needed, which tests to expect, and how the melanoma is treated — all depends on two things being settled first: that this is definitely melanoma, and which type it is (for example, melanoma in situ versus invasive melanoma).',
        'Until your care team has confirmed that, the rest of the Navigator can’t tell you anything useful, so this step stops here. Print the questions below and take them to that conversation. Once you know the diagnosis, come back and start Step 1 again.',
      ],
      doctorQuestions: [
        'Can you walk me through exactly what my pathology report says the diagnosis is?',
        'Is this definitely melanoma? If not, what else could it be?',
        'Is my melanoma in situ (confined to the surface) or invasive?',
      ],
      printLabel: 'Print these questions',
      continueLabel: 'Back to the Navigator',
      next: 'EXIT',
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
        help: 'Copy the value exactly as written. Do not round.',
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
        help: 'Labs format this differently, so it is stored as text.',
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
        { value: 'not_stated', label: 'I cannot tell / the report does not say', event: 'pathology_invasive_fields_reviewed' },
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
        ],
      },
      {
        heading: 'Diagnosis',
        rows: [
          { key: 'b3', label: 'Diagnosis on the report' },
          // For melanoma in situ / lentigo maligna the invasive-only fields do
          // not apply, so margin status is the only recorded field — show it
          // here, under the diagnosis, rather than in the invasive-fields block.
          { key: 'c7', label: 'Margin status', when: { b3: ['in_situ', 'lentigo_maligna'] } },
        ],
      },
      {
        heading: 'Key pathology information (for invasive melanoma ONLY)',
        rows: [
          { key: 'c1', label: 'Breslow thickness' },
          { key: 'c2', label: 'Ulceration' },
          { key: 'c3', label: 'Mitotic rate' },
          { key: 'c4', label: 'Lymphovascular invasion' },
          { key: 'c5', label: 'Regression' },
          { key: 'c6', label: 'Neurotropism' },
          { key: 'c7', label: 'Margin status', when: { b3: ['invasive'] } },
        ],
      },
    ],
    printLabel: 'Print my summary',
    completeLabel: 'I’ve reviewed this — continue to Step 2',
    // Merged journey: advance to Step 2 in the same page so the pathology
    // answers stay in memory and Step 2 opens already knowing them.
    completeNext: 'NEXT_STEP',
    completeEvent: 'melanoma_step1_completed',
    completeNote:
      '“Complete” means you finished this educational step. It does not mean your diagnosis or treatment is settled.',
  },
};
