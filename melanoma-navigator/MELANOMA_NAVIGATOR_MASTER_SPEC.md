# Beating Melanoma Navigator — Master Product & Build Specification

## Status
Phase 1 product specification derived from *Beating Melanoma: The Ultimate Patient Resource, Second Edition* by Steven Q. Wang, MD.

## Primary Goal
Transform the book's two-phase framework — **Mad Rush** and **Marathon** — into an interactive patient navigator for BeatingSkinCancer.com.

The Navigator is not a digital book and should not reproduce the book chapter-by-chapter. It should convert the book's framework into a guided sequence of **questions, tasks, decision points, progress states, and links to supporting education**.

Core product idea:

**Book framework → patient state → next best task → supporting education → progress → next task**

## Source-of-Truth Rule
Use `MELANOMA_JOURNEY_CONTENT.md` as the source of truth for patient journey structure.
Use `MELANOMA_MEDICAL_GUARDRAILS.md` as the source of truth for safety and medical-content behavior.

Do not invent new melanoma treatment recommendations, thresholds, staging rules, follow-up schedules, or prognostic claims.

If implementation requires a medical rule that is not explicitly defined in the content files, display or log:

`NEEDS_MEDICAL_REVIEW`

rather than guessing.

---

# 1. Product Philosophy

A newly diagnosed patient is often overwhelmed. The interface should answer three questions at all times:

1. **Where am I?**
2. **What should I do next?**
3. **Why does this matter?**

The Navigator should reduce cognitive load, not increase it.

Use progressive disclosure. Show the action first and deeper education second.

---

# 2. Journey Model

The Navigator has two major phases.

## Phase A — MAD RUSH
For patients from diagnosis through definitive initial treatment planning/completion.

Five core steps:

1. Understand the diagnostic information in the pathology report.
2. Understand the severity/stage of melanoma.
3. Understand treatment options.
4. Understand prognosis/survival information.
5. Find appropriate clinical experts.

## Phase B — MARATHON
For patients after initial treatment or patients living with a history of melanoma.

Core domains:

1. Medical follow-up.
2. How clinicians detect new melanoma.
3. How patients can look for new melanoma.
4. Melanoma prevention / UV protection.
5. Avoidance of indoor tanning.
6. Family risk and possible genetic counseling.
7. Technology and emerging tools.
8. Support, education, community, and staying informed.

---

# 3. Entry Screen

Route: `/melanoma/navigator`

Headline:

**Where are you in your melanoma journey?**

Recommended choices:

- I was just diagnosed.
- I am trying to understand my stage.
- I am deciding on treatment.
- I am looking for the right melanoma specialist.
- I have completed initial treatment.
- I am in long-term follow-up.
- I am worried about a new or changing spot.
- I am not sure where I am.

Each answer should route the user to the most appropriate starting module while preserving access to the full journey map.

Do not force every user to begin at Step 1.

---

# 4. Navigator Screen Structure

Each screen should include:

### A. Journey context
Example:

`Mad Rush  •  Step 1 of 5`

### B. Page title
Example:

**Get your pathology report**

### C. Why it matters
One short paragraph maximum.

### D. Current task
A clear, actionable instruction.

### E. Patient response
Usually 2–4 buttons, toggles, or structured choices.

### F. Learn more
Expandable secondary content or link to an existing BeatingSkinCancer.com educational page.

### G. Questions to ask your doctor
Only when useful.

### H. Completion state
Examples:

- Not started
- In progress
- Completed
- Waiting for doctor / results
- Needs clarification

### I. Next action
A prominent CTA, e.g. `Continue to staging`.

---

# 5. Progress Model

Display both global and local progress.

Example:

**Mad Rush**
- ✓ Pathology report
- ● Stage
- ○ Treatment options
- ○ Prognosis
- ○ Find experts

Do not imply that completing a website module means medical treatment is complete.

Use language such as:

- `I understand this step`
- `I have this information`
- `I discussed this with my doctor`

Avoid language such as:

- `You completed staging`
- `Your treatment is complete`

unless the user explicitly records that fact.

---

# 6. Persistence — MVP

For Phase 1, implement progress without requiring an account.

Recommended approach:

- localStorage for journey progress
- anonymous session identifier
- no name, email, diagnosis document, or other directly identifying health information required

Persist:

- current phase
- current step
- completed educational tasks
- user-selected non-sensitive navigation states

Do not persist free-text medical information in localStorage in MVP unless explicitly approved later.

Add `Start over` and `Clear my journey` controls.

---

# 7. Analytics

Track anonymous product events such as:

- `melanoma_navigator_started`
- `journey_phase_selected`
- `journey_step_viewed`
- `journey_step_completed`
- `learn_more_opened`
- `doctor_questions_opened`
- `navigator_resumed`
- `navigator_completed_mad_rush`
- `navigator_entered_marathon`

Suggested event properties:

- phase
- step_id
- entry_point
- completion_status

Do not send pathology values, diagnoses, free text, or other health details into standard analytics platforms.

---

# 8. UX Principles

- Mobile-first.
- Large tap targets.
- One primary action per screen.
- Plain-language headings.
- Minimize medical jargon on the first layer.
- Define unavoidable medical terms inline.
- Do not overwhelm users with survival statistics unless they intentionally enter the prognosis module.
- Always allow users to go backward without losing progress.
- Always show `View full journey`.
- Provide `I'm not sure` as an answer when appropriate.

---

# 9. Recommended Component Architecture

Adapt to the site's current framework rather than introducing a new framework unnecessarily.

Suggested components:

- `JourneyEntryCard`
- `JourneyProgress`
- `JourneyStepLayout`
- `TaskCard`
- `DecisionQuestion`
- `LearnMoreAccordion`
- `DoctorQuestionList`
- `MedicalReviewNotice`
- `JourneyResumeBanner`
- `JourneyCompletionCard`

Suggested content model:

```ts
interface JourneyStep {
  id: string
  phase: 'mad-rush' | 'marathon'
  title: string
  shortDescription: string
  goal: string
  tasks: JourneyTask[]
  learnMore?: ContentLink[]
  doctorQuestions?: string[]
  medicalReviewRequired?: boolean
}
```

Keep medical content in structured data/content files rather than hardcoding it inside UI components.

---

# 10. Routing Recommendation

Suggested routes:

- `/melanoma/navigator`
- `/melanoma/navigator/mad-rush`
- `/melanoma/navigator/mad-rush/pathology`
- `/melanoma/navigator/mad-rush/stage`
- `/melanoma/navigator/mad-rush/treatment`
- `/melanoma/navigator/mad-rush/prognosis`
- `/melanoma/navigator/mad-rush/find-experts`
- `/melanoma/navigator/marathon`
- `/melanoma/navigator/marathon/follow-up`
- `/melanoma/navigator/marathon/skin-exams`
- `/melanoma/navigator/marathon/self-exams`
- `/melanoma/navigator/marathon/prevention`
- `/melanoma/navigator/marathon/family-risk`
- `/melanoma/navigator/marathon/support`

Exact routing should be adapted to the existing BeatingSkinCancer.com architecture.

---

# 11. Development Sequence

## Phase 1A — Skeleton
Build:

1. Navigator landing page.
2. Mad Rush / Marathon entry routing.
3. Progress component.
4. Five Mad Rush step cards.
5. Marathon domain cards.
6. Local progress persistence.
7. Analytics hooks.

Use placeholder content only where explicitly marked.

## Phase 1B — Pathology module
Build the first fully interactive module around obtaining and understanding the pathology report.

This should be the proof-of-concept module because the book treats the pathology report as the foundation for staging, treatment planning, and prognosis.

## Phase 1C — Remaining Mad Rush
Build staging, treatment, prognosis, and expert-finding modules after medical review of current content.

## Phase 1D — Marathon
Add follow-up, self-exam, prevention, family-risk, and support modules.

---

# 12. Claude Code Implementation Prompt

When this repository is opened in Claude Code, use the following instruction:

> Read `MELANOMA_NAVIGATOR_MASTER_SPEC.md`, `MELANOMA_JOURNEY_CONTENT.md`, and `MELANOMA_MEDICAL_GUARDRAILS.md` completely before making changes. Then inspect the existing BeatingSkinCancer.com codebase, identify its framework, routing, design system, analytics setup, and reusable components. Build Phase 1A of the Melanoma Navigator using the existing architecture and visual language. Do not redesign unrelated parts of the site. Do not invent medical recommendations. Any medical rule not explicitly supported by the content files must be marked `NEEDS_MEDICAL_REVIEW`. Before coding, provide a concise implementation plan and list the files you expect to create or modify. Then proceed with implementation.

---

# 13. Definition of Success for MVP

A first-time patient should be able to:

1. Enter the Navigator.
2. Identify where they are in the journey.
3. Understand the next action.
4. Complete or defer a task.
5. Access supporting education without losing their place.
6. Return later on the same device and resume.
7. See clearly how the Mad Rush transitions into the Marathon.

The Navigator should feel like a calm guide through a complicated process — not like another medical encyclopedia.
