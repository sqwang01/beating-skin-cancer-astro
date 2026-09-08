# Mad Rush Step 1 — Deep Build Specification
## Understand the Diagnostic Information in the Pathology Report

**Project:** Beating Skin Cancer — Melanoma Navigator  
**Source framework:** *Beating Melanoma*, Second Edition  
**Role of this module:** Turn Step 1 of the book into a guided, task-based patient experience.

---

# 1. Goal of Step 1

The patient should leave Step 1 with:

- a copy of the pathology report, or a clear action plan to obtain it
- confirmation that the report appears to match the patient and biopsy site
- a basic understanding of whether the diagnosis is melanoma in situ / lentigo maligna or invasive melanoma
- the key pathology fields identified, when applicable
- awareness of who made the pathologic diagnosis
- awareness that pathology interpretation can sometimes be uncertain
- a clear pathway for discussing a second pathology opinion with the treating physician when appropriate
- a structured summary that can be carried forward into Step 2

Step 1 is **not** responsible for independently staging the melanoma or recommending treatment.

---

# 2. Core UX Principle

Do not present Step 1 as a long article.

Present it as a sequence of small tasks:

1. Get the report
2. Confirm it is the correct report
3. Find the diagnosis
4. Determine whether it says in situ / lentigo maligna or invasive melanoma
5. If invasive, find the important pathology fields
6. Identify who interpreted the specimen
7. Assess whether the report or diagnosis needs clarification
8. Create a Step 1 summary
9. Continue to Step 2

Each screen should answer only one major question.

---

# 3. Entry Screen

## Page title
**Step 1 — Understand Your Pathology Report**

## Supporting text
Your pathology report contains the information your doctors use to understand your melanoma and plan the next steps.

## Primary question
**Do you have a copy of your melanoma pathology report?**

### Buttons
- Yes, I have it
- No, I need to get it
- I’m not sure what this is

---

# 4. Branch A — Patient Does Not Have the Report

## Screen A1 — Why You Need It

Keep this concise.

Explain that the pathology report is used to:

- document the diagnosis
- help doctors understand the melanoma
- support staging
- help plan treatment
- provide a record for future medical care

CTA:

**Show me how to get it**

---

## Screen A2 — How to Get It

Offer practical routes:

- Download it from the patient portal
- Call the dermatologist or physician who performed the biopsy
- Ask the office for a copy of the pathology report
- Save an electronic copy and keep a personal copy for future care

## Suggested patient script

> “I was recently diagnosed with melanoma. Could you please send me a copy of my pathology report?”

## Completion question

**Were you able to request or obtain the report?**

- Yes — I have it now
- I requested it but do not have it yet
- I need help figuring out whom to contact

### If requested but not yet received
Set Step 1 status to:

`waiting_for_pathology_report`

Allow user to save progress and return later.

Do not force the user to continue through pathology interpretation without the report.

---

# 5. Branch B — Patient Has the Report

## Screens B1 & B2 — REMOVED (2026-09-06)

The identity check ("Confirm the report is yours" — name / date of birth /
biopsy date checkboxes) and the biopsy-site match check have been removed from
the flow. When the patient confirms they have the report (at the entry screen
or after obtaining it in Branch A), the Navigator goes straight to **Screen
B3 — Find the Diagnosis**. The `verify` sub-progress step, the `b1`/`b2`
summary rows, and their analytics events are gone with them.

---

# 7. Find the Diagnosis

## Screen B3 — Locate the Diagnosis Section

Instruction:

Look for a section labeled something like:

- Diagnosis
- Final Diagnosis
- Pathologic Diagnosis

The patient does not need to understand the macroscopic / gross description in order to complete this step.

## Question

**Does the report clearly say “melanoma”?**

Choices:

- Yes
- No
- I cannot tell

### If No or Cannot Tell

Show:

**The book recommends asking the dermatologist to explain the report when there is not a clear diagnosis in the diagnostic section.**

Action card:

**Ask my doctor to explain the diagnosis**

Allow the patient to continue only to the “diagnostic confidence” pathway, not to automated melanoma branching.

---

# 8. In Situ / Lentigo Maligna vs Invasive

## Screen B4 — What type of melanoma is written on the report?

Ask:

**Do you see any of these terms?**

Choices:

- Melanoma in situ
- Lentigo maligna
- Invasive melanoma
- None of these / I’m not sure

### Branch: Melanoma in situ or lentigo maligna

Set:

`invasion_category = in_situ`

Display:

**Your report appears to describe melanoma in situ / lentigo maligna.**

Then explain at a high level:

- these terms describe melanoma confined to the outer layer of skin
- many of the invasive-melanoma pathology fields may therefore not appear on the report

Do **not** convert this result into an automated treatment recommendation.

Skip the invasive-only field collection described below.

Route to:
**Who made the diagnosis?**

### Branch: Invasive melanoma

Set:

`invasion_category = invasive`

Continue to Breslow thickness.

### Branch: Unclear

Set:

`invasion_category = unknown`

Show:
**Ask your dermatologist to clarify whether the melanoma is in situ or invasive.**

Allow the patient to continue with “I’ll ask my doctor,” but do not infer invasive fields.

---

# 9. Invasive Melanoma — Key Pathology Fields

The book presents a set of important pathology items. The Navigator should turn these into a calm, progressive checklist.

Do not show all fields at once.

---

## Screen C1 — Breslow Thickness

Prompt:

**Can you find “Breslow thickness” or “Breslow depth” on the report?**

Helpful hint:

It is usually written in millimeters, such as:
- 0.5 mm
- 1.2 mm
- 2.0 mm

Choices:

- Yes
- No
- I’m not sure

### If Yes

Field:

`breslow_mm`

Input type:
numeric decimal

Also include:

**Copy the value exactly as written.**

Do not round.

Do not assign a stage in Step 1.

### If No / Unsure

Set:
`breslow_status = not_found`

Action:
**Ask my doctor where the Breslow thickness is listed**

---

## Screen C2 — Ulceration

Question:

**What does the report say about ulceration?**

Hint: *Ulceration is a standard part of a melanoma pathology report. If it is not mentioned, choose "Absent / not identified."*

Choices:

- Present
- Absent / not identified

(Updated 2026-09-08, Dr. Wang — the "I cannot find it" / `unknown` option was
removed. Ulceration is a mandatory element of a melanoma synoptic report, so a
report that does not call it out is recorded as "Absent / not identified." This
also means the AJCC 8th T category resolves for every entered case that has a
Breslow value, so the Step 2 estimate no longer falls back to the coarse
"Stage I or II — not yet complete" band for a missing ulceration status. Every
other pathology field on Step 1 keeps its "I cannot find it" option.)

Store:

`ulceration = present | absent` (the `unknown` value is retained in the type as a
defensive default but is no longer reachable from the UI)

Do not infer from other wording unless exact medically reviewed phrase matching is implemented.

---

## Screen C3 — Mitotic Rate

Question:

**Do you see a mitotic rate or mitotic index?**

Choices:

- Yes
- No
- I’m not sure

If Yes:

Field:

`mitotic_rate_text`

Store as text rather than forcing numeric interpretation in Phase 1.

Reason:
labs may format this differently.

Example display only:
“2/mm²”

Do not use this field to automatically classify risk in Step 1.

---

## Screen C4 — Lymphovascular Invasion

Question:

**Does the report mention lymphovascular invasion?**

Choices:

- Present
- Not identified / absent
- I cannot find it

Store:

`lymphovascular_invasion = present | absent | unknown`

---

## Screen C5 — Regression

Question:

**Does the report mention regression?**

Choices:

- Present
- Absent
- I cannot find it

Store:

`regression = present | absent | unknown`

This is informational only in Step 1.

---

## Screen C6 — Nerve Involvement / Neurotropism

Question:

**Does the report mention nerve involvement or neurotropism?**

Choices:

- Present
- Absent / not identified
- I cannot find it

Store:

`neurotropism = present | absent | unknown`

This is informational only in Step 1.

---

## Screen C7 — Margin Status

Question:

**What does the report say about the biopsy margins?**

Choices:

- Positive / involved
- Negative / clear
- Transected / extends to an edge
- I cannot tell
- The report does not say

Store the patient's selection but do not interpret this as definitive adequacy of treatment.

Display:

**The biopsy margin is not the same thing as the final surgical treatment margin. Your treating physician will decide what additional procedure is needed.**

---

# 10. Who Made the Diagnosis?

## Screen D1 — Pathologist / Dermatopathologist

Prompt:

**Can you find the name of the physician who interpreted the biopsy?**

Choices:

- Yes
- No
- I’m not sure

If Yes:
Optional field:

`pathologist_name`

Do not require this field.

Then ask:

**Does the report identify the physician as a dermatopathologist?**

- Yes
- No
- I’m not sure

Do not label a diagnosis “reliable” or “unreliable” based only on this answer.

---

# 11. Diagnostic Confidence Pathway

This portion is important because the book devotes substantial attention to the reliability of melanoma pathology.

## Screen D2 — Is the Diagnosis Clear?

Ask:

**Does the diagnosis section give a clear melanoma diagnosis, or is there a long/uncertain comment that you do not understand?**

Choices:

- The diagnosis is clear
- The report seems uncertain or complicated
- I’m not sure

### If uncertain / unsure

Show:

**Some melanoma diagnoses can be difficult to interpret. The book recommends discussing the report with your dermatologist and, when appropriate, asking whether review by another experienced pathologist or dermatopathologist would be useful.**

CTA:
**See questions to ask my doctor**

---

# 12. Second Pathology Opinion

## Screen D3 — Discussing a Second Opinion

This screen should not tell every patient they need a second opinion.

It should provide a discussion option when:

- the report is unclear
- the patient has been told the diagnosis is uncertain
- the patient wants additional confidence
- there is disagreement between pathology reports
- the treating physician recommends review

Suggested question for physician:

> “Do you think it would be helpful to have the slides reviewed by another pathologist or dermatopathologist experienced in melanoma?”

Explain:

- a second pathology opinion generally means another specialist reviews the original biopsy slides
- it does not automatically mean another skin biopsy

CTA:
**I want to discuss this with my doctor**

Status:
`second_opinion_discussion_planned = true`

---

# 13. If the Patient Already Has Two Reports

## Screen D4 — Compare the Reports

Ask:

**Do you already have a second pathology report?**

- Yes
- No

If Yes, guide the patient to compare:

- patient identity
- biopsy site
- specimen / accession reference if available
- in situ vs invasive diagnosis
- Breslow thickness if invasive
- whether the conclusions agree

Question:

**Do the two reports appear to agree?**

- Yes
- No
- I’m not sure

### If No / Unsure

Show:

**Bring both reports to your dermatologist. The book advises physician guidance when pathology reports conflict.**

Do not attempt to resolve the conflict automatically.

---

# 14. Step 1 Summary Screen

## Page title
**Your Pathology Report Summary**

Render only fields the patient entered.

Example:

**Report**
- Report obtained: Yes

**Diagnosis**
- Diagnosis: Melanoma
- Type: Invasive melanoma

**Important pathology information**
- Breslow thickness: 0.8 mm
- Ulceration: Absent
- Mitotic rate: Not found
- Lymphovascular invasion: Not identified
- Regression: Not found
- Neurotropism: Not found
- Margin status: Extends to edge

**Questions for my doctor**
- Where is the mitotic rate listed?
- Do you have confidence in the pathology diagnosis?
- Do you recommend another pathology review?

---

# 15. Completion Criteria

Step 1 should have three completion states.

## Complete

Use when:
- patient has the pathology report
- diagnosis category captured or patient intentionally marks it “unclear”
- invasive fields reviewed if applicable
- patient has reviewed the final summary

Status:
`complete`

## Waiting

Examples:
- pathology report requested but not received
- second pathology review pending
- patient needs clarification from physician

Status:
`waiting`

## Needs Attention

Examples:
- patient/site information mismatch
- diagnosis unclear
- two reports conflict

Status:
`needs_attention`

Do not use alarming language such as “danger” or “high risk” based solely on Step 1 fields.

---

# 16. Carry-Forward Data for Step 2

Step 1 may pass the following structured values into Step 2:

```ts
type MelanomaPathologySummary = {
  reportObtained: boolean;

  diagnosisClear: "yes" | "no" | "unknown";
  diagnosisText?: string;

  invasionCategory:
    | "in_situ"
    | "invasive"
    | "unknown";

  breslowMm?: number;
  breslowStatus?: "found" | "not_found" | "unknown";

  ulceration?: "present" | "absent" | "unknown";
  mitoticRateText?: string;
  lymphovascularInvasion?: "present" | "absent" | "unknown";
  regression?: "present" | "absent" | "unknown";
  neurotropism?: "present" | "absent" | "unknown";
  marginStatus?: string;

  pathologistName?: string;
  dermatopathologistStatus?: "yes" | "no" | "unknown";

  secondOpinionDiscussionPlanned?: boolean;
  secondReportExists?: boolean;
  reportsAgree?: "yes" | "no" | "unknown";

  status: "complete" | "waiting" | "needs_attention";
};
```

---

# 17. What Step 1 Must NOT Do

Do not:

- diagnose melanoma from uploaded text or an image
- tell the patient the pathology report is definitely correct
- assign AJCC stage
- tell the patient whether sentinel lymph node biopsy is required
- recommend surgery, immunotherapy, targeted therapy, radiation, or imaging
- calculate survival probability
- interpret conflicting pathology reports
- treat absence of a field as evidence that the finding is absent
- infer a medical value from ambiguous wording

Those belong in later modules or require clinician review.

---

# 18. Optional Phase 2 Feature — Pathology Report Upload

Do NOT make this necessary for the first version.

A future version may allow the user to upload a pathology report and have the system identify candidate fields.

If implemented:

- extraction must be clearly labeled as machine-assisted
- show the original source phrase beside every extracted value
- require user confirmation before saving
- never silently infer missing values
- never declare a stage solely from the extraction
- provide a prominent “Check this with your doctor” message
- design privacy/data-retention rules before accepting medical documents

Example:

**We found:**
Breslow thickness → “0.8 mm”

Buttons:
- Yes, that is correct
- No, edit it
- I’m not sure

---

# 19. Recommended Visual Pattern

Use a progress indicator within Step 1:

**Step 1 of 5 — Pathology Report**

Sub-progress:

1. Get report ✓
2. Verify report ✓
3. Understand diagnosis ●
4. Find key information ○
5. Check diagnostic confidence ○
6. Review summary ○

Keep the user focused on one task at a time.

---

# 20. Patient Language Rules

Prefer:

- “Find”
- “Look for”
- “Ask your doctor”
- “Your report says”
- “You may want to discuss”
- “I’m not sure”

Avoid:

- “You definitely have…”
- “Your cancer will…”
- “You need this treatment…”
- “This means your prognosis is…”
- “The AI determined…”

---

# 21. Claude Code Implementation Instruction

When building Step 1:

1. Inspect the existing BeatingSkinCancer.com codebase first.
2. Reuse the existing design system, typography, buttons, cards, spacing, and navigation.
3. Build Step 1 as reusable components rather than one monolithic page.
4. Use local/session persistence initially unless the existing architecture already defines another approved persistence layer.
5. Do not require account creation.
6. Keep clinical content in structured data/config files separate from UI code.
7. Do not hard-code staging or treatment rules into Step 1.
8. Add analytics events for major user actions without sending pathology values or medical details to analytics.

Suggested analytics events:

- `melanoma_step1_started`
- `pathology_report_has_copy`
- `pathology_report_needs_copy`
- `pathology_diagnosis_reviewed`
- `pathology_invasive_fields_reviewed`
- `pathology_second_opinion_info_viewed`
- `melanoma_step1_completed`

Analytics events should measure flow completion, not transmit protected medical content.

---

# 22. Acceptance Criteria

Step 1 is ready for review when a test user can:

1. enter Step 1
2. indicate whether they have a pathology report
3. receive instructions to obtain it if not
4. identify the written diagnosis
6. branch into in situ vs invasive vs unclear
7. review invasive pathology fields when applicable
8. learn about diagnostic confidence and second-opinion discussion
9. generate a concise Step 1 summary
10. save progress locally
11. return later without restarting
12. continue to Step 2 without Step 1 making treatment decisions

---

# 23. Design Philosophy

The desired emotional experience is:

**“I was handed a frightening pathology report full of unfamiliar words. Now I know what information matters, what I have already accomplished, what I still need to clarify, and what I should do next.”**

That is the purpose of the Melanoma Navigator.
