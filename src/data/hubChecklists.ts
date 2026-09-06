/**
 * Structured "What to Ask Your Doctor" content for the deep-dive articles under
 * the non-advanced disease hubs (BCC, SCC, melanoma, actinic keratosis, the
 * AK / PDT sub-hub, and atypical nevi).
 *
 * Mirrors `src/data/careTeamQuestions.ts` (which covers the three *advanced*
 * hubs) and is consumed the same two ways:
 *   1. on each article, via `src/components/QuestionList.astro`; and
 *   2. as printable PDF checklists at build time, via
 *      `integrations/checklist-pdfs.mjs` — one per article plus one combined
 *      "complete discussion guide" per hub.
 *
 * Question strings were lifted verbatim from each page's existing, medically
 * reviewed "What to Ask Your Doctor" list; `lastReviewed` mirrors that page's
 * `const lastReviewed`. `assertHubChecklistsValid()` enforces the reviewer /
 * date metadata the PDF footer needs and is called by the PDF build step.
 */

import type { QuestionGroup } from './careTeamQuestions';
import {
  DEFAULT_REVIEWER_SLUG,
  getReviewerIdentity,
} from './reviewerDirectory';

export interface HubChecklist {
  /** File-name stem; matches the article's route segment. */
  slug: string;
  /** Hub id — the first path segment under /downloads/. */
  hub: string;
  /** Human title for the checklist / PDF section header (the article's H1). */
  pageTitle: string;
  /** Site-relative route of the article this checklist belongs to. */
  pagePath: string;
  /** Position within the hub, for the combined guide. */
  order: number;
  /** YYYY-MM-DD — must equal the article's `const lastReviewed`. */
  lastReviewed: string;
  /** reviewerDirectory slug. Omit for the Editor-in-Chief (Dr. Wang). */
  reviewer?: string;
  groups: QuestionGroup[];
}

export interface HubChecklistMeta {
  id: string;
  /** e.g. "Basal Cell Carcinoma" */
  title: string;
  /** Hub landing-page route. */
  path: string;
  /** Disease name for label copy. */
  disease: string;
}

export const hubChecklistHubs: HubChecklistMeta[] = [
  { id: "bcc", title: "Basal Cell Carcinoma", path: "/basal-cell-carcinoma", disease: "basal cell carcinoma" },
  { id: "scc", title: "Squamous Cell Carcinoma", path: "/squamous-cell-carcinoma", disease: "squamous cell carcinoma" },
  { id: "melanoma", title: "Melanoma", path: "/melanoma", disease: "melanoma" },
  { id: "actinic-keratosis", title: "Actinic Keratosis", path: "/actinic-keratosis", disease: "actinic keratoses" },
  { id: "ak-pdt", title: "Photodynamic Therapy for Actinic Keratosis", path: "/actinic-keratosis/pdt", disease: "photodynamic therapy" },
  { id: "atypical-nevi", title: "Atypical Moles (Dysplastic Nevi)", path: "/atypical-nevi", disease: "atypical moles" },
  { id: "merkel-cell-carcinoma", title: "Merkel Cell Carcinoma", path: "/merkel-cell-carcinoma", disease: "Merkel cell carcinoma" },
];

// ======================================================================
// BASAL CELL CARCINOMA
// ======================================================================

const bcc: HubChecklist[] = [
  {
    slug: "biopsy-meaning",
    hub: "bcc",
    pageTitle: "What Does It Mean If My Biopsy Says \"Basal Cell Carcinoma\"?",
    pagePath: "/basal-cell-carcinoma/biopsy-meaning",
    order: 0,
    lastReviewed: "2026-08-22",
    groups: [
      {
        note: "When you review your biopsy results, consider asking:",
        ordered: true,
        questions: [
          "What type of basal cell carcinoma do I have?",
          "Were the biopsy margins clear or involved?",
          "Will I need Mohs surgery or a standard excision?",
          "What are my chances of recurrence?",
          "How often should I have full-body skin checks going forward?",
        ],
      },
    ],
  },
  {
    slug: "types",
    hub: "bcc",
    pageTitle: "How Do Doctors Decide Which Type of BCC I Have (Superficial, Nodular, Morpheaform)?",
    pagePath: "/basal-cell-carcinoma/types",
    order: 1,
    lastReviewed: "2026-08-22",
    groups: [
      {
        ordered: true,
        questions: [
          "What subtype of basal cell carcinoma do I have?",
          "How deep or aggressive is my tumor?",
          "Is Mohs surgery recommended, or can this be treated another way?",
          "What are my chances of recurrence?",
          "How often should I have skin checks after treatment?",
        ],
      },
    ],
  },
  {
    slug: "treatment-options",
    hub: "bcc",
    pageTitle: "What Are the Treatment Options for Basal Cell Carcinoma?",
    pagePath: "/basal-cell-carcinoma/treatment-options",
    order: 2,
    lastReviewed: "2026-08-22",
    groups: [
      {
        ordered: true,
        questions: [
          "Given my tumor's size, location, and subtype, which treatment do you recommend and why?",
          "What is the expected cure rate for this approach in my specific case?",
          "What will recovery and scarring look like?",
          "Am I a candidate for a non-surgical option?",
          "How will we confirm the BCC is completely gone after treatment?",
        ],
      },
    ],
  },
  {
    slug: "recovery-after-surgery",
    hub: "bcc",
    pageTitle: "What Should I Expect During Recovery After BCC Surgery?",
    pagePath: "/basal-cell-carcinoma/recovery-after-surgery",
    order: 3,
    lastReviewed: "2026-08-24",
    groups: [
      {
        ordered: true,
        questions: [
          "Exactly when can I remove the initial bandage, and how should I clean the wound after that?",
          "Which activities do I need to avoid, and for how long?",
          "When are my stitches scheduled to come out?",
          "What level of redness, swelling, or drainage is normal versus concerning for my specific repair?",
          "What can I do to minimize scarring once the wound has closed?",
        ],
      },
    ],
  },
  {
    slug: "recurrence-prevention",
    hub: "bcc",
    pageTitle: "Can Basal Cell Carcinoma Come Back After Treatment — And How Do I Prevent It?",
    pagePath: "/basal-cell-carcinoma/recurrence-prevention",
    order: 4,
    lastReviewed: "2026-08-24",
    groups: [
      {
        ordered: true,
        questions: [
          "Based on how my BCC was treated, what's my personal recurrence risk?",
          "How often should I come in for a full-body skin exam going forward?",
          "What should a recurrence at the treatment site actually look like?",
          "Am I a candidate for nicotinamide or other chemoprevention?",
          "Are there sunscreen or sun-protection habits specific to my skin type and lifestyle I should adopt?",
        ],
      },
    ],
  },
  {
    slug: "spread-and-seriousness",
    hub: "bcc",
    pageTitle: "What Is the Risk of BCC Spreading or Becoming Serious?",
    pagePath: "/basal-cell-carcinoma/spread-and-seriousness",
    order: 5,
    lastReviewed: "2026-08-24",
    groups: [
      {
        ordered: true,
        questions: [
          "Does my BCC have any of the high-risk features, like size, location, or subtype?",
          "Is there any sign of deeper growth into nerve, cartilage, or bone?",
          "Based on my risk category, why is this particular treatment being recommended over others?",
          "How closely will I need to be monitored given my tumor's risk level?",
          "What symptoms — numbness, persistent pain, rapid growth — should prompt me to call sooner than my next scheduled visit?",
        ],
      },
    ],
  },
  {
    slug: "self-exam-when-to-see-doctor",
    hub: "bcc",
    pageTitle: "How Do I Check My Skin for Basal Cell Carcinoma — and When Should I See a Doctor?",
    pagePath: "/basal-cell-carcinoma/self-exam-when-to-see-doctor",
    order: 6,
    lastReviewed: "2026-08-24",
    groups: [
      {
        ordered: true,
        questions: [
          "Is this spot something you'd want to biopsy, or is it safe to just keep watching?",
          "Given my skin type and history, how often should I be getting a professional skin check?",
          "Are there areas of my body I should be paying closer attention to during self-exams?",
          "Can you show me what to look for so I know what \"changed\" actually looks like for this spot?",
          "If I've had a BCC before, does that change how often I should self-exam or get checked?",
        ],
      },
    ],
  },
  {
    slug: "lifestyle-prevention",
    hub: "bcc",
    pageTitle: "What Lifestyle or Skin-Care Habits Help Reduce the Chance of Another Basal Cell Carcinoma?",
    pagePath: "/basal-cell-carcinoma/lifestyle-prevention",
    order: 7,
    lastReviewed: "2026-08-24",
    groups: [
      {
        ordered: true,
        questions: [
          "Given my skin type and history, is a mineral or chemical sunscreen better suited to me?",
          "Are any of my current medications increasing my sun sensitivity?",
          "Are there specific areas of my skin I tend to under-protect based on where my prior BCC was?",
          "Is my current sun-protection routine adequate, or are there gaps worth closing?",
          "At what point does daily sun protection stop mattering as much — is there ever a point I can ease up?",
        ],
      },
    ],
  },
];

// ======================================================================
// SQUAMOUS CELL CARCINOMA
// ======================================================================

const scc: HubChecklist[] = [
  {
    slug: "early-signs-vs-other-skin-cancers",
    hub: "scc",
    pageTitle: "What Are the Early Signs of Squamous Cell Carcinoma and How Is It Different From Other Skin Cancers?",
    pagePath: "/squamous-cell-carcinoma/early-signs-vs-other-skin-cancers",
    order: 0,
    lastReviewed: "2026-08-26",
    groups: [
      {
        ordered: true,
        questions: [
          "Does this spot look more consistent with SCC, BCC, or an actinic keratosis — and how confident are you without a biopsy?",
          "Should this be biopsied now, or is it reasonable to monitor it for a defined period first?",
          "Is this arising from a scar, chronic wound, or an area of prior radiation, and does that change how it should be evaluated?",
          "What specific changes in this spot should prompt me to call you before my next scheduled visit?",
          "Given where this is located, are there other spots nearby I should also be watching closely?",
        ],
      },
    ],
  },
  {
    slug: "staging-and-grading",
    hub: "scc",
    pageTitle: "How Do Doctors Grade or Stage an SCC and Why Does That Matter for Treatment?",
    pagePath: "/squamous-cell-carcinoma/staging-and-grading",
    order: 1,
    lastReviewed: "2026-08-26",
    groups: [
      {
        ordered: true,
        questions: [
          "What is the T stage of my tumor, and were any high-risk features found on pathology?",
          "What is the differentiation grade, and how does that affect my overall risk category?",
          "Am I considered low-risk, high-risk, or very-high-risk — and what specifically puts me in that category?",
          "Based on my risk category, what margin width or surgical approach are you recommending, and why?",
          "Do I need imaging or a sentinel lymph node biopsy to check my lymph nodes, or is that not indicated for my case?",
        ],
      },
    ],
  },
  {
    slug: "treatment-options",
    hub: "scc",
    pageTitle: "What Are the Main Treatment Approaches for SCC, and What Are the Pros and Cons of Each?",
    pagePath: "/squamous-cell-carcinoma/treatment-options",
    order: 2,
    lastReviewed: "2026-08-26",
    groups: [
      {
        ordered: true,
        questions: [
          "Based on my tumor's size, location, and risk features, which treatment do you recommend, and why over the alternatives?",
          "What is the expected cure rate for this specific approach with my type of tumor?",
          "What will the cosmetic outcome and recovery time realistically look like?",
          "Is a Mohs surgeon available for my case, and would that meaningfully change my odds compared to standard excision?",
          "If surgery isn't an option for me, what would radiation or systemic therapy involve, and what results should I expect?",
        ],
      },
    ],
  },
  {
    slug: "follow-up-care",
    hub: "scc",
    pageTitle: "What Follow-Up Care Is Required After SCC Treatment?",
    pagePath: "/squamous-cell-carcinoma/follow-up-care",
    order: 3,
    lastReviewed: "2026-08-26",
    groups: [
      {
        ordered: true,
        questions: [
          "Is my SCC classified as low-risk or high-risk, and what follow-up schedule does that mean for me?",
          "Will you be checking my lymph nodes at each visit, and what would a concerning finding feel like?",
          "Based on my history, what is my realistic risk of developing another skin cancer?",
          "Would chemoprevention, like nicotinamide, make sense for someone with my risk profile?",
          "What symptoms at or near the treatment site should prompt me to call before my next scheduled visit?",
        ],
      },
    ],
  },
  {
    slug: "recurrence-and-metastasis-risk",
    hub: "scc",
    pageTitle: "What Increases the Risk of SCC Coming Back or Spreading to Lymph Nodes or Other Organs?",
    pagePath: "/squamous-cell-carcinoma/recurrence-and-metastasis-risk",
    order: 4,
    lastReviewed: "2026-08-26",
    groups: [
      {
        ordered: true,
        questions: [
          "Based on my pathology report, is my SCC classified as low-risk, high-risk, or very-high-risk?",
          "Which specific feature — size, depth, differentiation, nerve involvement — is driving that risk category?",
          "Do I need imaging or a lymph node exam based on my risk level, and if so, what will that involve?",
          "Am I more at risk for local recurrence, nodal spread, or both?",
          "How does my immunosuppression status (if applicable) change my monitoring schedule going forward?",
        ],
      },
    ],
  },
  {
    slug: "self-skin-checks",
    hub: "scc",
    pageTitle: "How Do I Perform Regular Skin Checks for SCC and What Changes Should Alert Me?",
    pagePath: "/squamous-cell-carcinoma/self-skin-checks",
    order: 5,
    lastReviewed: "2026-08-26",
    groups: [
      {
        ordered: true,
        questions: [
          "Can you show me what specifically to look for so I recognize \"changed\" for this spot in the future?",
          "Given my history and skin type, how often should I be getting a professional full-body skin exam?",
          "Are there areas of my body I should be paying extra attention to during self-checks?",
          "If I have actinic keratoses, what would tell me one of them is starting to change into something more concerning?",
          "Is this spot something I can keep watching, or should it be biopsied now?",
        ],
      },
    ],
  },
  {
    slug: "high-risk-locations",
    hub: "scc",
    pageTitle: "Are There Special Considerations for SCC in High-Risk Areas (Ears, Lips, Fingers)?",
    pagePath: "/squamous-cell-carcinoma/high-risk-locations",
    order: 6,
    lastReviewed: "2026-08-26",
    groups: [
      {
        ordered: true,
        questions: [
          "Does the location of my SCC put it in a higher-risk category, and why?",
          "Should I be referred to a Mohs surgeon or a multidisciplinary team given where this tumor is?",
          "Is there any imaging needed to check whether it has reached cartilage, bone, or nearby lymph nodes?",
          "What will reconstruction involve, and who will be doing that part of the treatment?",
          "Given the location, how closely will I need to be followed after treatment?",
        ],
      },
    ],
  },
  {
    slug: "prevention",
    hub: "scc",
    pageTitle: "What Prevention Steps and Skin-Care Practices Reduce My Chance of Getting Another SCC?",
    pagePath: "/squamous-cell-carcinoma/prevention",
    order: 7,
    lastReviewed: "2026-08-26",
    groups: [
      {
        ordered: true,
        questions: [
          "Given my history, am I a candidate for nicotinamide or a prescription chemoprevention option?",
          "Do I have actinic keratoses or field damage that should be treated proactively?",
          "How often should I be seen for follow-up skin exams based on my risk?",
          "If I'm on immunosuppressive medication, should my dermatologist and my other specialist be coordinating on my skin cancer risk?",
          "Are there specific areas of my skin, based on where my prior SCC was, that I should be paying closer attention to?",
        ],
      },
    ],
  },
];

// ======================================================================
// MELANOMA
// ======================================================================

const melanoma: HubChecklist[] = [
  {
    slug: "what-to-expect-after-diagnosis",
    hub: "melanoma",
    pageTitle: "What to Expect After a Melanoma Diagnosis",
    pagePath: "/melanoma/what-to-expect-after-diagnosis",
    order: 0,
    lastReviewed: "2026-08-22",
    groups: [
      {
        bullet: "teal",
        questions: [
          "What stage is my melanoma, and how was that determined?",
          "Do I need a sentinel lymph node biopsy?",
          "Will I need additional treatment after surgery?",
          "How often should I have skin exams or imaging?",
          "What steps can I take to reduce my risk of recurrence?",
        ],
      },
    ],
  },
  {
    slug: "pathology-report",
    hub: "melanoma",
    pageTitle: "Understanding Your Melanoma Pathology Report",
    pagePath: "/melanoma/pathology-report",
    order: 1,
    lastReviewed: "2026-08-22",
    groups: [
      {
        ordered: true,
        questions: [
          "What is my Breslow depth, and is there ulceration?",
          "Are my margins clear, or will I need a re-excision?",
          "Do my results suggest I should consider a sentinel lymph node biopsy?",
          "Was any molecular testing done, and did it find any actionable mutations?",
          "Would a second pathology opinion be worthwhile in my case?",
        ],
      },
    ],
  },
  {
    slug: "breslow-depth-explained",
    hub: "melanoma",
    pageTitle: "Breslow Depth Explained: How \"Thickness\" Affects Prognosis",
    pagePath: "/melanoma/breslow-depth-explained",
    order: 2,
    lastReviewed: "2026-08-25",
    groups: [
      {
        ordered: true,
        questions: [
          "What is my exact Breslow depth, and which T category does it place me in?",
          "Is there ulceration, and how does that affect my risk alongside the depth?",
          "What excision margin do you recommend based on my thickness?",
          "Given my depth, is a sentinel lymph node biopsy recommended, optional, or not indicated?",
          "Is my case close enough to a staging cutoff that a second pathology opinion would be worthwhile?",
        ],
      },
    ],
  },
  {
    slug: "sentinel-lymph-node-biopsy",
    hub: "melanoma",
    pageTitle: "Sentinel Lymph Node Biopsy: What It Means for Melanoma",
    pagePath: "/melanoma/sentinel-lymph-node-biopsy",
    order: 3,
    lastReviewed: "2026-08-22",
    groups: [
      {
        bullet: "teal",
        questions: [
          "Do you recommend a sentinel lymph node biopsy for my melanoma? Why or why not?",
          "How will the results affect my treatment plan?",
          "What are the potential risks or side effects of the biopsy?",
          "How long will it take to get the results?",
          "If the biopsy is positive, what are the next steps?",
        ],
      },
    ],
  },
  {
    slug: "melanoma-stage-meaning",
    hub: "melanoma",
    pageTitle: "What Does My Melanoma Stage Mean?",
    pagePath: "/melanoma/melanoma-stage-meaning",
    order: 4,
    lastReviewed: "2026-08-22",
    groups: [
      {
        bullet: "teal",
        questions: [
          "What is my exact melanoma stage, and how was it determined?",
          "Does my pathology report mention Breslow depth or ulceration?",
          "Should I have a sentinel lymph node biopsy?",
          "Are there adjuvant or clinical trial options for my stage?",
          "How often should I return for skin and lymph node checks?",
        ],
      },
    ],
  },
  {
    slug: "melanoma-treatment-options",
    hub: "melanoma",
    pageTitle: "Melanoma Treatment Options",
    pagePath: "/melanoma/melanoma-treatment-options",
    order: 5,
    lastReviewed: "2026-08-22",
    groups: [
      {
        bullet: "teal",
        questions: [
          "What stage is my melanoma, and how does it affect my treatment options?",
          "Should I have a sentinel lymph node biopsy?",
          "Is my tumor being tested for BRAF or other mutations?",
          "Would immunotherapy or targeted therapy benefit me?",
          "What are the possible side effects, and how can they be managed?",
          "Are there any clinical trials I might qualify for?",
          "How often should I return for follow-up visits and skin checks?",
        ],
      },
    ],
  },
  {
    slug: "finding-a-melanoma-specialist",
    hub: "melanoma",
    pageTitle: "How to Find the Right Melanoma Specialist Near You",
    pagePath: "/melanoma/finding-a-melanoma-specialist",
    order: 6,
    lastReviewed: "2026-08-25",
    groups: [
      {
        bullet: "teal",
        questions: [
          "Given my stage, should I be seen at a melanoma-specific center?",
          "Would you recommend a specific surgical oncologist or melanoma center for my case?",
          "Will my case be reviewed by a multidisciplinary team?",
          "Can you send my pathology report and slides if I want a second opinion?",
          "How will care be coordinated between you and any specialist I see?",
        ],
      },
    ],
  },
  {
    slug: "melanoma-clinical-trials",
    hub: "melanoma",
    pageTitle: "Melanoma Clinical Trials: Should You Consider One?",
    pagePath: "/melanoma/melanoma-clinical-trials",
    order: 7,
    lastReviewed: "2026-08-25",
    groups: [
      {
        bullet: "teal",
        questions: [
          "Is there a clinical trial that fits my specific diagnosis and stage?",
          "What phase is this trial in, and what does that mean for how well the treatment's safety and effectiveness are already understood?",
          "What are the known and possible side effects, and how will they be monitored?",
          "Will I still receive standard treatment, or does the trial replace it?",
          "What extra tests, visits, or time commitments does participation require compared with standard care?",
          "What happens if the trial treatment doesn't work for me, or if I want to stop participating?",
          "Are travel, lodging, or costs of trial-related care covered, and what will my insurance still need to pay for?",
        ],
      },
    ],
  },
];

// ======================================================================
// ACTINIC KERATOSIS
// ======================================================================

const ak: HubChecklist[] = [
  {
    slug: "what-is-ak-vs-skin-cancer",
    hub: "actinic-keratosis",
    pageTitle: "What Is an Actinic Keratosis, and How Is It Different From Skin Cancer?",
    pagePath: "/actinic-keratosis/what-is-ak-vs-skin-cancer",
    order: 0,
    lastReviewed: "2026-08-24",
    groups: [
      {
        ordered: true,
        questions: [
          "Does this particular AK have any features that concern you, or is it low-risk to watch?",
          "Would a biopsy help clarify whether this spot has started to invade, or is treatment reasonable without one?",
          "How many AKs do I have, and does that change your recommended treatment approach?",
          "What changes in this spot should prompt me to call you before my next visit?",
          "How often should I have my skin checked given my history of AKs?",
        ],
      },
    ],
  },
  {
    slug: "treat-now-vs-watch",
    hub: "actinic-keratosis",
    pageTitle: "How Do I Know Whether an AK Needs Treatment Now or Can Be Watched Safely?",
    pagePath: "/actinic-keratosis/treat-now-vs-watch",
    order: 1,
    lastReviewed: "2026-08-25",
    groups: [
      {
        ordered: true,
        questions: [
          "Does this specific AK have any features — thickness, tenderness, growth — that make you want to treat it now rather than watch it?",
          "Given my health history (immune status, prior skin cancers, other conditions), does that change how aggressively you'd approach a borderline spot?",
          "If we choose to watch this lesion, what specifically should prompt me to call you before the next visit?",
          "How does the location of this AK — ear, lip, scalp versus elsewhere — factor into your recommendation?",
          "If I have many AKs, does that change whether individual lesions get watched versus treated as a group?",
        ],
      },
    ],
  },
  {
    slug: "treatment-options",
    hub: "actinic-keratosis",
    pageTitle: "What Are the Treatment Options for Actinic Keratoses, and How Do I Pick the Right One?",
    pagePath: "/actinic-keratosis/treatment-options",
    order: 2,
    lastReviewed: "2026-08-25",
    groups: [
      {
        ordered: true,
        questions: [
          "Given the number and location of my AKs, would you recommend lesion-directed or field therapy?",
          "What kind of reaction should I expect from this specific treatment, and how long should it last?",
          "Are there sun-protection or activity restrictions I need to follow during treatment?",
          "How will we know if the treatment worked, and when should I come back to check?",
          "If this treatment doesn't fully clear things, what's the next option?",
        ],
      },
    ],
  },
  {
    slug: "progression-risk-untreated",
    hub: "actinic-keratosis",
    pageTitle: "What Are the Risks of Leaving an Actinic Keratosis Untreated?",
    pagePath: "/actinic-keratosis/progression-risk-untreated",
    order: 3,
    lastReviewed: "2026-08-25",
    groups: [
      {
        ordered: true,
        questions: [
          "Given my overall number of AKs and sun-damage history, am I in a higher-risk category, or is my risk closer to average?",
          "Am I on any medication — for a transplant or another condition — that suppresses my immune system and raises my skin cancer risk?",
          "Do any of my current AKs sit in a higher-risk location, like my ears, lips, or scalp?",
          "Is there a lesion that keeps coming back or has never fully cleared that we should address differently?",
          "If I choose not to treat a particular spot now, what would make you recommend revisiting that decision?",
        ],
      },
    ],
  },
  {
    slug: "monitoring-schedule",
    hub: "actinic-keratosis",
    pageTitle: "How Often Should I Get Skin Exams When I Have AKs?",
    pagePath: "/actinic-keratosis/monitoring-schedule",
    order: 4,
    lastReviewed: "2026-08-25",
    groups: [
      {
        ordered: true,
        questions: [
          "Based on my history, how often should I be coming in for a full skin exam?",
          "Do any of my risk factors — prior skin cancer, immune status, sun exposure history — push me toward more frequent visits?",
          "Is there anything specific about my skin you'd like me to keep an eye on between now and my next visit?",
          "What changes should prompt me to call before my scheduled appointment?",
          "Would keeping a photo log of my AKs be helpful for you to track at future visits?",
        ],
      },
    ],
  },
  {
    slug: "prevention-and-sun-protection",
    hub: "actinic-keratosis",
    pageTitle: "What Skin-Care and Sun-Protection Habits Help Reduce New AKs?",
    pagePath: "/actinic-keratosis/prevention-and-sun-protection",
    order: 5,
    lastReviewed: "2026-08-25",
    groups: [
      {
        ordered: true,
        questions: [
          "Given how many AKs I've had, am I a reasonable candidate for oral nicotinamide?",
          "Are there specific areas of my skin where you'd recommend I be especially strict about sunscreen or clothing?",
          "Is a prescription-strength sunscreen or a specific formulation better suited to my skin type?",
          "Should I be doing any field-directed treatment alongside these prevention habits, or is prevention enough on its own right now?",
          "How will we know if these prevention steps are working, versus if I still need more active treatment?",
        ],
      },
    ],
  },
  {
    slug: "field-therapy-multiple-aks",
    hub: "actinic-keratosis",
    pageTitle: "What Do I Do When I Have Many AKs? Does the Approach Differ?",
    pagePath: "/actinic-keratosis/field-therapy-multiple-aks",
    order: 6,
    lastReviewed: "2026-08-25",
    groups: [
      {
        ordered: true,
        questions: [
          "Given how many AKs I have and where they are, would you recommend field therapy, spot treatment, or a combination?",
          "Which field agent fits my skin type, schedule, and tolerance for irritation best?",
          "What should the reaction look like during treatment, and what would be a sign to call you instead of waiting it out?",
          "If this course doesn't clear things well enough, what's the next option?",
          "How soon after finishing treatment will we know whether it worked, and when should I come back to be re-checked?",
        ],
      },
    ],
  },
  {
    slug: "talking-to-your-doctor",
    hub: "actinic-keratosis",
    pageTitle: "How Do I Talk to My Doctor About Managing AKs Over Time and Monitoring Changes?",
    pagePath: "/actinic-keratosis/talking-to-your-doctor",
    order: 7,
    lastReviewed: "2026-08-25",
    groups: [
      {
        note: "If you only bring five questions to your next visit, make them these:",
        ordered: true,
        questions: [
          "Given my current number and history of AKs, how often should I be seen?",
          "Is there a standing, long-term management plan for me, rather than treating each new spot as a separate event?",
          "What specific changes in a spot should prompt me to call before my next scheduled visit?",
          "Why is this treatment the right choice for this spot, and what are the alternatives?",
          "What sun-protection or lifestyle changes would most reduce how many new AKs I develop?",
        ],
      },
    ],
  },
];

// ======================================================================
// PHOTODYNAMIC THERAPY FOR ACTINIC KERATOSIS
// ======================================================================

const akPdt: HubChecklist[] = [
  {
    slug: "what-is-pdt-and-how-it-works",
    hub: "ak-pdt",
    pageTitle: "What Is Photodynamic Therapy and How Does It Work?",
    pagePath: "/actinic-keratosis/pdt/what-is-pdt-and-how-it-works",
    order: 0,
    lastReviewed: "2026-09-04",
    groups: [
      {
        ordered: true,
        questions: [
          "Which photosensitizer will you use, and how long will it need to incubate before the light exposure?",
          "Will you use a lamp-based light source or daylight PDT, and why is that the right choice for my skin?",
          "How will you confirm the treated area has absorbed enough of the solution before activating it with light?",
          "How much of my sun-damaged skin — beyond the AKs you can see — will be included in the treated field?",
          "What should I expect to feel during the light exposure itself?",
        ],
      },
    ],
  },
  {
    slug: "why-choose-pdt",
    hub: "ak-pdt",
    pageTitle: "Why Might My Dermatologist Recommend PDT Over Other AK Treatments?",
    pagePath: "/actinic-keratosis/pdt/why-choose-pdt",
    order: 1,
    lastReviewed: "2026-09-04",
    groups: [
      {
        ordered: true,
        questions: [
          "Given the pattern of my sun damage, would you expect PDT, cryotherapy, or a topical cream to work best for me?",
          "How does my immune status factor into your recommendation?",
          "Would combining a short course of topical treatment with PDT make sense in my case?",
          "What cosmetic outcome should I expect from each option you're considering?",
          "If we start with one approach and it doesn't clear enough of the AKs, what's the next step?",
        ],
      },
    ],
  },
  {
    slug: "am-i-a-candidate-for-pdt",
    hub: "ak-pdt",
    pageTitle: "Am I a Good Candidate for Photodynamic Therapy?",
    pagePath: "/actinic-keratosis/pdt/am-i-a-candidate-for-pdt",
    order: 2,
    lastReviewed: "2026-09-04",
    groups: [
      {
        ordered: true,
        questions: [
          "Based on how many AKs I have and where they are, would I benefit more from PDT or a spot treatment?",
          "Are any of my current AKs too thick for PDT to work well, and if so, what do we do first?",
          "Given what I've already tried, why are you recommending PDT now?",
          "Is there anything in my health history or current medications that would make PDT unsafe for me?",
          "Can I realistically avoid direct sunlight for the recommended period after treatment?",
        ],
      },
    ],
  },
  {
    slug: "what-happens-during-a-pdt-session",
    hub: "ak-pdt",
    pageTitle: "What Happens During a PDT Treatment Session, Step by Step?",
    pagePath: "/actinic-keratosis/pdt/what-happens-during-a-pdt-session",
    order: 3,
    lastReviewed: "2026-09-04",
    groups: [
      {
        ordered: true,
        questions: [
          "How long will my incubation period be, and will the area be covered during it?",
          "What light source will be used, and roughly how long does the exposure step take?",
          "What can be done to manage discomfort during the light exposure?",
          "What should I plan for immediately afterward — do I need someone to drive me, or can I go straight back to normal activities?",
          "What should my skin look like in the hours right after treatment, and what would be a reason to call you?",
        ],
      },
    ],
  },
  {
    slug: "preparing-for-your-pdt-appointment",
    hub: "ak-pdt",
    pageTitle: "How Should I Prepare for My PDT Appointment?",
    pagePath: "/actinic-keratosis/pdt/preparing-for-your-pdt-appointment",
    order: 4,
    lastReviewed: "2026-09-04",
    groups: [
      {
        ordered: true,
        questions: [
          "Are any of my current medications or supplements likely to affect how my skin reacts to PDT?",
          "Should I stop using any topical products before treatment, and if so, how many days beforehand?",
          "How long will the appointment take, and how strict does my sun avoidance need to be on the trip home?",
          "What should I bring to cover the treated area afterward?",
          "Will I need someone to drive me, or is that just a precaution?",
          "What can I expect to feel during the light-exposure portion of treatment?",
        ],
      },
    ],
  },
  {
    slug: "pdt-side-effects-and-downtime",
    hub: "ak-pdt",
    pageTitle: "What Side Effects and Downtime Should I Expect After PDT?",
    pagePath: "/actinic-keratosis/pdt/pdt-side-effects-and-downtime",
    order: 5,
    lastReviewed: "2026-09-04",
    groups: [
      {
        ordered: true,
        questions: [
          "How much pain should I expect during my treatment, and what can be done to reduce it?",
          "How long should I expect redness, swelling, and crusting to last for my specific treatment area?",
          "Exactly how many days do I need to avoid direct sunlight afterward?",
          "What symptoms should prompt me to call you rather than wait it out?",
          "Is the reaction I'm having typical, or should I come in to be seen?",
        ],
      },
    ],
  },
  {
    slug: "pdt-aftercare-and-recovery",
    hub: "ak-pdt",
    pageTitle: "How Do I Care for My Skin After PDT?",
    pagePath: "/actinic-keratosis/pdt/pdt-aftercare-and-recovery",
    order: 6,
    lastReviewed: "2026-09-04",
    groups: [
      {
        ordered: true,
        questions: [
          "Exactly how long should I avoid sunlight and bright indoor light after my treatment?",
          "What products should I use to clean and moisturize the treated area?",
          "What level of redness, swelling, or crusting is normal for me, and what would be too much?",
          "Is there anything I can take or apply for discomfort?",
          "When can I resume my normal skincare routine and wear makeup again?",
          "What symptoms should prompt me to call your office right away?",
        ],
      },
    ],
  },
  {
    slug: "how-many-pdt-sessions-and-results",
    hub: "ak-pdt",
    pageTitle: "How Many PDT Sessions Will I Need, and What Results Can I Expect?",
    pagePath: "/actinic-keratosis/pdt/how-many-pdt-sessions-and-results",
    order: 7,
    lastReviewed: "2026-09-04",
    groups: [
      {
        ordered: true,
        questions: [
          "Based on my lesions, how many PDT sessions do you expect I'll need?",
          "When will you check whether the treatment worked, and what will that visit involve?",
          "What clearance rate is realistic for someone with my skin and lesion type?",
          "If some lesions don't clear, what would be the next step?",
          "How long do you expect these results to last for me?",
          "How often should I have routine skin checks going forward?",
        ],
      },
    ],
  },
  {
    slug: "managing-discomfort-during-pdt",
    hub: "ak-pdt",
    pageTitle: "How Is Discomfort During PDT Managed?",
    pagePath: "/actinic-keratosis/pdt/managing-discomfort-during-pdt",
    order: 8,
    lastReviewed: "2026-09-04",
    groups: [
      {
        bullet: "teal",
        questions: [
          "What cooling measures will be used during my session, and can I ask for more if I need it?",
          "Is a topical numbing cream, injected local anesthetic, or nerve block available at this practice?",
          "Should I take an over-the-counter pain reliever before my appointment, and if so, which one?",
          "Am I a candidate for daylight PDT instead of a conventional lamp-based session?",
          "What should I do if the discomfort becomes hard to tolerate partway through treatment?",
        ],
      },
    ],
  },
  {
    slug: "pdt-safety-and-who-should-avoid-it",
    hub: "ak-pdt",
    pageTitle: "Is PDT Safe, and Who Should Avoid It?",
    pagePath: "/actinic-keratosis/pdt/pdt-safety-and-who-should-avoid-it",
    order: 9,
    lastReviewed: "2026-09-04",
    groups: [
      {
        bullet: "teal",
        questions: [
          "Do any of my current medications or supplements increase my sensitivity to light?",
          "Should I be screened for porphyria or another photosensitivity disorder before treatment?",
          "Given my lupus (or other photosensitive condition), is PDT still a reasonable option for me?",
          "What should I realistically expect to be able to do — and avoid — in the 24–48 hours after treatment?",
          "What would a severe reaction look like, and when should I call the office instead of waiting it out?",
        ],
      },
    ],
  },
];

// ======================================================================
// ATYPICAL MOLES (DYSPLASTIC NEVI)
// ======================================================================

const atypicalNevi: HubChecklist[] = [
  {
    slug: "what-makes-a-mole-atypical",
    hub: "atypical-nevi",
    pageTitle: "What Makes a Mole \"Atypical\" — and How It Differs From a Normal Mole",
    pagePath: "/atypical-nevi/what-makes-a-mole-atypical",
    order: 0,
    lastReviewed: "2026-08-27",
    groups: [
      {
        ordered: true,
        questions: [
          "Which of my moles do you consider atypical, and how many are there?",
          "Is any one of them concerning enough to biopsy now, or are we monitoring?",
          "Should we take baseline photos so we can compare at my next visit?",
          "Given my moles, how often should I be seen, and should I do monthly self-exams?",
          "Does my family history change how closely you want to watch these?",
        ],
      },
    ],
  },
  {
    slug: "warning-signs-of-melanoma-change",
    hub: "atypical-nevi",
    pageTitle: "Warning Signs an Atypical Mole May Be Turning Into Melanoma",
    pagePath: "/atypical-nevi/warning-signs-of-melanoma-change",
    order: 1,
    lastReviewed: "2026-08-27",
    groups: [
      {
        ordered: true,
        questions: [
          "Which of my moles should I photograph and watch most closely?",
          "This mole has changed — do you want to biopsy it or monitor it?",
          "What specific changes should make me call you before my next scheduled visit?",
          "Can you show me which of my moles is the \"ugly duckling,\" if any?",
          "How do I check areas I can't see well, like my scalp, back, and soles?",
        ],
      },
    ],
  },
  {
    slug: "dermatologist-evaluation-dermoscopy",
    hub: "atypical-nevi",
    pageTitle: "What a Dermatologist Looks For When Examining Atypical Moles",
    pagePath: "/atypical-nevi/dermatologist-evaluation-dermoscopy",
    order: 2,
    lastReviewed: "2026-08-27",
    groups: [
      {
        ordered: true,
        questions: [
          "Do you use dermoscopy, and did any of my moles look concerning under it?",
          "Would I benefit from baseline total-body photography or digital mole mapping?",
          "Which specific moles are you planning to re-check next time?",
          "Are we biopsying anything today, or monitoring — and why?",
          "How thoroughly were my scalp, soles, and nails checked?",
        ],
      },
    ],
  },
  {
    slug: "when-to-biopsy-or-remove",
    hub: "atypical-nevi",
    pageTitle: "When Does an Atypical Mole Need to Be Biopsied or Removed?",
    pagePath: "/atypical-nevi/when-to-biopsy-or-remove",
    order: 3,
    lastReviewed: "2026-08-27",
    groups: [
      {
        ordered: true,
        questions: [
          "Why are we biopsying this mole — what did you see that concerned you?",
          "Which technique will you use, and will the whole mole be removed?",
          "When will results be back, and how will I hear them?",
          "If it comes back as a dysplastic nevus, what grade and margin would prompt more surgery?",
          "For the moles we're not removing, what's the monitoring plan?",
        ],
      },
    ],
  },
  {
    slug: "surveillance-schedule",
    hub: "atypical-nevi",
    pageTitle: "How Often Should You Get Your Skin Checked If You Have Atypical Moles?",
    pagePath: "/atypical-nevi/surveillance-schedule",
    order: 4,
    lastReviewed: "2026-08-27",
    groups: [
      {
        ordered: true,
        questions: [
          "Given my moles and history, how often do you want to see me?",
          "What puts me in that risk category, and could it change over time?",
          "Should I have baseline total-body photography?",
          "How should I do my monthly self-exam, and which moles matter most?",
          "What specifically should make me call before my next scheduled visit?",
        ],
      },
    ],
  },
  {
    slug: "melanoma-risk-association",
    hub: "atypical-nevi",
    pageTitle: "Does Having Atypical Moles Mean You're at Higher Risk for Melanoma?",
    pagePath: "/atypical-nevi/melanoma-risk-association",
    order: 5,
    lastReviewed: "2026-08-27",
    groups: [
      {
        ordered: true,
        questions: [
          "Based on my moles and history, roughly how elevated is my melanoma risk?",
          "Do I have enough atypical moles or family history to consider genetic counseling?",
          "How does my risk change what we do — exam frequency, photography, sun advice?",
          "Which of my risk factors can I actually influence?",
          "What's my plan if a suspicious mole shows up between visits?",
        ],
      },
    ],
  },
  {
    slug: "tracking-changes-over-time",
    hub: "atypical-nevi",
    pageTitle: "The Best Way to Track Changes in Your Moles Over Time",
    pagePath: "/atypical-nevi/tracking-changes-over-time",
    order: 6,
    lastReviewed: "2026-08-27",
    groups: [
      {
        ordered: true,
        questions: [
          "Which specific moles do you want me to photograph and watch closely?",
          "How often should I redo my baseline photos?",
          "Do you offer total-body photography or digital dermoscopy for my situation?",
          "What's the best way to send you a photo if I spot a change between visits?",
          "Can you mark my watched moles on a body map I can take home?",
        ],
      },
    ],
  },
  {
    slug: "prevention-and-sun-protection",
    hub: "atypical-nevi",
    pageTitle: "How to Protect Your Skin and Prevent New Atypical Moles",
    pagePath: "/atypical-nevi/prevention-and-sun-protection",
    order: 7,
    lastReviewed: "2026-08-27",
    groups: [
      {
        ordered: true,
        questions: [
          "Given my skin type and moles, how aggressive should my sun protection be?",
          "Which sunscreen type and SPF do you recommend for daily use?",
          "Should my children be screened or counseled given our family's mole pattern?",
          "Should I have my vitamin D level checked?",
          "Beyond sun protection, is there anything else that would lower my risk?",
        ],
      },
    ],
  },
];

// ======================================================================
// MERKEL CELL CARCINOMA
// ======================================================================

const merkelCellCarcinoma: HubChecklist[] = [
  {
    slug: "diagnosis-and-staging",
    hub: "merkel-cell-carcinoma",
    pageTitle: "How Is Merkel Cell Carcinoma Diagnosed and Staged?",
    pagePath: "/merkel-cell-carcinoma/diagnosis-and-staging",
    order: 0,
    lastReviewed: "2026-09-06",
    groups: [
      {
        ordered: true,
        questions: [
          "What did my biopsy and immunostains show, and was the tumor tested for the Merkel cell polyomavirus?",
          "Will I have a sentinel lymph node biopsy, and when — before, during, or after removing the primary tumor?",
          "What imaging will I have for staging, and will you use PET/CT or CT?",
          "What is my clinical stage now, and could it change after surgery and node results?",
          "Will my case be reviewed by a multidisciplinary team experienced with MCC?",
          "Should I get a second opinion on the pathology at a center that sees MCC often?",
        ],
      },
    ],
  },
  {
    slug: "aeiou-warning-signs",
    hub: "merkel-cell-carcinoma",
    pageTitle: "What the AEIOU Warning Signs of Merkel Cell Carcinoma Mean",
    pagePath: "/merkel-cell-carcinoma/aeiou-warning-signs",
    order: 1,
    lastReviewed: "2026-09-06",
    groups: [
      {
        ordered: true,
        questions: [
          "This bump has grown over the past few weeks — should it be biopsied now rather than watched?",
          "How many AEIOU features do you think this lesion has?",
          "I am immunosuppressed — does that change how quickly this needs to be evaluated?",
          "If the biopsy is not MCC, what else could this be, and how will we follow it?",
          "If it is MCC, who will coordinate my staging work-up and how soon can that start?",
        ],
      },
    ],
  },
  {
    slug: "merkel-cell-polyomavirus-and-immune-suppression",
    hub: "merkel-cell-carcinoma",
    pageTitle: "Merkel Cell Polyomavirus and Immune Suppression: Why MCC Develops",
    pagePath: "/merkel-cell-carcinoma/merkel-cell-polyomavirus-and-immune-suppression",
    order: 2,
    lastReviewed: "2026-09-06",
    groups: [
      {
        ordered: true,
        questions: [
          "Was my tumor tested for the Merkel cell polyomavirus, and what was the result?",
          "If my tumor is virus-positive, can I use the blood antibody test to help monitor for recurrence?",
          "I take immune-suppressing medication — can it be safely reduced or adjusted, and who decides that?",
          "Does my immune status change my recommended follow-up schedule or imaging?",
          "If I need immunotherapy and I am a transplant recipient, how will you balance that against rejection risk?",
        ],
      },
    ],
  },
  {
    slug: "treatment-options",
    hub: "merkel-cell-carcinoma",
    pageTitle: "Merkel Cell Carcinoma Treatment Options: Surgery, Radiation, and Immunotherapy",
    pagePath: "/merkel-cell-carcinoma/treatment-options",
    order: 3,
    lastReviewed: "2026-09-06",
    groups: [
      {
        ordered: true,
        questions: [
          "What is my stage, and which treatments does that call for — surgery, radiation, immunotherapy, or a combination?",
          "Will I need radiation after surgery? What features of my tumor drive that recommendation?",
          "In what order will treatments happen, and how many weeks apart?",
          "Is my case being reviewed by a multidisciplinary tumor board?",
          "Is there a clinical trial I should consider now, including immunotherapy before surgery?",
          "What are the expected side effects of each part of my plan, and how will they be managed?",
        ],
      },
    ],
  },
  {
    slug: "sentinel-lymph-node-biopsy",
    hub: "merkel-cell-carcinoma",
    pageTitle: "Why Sentinel Lymph Node Biopsy Is Routine for Merkel Cell Carcinoma",
    pagePath: "/merkel-cell-carcinoma/sentinel-lymph-node-biopsy",
    order: 4,
    lastReviewed: "2026-09-06",
    groups: [
      {
        ordered: true,
        questions: [
          "Will my sentinel lymph node biopsy be done at the same time as the wide excision?",
          "Who reads the node pathology, and are MCC-specific immunostains used?",
          "If the node is positive, will you recommend radiation, surgery to remove the nodes, or both?",
          "What are the risks of the procedure for me — lymphedema, numbness, seroma, wound issues?",
          "If a biopsy is not recommended in my case, what is the reason, and how will you monitor the nodes instead?",
        ],
      },
    ],
  },
  {
    slug: "follow-up-and-recurrence-monitoring",
    hub: "merkel-cell-carcinoma",
    pageTitle: "Follow-Up Care and Monitoring for Recurrence After Merkel Cell Carcinoma",
    pagePath: "/merkel-cell-carcinoma/follow-up-and-recurrence-monitoring",
    order: 5,
    lastReviewed: "2026-09-06",
    groups: [
      {
        ordered: true,
        questions: [
          "Given my stage, how often should I be seen, and for how many years?",
          "Will I have scheduled imaging? Which scans, how often, and for how long?",
          "Was my tumor virus-positive, and can I use the antibody blood test to help monitor for recurrence?",
          "Which clinician \"owns\" my surveillance — dermatology, surgical oncology, or medical oncology?",
          "Exactly what should I check at home, and how do I reach you quickly if I find something?",
          "Does my immune status change any of the above?",
        ],
      },
    ],
  },
  {
    slug: "advanced-metastatic-mcc-immunotherapy",
    hub: "merkel-cell-carcinoma",
    pageTitle: "Advanced or Metastatic Merkel Cell Carcinoma and Checkpoint Immunotherapy",
    pagePath: "/merkel-cell-carcinoma/advanced-metastatic-mcc-immunotherapy",
    order: 6,
    lastReviewed: "2026-09-06",
    groups: [
      {
        ordered: true,
        questions: [
          "Is checkpoint immunotherapy the right first treatment for me, and which drug do you recommend?",
          "How will we know if it is working, and how often will I have scans?",
          "What immune-related side effects should I watch for, and who do I call, day or night?",
          "If it works, how long do I stay on it? If it stops working, what is next?",
          "Do I have an autoimmune condition or a transplant that changes this decision?",
          "Is there a clinical trial I should consider now?",
        ],
      },
    ],
  },
];

// ======================================================================

export const hubChecklists: HubChecklist[] = [
  ...bcc,
  ...scc,
  ...melanoma,
  ...ak,
  ...akPdt,
  ...atypicalNevi,
  ...merkelCellCarcinoma,
];

// Lookups ----------------------------------------------------------------

export function getHubChecklistMeta(hubId: string): HubChecklistMeta {
  const meta = hubChecklistHubs.find((h) => h.id === hubId);
  if (!meta) throw new Error(`Unknown hub: ${hubId}`);
  return meta;
}

export function getHubChecklistsFor(hubId: string): HubChecklist[] {
  return hubChecklists
    .filter((c) => c.hub === hubId)
    .sort((a, b) => a.order - b.order);
}

/** Look up a checklist by its article route. */
export function getHubChecklistByPath(pagePath: string): HubChecklist | undefined {
  return hubChecklists.find((c) => c.pagePath === pagePath);
}

// PDF asset paths (also the public URLs the download links point at) --------

export function hubChecklistPdfPath(c: HubChecklist): string {
  return `/downloads/${c.hub}/${c.slug}-checklist.pdf`;
}

export function hubBundlePdfPath(hubId: string): string {
  return `/downloads/${hubId}/complete-${hubId}-discussion-guide.pdf`;
}

// Validation -----------------------------------------------------------

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Throws if any checklist is missing content or reviewer metadata the PDF
 * footer needs. Called by `integrations/checklist-pdfs.mjs`, so a violation
 * fails the build — matching the reviewer-byline policy in CLAUDE.md.
 */
export function assertHubChecklistsValid(): void {
  const problems: string[] = [];

  for (const c of hubChecklists) {
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

    if (!c.groups.length) problems.push(`${id}: has no question groups`);
    c.groups.forEach((g, i) => {
      if (!g.questions.length) {
        problems.push(`${id}: group ${i} has no questions`);
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
      `hubChecklists.ts validation failed:\n  - ${problems.join('\n  - ')}`,
    );
  }
}
