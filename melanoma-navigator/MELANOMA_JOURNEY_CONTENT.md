# Beating Melanoma Navigator — Journey Content Map

## Purpose
This file converts the structure of *Beating Melanoma, Second Edition* into actionable Navigator content.

It is intentionally a **content map**, not a reproduction of the book. Patient-facing copy should be concise and original while preserving the book's framework and intent.

---

# PART I — MAD RUSH

## MR-1 — Understand the Pathology Report

### Patient goal
Obtain the pathology report, verify that it belongs to the patient and correct biopsy site, identify the major diagnostic features, and know when clarification or expert pathology review may be worth discussing.

### Entry question
**Do you have a copy of your melanoma pathology report?**

Choices:

- Yes.
- No.
- I am not sure.

### If NO
Primary task:

**Get a copy of the pathology report from the clinician or facility that performed the biopsy.**

Suggested support:

- Explain that electronic patient portals often contain the report.
- Encourage saving a copy for future care.

Completion:

`I have my pathology report.`

### If YES
Walk through a checklist rather than asking the patient to interpret the report independently.

> **Identity/site check removed (2026-09-06).** The Navigator no longer asks
> the patient to confirm name / date of birth / biopsy date or to check that
> the biopsy site matches. Go straight from "I have the report" to the
> diagnostic-type question below.

#### Diagnostic type
Question:

**Does the report say melanoma in situ / lentigo maligna, invasive melanoma, or are you not sure?**

Choices:

- Melanoma in situ / lentigo maligna
- Invasive melanoma
- I cannot tell

If `I cannot tell`:

Route to explanation + `Ask my doctor` task.

#### Key pathology features
For invasive melanoma, help the patient locate — not independently validate — items such as:

- Breslow thickness
- ulceration
- mitotic rate
- lymphovascular invasion if reported
- regression if reported
- neurotropism/nerve involvement if reported
- margin status

Do not convert these values into a treatment recommendation in this module.

#### Diagnostic confidence
Ask:

**Did your dermatologist explain whether they are confident in the pathology diagnosis?**

Choices:

- Yes.
- No / not yet.
- My report appears uncertain or complicated.

For uncertainty, provide a discussion prompt about whether review by an experienced pathologist/dermatopathologist is appropriate.

### Completion criteria
User has:

- obtained the report
- identified whether it is in situ or invasive, or marked this as needing clarification
- located key pathology information or marked it for clinician discussion
- considered whether diagnostic confidence needs discussion

### Next
`MR-2 — Understand Your Stage`

---

# MR-2 — Understand the Severity / Stage

### Patient goal
Understand what staging is for, know the basic meaning of tumor/nodal/distant disease information, and obtain the patient's actual stage from the treating team.

### Important UX rule
The website must not imply that it has definitively staged the patient's melanoma.

### Entry question
**Has your doctor told you your melanoma stage?**

Choices:

- Yes.
- No.
- I have a stage written down but do not understand it.

### Educational layer
Explain at a high level that staging incorporates information about:

- the primary melanoma
- lymph nodes
- distant spread when relevant

The book uses the AJCC framework and explains TNM concepts and the role of sentinel lymph node biopsy.

### Sentinel node education branch
Question:

**Has sentinel lymph node biopsy been discussed with you?**

Choices:

- Yes.
- No.
- I already had one.
- I am not sure what this is.

Provide education only; do not automatically recommend or reject the procedure based on user-entered numbers without a separately medically reviewed rules engine.

### Stage capture
Allow user to optionally mark what their clinician told them:

- Stage 0
- Stage I
- Stage II
- Stage III
- Stage IV
- Not sure / waiting for final stage

If substage is used, it should be treated as clinician-provided data, not derived by the website in the MVP.

### Completion
`My care team has explained my stage` OR `I know what I need to ask at my next visit.`

### Next
`MR-3 — Understand Treatment Options`

---

# MR-3 — Understand Treatment Options

### Patient goal
Understand the major categories of melanoma treatment relevant to conversations with clinicians and prepare for treatment decision-making.

### Treatment topics from the book
The book discusses:

- surgical excision
- sentinel lymph node biopsy
- immunotherapy
- targeted therapy
- radiation
- chemotherapy in selected advanced settings
- clinical trials

### Entry question
**Have you already discussed a treatment plan with a melanoma clinician?**

Choices:

- Yes.
- Not yet.
- I have been given options and need help understanding them.

### Navigator behavior
Show treatment education according to clinician-provided stage/pathway where possible, but do not claim to select the correct treatment.

Use prompts such as:

- `What is the goal of this treatment?`
- `What are the alternatives?`
- `What are the important risks and side effects?`
- `Do I need another specialist involved?`
- `Is a clinical trial relevant to my situation?`

### Advanced disease support
When systemic therapy is being discussed, encourage users to bring a family member/friend or otherwise capture notes from consultations. The book specifically emphasizes the volume and complexity of information in these visits.

### Completion
`I understand the treatment plan being discussed and have questions prepared for my doctor.`

### Next
`MR-4 — Understand Prognosis`

---

# MR-4 — Understand Prognosis

### Patient goal
Understand what prognosis means and how to discuss it with the treating team without treating population statistics as an individualized prediction.

### Entry warning
This section contains survival and prognosis information. Ask the user whether they want to continue.

Choices:

- Yes, show me.
- Not now.

### Core principles

- Prognosis varies substantially by stage and individual circumstances.
- Population statistics are estimates, not guarantees for an individual.
- Treatment advances can make older survival datasets less representative of current outcomes.

### Recommended interaction
Instead of immediately displaying a table of survival percentages, ask:

**What do you want help understanding?**

- What prognosis means
- What my stage generally means
- How to interpret survival statistics
- Questions to ask my oncologist

### Completion
`I understand how to discuss prognosis with my care team.`

### Next
`MR-5 — Find Clinical Experts`

---

# MR-5 — Find Clinical Experts

### Patient goal
Help patients understand which specialists may participate in melanoma care and how to assess whether they have appropriate expertise.

### Specialist categories reflected in the book

- dermatologist / skin cancer specialist
- dermatopathologist or pathologist experienced in melanoma
- surgical oncologist / melanoma surgeon
- medical oncologist
- radiation oncologist when relevant
- genetic counselor when relevant
- multidisciplinary cancer center/team for more complex disease

### Questions patients can use when evaluating a referral

- Does this clinician routinely care for melanoma patients?
- Does the clinician have specific melanoma/skin-cancer expertise?
- Does my referring doctor trust and regularly work with this clinician?
- Would another opinion change management in my case?

### Travel / remote consultation branch
If local expertise is limited, explain that the book discusses consultation with specialists at another center, with local physicians potentially carrying out the recommended care plan.

### Completion
`I know which clinician/team is managing my melanoma and who else may need to be involved.`

### Transition
Show:

**You have reached the end of the five-step Mad Rush guide.**

Then offer:

`Continue to the Marathon →`

---

# PART II — MARATHON

The Marathon should not feel like a one-time checklist. It is an ongoing dashboard of habits, surveillance, and questions.

---

# MA-1 — Medical Follow-Up

### Patient goal
Understand why follow-up continues after treatment and keep a clinician-defined follow-up plan.

### Core ideas from the book
Long-term follow-up addresses two major concerns:

1. recurrence of the original melanoma
2. development of another melanoma

### Tasks

- Identify which clinician(s) are providing follow-up.
- Record the follow-up schedule recommended by the care team.
- Keep scheduled skin examinations.
- Know which symptoms or changes should prompt contacting the care team.

### Medical-review requirement
Any stage-specific follow-up schedule displayed as a recommendation must be updated and medically reviewed before launch.

---

# MA-2 — What a Dermatologist Looks For

### Patient goal
Know what to expect from high-quality melanoma surveillance without teaching patients to diagnose melanoma themselves.

### Educational topics from the book

- total-body skin examination
- inspection of prior melanoma scar
- lymph node examination when appropriate
- ABCDE concept
- ugly duckling concept
- symptoms/change
- dermoscopy
- photography / digital monitoring in selected high-risk patients

### Patient checklist

- Does my clinician examine my skin comprehensively?
- Is dermoscopy used when appropriate?
- Do I need baseline or serial photography because of numerous/atypical nevi?

---

# MA-3 — Patient Skin Self-Examination

### Patient goal
Build a monthly habit of becoming familiar with the skin and noticing meaningful changes.

### Core task
`Do a monthly skin self-exam.`

### Suggested guided sequence

1. Front and sides of body.
2. Arms, forearms, underarms, hands.
3. Back and buttocks using a mirror or helper.
4. Legs and feet, including between toes and soles.
5. Neck and scalp, with help if needed.

### What to notice

- ABCDE features
- a lesion that looks different from surrounding lesions (ugly duckling)
- evolution/change
- pain, itching, or bleeding

### Safety message
The goal is familiarity and early recognition of change — not self-diagnosis. Concerning lesions should be assessed by a qualified clinician.

---

# MA-4 — Prevention / UV Protection

### Patient goal
Reduce avoidable UV exposure and build sustainable protection habits.

### Prevention hierarchy reflected in the book

- avoid excessive UV exposure and artificial tanning
- seek shade
- use protective clothing, hats, and sunglasses
- use sunscreen

The book also discusses oral supplements; do not surface supplement recommendations in the MVP without current medical review.

### Habit checklist

- I avoid intentional tanning.
- I seek shade during prolonged outdoor exposure.
- I use protective clothing / hat / sunglasses.
- I use sunscreen as part of my sun-protection strategy.

---

# MA-5 — Avoid Indoor Tanning

### Patient goal
Clearly communicate that intentional indoor UV tanning is inappropriate for melanoma survivors and is a preventable UV exposure.

This can be a short educational module rather than a lengthy journey branch.

---

# MA-6 — Family Risk & Genetics

### Patient goal
Understand that melanoma risk reflects a combination of phenotype, personal/family history, environmental exposure, and sometimes inherited predisposition.

### Topics from the book

- skin/hair phenotype
- number/type of nevi
- personal history of melanoma
- family history
- immune suppression
- genetic predisposition
- genetic counseling

### Navigator question
**Have you discussed your family history and personal melanoma history with your doctor?**

If multiple melanomas, young age at melanoma, or significant family cancer history are present, the navigator may suggest asking whether genetic counseling is appropriate — but must not declare that genetic testing is required.

---

# MA-7 — Technology & Emerging Tools

### Patient goal
Explain that technology used in melanoma detection, monitoring, and molecular testing evolves over time.

### Important rule
Do not make the companies/tests discussed in the 2024 book a permanent recommendation list.

Instead, this module should link to an editorially maintained `Emerging Technology` page that can be updated independently.

---

# MA-8 — Support, Community & Staying Informed

### Patient goal
Help patients identify credible support and continuing education.

### Topics from the book

- staying informed through expert education
- patient support communities
- sharing experiences
- giving back / advocacy
- reputable melanoma/skin-cancer organizations

### Product opportunity
This can eventually become a personalized resource hub rather than a required completion step.

---

# CHECKLIST DASHBOARD

The book's final checklist should inspire the Navigator's dashboard.

## Mad Rush dashboard

- [ ] I have a copy of my pathology report.
- [ ] I have reviewed the important information with my clinician.
- [ ] I know whether the melanoma is in situ or invasive, or I know who to ask.
- [ ] I know my clinician-provided stage or I am waiting for final staging.
- [ ] I understand the treatment plan/options being discussed.
- [ ] I have discussed prognosis if I want that information.
- [ ] I know which melanoma specialist/team is responsible for my care.

## Marathon dashboard

- [ ] I have an ongoing dermatologist follow-up plan.
- [ ] I know whether other specialists need to follow me.
- [ ] I know my clinician-recommended follow-up frequency.
- [ ] I perform regular skin self-exams.
- [ ] I know what kinds of changes should prompt evaluation.
- [ ] I practice UV protection.
- [ ] I avoid indoor tanning.
- [ ] I have discussed family risk / genetic counseling if relevant.

---

# CONTENT LINKING STRATEGY

Each Navigator task can link to existing or future educational pages.

Examples:

`What is Breslow thickness?` → educational article

`What is a sentinel lymph node biopsy?` → educational article/video

`Understanding melanoma stage` → staging explainer

`How immunotherapy works` → treatment article

`How to do a skin self-exam` → illustrated guide/video

`How to choose sunscreen` → existing prevention content

The Navigator should remain concise; the knowledge base provides depth.
