/**
 * Mad Rush — Step 2: Confirm Your Melanoma Stage.
 *
 * Rebuilt as the second half of the merged Mad Rush journey (see journey.ts).
 * Step 1 and Step 2 render into one page, so every pathology answer the patient
 * recorded in Step 1 is still in memory here. Step 2 therefore does NOT re-ask
 * the diagnosis, Breslow thickness, or ulceration — it opens with a `recap`
 * screen that echoes those Step 1 answers back for a single confirmation, then
 * spends its screens on the two things the pathology report does not cover:
 * the lymph nodes (N) and distant spread (M).
 *
 * Stage 0 skip (`enterRoute` + the k0a / k1a routing below): when the patient is
 * already effectively Stage 0 — Step 1 diagnosis is melanoma in situ / lentigo
 * maligna, or a doctor has told them "Stage 0" — every Step 2 question screen is
 * bypassed and the patient lands straight on the "Your stage picture" summary.
 * There is nothing for N or M to add once the disease is in situ.
 *
 * Flow shape:
 *   k0    recap of the Step 1 pathology answers  (cold entry → k0cold capture)
 *   k1    the anchor: a stage a doctor has already given (kept separate always)
 *   k2    bridge — what is left to confirm (invasive only)
 *   N1–N3 invasive node track: node found? → sentinel node status → nearby skin
 *   M1–M3 distant-spread track: distant spread? → imaging
 *   S     "Your stage picture": a worded band + the two-box summary + questions
 *
 * Guardrails (GUARDRAILS §2, §4, §6, §13 / STEP2 spec §2, §16, §23, §30):
 *   - No T category and no precise AJCC stage is computed. The summary shows a
 *     COARSE worded band only — Stage 0 / Stage I–II / Stage III / Stage IV —
 *     from the broad answer pattern, always with a review notice and "your
 *     physician confirms the exact stage." This is not the gated rule engine in
 *     medicalRules.ts and never names a sub-stage.
 *   - A doctor-reported stage is captured and shown on its own, never
 *     overwritten by the band.
 *   - "Unknown" is first-class everywhere; never read as N0 or M0.
 *   - Inconsistent entries reveal a neutral "confirm with your doctor" note;
 *     the Navigator never says which entry is wrong and never corrects it.
 *   - Non-cutaneous melanoma left Step 1 already; if a user still reaches here
 *     with an unclear diagnosis they are routed to confirm it with a clinician.
 */

import type { StepDef } from './types';
import { MEDICAL_CONTENT_REQUIRES_CURRENT_REVIEW } from './medicalRules';

/**
 * Neutral UX-safety consistency checks (STEP2 spec §28). If every screen id in a
 * rule's `when` map holds one of the listed answer values, the summary's
 * `consistencyNote` is revealed. NOT diagnostic — never says which entry is
 * wrong, never changes anything.
 */
export const STEP2_CONSISTENCY_RULES: { id: string; when: Record<string, string[]> }[] = [
  { id: 'insitu_vs_advanced_doc', when: { b3: ['in_situ', 'lentigo_maligna'], k1a: ['stage_III', 'stage_IV'] } },
  { id: 'insitu_vs_advanced_doc_cold', when: { k0a: ['in_situ'], k1a: ['stage_III', 'stage_IV'] } },
  { id: 'node_found_vs_early_doc', when: { N1: ['yes'], k1a: ['stage_0', 'stage_I'] } },
  { id: 'slnb_pos_vs_early_doc', when: { N2: ['positive'], k1a: ['stage_0', 'stage_I'] } },
  { id: 'distant_vs_not_stage4_doc', when: { M2: ['yes'], k1a: ['stage_0', 'stage_I', 'stage_II', 'stage_III'] } },
];

const STAGE3_NODE_NOTE =
  'A lymph node with melanoma places staging in the Stage III group when there is no distant spread. Your melanoma specialist determines the subgroup (IIIA–IIID) from the tumor and node details together.';

export const STEP2: StepDef = {
  id: 'step2',
  phase: 'mad-rush',
  number: 2,
  total: 4,
  slug: 'stage',

  metaTitle: 'Step 2: Confirm Your Melanoma Stage | Beating Skin Cancer',
  metaDescription:
    'Building on your pathology report, this step confirms the two pieces it does not cover — lymph nodes and distant spread — and shows the stage range your melanoma most likely falls in, with the questions to confirm it with your doctor.',

  heroKicker: 'Mad Rush • Step 2 of 4',
  heroTitle: 'Step 2 — Confirm Your Melanoma Stage',
  heroSubtitle:
    'Your pathology report already describes the original tumor. This step confirms what it does not cover — the lymph nodes and any distant spread — and shows the stage range that points to.',
  backHref: '/melanoma/navigator/mad-rush',
  backLabel: '← Back to the Mad Rush map',
  exitHref: '/melanoma/navigator/mad-rush',

  whyItMatters:
    'You do not need to memorize the staging system. Your report covers the tumor (T). Step 2 fills in the lymph nodes (N) and distant spread (M), shows you the range that points to, and hands you the questions to confirm the exact stage with your doctor.',
  contextualDisclaimer:
    'This step explains staging and organizes what is known. It does not assign your stage. The range shown is educational and coarse; your treating physician confirms your stage, its sub-stage, and whether it is clinical or pathologic.',

  start: 'k0',

  // Stage 0 skip: an in-situ / lentigo maligna diagnosis carried from Step 1
  // jumps past every question screen to the stage picture. (Cold entry with no
  // Step 1 answers is handled on k0a; a doctor-reported "Stage 0" on k1a.)
  enterRoute: [
    { when: { b3: ['in_situ', 'lentigo_maligna'] }, next: 'SUMMARY:step2' },
  ],

  subProgress: [
    { key: 'report', label: 'Your report' },
    { key: 'anchor', label: 'Stage from your doctor' },
    { key: 'nodes', label: 'Lymph nodes (N)' },
    { key: 'distant', label: 'Distant spread (M)' },
    { key: 'picture', label: 'Your stage picture' },
  ],

  screens: [
    /* ------------------------------------------------ RECAP OF STEP 1 */
    {
      id: 'k0',
      kind: 'recap',
      spKey: 'report',
      viewEvent: 'melanoma_step2_started',
      title: 'What your pathology report shows',
      body: [
        'These are the answers you recorded in Step 1. They describe the original tumor — the T in staging. Check they still match your report before we go on.',
      ],
      recap: {
        rows: [
          { label: 'Diagnosis', from: ['b3', 'k0a'] },
          { label: 'Breslow thickness', from: ['c1', 'k0b'] },
          { label: 'Ulceration', from: ['c2', 'k0c'] },
          { label: 'Biopsy margins', from: ['c7'] },
        ],
        emptyNext: 'k0cold',
        confirmLabel: 'Yes — that matches my report',
        confirmNext: 'k1',
        changeLabel: 'I need to correct something',
        changeNext: 'k0cold',
      },
    },
    {
      id: 'k0cold',
      kind: 'info',
      spKey: 'report',
      title: 'Let’s capture three things from your report',
      body: [
        'Either you haven’t been through Step 1 in this session, or you want to update what it recorded. Have your pathology report handy — we need three items from it.',
      ],
      continueLabel: 'Start',
      next: 'k0a',
    },
    {
      id: 'k0a',
      kind: 'decision',
      spKey: 'report',
      title: 'Diagnosis',
      prompt: 'Does your report describe melanoma in situ or invasive melanoma?',
      choices: [
        { value: 'in_situ', label: 'Melanoma in situ / lentigo maligna', next: 'SUMMARY' },
        { value: 'invasive', label: 'Invasive melanoma', next: 'k0b' },
        { value: 'unknown', label: 'I’m not sure', reveal: 'k0a_unknown' },
      ],
      notes: [
        {
          id: 'k0a_unknown',
          tone: 'action',
          body: [
            'Ask your dermatologist to confirm whether the melanoma is in situ or invasive — it changes which staging path applies. You can keep going with what you know.',
          ],
          doctorQuestions: ['Is my melanoma in situ or invasive?'],
          continue: { label: 'Continue', next: 'k1' },
        },
      ],
    },
    {
      id: 'k0b',
      kind: 'field',
      spKey: 'report',
      title: 'Breslow thickness',
      body: ['Look for “Breslow thickness” or “Breslow depth,” written in millimeters.'],
      field: {
        key: 'breslow',
        label: 'Breslow thickness (mm) — leave blank if you don’t have it',
        type: 'decimal',
        placeholder: 'e.g. 1.2',
        help: 'The Navigator records this to organize your questions. It does not calculate a stage from the number.',
      },
      notes: [
        {
          id: 'k0b_missing',
          tone: 'action',
          body: ['If you can’t find it, note it as a question for your doctor and continue.'],
          doctorQuestions: ['What is my Breslow thickness, and what T category does it fall into?'],
        },
      ],
      continueLabel: 'Continue',
      next: 'k0c',
    },
    {
      id: 'k0c',
      kind: 'decision',
      spKey: 'report',
      title: 'Ulceration',
      prompt: 'What does your report say about ulceration?',
      choices: [
        { value: 'present', label: 'Present' },
        { value: 'absent', label: 'Absent / not identified' },
        { value: 'unknown', label: 'I can’t find it' },
      ],
      next: 'k1',
    },

    /* ---------------------------------------------------- THE ANCHOR */
    {
      id: 'k1',
      kind: 'decision',
      spKey: 'anchor',
      title: 'Has a doctor already told you your melanoma stage?',
      body: [
        'If so, that stage is the one that counts. The Navigator records it separately as “stage reported by your doctor” and never changes it.',
      ],
      choices: [
        { value: 'yes', label: 'Yes', next: 'k1a' },
        { value: 'no', label: 'No', next: 'k2', event: 'step2_doctor_stage_question_completed', status: 'waiting' },
        { value: 'unsure', label: 'I’m not sure', next: 'k2', event: 'step2_doctor_stage_question_completed', status: 'waiting' },
      ],
    },
    {
      id: 'k1a',
      kind: 'decision',
      spKey: 'anchor',
      title: 'What stage were you told?',
      choices: [
        { value: 'stage_0', label: 'Stage 0', next: 'SUMMARY', event: 'step2_doctor_stage_question_completed' },
        { value: 'stage_I', label: 'Stage I (or IA / IB)', next: 'k1b', event: 'step2_doctor_stage_question_completed' },
        { value: 'stage_II', label: 'Stage II (or IIA / IIB / IIC)', next: 'k1b', event: 'step2_doctor_stage_question_completed' },
        { value: 'stage_III', label: 'Stage III (or IIIA–IIID)', next: 'k1b', event: 'step2_doctor_stage_question_completed' },
        { value: 'stage_IV', label: 'Stage IV', next: 'k1b', event: 'step2_doctor_stage_question_completed' },
        { value: 'dont_remember', label: 'I don’t remember exactly', next: 'k1b', event: 'step2_doctor_stage_question_completed' },
      ],
    },
    {
      id: 'k1b',
      kind: 'decision',
      spKey: 'anchor',
      title: 'Was that a clinical or a pathologic stage?',
      body: [
        'Ask if you’re not sure — it tells you whether the stage can still change.',
      ],
      choices: [
        { value: 'clinical', label: 'Clinical stage', next: 'k2' },
        { value: 'pathologic', label: 'Pathologic stage', next: 'k2' },
        { value: 'unsure', label: 'I don’t know', reveal: 'k1b_unsure' },
      ],
      notes: [
        {
          id: 'k1b_unsure',
          tone: 'info',
          body: [
            '<strong>Clinical stage</strong> is the working stage from the biopsy, the exam, and any imaging — before surgery. <strong>Pathologic stage</strong> adds what the definitive surgery and a sentinel lymph node biopsy show, and is usually more precise. Add this to your questions.',
          ],
          doctorQuestions: ['Is my stage a clinical stage or a pathologic stage, and could it still change?'],
          continue: { label: 'Continue', next: 'k2' },
        },
      ],
    },

    /* ---------------------------------------------------- BRIDGE (invasive only) */
    {
      id: 'k2',
      kind: 'info',
      spKey: 'nodes',
      title: 'What’s left to confirm',
      body: [
        'Your report covers the original tumor (T). Two things it doesn’t cover still shape the overall stage:',
        '<strong>N — the lymph nodes.</strong> Whether melanoma has reached a nearby lymph node or the skin around it.',
        '<strong>M — metastasis.</strong> Whether melanoma has been found in a distant part of the body.',
        'We’ll go through those now, then show you the range they point to.',
      ],
      continueLabel: 'Continue',
      next: 'N1',
    },

    /* ------------------------------------------- INVASIVE — NODES (N) */
    {
      id: 'N1',
      kind: 'decision',
      spKey: 'nodes',
      title: 'N — lymph nodes',
      body: [
        'Melanoma can travel from the original tumor to a nearby lymph node. That can show up on a physical exam, on imaging, or only under the microscope after a sentinel lymph node biopsy.',
      ],
      prompt: 'Has a doctor told you that melanoma was found in a lymph node?',
      choices: [
        { value: 'yes', label: 'Yes', next: 'N1how' },
        { value: 'no', label: 'No', next: 'N2' },
        { value: 'unsure', label: 'I’m not sure', next: 'N2' },
      ],
    },
    {
      id: 'N1how',
      kind: 'decision',
      spKey: 'nodes',
      title: 'How was the lymph node finding made?',
      body: ['Recorded as background information. The Navigator does not assign an N category from it.'],
      choices: [
        { value: 'slnb', label: 'Sentinel lymph node biopsy', next: 'Npos' },
        { value: 'palpable', label: 'A lymph node I or my doctor could feel', next: 'Npos' },
        { value: 'imaging', label: 'Imaging', next: 'Npos' },
        { value: 'other_surgery', label: 'Another biopsy or surgery', next: 'Npos' },
        { value: 'unsure', label: 'I’m not sure', next: 'Npos' },
      ],
    },
    {
      id: 'Npos',
      kind: 'info',
      spKey: 'nodes',
      title: 'A positive lymph node moves staging to the Stage III range',
      body: [
        'Melanoma found in a regional lymph node means the disease involves the lymphatic system near the original tumor. In the staging framework described in the book, this corresponds to <strong>Stage III</strong> when there is no distant spread — regardless of how thick the original tumor was.',
        'Stage III has four subgroups (IIIA–IIID). The Navigator does not work out the subgroup — that depends on details of the tumor and the nodes that your melanoma specialist puts together.',
      ],
      medicalReviewNotice: MEDICAL_CONTENT_REQUIRES_CURRENT_REVIEW,
      doctorQuestions: [
        'Which Stage III subgroup (IIIA–IIID) am I, and what determines that?',
        'What treatment options — including adjuvant therapy — apply to my situation?',
        'What follow-up and imaging schedule do you recommend?',
      ],
      learnMore: [{ label: 'What your melanoma stage means', href: '/melanoma/melanoma-stage-meaning' }],
      continueLabel: 'Continue to distant spread',
      continueEvent: 'step2_n_section_completed',
      next: 'M1',
    },
    {
      id: 'N2',
      kind: 'decision',
      spKey: 'nodes',
      title: 'Sentinel lymph node biopsy',
      body: [
        'A sentinel lymph node biopsy checks the first lymph node(s) melanoma would be most likely to reach. It is how melanoma in a node is often found when nothing could be felt on an exam.',
      ],
      prompt: 'Where are you with a sentinel lymph node biopsy?',
      choices: [
        { value: 'negative', label: 'It was done and was negative', next: 'N2neg' },
        { value: 'positive', label: 'It was done and was positive', next: 'Npos' },
        { value: 'scheduled', label: 'It is scheduled', next: 'N2pending', status: 'waiting' },
        { value: 'considering', label: 'My team and I are still deciding', next: 'N2pending', status: 'waiting' },
        { value: 'not_needed', label: 'My doctor said I do not need one', next: 'N2none' },
        { value: 'not_discussed', label: 'It hasn’t been discussed yet', next: 'N2explain' },
        { value: 'dont_know', label: 'I don’t know what this is', next: 'N2explain' },
      ],
    },
    {
      id: 'N2explain',
      kind: 'info',
      spKey: 'nodes',
      viewEvent: 'step2_slnb_education_viewed',
      title: 'What a sentinel lymph node biopsy is',
      body: [
        'When melanoma cells leave the original tumor, the first place they usually travel is a nearby lymph node — the “sentinel” node. A sentinel lymph node biopsy removes that node, or a small group, so a pathologist can look for melanoma cells under the microscope.',
        'It is usually done at the same time as the definitive surgery. It is mainly a staging test: it does not treat the melanoma, but a positive result changes the stage and the options your team discusses.',
        'Not everyone with melanoma needs one. Whether it applies to you depends on the tumor’s thickness and other features — that is a conversation for your surgeon or melanoma specialist.',
      ],
      medicalReviewNotice: MEDICAL_CONTENT_REQUIRES_CURRENT_REVIEW,
      learnMore: [{ label: 'Sentinel lymph node biopsy', href: '/melanoma/sentinel-lymph-node-biopsy' }],
      doctorQuestions: [
        'Given my melanoma’s thickness and features, do you recommend a sentinel lymph node biopsy?',
        'What would a positive or a negative result change?',
      ],
      continueLabel: 'Continue',
      next: 'N3',
    },
    {
      id: 'N2neg',
      kind: 'info',
      spKey: 'nodes',
      title: 'A negative sentinel lymph node',
      body: [
        'A negative sentinel lymph node means melanoma was not found in the node(s) that were sampled. That is reassuring — it means the disease most likely has not reached the regional lymph nodes.',
        'Your overall stage still depends on the original tumor’s features (thickness, ulceration). A negative node generally keeps staging in the <strong>Stage I–II</strong> range described in the book, which your physician confirms.',
      ],
      medicalReviewNotice: MEDICAL_CONTENT_REQUIRES_CURRENT_REVIEW,
      continueLabel: 'Continue',
      next: 'N3',
    },
    {
      id: 'N2pending',
      kind: 'info',
      spKey: 'nodes',
      title: 'Your stage is still provisional',
      body: [
        'Until the sentinel lymph node result is back, part of the staging picture is missing. Doctors call this a <strong>clinical</strong> stage — the working stage before surgery and node results are in.',
        'If the sentinel node is negative, staging usually stays in the Stage I–II range based on the tumor. If it is positive, staging moves to <strong>Stage III</strong>. Your physician sets the final (pathologic) stage afterward.',
      ],
      medicalReviewNotice: MEDICAL_CONTENT_REQUIRES_CURRENT_REVIEW,
      doctorQuestions: [
        'After my sentinel lymph node biopsy, what will my stage be if it is negative, and if it is positive?',
        'When will the result be back, and who will go over it with me?',
      ],
      continueLabel: 'Continue',
      next: 'N3',
    },
    {
      id: 'N2none',
      kind: 'info',
      spKey: 'nodes',
      title: 'No sentinel lymph node biopsy planned',
      body: [
        'Your doctor has decided a sentinel lymph node biopsy is not needed in your case — often because the tumor is thin enough that the chance of a positive node is low, or because another factor makes it unhelpful.',
        'Staging then rests on the original tumor’s features, your physical exam, and any imaging. A case with no lymph node involvement and no distant spread sits in the <strong>Stage I–II</strong> range, which your physician confirms.',
      ],
      medicalReviewNotice: MEDICAL_CONTENT_REQUIRES_CURRENT_REVIEW,
      doctorQuestions: ['Why is a sentinel lymph node biopsy not recommended for me?'],
      continueLabel: 'Continue',
      next: 'N3',
    },
    {
      id: 'N3',
      kind: 'decision',
      spKey: 'nodes',
      title: 'Melanoma in nearby skin or tissue',
      body: [
        'Sometimes melanoma shows up in the skin or tissue between the original tumor and the lymph nodes, separate from the main spot.',
      ],
      prompt:
        'Has a doctor told you there are melanoma deposits in nearby skin or tissue — using a term like in-transit, satellite, or microsatellite?',
      choices: [
        { value: 'yes', label: 'Yes', reveal: 'N3_yes' },
        { value: 'no', label: 'No', next: 'M1', event: 'step2_n_section_completed' },
        { value: 'unsure', label: 'I’m not sure', next: 'M1', event: 'step2_n_section_completed' },
      ],
      notes: [
        {
          id: 'N3_yes',
          tone: 'info',
          body: [
            'These findings are also part of the <strong>Stage III</strong> group in the staging framework described in the book. The Navigator does not work out the exact stage — your melanoma specialist does, using the tumor and node details together.',
          ],
          doctorQuestions: [
            'I was told there is in-transit / satellite / microsatellite disease — how does that affect my stage and treatment?',
          ],
          continue: { label: 'Continue to distant spread', next: 'M1', event: 'step2_n_section_completed' },
        },
      ],
    },

    /* ------------------------------------------- DISTANT SPREAD (M) */
    {
      id: 'M1',
      kind: 'info',
      spKey: 'distant',
      title: 'M — distant spread',
      body: [
        'M describes whether melanoma has been found in a distant part of the body — for example distant skin or soft tissue, lung, liver or another organ, or brain.',
        'Not having had imaging does not by itself mean there is no distant spread. Only a clinical evaluation can establish that.',
      ],
      continueLabel: 'Continue',
      next: 'M2',
    },
    {
      id: 'M2',
      kind: 'decision',
      spKey: 'distant',
      title: 'Has distant spread been found?',
      prompt: 'Has a doctor told you that melanoma has spread to a distant organ or distant part of the body?',
      choices: [
        { value: 'yes', label: 'Yes', reveal: 'M2_yes' },
        { value: 'no', label: 'No', next: 'M3' },
        { value: 'unsure', label: 'I’m not sure', next: 'M3' },
        { value: 'not_evaluated', label: 'I have not had this evaluated', next: 'M3' },
      ],
      notes: [
        {
          id: 'M2_yes',
          tone: 'info',
          body: [
            'In the staging framework described in the book, distant metastasis corresponds to <strong>Stage IV</strong>. Your oncology team determines the detailed M category and the treatment plan — the Navigator does not.',
          ],
          doctorQuestions: [
            'Where has melanoma been found, and what is my M category?',
            'What treatment options apply to my situation?',
          ],
          continue: { label: 'Continue', next: 'M3' },
        },
      ],
    },
    {
      id: 'M3',
      kind: 'decision',
      spKey: 'distant',
      title: 'Imaging',
      body: ['Informational. “No imaging” is not used to infer anything about spread.'],
      prompt: 'Have you had imaging as part of melanoma staging?',
      choices: [
        { value: 'ct', label: 'CT', next: 'SUMMARY', event: 'step2_m_section_completed' },
        { value: 'pet_ct', label: 'PET/CT', next: 'SUMMARY', event: 'step2_m_section_completed' },
        { value: 'mri', label: 'MRI', next: 'SUMMARY', event: 'step2_m_section_completed' },
        { value: 'multiple', label: 'More than one of these', next: 'SUMMARY', event: 'step2_m_section_completed' },
        { value: 'none', label: 'No', next: 'SUMMARY', event: 'step2_m_section_completed' },
        { value: 'unsure', label: 'I’m not sure', next: 'SUMMARY', event: 'step2_m_section_completed' },
      ],
      notes: [
        {
          id: 'M3_always',
          tone: 'info',
          static: true,
          body: [
            'Your doctor decides whether imaging is appropriate based on your stage, examination, symptoms, and other clinical factors.',
          ],
        },
      ],
    },
  ],

  summary: {
    title: 'Your stage picture',
    intro:
      'The range below is built only from the broad pattern of your answers. It is educational and coarse — not your official stage. Below it: what your doctor has told you, what you recorded, and the questions to settle the exact stage. Bring this, or print it, to your next visit.',

    stageBand: {
      heading: 'Where your melanoma most likely falls',
      notice:
        'This is an educational range, not a diagnosis or an official stage. It uses only the broad pattern — the tumor, whether a lymph node was involved, and whether there is distant spread. It does not use the Breslow thickness or ulceration to work out a number and letter (such as IB or IIIC). Your physician confirms the exact stage, its sub-stage, and whether it is clinical or pathologic.',
      rules: [
        {
          when: { M2: ['yes'] },
          band: 'Stage IV',
          note: 'A distant site has been reported to you. In the staging framework, distant spread is Stage IV. Your oncology team sets the detailed category and the treatment plan.',
        },
        { when: { N1: ['yes'] }, band: 'Stage III', note: STAGE3_NODE_NOTE },
        { when: { N2: ['positive'] }, band: 'Stage III', note: STAGE3_NODE_NOTE },
        {
          when: { N3: ['yes'] },
          band: 'Stage III',
          note: 'In-transit, satellite, or microsatellite disease is part of the Stage III group when there is no distant spread. Your specialist determines the subgroup.',
        },
        {
          when: { b3: ['in_situ', 'lentigo_maligna'] },
          band: 'Stage 0',
          note: 'Melanoma in situ with no spread corresponds to Stage 0 — the earliest category. Your physician confirms it and goes over removing the area completely.',
        },
        {
          when: { k0a: ['in_situ'] },
          band: 'Stage 0',
          note: 'Melanoma in situ with no spread corresponds to Stage 0 — the earliest category. Your physician confirms it and goes over removing the area completely.',
        },
        {
          when: { k1a: ['stage_0'] },
          band: 'Stage 0',
          note: 'A doctor has told you this is Stage 0 — melanoma still confined to the top layer of skin, the earliest category. Your physician confirms it and goes over removing the area completely.',
        },
        {
          when: { N2: ['negative'] },
          band: 'Stage I or II',
          note: 'An invasive melanoma with a negative sentinel lymph node and no distant spread sits in the Stage I–II range. The exact number and letter depend on the Breslow thickness and ulceration — your physician confirms it.',
        },
        {
          when: { N2: ['not_needed'] },
          band: 'Stage I or II',
          note: 'An invasive melanoma with no lymph node involvement and no distant spread sits in the Stage I–II range. Your physician confirms the exact number and letter.',
        },
      ],
      fallback: {
        band: 'Stage I or II — not yet complete',
        note: 'Your report points to an invasive melanoma, but the lymph node picture is still open — a sentinel lymph node biopsy pending, still being decided, or not yet discussed. Until it is settled the stage is provisional: a negative node keeps it in the Stage I–II range, a positive node moves it to Stage III.',
      },
    },

    sections: [
      {
        heading: 'What your doctor has told you',
        rows: [
          { key: 'k1', label: 'Has a doctor assigned a stage?' },
          { key: 'k1a', label: 'Stage reported by your doctor' },
          { key: 'k1b', label: 'Clinical or pathologic stage' },
        ],
      },
      {
        heading: 'From your pathology report',
        rows: [
          { key: ['b3', 'k0a'], label: 'Diagnosis' },
          { key: ['c1', 'k0b'], label: 'Breslow thickness' },
          { key: ['c2', 'k0c'], label: 'Ulceration' },
          { key: 'c7', label: 'Biopsy margins' },
        ],
      },
      {
        heading: 'Lymph nodes and spread (recorded here)',
        rows: [
          { key: 'N1', label: 'Melanoma found in a lymph node' },
          { key: 'N1how', label: 'How the node finding was made' },
          { key: 'N2', label: 'Sentinel lymph node biopsy status' },
          { key: 'N3', label: 'Nearby skin / tissue deposits' },
          { key: 'M2', label: 'Distant spread reported' },
          { key: 'M3', label: 'Imaging for staging' },
        ],
      },
    ],
    questionsHeading: 'Questions for my doctor',
    consistencyNote:
      'Some of the information entered does not fit together in the way the staging framework is usually described. This is not a diagnosis and does not mean anything is wrong — please review your entries and ask your doctor to confirm your stage.',
    consistencyRules: STEP2_CONSISTENCY_RULES,
    viewEvent: 'step2_staging_summary_viewed',
    printLabel: 'Print my stage picture and questions',
    completeLabel: 'I’ve reviewed this — finish the Mad Rush',
    completeNext: '/melanoma/navigator/mad-rush',
    completeEvent: 'melanoma_step2_completed',
    completeNote:
      '“Complete” means you finished this educational step. It does not mean your melanoma stage is medically finalized.',
  },
};
