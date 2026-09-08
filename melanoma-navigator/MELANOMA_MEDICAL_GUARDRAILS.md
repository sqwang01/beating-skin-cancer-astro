# Beating Melanoma Navigator — Medical Guardrails

## Purpose
These rules govern all patient-facing logic and copy in the Melanoma Navigator.

The Navigator is an educational and organizational tool. It is not a substitute for individualized medical evaluation or treatment planning.

---

# 1. Core Rule

The Navigator may:

- explain concepts
- organize information
- help patients find questions to ask
- help users track which steps they have addressed
- route users to educational resources

The Navigator must not independently:

- diagnose melanoma
- confirm that a pathology report is correct
- assign a definitive melanoma stage
- prescribe treatment
- tell a patient that a treatment is unnecessary or required based solely on user-entered data
- predict an individual's survival
- tell a patient that melanoma has or has not recurred

---

# 2. Medical Freshness Rule

The source book was published in 2024 and includes medical guidance and data drawn from earlier guideline/data eras.

Therefore, the following content categories must be checked against current authoritative guidance before they are made executable or displayed as current recommendations:

- sentinel lymph node biopsy thresholds
- surgical margin recommendations
- imaging recommendations
- systemic treatment options
- adjuvant treatment recommendations
- BRAF/other molecular testing recommendations
- follow-up schedules
- survival statistics
- drug indications and dosing
- gene-expression or molecular assay recommendations

Mark such content in code/content as:

`MEDICAL_CONTENT_REQUIRES_CURRENT_REVIEW`

until approved.

---

# 3. Pathology Report Module

The Navigator can help users locate terms such as:

- melanoma in situ
- invasive melanoma
- Breslow thickness
- ulceration
- mitotic rate
- lymphovascular invasion
- regression
- neurotropism
- margin status

It may define these terms in plain language.

It must not certify that a report is accurate or complete.

If the user cannot find a diagnosis, finds conflicting information, or reports uncertainty, route to:

**Please discuss the report with the clinician who performed the biopsy or a clinician experienced in melanoma.**

Second-opinion pathology should be framed as something to discuss with the treating clinician, not as an automatic requirement.

---

# 4. Staging

The MVP should treat stage as **clinician-provided information**.

Do not implement an automated stage calculator in Phase 1 unless:

1. the rule set is separately specified,
2. it is updated to the current staging system,
3. it has been medically reviewed,
4. uncertainty states are handled explicitly.

If users enter pathology values, those values can be used to teach what the terms mean, but should not automatically produce a definitive stage in the MVP.

**Update — 2026-09-07 (Dr. Steven Q. Wang).** The four conditions above are now
met for a **narrow** slice, so a computed estimate is live for it:

1. The rule set is specified — `T_CATEGORY_RULESET` + `STAGE_GROUPING_REFERENCE`
   in `src/data/navigator/medicalRules.ts`.
2. It is reconciled to the current staging system — **AJCC 8th edition**.
3. It was medically reviewed 2026-09-07 by Steven Q. Wang, MD (board-certified
   dermatologist, Editor-in-Chief): both sets `status: 'approved'`,
   `STAGING_RULES_ENABLED = true`.
4. Uncertainty is explicit — `estimateStageGroup()` returns `insufficient`
   (no Breslow, or unknown ulceration where it decides the sub-letter),
   `provisional` (sentinel node not yet negative), or defers to the coarse
   worded band for Stage 0 / III / IV. The result screen always labels it an
   educational estimate the treating physician confirms, and never overwrites a
   doctor-reported stage.
   - **Update 2026-09-08 (Dr. Wang):** the ulceration question no longer offers
     an "I cannot find it" option (Step 1 `c2`, Step 2 `k0c`, and the Step 2 `k0`
     / Step 3 `t0` recap edits) —
     ulceration is a mandatory synoptic-report element, so an unmentioned
     ulceration is recorded as "Absent / not identified." An entered case
     therefore always resolves a T category once a Breslow value is present, and
     the `insufficient` result now signals only a missing Breslow. The
     ulceration-`unknown` code path is kept as a defensive default.

Scope is deliberately **Stage I and II only** (sub-groups IA–IIC for a
node-negative / node-not-needed case). A positive node, distant spread, the
III/IV sub-groups, and clinical-vs-pathologic all remain clinician-provided.
Roll back (`STAGING_RULES_ENABLED = false`, `meta.status: 'draft'`) if a newer
AJCC edition supersedes the 8th or the review lapses.

---

# 5. Treatment

Treatment content must be framed as education for a conversation with the patient's clinician.

Preferred language:

- `Treatment options your care team may discuss include...`
- `Ask your doctor whether this applies to your melanoma.`
- `Your treatment plan depends on factors that cannot be fully assessed by this Navigator.`

Avoid:

- `You need...`
- `You do not need...`
- `The correct treatment is...`

unless the statement is generic safety guidance and has been medically approved.

---

# 6. Prognosis

Population survival statistics should never be presented as an individual prediction.

If survival data are included:

- identify the source and data era
- explain that treatments and outcomes change over time
- explain that statistics describe groups rather than a particular individual
- allow the patient to skip prognosis content

Never generate a personalized survival probability from user-entered information in the MVP.

---

# 7. Symptoms / Possible Recurrence

If the user reports a new, changing, painful, itching, bleeding, or otherwise concerning lesion, the Navigator should encourage clinical evaluation rather than attempting image-free diagnosis.

If the site later accepts lesion photos, the product must still avoid presenting AI output as a definitive melanoma diagnosis.

For severe or rapidly worsening symptoms potentially requiring urgent evaluation, direct the user to appropriate urgent medical care.

---

# 8. Self-Examination

Teach self-examination as a familiarity and early-recognition habit.

Make clear:

**The purpose is not to teach patients to diagnose melanoma themselves.**

The user should be encouraged to show concerning changes to a qualified clinician.

---

# 9. Genetics

The Navigator may explain that personal history, family history, multiple melanomas, age at diagnosis, and other cancers can influence whether a clinician considers genetic counseling.

It should not:

- diagnose hereditary melanoma
- order/recommend a specific genetic panel automatically
- interpret a pathogenic variant without qualified clinical context

Preferred CTA:

`Ask whether genetic counseling is appropriate for you or your family.`

---

# 10. Privacy

MVP design principle: collect as little health information as possible.

Do not require:

- account creation
- email
- date of birth
- name
- pathology-document upload

for basic navigation.

If pathology upload or persistent health profiles are added later, perform a separate privacy/security/legal review before implementation.

Do not send health-specific values or free text to standard web analytics.

---

# 11. Content Maintenance

Separate durable journey content from time-sensitive clinical content.

## Durable

- Mad Rush / Marathon framework
- obtaining records
- preparing questions
- understanding terminology
- self-exam habit
- UV protection principles
- finding expert care

## Time-sensitive

- guideline thresholds
- drug approvals
- staging details
- survival percentages
- imaging schedules
- follow-up intervals
- emerging technologies

Time-sensitive content should live in easily updateable content modules with:

- `last_medical_reviewed`
- `reviewed_by`
- `source_guideline`
- `source_date`

---

# 12. Required Footer / Contextual Notice

Use a concise notice, not a frightening wall of legal text:

**This Navigator provides educational information and helps you organize questions and next steps. It does not diagnose melanoma or replace the recommendations of your treating clinicians.**

For treatment, staging, prognosis, and symptom modules, show a contextual reminder where appropriate.

---

# 13. Claude Code Safety Instruction

Claude Code must follow this rule:

> Never infer a new clinical recommendation from the source book. If a requested UI behavior requires medical decision logic that has not been explicitly reviewed and documented, implement the interface with a `NEEDS_MEDICAL_REVIEW` placeholder instead of inventing the rule.
