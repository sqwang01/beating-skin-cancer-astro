/**
 * Structured "questions to ask your care team" content for every sub-page of the
 * three advanced skin-cancer hubs (advanced BCC, advanced SCC, advanced
 * melanoma).
 *
 * This is the single source of truth for that content. It is rendered:
 *   1. on each sub-page, via `src/components/QuestionList.astro` (identical
 *      markup to the hand-authored lists it replaced); and
 *   2. into printable PDF checklists at build time, via
 *      `integrations/checklist-pdfs.mjs` — one per sub-page plus one combined
 *      "complete discussion guide" per hub.
 *
 * A question string MAY contain inline `<a>`, `<em>`, or `<strong>` markup,
 * copied verbatim from the page it came from. The web render injects it with
 * `set:html`; the PDF generator strips tags to plain text.
 *
 * Every entry MUST carry a valid `lastReviewed` (YYYY-MM-DD, mirroring the
 * page's `const lastReviewed`) and, if `reviewer` is set, a slug that resolves
 * in `src/data/reviewerDirectory.ts`. `assertChecklistsValid()` enforces this
 * and is called by the PDF build step, which fails the build on any violation.
 */

import {
  DEFAULT_REVIEWER_SLUG,
  getReviewerIdentity,
} from './reviewerDirectory';

export type HubId = 'advanced-bcc' | 'advanced-scc' | 'advanced-melanoma';

/** A single question. May contain inline <a>/<em>/<strong> markup. */
export type Question = string;

export interface QuestionGroup {
  /** Section label. Used as a heading in the PDF; on-page, the sub-page keeps
   *  its own <h2> and this is ignored by the renderer. Omit for the single
   *  unlabelled list on a deep-dive article. */
  heading?: string;
  /** Optional lead-in sentence, shown on-page (as `<p class="text-slate/80 mb-4">`)
   *  and in the PDF. May contain inline markup. */
  note?: string;
  /** true → ordered `<ol class="... list-decimal list-inside">`;
   *  false/omit → `<ul>` with bullet spans. Matches the original markup. */
  ordered?: boolean;
  /** Bullet colour for unordered lists. Matches the original markup. */
  bullet?: 'teal' | 'coral';
  questions: Question[];
}

export interface CareTeamChecklist {
  /** File-name stem; matches the sub-page's route segment. */
  slug: string;
  hub: HubId;
  /** Human title for the checklist / PDF section header. */
  pageTitle: string;
  /** Site-relative route of the sub-page this checklist belongs to. */
  pagePath: string;
  /** Position within the hub, for the combined guide and any listings. */
  order: number;
  /** YYYY-MM-DD — must equal the sub-page's `const lastReviewed`. */
  lastReviewed: string;
  /** reviewerDirectory slug. Omit for the Editor-in-Chief (Dr. Wang). */
  reviewer?: string;
  groups: QuestionGroup[];
}

export interface HubMeta {
  id: HubId;
  /** e.g. "Advanced Basal Cell Carcinoma" */
  title: string;
  /** Hub landing-page route. */
  path: string;
  /** Disease name for link/label copy, e.g. "advanced BCC". */
  disease: string;
}

export const hubs: HubMeta[] = [
  {
    id: 'advanced-bcc',
    title: 'Advanced Basal Cell Carcinoma',
    path: '/basal-cell-carcinoma/advanced-bcc',
    disease: 'advanced BCC',
  },
  {
    id: 'advanced-scc',
    title: 'Advanced Squamous Cell Carcinoma',
    path: '/squamous-cell-carcinoma/advanced-scc',
    disease: 'advanced SCC',
  },
  {
    id: 'advanced-melanoma',
    title: 'Advanced Melanoma',
    path: '/melanoma/advanced-melanoma',
    disease: 'advanced melanoma',
  },
];

// Reusable link fragments (kept verbatim from the source pages) --------------

const A = (href: string, text: string) =>
  `<a href="${href}" class="text-teal hover:text-teal/80 underline">${text}</a>`;

// ==========================================================================
// ADVANCED BCC
// ==========================================================================

const advancedBcc: CareTeamChecklist[] = [
  {
    slug: 'what-advanced-bcc-means',
    hub: 'advanced-bcc',
    pageTitle: 'What Advanced BCC Means',
    pagePath: '/basal-cell-carcinoma/advanced-bcc/what-advanced-bcc-means',
    order: 1,
    lastReviewed: '2026-08-31',
    groups: [
      {
        ordered: true,
        questions: [
          'Is my BCC locally advanced, or has it actually spread? What did the imaging show?',
          "Why can't this be treated with surgery or radiation — is that permanent, or could it change?",
          'Will my case be reviewed by a multidisciplinary team?',
          'What systemic treatment would you start with, and what is the goal — cure, control, or shrinking it before surgery?',
          'How will we know whether the treatment is working?',
        ],
      },
    ],
  },
  {
    slug: 'multidisciplinary-workup',
    hub: 'advanced-bcc',
    pageTitle: 'The Multidisciplinary Workup',
    pagePath: '/basal-cell-carcinoma/advanced-bcc/multidisciplinary-workup',
    order: 2,
    lastReviewed: '2026-08-31',
    groups: [
      {
        ordered: true,
        questions: [
          'Based on the exam and pathology, how far do you think this tumor extends — and do we need a scan to be sure?',
          'Is there any sign the cancer is involving a nerve?',
          'Which subtype is on my pathology report, and does it change the plan?',
          'Which specialists will be involved in my care, and who is coordinating it?',
          'Will my case be presented at a tumor board? When will I hear the recommendation?',
          'Is my tumor still removable with surgery, or are we considering other treatments first?',
        ],
      },
    ],
  },
  {
    slug: 'when-surgery-radiation-not-enough',
    hub: 'advanced-bcc',
    pageTitle: 'When Surgery and Radiation Are Not Enough',
    pagePath:
      '/basal-cell-carcinoma/advanced-bcc/when-surgery-radiation-not-enough',
    order: 3,
    lastReviewed: '2026-08-31',
    groups: [
      {
        ordered: true,
        questions: [
          'Why specifically is surgery not an option for my tumor — location, size, prior operations, or my overall health?',
          'Has radiation been ruled out, and if so, why?',
          'Could medication shrink this tumor enough to make surgery possible later?',
          'Will my case be presented at a multidisciplinary tumor board?',
          'If we start systemic treatment, what is the goal, and how will we measure whether it is working?',
        ],
      },
    ],
  },
  {
    slug: 'hedgehog-pathway-inhibitors',
    hub: 'advanced-bcc',
    pageTitle: 'Hedgehog Pathway Inhibitors',
    pagePath: '/basal-cell-carcinoma/advanced-bcc/hedgehog-pathway-inhibitors',
    order: 4,
    lastReviewed: '2026-08-31',
    groups: [
      {
        ordered: true,
        questions: [
          'Is my BCC locally advanced or metastatic, and which hedgehog inhibitor do you recommend for me and why?',
          'What response is realistic for a tumor like mine, and how will we measure whether it is working?',
          'How long might I need to take it, and what would make us stop or switch?',
          'What side effects should I expect, and what is the plan for managing them or taking breaks?',
          'If the drug stops working, what are my next options — immunotherapy or a trial?',
          'What contraception and blood-donation precautions apply, and for how long after the last dose?',
        ],
      },
    ],
  },
  {
    slug: 'managing-hedgehog-inhibitor-side-effects',
    hub: 'advanced-bcc',
    pageTitle: 'Managing Hedgehog Inhibitor Side Effects',
    pagePath:
      '/basal-cell-carcinoma/advanced-bcc/managing-hedgehog-inhibitor-side-effects',
    order: 5,
    lastReviewed: '2026-08-31',
    groups: [
      {
        ordered: true,
        questions: [
          'Which side effects am I most likely to get, and when might they start?',
          'What specifically can we do about muscle cramps and taste changes?',
          'At what point would we lower the dose or take a break — and can we plan breaks in advance?',
          'If I stop for a few weeks, is there a risk the cancer comes back or stops responding?',
          'Should I see a dietitian, and do you recommend any supplements?',
          'Which symptoms mean I should call you right away rather than wait for my next visit?',
        ],
      },
    ],
  },
  {
    slug: 'immunotherapy-for-advanced-bcc',
    hub: 'advanced-bcc',
    pageTitle: 'Immunotherapy for Advanced BCC',
    pagePath: '/basal-cell-carcinoma/advanced-bcc/immunotherapy-for-advanced-bcc',
    order: 6,
    lastReviewed: '2026-08-31',
    groups: [
      {
        ordered: true,
        questions: [
          'Is immunotherapy the right next step for me, or are other options still on the table?',
          'Given my tumor, what is a realistic chance that it will shrink on cemiplimab?',
          'What immune-related side effects should prompt me to call you right away?',
          'How will we know if it is working, and how long before we can tell?',
          'Do my other medical conditions or medications raise my risk with this drug?',
          'Is there a clinical trial I should consider instead of or alongside this?',
        ],
      },
    ],
  },
  {
    slug: 'neoadjuvant-therapy-before-surgery',
    hub: 'advanced-bcc',
    pageTitle: 'Neoadjuvant Therapy Before Surgery',
    pagePath:
      '/basal-cell-carcinoma/advanced-bcc/neoadjuvant-therapy-before-surgery',
    order: 7,
    lastReviewed: '2026-08-31',
    groups: [
      {
        ordered: true,
        questions: [
          'What would surgery look like now, and how might it change if the tumor shrinks first?',
          'How many months of medication are you planning, and how will we measure the response?',
          'What side effects are most likely, and at what point would we stop early?',
          'How will you find and remove the original tumor border after it shrinks?',
          'Is a clinical trial of neoadjuvant treatment an option for me?',
          'Will my insurance cover this use of the drug?',
        ],
      },
    ],
  },
  {
    slug: 'clinical-trials-for-advanced-bcc',
    hub: 'advanced-bcc',
    pageTitle: 'Clinical Trials for Advanced BCC',
    pagePath: '/basal-cell-carcinoma/advanced-bcc/clinical-trials-for-advanced-bcc',
    order: 8,
    lastReviewed: '2026-08-31',
    groups: [
      {
        bullet: 'teal',
        questions: [
          'Is there a clinical trial that fits my specific type of advanced BCC and my treatment history?',
          "What phase is it, and how much is already known about the study drug's safety and benefit?",
          'Would the trial replace my standard treatment, add to it, or be a next step if my current drug stops working?',
          'What extra visits, scans, biopsies, or travel would it involve compared with standard care?',
          'What are the known and possible side effects, and how would they be monitored?',
          'What happens if the trial treatment does not work for me, or if I decide to stop?',
          'Which costs are covered by the sponsor, and what would my insurance still be billed for?',
        ],
      },
    ],
  },
  {
    slug: 'gorlin-syndrome',
    hub: 'advanced-bcc',
    pageTitle: 'Gorlin Syndrome',
    pagePath: '/basal-cell-carcinoma/advanced-bcc/gorlin-syndrome',
    order: 9,
    lastReviewed: '2026-08-31',
    groups: [
      {
        bullet: 'teal',
        questions: [
          'Do my features meet the criteria for Gorlin syndrome, and should I have genetic testing and counseling?',
          'Should my children or other relatives be tested or screened, and starting at what age?',
          'How often should I have skin exams and jaw imaging?',
          'Which of my BCCs can be managed with creams, light therapy, or curettage rather than surgery?',
          'Am I a candidate for a hedgehog pathway inhibitor, and would it be a short course or longer term?',
          'Given my radiation sensitivity, how should imaging and any future radiotherapy be handled?',
          'Are there clinical trials or specialty clinics for Gorlin syndrome I should know about?',
        ],
      },
    ],
  },
  {
    slug: 'questions-to-ask-your-care-team',
    hub: 'advanced-bcc',
    pageTitle: 'Questions to Ask Your Care Team About Advanced BCC',
    pagePath:
      '/basal-cell-carcinoma/advanced-bcc/questions-to-ask-your-care-team',
    order: 10,
    lastReviewed: '2026-08-31',
    groups: [
      {
        heading: 'Questions About Your Diagnosis and Testing',
        bullet: 'teal',
        questions: [
          `What does "advanced" mean in my case — is this ${A('/basal-cell-carcinoma/advanced-bcc/what-advanced-bcc-means', 'locally advanced or metastatic')} disease?`,
          'Which subtype of BCC is on my pathology report, and is it an aggressive one?',
          'Is there any sign the tumor is growing along a nerve (perineural invasion)?',
          'Do I need an MRI, CT, or other scan before we decide on treatment? Why or why not?',
          'Has my tissue been reviewed by a dermatopathologist here, or should the slides be re-reviewed?',
          `Should I be checked for ${A('/basal-cell-carcinoma/advanced-bcc/gorlin-syndrome', 'Gorlin syndrome')} or another reason I am getting these tumors?`,
          'Will my case be presented at a tumor board, and when will I hear the recommendation?',
        ],
      },
      {
        heading: 'Questions for Your Dermatologist or Mohs Surgeon',
        bullet: 'teal',
        questions: [
          `Is my tumor still removable with surgery, or has it reached the point where ${A('/basal-cell-carcinoma/advanced-bcc/when-surgery-radiation-not-enough', 'surgery and radiation are no longer enough')}?`,
          'If it is removable, what technique would you use, and what is the expected cure rate?',
          'How large would the wound be, and who would handle the reconstruction?',
          'What structures are near the tumor that could be affected — nerves, the eye, cartilage, bone?',
          `Would treatment ${A('/basal-cell-carcinoma/advanced-bcc/neoadjuvant-therapy-before-surgery', 'before surgery to shrink the tumor')} make the operation smaller or safer?`,
          'Who is coordinating my overall care, and how do I reach that office between visits?',
          'Would you recommend a second opinion at a center that treats many advanced skin cancers?',
        ],
      },
      {
        heading: 'Questions for Your Surgeon',
        note: 'For a head and neck or surgical oncologist planning a larger operation:',
        bullet: 'teal',
        questions: [
          'What exactly would be removed, and how would that affect how I look, speak, chew, or see?',
          'How likely is it that you will get clear margins in one operation? What if you do not?',
          'Will lymph nodes be removed or sampled?',
          'What is the recovery like — hospital stay, time off, drains, wound care?',
          'Is radiation or medication likely to be recommended after surgery?',
          'How many operations like this do you and this center do each year?',
        ],
      },
      {
        heading: 'Questions for Your Radiation Oncologist',
        bullet: 'teal',
        questions: [
          'Is radiation the main treatment here, or is it being added after surgery?',
          'How many sessions, over how many weeks, and what does a session involve?',
          'What are the short-term effects (skin irritation, fatigue) and the long-term ones for my treatment area?',
          'Do I need a dental evaluation or other preparation before starting?',
          'What is the chance radiation controls the tumor long term, given its size and location?',
          'Can this area be treated again later if the cancer comes back?',
        ],
      },
      {
        heading: 'Questions for Your Medical Oncologist',
        note: 'When systemic (whole-body) medication is on the table:',
        bullet: 'coral',
        questions: [
          `Are we starting with a ${A('/basal-cell-carcinoma/advanced-bcc/hedgehog-pathway-inhibitors', 'hedgehog pathway inhibitor')}, ${A('/basal-cell-carcinoma/advanced-bcc/immunotherapy-for-advanced-bcc', 'immunotherapy')}, or a clinical trial — and why that one first?`,
          'Is the goal to shrink the tumor before surgery, or to control it long term?',
          `What side effects are most common, and ${A('/basal-cell-carcinoma/advanced-bcc/managing-hedgehog-inhibitor-side-effects', 'how are they managed')}? Which ones should prompt me to call?`,
          'How and when will we know if the medication is working? What scans or exams, how often?',
          'Are treatment breaks an option if side effects build up?',
          'What is the plan if this drug stops working or I cannot tolerate it?',
          `Is there a ${A('/basal-cell-carcinoma/advanced-bcc/clinical-trials-for-advanced-bcc', 'clinical trial')} I should consider, here or elsewhere?`,
          'Do I need to avoid pregnancy or fathering a child during and after this treatment?',
        ],
      },
      {
        heading: 'Questions About Daily Life, Support, and Cost',
        bullet: 'teal',
        questions: [
          'How will treatment affect my ability to work, drive, and care for my family?',
          'Is there a nurse navigator or social worker who can help with scheduling, transportation, and paperwork?',
          'What will this cost me, and is there financial assistance or a copay program for the medication?',
          'What support is available for the emotional side — counseling, support groups, palliative care for symptom relief?',
          'Who do I call after hours if I have a problem related to treatment?',
          'What does follow-up look like once active treatment ends?',
        ],
      },
      {
        heading: 'Questions to Prioritize If Your Time Is Short',
        note: 'If you can only ask a handful, start here:',
        ordered: true,
        questions: [
          'Is the goal of treatment to cure this or to control it?',
          'Can the tumor still be removed with surgery?',
          'What are my treatment options, and which do you recommend and why?',
          'What are the main side effects, and how reversible are they?',
          'Has a multidisciplinary team reviewed my case?',
          'Who is my main point of contact, and how do I reach them?',
        ],
      },
    ],
  },
  {
    slug: 'living-with-advanced-bcc',
    hub: 'advanced-bcc',
    pageTitle: 'Living With Advanced BCC',
    pagePath: '/basal-cell-carcinoma/advanced-bcc/living-with-advanced-bcc',
    order: 11,
    lastReviewed: '2026-08-31',
    groups: [
      {
        ordered: true,
        questions: [
          'Is my BCC locally advanced or metastatic, and what does that mean for my outlook?',
          'What is the goal of my treatment right now — to cure, to shrink the tumor, or to control it long term?',
          'What will my follow-up schedule and imaging look like over the next year?',
          'If long-term side effects become hard to live with, what are my options — dose changes, treatment breaks, or switching therapy?',
          'Can you refer me for reconstruction or a prosthesis, and when would that happen?',
          'Can I meet with a palliative (supportive) care team, and how do I connect with a social worker?',
          'What support is available for my caregiver?',
        ],
      },
    ],
  },
];

// ==========================================================================
// ADVANCED SCC
// ==========================================================================

const advancedScc: CareTeamChecklist[] = [
  {
    slug: 'what-advanced-scc-means',
    hub: 'advanced-scc',
    pageTitle: 'What Advanced SCC Means',
    pagePath: '/squamous-cell-carcinoma/advanced-scc/what-advanced-scc-means',
    order: 1,
    lastReviewed: '2026-08-31',
    groups: [
      {
        ordered: true,
        questions: [
          'Is my SCC locally advanced, or has it actually spread? What did the imaging show?',
          "Why can't this be treated with surgery or radiation — is that permanent, or could it change?",
          'Will my case be reviewed by a multidisciplinary team?',
          'What systemic treatment would you start with, and what is the goal — cure, control, or shrinking the tumor before surgery?',
          'How will we know whether the treatment is working, and how often will I be scanned?',
        ],
      },
    ],
  },
  {
    slug: 'high-risk-features',
    hub: 'advanced-scc',
    pageTitle: 'High-Risk Features',
    pagePath: '/squamous-cell-carcinoma/advanced-scc/high-risk-features',
    order: 2,
    lastReviewed: '2026-08-31',
    groups: [
      {
        ordered: true,
        questions: [
          'Which specific high-risk features does my tumor have, and what does my pathology report say about depth, differentiation, and perineural invasion?',
          "What is my tumor's stage in the AJCC and BWH systems, and my NCCN risk category?",
          'Does my risk level call for Mohs surgery, wider margins, or radiation after surgery?',
          'Do I need imaging or a sentinel lymph node biopsy to check my lymph nodes?',
          'How often should I be seen for follow-up, and what should I watch for between visits?',
        ],
      },
    ],
  },
  {
    slug: 'multidisciplinary-workup',
    hub: 'advanced-scc',
    pageTitle: 'The Multidisciplinary Workup',
    pagePath: '/squamous-cell-carcinoma/advanced-scc/multidisciplinary-workup',
    order: 3,
    lastReviewed: '2026-08-31',
    groups: [
      {
        ordered: true,
        questions: [
          'Has a dermatopathologist re-reviewed my slides, and does the report list differentiation, depth, perineural and lymphovascular invasion, margins, and subtype?',
          'What is my stage under the BWH and AJCC8 systems, and what does that predict?',
          'Do I need a scan — and should it be CT, MRI, PET-CT, or ultrasound?',
          'Is there any sign the cancer has reached a nerve or a lymph node?',
          'Which specialists will be involved, and will my case go to a tumor board?',
          'Are there clinical trials I should consider now, before we start treatment?',
        ],
      },
    ],
  },
  {
    slug: 'perineural-invasion',
    hub: 'advanced-scc',
    pageTitle: 'Perineural Invasion',
    pagePath: '/squamous-cell-carcinoma/advanced-scc/perineural-invasion',
    order: 4,
    lastReviewed: '2026-08-31',
    groups: [
      {
        ordered: true,
        questions: [
          'Is my perineural invasion incidental (microscopic) or clinical, and what size nerve is involved?',
          'Was a named nerve involved, and were my surgical margins clear of nerve?',
          'Do I need an MRI, and what did it show about the nerve and the skull base?',
          'Does the PNI change my stage under the AJCC or BWH systems?',
          'Do you recommend radiation after surgery? Why or why not, and what area would it cover?',
          'What symptoms should prompt me to call, and how often will I be seen for follow-up?',
        ],
      },
    ],
  },
  {
    slug: 'nodal-metastasis-and-sentinel-node',
    hub: 'advanced-scc',
    pageTitle: 'Nodal Metastasis and the Sentinel Node',
    pagePath:
      '/squamous-cell-carcinoma/advanced-scc/nodal-metastasis-and-sentinel-node',
    order: 5,
    lastReviewed: '2026-08-31',
    groups: [
      {
        ordered: true,
        questions: [
          "Based on my tumor's features and stage, what is my estimated risk of spread to lymph nodes?",
          'Which lymph node basin drains my tumor, and how will it be checked and followed?',
          'Do you recommend a sentinel lymph node biopsy in my case? What are the pros and cons for me?',
          'If a node is involved, would you recommend surgery, radiation, or both — and would systemic therapy be added?',
          'Was extranodal extension present, and how does that change my treatment?',
          'How often will I have exams and imaging, and for how long?',
        ],
      },
    ],
  },
  {
    slug: 'when-surgery-radiation-not-enough',
    hub: 'advanced-scc',
    pageTitle: 'When Surgery and Radiation Are Not Enough',
    pagePath:
      '/squamous-cell-carcinoma/advanced-scc/when-surgery-radiation-not-enough',
    order: 6,
    lastReviewed: '2026-08-31',
    groups: [
      {
        ordered: true,
        questions: [
          'Why specifically is surgery not an option — location, extent, prior operations, or my overall health?',
          'Has radiation been ruled out, and if so, why — have I already had radiation to this area?',
          'Could immunotherapy shrink this tumor enough to make surgery possible later?',
          'Will my case be presented at a multidisciplinary tumor board?',
          'Is the goal of treatment to cure the cancer, to control it, or to relieve symptoms?',
          'If we start systemic therapy, how will we measure whether it is working?',
        ],
      },
    ],
  },
  {
    slug: 'immunotherapy-for-advanced-scc',
    hub: 'advanced-scc',
    pageTitle: 'Immunotherapy for Advanced SCC',
    pagePath:
      '/squamous-cell-carcinoma/advanced-scc/immunotherapy-for-advanced-scc',
    order: 7,
    lastReviewed: '2026-08-31',
    groups: [
      {
        ordered: true,
        questions: [
          'Is my SCC locally advanced or metastatic, and is immunotherapy the right first step?',
          'Would you use cemiplimab or pembrolizumab for me, and why?',
          'Given my tumor, what is a realistic chance it will shrink, and how long until we know?',
          'Do I have any condition — a transplant, an autoimmune disease — that raises my risk with this treatment?',
          'How often will I have scans and blood tests, and how long would I stay on treatment?',
          'If it does not work or stops working, what would we do next? Is there a clinical trial for me?',
        ],
      },
    ],
  },
  {
    slug: 'managing-immunotherapy-side-effects',
    hub: 'advanced-scc',
    pageTitle: 'Managing Immunotherapy Side Effects',
    pagePath:
      '/squamous-cell-carcinoma/advanced-scc/managing-immunotherapy-side-effects',
    order: 8,
    lastReviewed: '2026-08-31',
    groups: [
      {
        ordered: true,
        questions: [
          'Which side effects are most likely for me, and which are the dangerous ones to watch for?',
          'What blood tests will you run before each infusion, and what are you looking for?',
          'At what point would we pause treatment, and at what point would we stop it for good?',
          'If I need steroids, how long would that last, and what else do I need while taking them?',
          'If I develop a thyroid or other hormone problem, can I stay on immunotherapy?',
          'Who do I call after hours, and what symptoms should send me straight to the emergency room?',
        ],
      },
    ],
  },
  {
    slug: 'neoadjuvant-immunotherapy-before-surgery',
    hub: 'advanced-scc',
    pageTitle: 'Neoadjuvant Immunotherapy Before Surgery',
    pagePath:
      '/squamous-cell-carcinoma/advanced-scc/neoadjuvant-immunotherapy-before-surgery',
    order: 9,
    lastReviewed: '2026-09-01',
    groups: [
      {
        ordered: true,
        questions: [
          'Is my tumor a candidate for immunotherapy before surgery, and what would that change about my operation?',
          "How many doses would I get, and how long before we know whether it's working?",
          'Will I still need surgery even if the tumor seems to disappear?',
          "What happens to the surgical plan if the tumor doesn't shrink, or grows, during treatment?",
          'Is a transplant, autoimmune condition, or other health issue a reason to avoid this approach for me?',
          'Who is on my team for this — dermatology, surgery, and medical oncology together?',
        ],
      },
    ],
  },
  {
    slug: 'chemotherapy-and-egfr-targeted-therapy',
    hub: 'advanced-scc',
    pageTitle: 'Chemotherapy and EGFR-Targeted Therapy',
    pagePath:
      '/squamous-cell-carcinoma/advanced-scc/chemotherapy-and-egfr-targeted-therapy',
    order: 10,
    lastReviewed: '2026-09-01',
    groups: [
      {
        ordered: true,
        questions: [
          'Why is cetuximab or chemotherapy being recommended for me instead of immunotherapy?',
          'Is this because of a transplant, immunosuppression, an autoimmune condition, or because immunotherapy already stopped working?',
          'What response rate is realistic for my specific situation?',
          "What side effects should I expect, and how will they be managed — for cetuximab's rash, or chemotherapy's effect on blood counts?",
          'Would combining this with radiation be considered?',
          "If this doesn't work, is immunotherapy still an option later, or is there a clinical trial to consider?",
        ],
      },
    ],
  },
  {
    slug: 'clinical-trials-for-advanced-scc',
    hub: 'advanced-scc',
    pageTitle: 'Clinical Trials for Advanced SCC',
    pagePath:
      '/squamous-cell-carcinoma/advanced-scc/clinical-trials-for-advanced-scc',
    order: 11,
    lastReviewed: '2026-09-01',
    groups: [
      {
        bullet: 'teal',
        questions: [
          'Is there a clinical trial that fits my specific type of advanced SCC and my treatment history?',
          "What phase is it, and how much is already known about the study drug's safety and benefit?",
          'Would the trial replace my standard treatment, add to it, or be a next step if my current drug stops working?',
          'If I am a transplant recipient or otherwise immunosuppressed, is this trial designed with that in mind?',
          'What extra visits, scans, biopsies, or travel would it involve compared with standard care?',
          'What are the known and possible side effects, and how would they be monitored?',
          'What happens if the trial treatment does not work for me, or if I decide to stop?',
          'Which costs are covered by the sponsor, and what would my insurance still be billed for?',
        ],
      },
    ],
  },
  {
    slug: 'scc-in-transplant-and-immunosuppressed-patients',
    hub: 'advanced-scc',
    pageTitle: 'SCC in Transplant and Immunosuppressed Patients',
    pagePath:
      '/squamous-cell-carcinoma/advanced-scc/scc-in-transplant-and-immunosuppressed-patients',
    order: 12,
    lastReviewed: '2026-09-01',
    groups: [
      {
        ordered: true,
        questions: [
          'How often should I have full-body skin exams given my transplant or immunosuppression?',
          'Is my current immunosuppression regimen something we should reconsider given my skin cancer history?',
          'If my SCC becomes advanced, is immunotherapy an option for me, or too risky because of my transplant?',
          'Who would be involved in that decision — my transplant team, oncologist, or both together?',
          'What non-immunotherapy treatments would we try first, and how effective are they typically?',
          'Is there a specialized center or clinical trial studying safer immunotherapy protocols for transplant recipients like me?',
        ],
      },
    ],
  },
  {
    slug: 'questions-to-ask-your-care-team',
    hub: 'advanced-scc',
    pageTitle: 'Questions to Ask Your Care Team About Advanced SCC',
    pagePath:
      '/squamous-cell-carcinoma/advanced-scc/questions-to-ask-your-care-team',
    order: 13,
    lastReviewed: '2026-09-01',
    groups: [
      {
        heading: 'Questions About Your Diagnosis and Testing',
        bullet: 'teal',
        questions: [
          `What does "advanced" mean in my case — is this ${A('/squamous-cell-carcinoma/advanced-scc/what-advanced-scc-means', 'locally advanced or metastatic')} disease?`,
          `Does my pathology report show any ${A('/squamous-cell-carcinoma/advanced-scc/high-risk-features', 'high-risk features')}, such as poor differentiation or deep invasion?`,
          `Is there any sign the tumor is growing along a nerve (${A('/squamous-cell-carcinoma/advanced-scc/perineural-invasion', 'perineural invasion')})?`,
          `Do I need imaging (CT, MRI, or ultrasound) of the lymph nodes, and is a ${A('/squamous-cell-carcinoma/advanced-scc/nodal-metastasis-and-sentinel-node', 'sentinel node biopsy')} being considered?`,
          'Has my tissue been reviewed by a dermatopathologist here, or should the slides be re-reviewed?',
          'Am I on immunosuppressing medication or have I had an organ transplant — does that change the plan?',
          'Will my case be presented at a tumor board, and when will I hear the recommendation?',
        ],
      },
      {
        heading: 'Questions for Your Dermatologist or Mohs Surgeon',
        bullet: 'teal',
        questions: [
          `Is my tumor still removable with surgery, or has it reached the point where ${A('/squamous-cell-carcinoma/advanced-scc/when-surgery-radiation-not-enough', 'surgery and radiation are no longer enough')}?`,
          'If it is removable, what technique would you use, and what is the expected cure rate?',
          'How large would the wound be, and who would handle the reconstruction?',
          'What structures are near the tumor that could be affected — nerves, cartilage, bone, the eye?',
          'Would treatment before surgery to shrink the tumor make the operation smaller or safer?',
          'Who is coordinating my overall care, and how do I reach that office between visits?',
          'Would you recommend a second opinion at a center that treats many advanced skin cancers?',
        ],
      },
      {
        heading: 'Questions for Your Surgeon',
        note: 'For a head and neck or surgical oncologist planning a larger operation, including any lymph node surgery:',
        bullet: 'teal',
        questions: [
          'What exactly would be removed, and how would that affect how I look, speak, chew, or see?',
          'How likely is it that you will get clear margins in one operation? What if you do not?',
          'Will lymph nodes be removed or sampled, and how will that change my recovery?',
          'What is the recovery like — hospital stay, time off, drains, wound care?',
          'Is radiation or medication likely to be recommended after surgery?',
          'How many operations like this do you and this center do each year?',
        ],
      },
      {
        heading: 'Questions for Your Radiation Oncologist',
        bullet: 'teal',
        questions: [
          'Is radiation the main treatment here, is it being added after surgery, or is it aimed at the lymph nodes as well as the primary tumor?',
          'How many sessions, over how many weeks, and what does a session involve?',
          'What are the short-term effects (skin irritation, fatigue, difficulty swallowing) and the long-term ones for my treatment area?',
          'Do I need a dental evaluation or other preparation before starting, especially for head and neck radiation?',
          'What is the chance radiation controls the tumor long term, given its size, location, and nerve involvement?',
          'Can this area be treated again later if the cancer comes back?',
        ],
      },
      {
        heading: 'Questions for Your Medical Oncologist',
        note: 'When systemic (whole-body) medication is on the table:',
        bullet: 'coral',
        questions: [
          `Are we starting with ${A('/squamous-cell-carcinoma/advanced-scc/immunotherapy-for-advanced-scc', 'immunotherapy')}, chemotherapy or an EGFR-targeted drug, or a clinical trial — and why that one first?`,
          'Is the goal to shrink the tumor before surgery, or to control it long term?',
          `What side effects are most common, and ${A('/squamous-cell-carcinoma/advanced-scc/managing-immunotherapy-side-effects', 'how are they managed')}? Which ones should prompt me to call?`,
          'How and when will we know if the medication is working? What scans or exams, how often?',
          'If I have had a solid-organ transplant or take immune-suppressing medication, is immunotherapy still safe for me, and who is coordinating that decision with my transplant team?',
          'What is the plan if this drug stops working or I cannot tolerate it?',
          'Is there a clinical trial I should consider, here or elsewhere?',
        ],
      },
      {
        heading: 'Questions About Daily Life, Support, and Cost',
        bullet: 'teal',
        questions: [
          'How will treatment affect my ability to work, drive, and care for my family?',
          'Is there a nurse navigator or social worker who can help with scheduling, transportation, and paperwork?',
          'What will this cost me, and is there financial assistance or a copay program for the medication?',
          'What support is available for the emotional side — counseling, support groups, palliative care for symptom relief?',
          'Who do I call after hours if I have a problem related to treatment?',
          'What does follow-up look like once active treatment ends?',
        ],
      },
      {
        heading: 'Questions to Prioritize If Your Time Is Short',
        note: 'If you can only ask a handful, start here:',
        ordered: true,
        questions: [
          'Is the goal of treatment to cure this or to control it?',
          'Can the tumor still be removed with surgery?',
          'Do the lymph nodes need to be checked or treated?',
          'What are my treatment options, and which do you recommend and why?',
          'Has a multidisciplinary team reviewed my case?',
          'Who is my main point of contact, and how do I reach them?',
        ],
      },
    ],
  },
  {
    slug: 'living-with-advanced-scc',
    hub: 'advanced-scc',
    pageTitle: 'Living With Advanced SCC',
    pagePath: '/squamous-cell-carcinoma/advanced-scc/living-with-advanced-scc',
    order: 14,
    lastReviewed: '2026-09-01',
    groups: [
      {
        ordered: true,
        questions: [
          'Is my SCC locally advanced or has it spread to lymph nodes or elsewhere, and what does that mean for my outlook?',
          'What is the goal of my treatment right now — to cure, to shrink the tumor, or to control it long term?',
          'What will my follow-up schedule and imaging look like over the next year?',
          'If long-term side effects become hard to live with, what are my options — dose changes, treatment breaks, or switching therapy?',
          'Can you refer me for reconstruction, lymphedema care, or a prosthesis, and when would that happen?',
          'Can I meet with a palliative (supportive) care team, and how do I connect with a social worker?',
          'What support is available for my caregiver?',
        ],
      },
    ],
  },
];

// ==========================================================================
// ADVANCED MELANOMA
// ==========================================================================

const advancedMelanoma: CareTeamChecklist[] = [
  {
    slug: 'what-advanced-melanoma-means',
    hub: 'advanced-melanoma',
    pageTitle: 'What Advanced Melanoma Means',
    pagePath: '/melanoma/advanced-melanoma/what-advanced-melanoma-means',
    order: 1,
    lastReviewed: '2026-09-01',
    groups: [
      {
        ordered: true,
        questions: [
          'Is my melanoma regionally advanced (stage III) or metastatic (stage IV), and what is the exact stage grouping?',
          'If it is stage III, was the nodal spread microscopic or clinically detected, and are there in-transit or satellite lesions?',
          'If it is stage IV, which sites are involved, and what did my LDH level show?',
          'Can any of the melanoma be removed with surgery, now or after medication?',
          'Will my case be reviewed by a multidisciplinary team, and what systemic treatment would you start with?',
        ],
      },
    ],
  },
  {
    slug: 'staging-workup-and-imaging',
    hub: 'advanced-melanoma',
    pageTitle: 'Staging Workup and Imaging',
    pagePath: '/melanoma/advanced-melanoma/staging-workup-and-imaging',
    order: 2,
    lastReviewed: '2026-09-01',
    groups: [
      {
        ordered: true,
        questions: [
          'What is my full TNM stage, and is it a clinical or a pathologic stage?',
          'Which scans will I have, and will they include a brain MRI even though I feel well?',
          'Has my tumor been tested for BRAF — and, if it is acral or mucosal, for NRAS and KIT?',
          'Will my original pathology slides be re-reviewed here, and could that change my stage?',
          'Will my case be presented at a multidisciplinary tumor board before we decide on treatment?',
        ],
      },
    ],
  },
  {
    slug: 'immunotherapy-for-advanced-melanoma',
    hub: 'advanced-melanoma',
    pageTitle: 'Immunotherapy for Advanced Melanoma',
    pagePath: '/melanoma/advanced-melanoma/immunotherapy-for-advanced-melanoma',
    order: 3,
    lastReviewed: '2026-09-01',
    groups: [
      {
        ordered: true,
        questions: [
          'Which regimen are you recommending for me, and what are its expected response rate and serious-side-effect rate?',
          'Given my other health conditions, is the ipilimumab combination too risky for me?',
          'How and when will we know whether it is working, and what would you do if an early scan is unclear?',
          'How long do you expect me to stay on treatment, and what happens when I stop?',
          'If this regimen does not work, what are my next options — targeted therapy, TIL therapy, or a trial?',
        ],
      },
    ],
  },
  {
    slug: 'targeted-therapy-braf-mek',
    hub: 'advanced-melanoma',
    pageTitle: 'Targeted Therapy (BRAF/MEK)',
    pagePath: '/melanoma/advanced-melanoma/targeted-therapy-braf-mek',
    order: 4,
    lastReviewed: '2026-09-01',
    groups: [
      {
        ordered: true,
        questions: [
          'Has my tumor been tested for a BRAF mutation, and what exactly did it show?',
          'Given my situation, should I start with immunotherapy or targeted therapy — and why?',
          'If we use targeted therapy, which drug pair do you recommend for me, and what side effects are most likely?',
          'How and how often will we check that it is working, and what happens if it stops?',
          'If my stage III melanoma was fully removed, is adjuvant targeted therapy or adjuvant immunotherapy the better fit for me?',
        ],
      },
    ],
  },
  {
    slug: 'managing-immunotherapy-side-effects',
    hub: 'advanced-melanoma',
    pageTitle: 'Managing Immunotherapy Side Effects',
    pagePath: '/melanoma/advanced-melanoma/managing-immunotherapy-side-effects',
    order: 5,
    lastReviewed: '2026-09-01',
    groups: [
      {
        ordered: true,
        questions: [
          'Given my regimen, which side effects are most likely for me, and which are the dangerous ones to watch for?',
          'What blood tests will you run before each infusion, and what are you looking for?',
          'At what point would we pause treatment, and at what point would we stop it for good?',
          'If I need steroids, how long would that last, and what else do I need while taking them?',
          'Who do I call after hours, and which symptoms should send me straight to the emergency room?',
        ],
      },
    ],
  },
  {
    slug: 'neoadjuvant-immunotherapy',
    hub: 'advanced-melanoma',
    pageTitle: 'Neoadjuvant Immunotherapy',
    pagePath: '/melanoma/advanced-melanoma/neoadjuvant-immunotherapy',
    order: 6,
    lastReviewed: '2026-09-01',
    groups: [
      {
        ordered: true,
        questions: [
          'Is my melanoma macroscopic, resectable stage III — the situation where neoadjuvant treatment is used?',
          'Would you recommend neoadjuvant immunotherapy over surgery-first with adjuvant treatment, and why?',
          'Which regimen would I get before surgery, and how long until the operation?',
          'How will the pathologic response be measured, and how would it change what happens afterward?',
          'What happens if the melanoma grows during the pre-surgery treatment, or if I have a serious side effect?',
        ],
      },
    ],
  },
  {
    slug: 'adjuvant-therapy-after-surgery',
    hub: 'advanced-melanoma',
    pageTitle: 'Adjuvant Therapy After Surgery',
    pagePath: '/melanoma/advanced-melanoma/adjuvant-therapy-after-surgery',
    order: 7,
    lastReviewed: '2026-09-01',
    groups: [
      {
        ordered: true,
        questions: [
          'What is my exact substage, and what is my estimated chance of recurrence with and without adjuvant therapy?',
          'Given my substage, do you recommend immunotherapy, targeted therapy, or observation — and why?',
          'Has my melanoma been tested for a BRAF mutation, and what did that show?',
          'What is my personal risk of a permanent hormone problem or another lasting side effect?',
          'Would neoadjuvant treatment before surgery, or a clinical trial, be a better fit for my situation?',
        ],
      },
    ],
  },
  {
    slug: 'melanoma-brain-metastases',
    hub: 'advanced-melanoma',
    pageTitle: 'Melanoma Brain Metastases',
    pagePath: '/melanoma/advanced-melanoma/melanoma-brain-metastases',
    order: 8,
    lastReviewed: '2026-09-01',
    groups: [
      {
        ordered: true,
        questions: [
          'How many brain lesions are there, how large are they, and are any causing symptoms or swelling?',
          'Would you recommend stereotactic radiosurgery, surgery, or both — and in what order relative to systemic therapy?',
          'Is my melanoma <em>BRAF</em>-mutated, and does that change whether we start with immunotherapy or targeted therapy?',
          'Am I on steroids, and if so, what is the plan to get the dose as low as possible?',
          'Is there a clinical trial for melanoma brain metastases that I might be eligible for, and has my case been reviewed by a multidisciplinary team?',
        ],
      },
    ],
  },
  {
    slug: 'til-therapy-and-newer-options',
    hub: 'advanced-melanoma',
    pageTitle: 'TIL Therapy and Newer Options',
    pagePath: '/melanoma/advanced-melanoma/til-therapy-and-newer-options',
    order: 9,
    lastReviewed: '2026-09-01',
    groups: [
      {
        ordered: true,
        questions: [
          'Now that my first-line treatment has stopped working, what are all my options — another drug class, TIL therapy, or a trial?',
          'Am I a candidate for lifileucel — is there a lesion large enough to harvest, and am I fit enough for the chemotherapy and IL-2?',
          'Which center near me is certified to deliver TIL therapy, and what would referral involve?',
          'Is there a role for T-VEC for my skin or lymph node disease?',
          'Are there clinical trials — including vaccine or cell-therapy trials — that I should be evaluated for now?',
        ],
      },
    ],
  },
  {
    slug: 'clinical-trials-for-advanced-melanoma',
    hub: 'advanced-melanoma',
    pageTitle: 'Clinical Trials for Advanced Melanoma',
    pagePath: '/melanoma/advanced-melanoma/clinical-trials-for-advanced-melanoma',
    order: 10,
    lastReviewed: '2026-09-01',
    groups: [
      {
        heading: 'Questions to Ask Before Enrolling',
        bullet: 'teal',
        questions: [
          '<strong>What is being tested, and what is the comparison?</strong> Is there randomization? If so, what does each group receive — does everyone get at least standard treatment?',
          '<strong>What is the goal for me</strong> — shrinking the melanoma, keeping it stable, lowering recurrence risk — and how will that be measured?',
          '<strong>What are the known and possible risks,</strong> and how do they compare with standard treatment?',
          '<strong>What extra visits, scans, biopsies, and travel</strong> are required, and over how long? What costs are covered by the trial, and what falls to me or my insurance?',
          '<strong>What happens if the treatment does not work</strong> or I need to stop? Can I still get standard therapy afterward, and can I leave the trial at any time?',
        ],
      },
      {
        heading: 'What to Ask Your Doctor',
        ordered: true,
        questions: [
          'Is a clinical trial a reasonable option for me right now, or at a specific point ahead?',
          'Are there trials at this center I might qualify for, and are there multicenter trials worth traveling for?',
          'Given my mutation status and prior treatment, what kinds of trials am I eligible for?',
          'If I join a trial, would I keep seeing you, and how would my care be coordinated?',
          'Could a referral to a larger melanoma center open up trial options I do not have here?',
        ],
      },
    ],
  },
  {
    slug: 'questions-to-ask-your-care-team',
    hub: 'advanced-melanoma',
    pageTitle: 'Questions to Ask Your Care Team About Advanced Melanoma',
    pagePath: '/melanoma/advanced-melanoma/questions-to-ask-your-care-team',
    order: 11,
    lastReviewed: '2026-09-01',
    groups: [
      {
        heading: 'Understanding My Diagnosis and Stage',
        note: 'These answers shape every decision that follows.',
        bullet: 'teal',
        questions: [
          'Is my melanoma stage III or stage IV, and what is the exact substage?',
          'Where is the melanoma — lymph nodes only, in-transit skin lesions, or distant organs? Which organs?',
          'Can all of it be removed with surgery — now, or possibly after medication?',
          'What is my blood LDH level, and is it normal or elevated?',
          'Has my tumor been tested for a <em>BRAF</em> mutation? If it is acral or mucosal melanoma, has it been tested for <em>NRAS</em> and <em>KIT</em>?',
          'Has my brain been imaged with MRI, even though I feel well?',
          'Will my original pathology be re-reviewed here, and will my case go to a multidisciplinary tumor board?',
        ],
      },
      {
        heading: 'Choosing a Treatment Plan',
        bullet: 'teal',
        questions: [
          'What treatment are you recommending, and what is the goal — cure, long-term control, or shrinking the melanoma before surgery?',
          `Why ${A('/melanoma/advanced-melanoma/immunotherapy-for-advanced-melanoma', 'immunotherapy')} versus ${A('/melanoma/advanced-melanoma/targeted-therapy-braf-mek', 'targeted therapy')} for me? If immunotherapy, single-agent or a combination — and why?`,
          'For each option you are considering, what is the expected response rate and the expected rate of serious side effects?',
          `If my melanoma is resectable stage III, is ${A('/melanoma/advanced-melanoma/neoadjuvant-immunotherapy', 'neoadjuvant treatment before surgery')} an option? What about ${A('/melanoma/advanced-melanoma/adjuvant-therapy-after-surgery', 'adjuvant treatment after surgery')}?`,
          'How long would I be on treatment, and what happens when I stop?',
          'If this treatment does not work, what are the next options?',
        ],
      },
      {
        heading: 'During Treatment',
        bullet: 'teal',
        questions: [
          `Which side effects are most likely for me, and which ones are urgent? See ${A('/melanoma/advanced-melanoma/managing-immunotherapy-side-effects', 'managing immunotherapy side effects')}.`,
          'Who do I call after hours, and which symptoms should send me straight to the emergency room?',
          'What blood tests and scans will I have, and how often?',
          'How will we know whether the treatment is working, and what would you do if an early scan is unclear?',
          'Can I keep working, exercising, and traveling during treatment? Are any vaccines or medications off-limits?',
        ],
      },
      {
        heading: 'Surgery and Radiation',
        bullet: 'teal',
        questions: [
          'Is surgery still useful for me — to remove nodes, an in-transit lesion, or a single distant spot (oligometastatic disease)?',
          'If I have a positive sentinel node, are you recommending nodal ultrasound surveillance rather than removing all the nodes, and why?',
          `Is there a role for radiation — to a lymph node basin, a bone lesion, or a ${A('/melanoma/advanced-melanoma/melanoma-brain-metastases', 'brain metastasis')} — and how does it fit with my systemic treatment?`,
          'What is the recovery from any planned procedure, and how might it delay other treatment?',
        ],
      },
      {
        heading: 'Second Opinions and Clinical Trials',
        bullet: 'teal',
        questions: [
          'Would you recommend a second opinion at a high-volume melanoma center? Can you help arrange it without delaying treatment?',
          `Am I eligible for a ${A('/melanoma/advanced-melanoma/clinical-trials-for-advanced-melanoma', 'clinical trial')} — here or elsewhere — and is a trial reasonable now rather than later?`,
          `Am I a candidate for newer options such as ${A('/melanoma/advanced-melanoma/til-therapy-and-newer-options', 'TIL cell therapy')}?`,
          'If I join a trial, would I keep seeing you, and how would my care be coordinated?',
        ],
      },
      {
        heading: 'Follow-Up and Surveillance',
        bullet: 'teal',
        questions: [
          'After treatment, how often will I have exams, blood tests, and imaging — and for how many years?',
          'Will follow-up include brain MRI, and how long will that continue?',
          'Who does my skin checks, and how often, given my higher risk of a new, separate melanoma?',
          'What symptoms between visits should prompt a call?',
          'What does "no evidence of disease" mean for me, and what is the plan if the melanoma comes back?',
        ],
      },
      {
        heading: 'Support and Practical Concerns',
        bullet: 'teal',
        questions: [
          'If I might want children later, should I see a fertility specialist before treatment starts?',
          'Is there a nurse navigator, social worker, or financial counselor who can help with costs, work, and insurance?',
          'What mental health support and peer support groups do you recommend, for me and for my caregiver?',
          'Can I see palliative or supportive care alongside my active treatment to help manage symptoms and stress?',
          'What should my family know about my diagnosis, including whether they should have their own skin checks?',
        ],
      },
      {
        heading: 'Five Questions to Start With',
        note: 'If time is short, these five open up the rest of the conversation:',
        ordered: true,
        questions: [
          'Is my melanoma stage III or stage IV, and can any of it be removed with surgery?',
          'Is my tumor BRAF-mutant, and what is my LDH?',
          'What treatment do you recommend first, what is the goal, and what are its main risks?',
          'Will my case be reviewed by a multidisciplinary team, and am I eligible for a clinical trial?',
          'Should I get a second opinion at a high-volume melanoma center?',
        ],
      },
    ],
  },
  {
    slug: 'living-with-advanced-melanoma',
    hub: 'advanced-melanoma',
    pageTitle: 'Living With Advanced Melanoma',
    pagePath: '/melanoma/advanced-melanoma/living-with-advanced-melanoma',
    order: 12,
    lastReviewed: '2026-09-01',
    groups: [
      {
        ordered: true,
        questions: [
          'Given where my melanoma is and how it has responded, what is a realistic picture of my outlook?',
          'What exactly is my surveillance schedule — which tests, how often, and for how many years?',
          'Which of my treatment side effects are likely to be permanent, and how are they managed long term?',
          'Can I be referred to palliative or supportive care to help with symptoms and stress while I stay on treatment?',
          'What mental health and peer support do you recommend for me and for my caregiver?',
        ],
      },
    ],
  },
];

// ==========================================================================

export const careTeamChecklists: CareTeamChecklist[] = [
  ...advancedBcc,
  ...advancedScc,
  ...advancedMelanoma,
];

// Lookups ------------------------------------------------------------------

export function getHubMeta(hub: HubId): HubMeta {
  const meta = hubs.find((h) => h.id === hub);
  if (!meta) throw new Error(`Unknown hub: ${hub}`);
  return meta;
}

export function getHubChecklists(hub: HubId): CareTeamChecklist[] {
  return careTeamChecklists
    .filter((c) => c.hub === hub)
    .sort((a, b) => a.order - b.order);
}

/** Look up a checklist by hub + slug (slugs repeat across hubs). */
export function getChecklist(
  hub: HubId,
  slug: string,
): CareTeamChecklist | undefined {
  return careTeamChecklists.find((c) => c.hub === hub && c.slug === slug);
}

/** Look up a checklist by its sub-page route. */
export function getChecklistByPath(
  pagePath: string,
): CareTeamChecklist | undefined {
  return careTeamChecklists.find((c) => c.pagePath === pagePath);
}

// PDF asset paths (also the public URLs the download links point at) ------

export function checklistPdfPath(c: CareTeamChecklist): string {
  return `/downloads/${c.hub}/${c.slug}-checklist.pdf`;
}

export function hubBundlePdfPath(hub: HubId): string {
  return `/downloads/${hub}/complete-${hub}-discussion-guide.pdf`;
}

// Validation ------------------------------------------------------------

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Throws if any checklist is missing content or reviewer metadata the PDF
 * footer needs. Called by `integrations/checklist-pdfs.mjs`, so a violation
 * fails the build — matching the reviewer-byline policy in CLAUDE.md.
 */
export function assertChecklistsValid(): void {
  const problems: string[] = [];

  for (const c of careTeamChecklists) {
    const id = `${c.hub}/${c.slug}`;

    if (!DATE_RE.test(c.lastReviewed)) {
      problems.push(`${id}: lastReviewed "${c.lastReviewed}" is not YYYY-MM-DD`);
    } else if (Number.isNaN(Date.parse(`${c.lastReviewed}T00:00:00Z`))) {
      problems.push(`${id}: lastReviewed "${c.lastReviewed}" is not a real date`);
    }

    const reviewerSlug = c.reviewer ?? DEFAULT_REVIEWER_SLUG;
    if (!getReviewerIdentity(reviewerSlug)) {
      problems.push(
        `${id}: reviewer "${reviewerSlug}" not found in reviewerDirectory.ts`,
      );
    }

    if (!c.groups.length) {
      problems.push(`${id}: has no question groups`);
    }
    c.groups.forEach((g, i) => {
      if (!g.questions.length) {
        problems.push(`${id}: group ${i} ("${g.heading ?? ''}") has no questions`);
      }
      g.questions.forEach((q, j) => {
        if (typeof q !== 'string' || !q.trim()) {
          problems.push(`${id}: group ${i} question ${j} is empty`);
        }
      });
    });
  }

  if (problems.length) {
    throw new Error(
      `careTeamQuestions.ts validation failed:\n  - ${problems.join('\n  - ')}`,
    );
  }
}
