# Mad Rush Step 2 — Deep Build Specification
## Understand the Severity of Your Melanoma with the AJCC Staging System

**Project:** Beating Skin Cancer — Melanoma Navigator  
**Source framework:** *Beating Melanoma*, Second Edition  
**Role of this module:** Turn Step 2 of the book into a guided staging-education experience.

---

# Amendment — 2026-09-07 (Dr. Steven Q. Wang): Step 2 is recap → summary only

Supersedes the amendment below and the `k1` / `k2` / N / M sections that follow.

`step2Staging.ts` now keeps **only** the `k0` pathology recap (with the
`k0cold` / `k0a` / `k0b` / `k0c` cold-entry capture) and the "Your stage picture"
summary. **"Yes — that matches my report"** on `k0` — or an inline correction
saved — routes **straight to `SUMMARY:step2`**.

Deleted, no longer built:

- **`k1`** ("Has a doctor already told you your melanoma stage?"). The
  clinician-assigned stage is deferred to on the summary; the Navigator does not
  ask.
- **`k2`** (the "what's left to confirm" bridge) and the **entire N and M
  question track** — `N1`, `N1how`, `Npos`, `N2`, `N2explain`, `N2neg`,
  `N2pending`, `N2none`, `N3`, `M1`, `M2`, `M3`.
- The **T1a / T2a–T4b early-exit routing** (`k2.autoRouteByTCat`, §16). The
  summary still shows the educational Stage I/II sub-group from the Step 1
  pathology answers via `estimateStageGroup()`; with no lymph-node answers an
  invasive case is always `provisional` (negative sentinel node keeps the
  sub-group, a positive node → Stage III, distant spread → Stage IV).
- Summary sections "What your doctor has told you" (the `k1` row) and "Lymph
  nodes and spread (recorded here)", the `stageBand` rules keyed on
  `N1` / `N2` / `N3` / `M2` / `T1a` / `earlyStage`, and the
  `stageEstimate.caveats` / `nodePositive` / `distant` / `slnbNegative` /
  `slnbNotNeeded` keys.

`flow.js` keeps the generic `autoRouteByTCat` / `resolveComputedRoute()` /
`renderNoteEstimate()` engine support (dormant — no screen emits the attributes).
`subProgress` is now just **Your report → Your stage picture**. Analytics events
`step2_doctor_stage_question_completed`, `step2_t_section_completed`,
`step2_n_section_completed`, `step2_slnb_education_viewed`,
`step2_m_section_completed` were dropped from the allow-list.

---

# Amendment — 2026-09-07 (Dr. Steven Q. Wang): "Yes, a doctor told me my stage" early exit

Answering **"Yes"** on `k1` ("Has a doctor already told you your melanoma stage?")
now routes **straight to the "Your stage picture" summary**. That clinician-assigned
stage is deferred to; the Navigator asks nothing further.

Superseded by this amendment (kept below for history, no longer built):

- **`k1a`** ("What stage were you told?") and **`k1b`** ("Was that a clinical or a
  pathologic stage?") screens — **deleted**. The summary now tells the patient
  their physician confirms the exact stage, its sub-stage, and clinical vs.
  pathologic.
- **§28 Staging Consistency Checks** — **removed**. Every rule compared a
  doctor-reported stage (`k1a`) against the pathology / node / spread answers;
  with `k1a` gone there is nothing to compare. `STEP2_CONSISTENCY_RULES`, the
  summary `consistencyNote` / `consistencyRules`, the `k1a`-keyed `stageBand`
  rule, and the `k1a` `unless` guards on `k2.autoRouteByTCat` were all dropped.
- References to the "`k1` / `k1a` / `k1b`" anchor triplet elsewhere in this spec
  now mean **`k1` only**.

Unchanged: **"No" / "I'm not sure"** on `k1` still route to `k2` and walk the full
k2 → N → M flow; the T1a and T2a–T4b `k2.autoRouteByTCat` early exits still fire
(they simply no longer have a doctor-stage suppression guard).

---

# 1. Goal of Step 2

The patient should leave Step 2 with:

- a simple understanding of what melanoma staging is for
- a basic understanding of the TNM framework
- awareness of the difference between clinical staging and pathologic staging
- an understanding of what information is already known from Step 1
- awareness that lymph node status may require additional clinical evaluation or sentinel lymph node biopsy
- awareness that distant metastasis status may require physician-directed imaging or other evaluation
- a provisional staging summary based only on information explicitly entered or confirmed
- a clear list of staging questions to ask the treating physician
- a final prompt to have the physician confirm the melanoma stage

The central patient-facing message should be:

**“You do not need to memorize the staging system. You need to understand the pieces that determine your stage and know what to ask your doctor.”**

Step 2 should educate and organize information. It should not present itself as a substitute for clinician staging.

---

# 2. Source-of-Truth Warning

The book explains AJCC 8th-edition melanoma staging and cites 2022 NCCN guidance for sentinel lymph node biopsy discussion.

Because this Navigator is being built after publication of the book, all staging tables, thresholds, SLNB criteria, and management-linked rules must be treated as:

`MEDICAL_CONTENT_REQUIRES_CURRENT_REVIEW`

Do not silently update the book from model knowledge.

Do not silently assume the book's thresholds remain current.

Before production release, a physician reviewer should compare any executable rule against the current AJCC staging system and current NCCN or other chosen clinical guideline.

---

# 3. Core UX Principle

Do not begin with a dense staging table.

The book itself acknowledges that staging is complex. The Navigator should therefore progressively teach:

**T → N → M → Stage**

Each concept gets its own screen.

The user should always be able to choose:

- I know this
- I don't know
- My doctor hasn't told me yet

Unknown information must be treated as unknown, not negative.

---

# 4. Step 2 Entry Screen

## Page title
**Step 2 — Understand Your Melanoma Stage**

## Supporting text
Staging is a way doctors describe how advanced a melanoma is. It helps guide treatment discussions, prognosis, clinical-trial interpretation, and follow-up planning.

## Reassurance / framing
**You do not need to calculate your stage by yourself. This step will help you understand the information your doctors use so you can have a more informed conversation with them.**

## Primary CTA
**Start with T, N, and M**

---

# 5. First Gate — Do You Already Know Your Stage?

## Screen A1

Question:

**Has a doctor already told you your melanoma stage?**

Choices:

- Yes
- No
- I’m not sure

### If Yes

Ask:

**What stage were you told?**

Choices:

- Stage 0
- Stage I
- Stage IA
- Stage IB
- Stage II
- Stage IIA
- Stage IIB
- Stage IIC
- Stage III
- Stage IIIA
- Stage IIIB
- Stage IIIC
- Stage IIID
- Stage IV
- I don’t remember exactly

Store:

`doctor_reported_stage`

Important:

This value should be displayed as:

**Stage reported by your doctor**

Do not overwrite it with a Navigator-derived stage.

The Navigator may still walk the patient through T, N, and M so the patient understands why that stage was assigned.

---

# 6. Explain Clinical vs Pathologic Staging

## Screen A2 — Two Ways Staging Is Described

The book distinguishes:

### Clinical staging
Used after the initial biopsy and based on information available from examination, pathology, imaging, and other clinical evaluation.

### Pathologic staging
Includes additional information obtained after definitive surgery and, when performed, lymph node surgery such as sentinel lymph node biopsy.

Patient-facing takeaway:

**Your stage can become more precise as additional information becomes available.**

Question:

**Have you already had your definitive melanoma surgery?**

- Yes
- No
- I’m not sure

Question:

**Have you had a sentinel lymph node biopsy?**

- Yes
- No
- It has been recommended but not done yet
- I don’t know what this is

These answers determine whether the Navigator should describe staging as potentially incomplete.

---

# 7. Introduce TNM

## Screen B1 — The Three Pieces of Staging

Use three simple cards:

### T — Tumor
What is known about the original melanoma.

From the book, the most important Step 2 inputs are:
- Breslow thickness
- ulceration

### N — Nodes
Whether melanoma has been found in lymph nodes or nearby regional sites.

### M — Metastasis
Whether melanoma has been found in distant parts of the body.

Display:

**Your overall melanoma stage is built from these pieces.**

CTA:
**Start with T**

---

# 8. T — Primary Tumor

## `k0` recap — Pull Information from Step 1

(This was historically called "Screen T1"; there is no longer a standalone
"T — your original tumor" screen — see §16 and the note in §23.)

If Step 1 is complete, `k0` ("What your pathology report shows") echoes the
recorded pathology fields back for a single confirmation:

- Diagnosis (in situ vs invasive)
- Breslow thickness
- Ulceration
- Mitotic rate
- Lymphovascular invasion
- Nerve involvement / neurotropism
- Biopsy margins

Example:

**From your pathology report:**
- Invasive melanoma
- Breslow thickness: 1.2 mm
- Ulceration: Absent
- …

Buttons:

- **Yes — that matches my report** → `k1` (the doctor-stage anchor), **unless a
  `k0.autoRoute` rule matches** — a Step 1 in-situ / lentigo maligna diagnosis
  (`b3`), or a cold-entry `k0a = in_situ`, routes straight to `SUMMARY:step2`
  (the Stage 0 skip; nothing for N or M to add). `autoRoute` is checked only on
  the confirm and **Save changes** buttons, never on entry, so the recap always
  paints first — an in-situ patient still gets to verify and, if needed,
  inline-correct what Step 1 recorded.
- **I need to correct something** → opens inline edit mode on the same card

If no Step 1 answers are carried (cold entry) the card is skipped and the flow
forwards to `k0cold` → `k0a`–`k0c`.

**Inline correction (product decision 2026-09-07, Dr. Wang; diagnosis row
amended 2026-09-07).** "I need to correct something" does not route away. Every
row — Diagnosis included — becomes an input (Breslow / mitotic rate = free text;
Diagnosis / ulceration / LVI / neurotropism / margins = dropdown) written
straight back to its Step 1 answer key on **Save changes**, which then routes to
`k1` (or `SUMMARY:step2` when the `k0.autoRoute` in-situ rule matches, exactly as
the confirm button does). LVI and neurotropism read out as **Yes / No / I don't
know**. A blank dropdown pick leaves that answer unchanged; a cleared text field
clears it.

The **Diagnosis** dropdown (Melanoma in situ / Lentigo maligna / Invasive
melanoma) writes `b3` and stays on this page — it replaces the earlier **Change
the diagnosis** link, which routed the patient back through `k0a` and off the
recap. Because in situ vs invasive changes which fields apply, the pick carries
presets: an in-situ / lentigo maligna pick sets the invasive-only pathology
fields (`c1`–`c4`, `c6`) to "N/A" — mirroring Step 1's `IN_SITU_FIELD_PRESETS` —
and an invasive pick clears them so the recap's own Breslow + ulceration rows
are re-entered here. The in-situ Stage 0 skip then runs off `k0.autoRoute` on
**Save changes**, the same as the confirm button. No medical logic runs on the
recap; it only reads and re-writes
answer labels.

Never silently use unconfirmed values.

---

# 9. T Branch — Melanoma In Situ

If:

`invasionCategory = in_situ`

Display:

**Your pathology report describes melanoma in situ / lentigo maligna.**

Book-derived staging concept:

This corresponds to **Stage 0** when there is no nodal or distant disease.

However, production behavior should be:

**Navigator educational result:**  
“Melanoma in situ is categorized as Stage 0 in the staging framework described in the book.”

Then:

**Please confirm your final stage with your treating physician.**

Do not route through invasive T categories.

**Product decision (2026-09-07, Dr. Wang) — Stage 0 skip:** when the patient is
already effectively Stage 0, the Navigator shows **no Step 2 question screens at
all** and takes them straight to the "Your stage picture" summary (Stage 0 band +
"confirm with your treating physician"). This applies when:

- Step 1 diagnosis is melanoma in situ / lentigo maligna (`b3`): the patient
  still sees the `k0` recap to verify / inline-correct the Step 1 fields (same
  edit window as every other case), and `k0.autoRoute` sends the confirm and
  **Save changes** buttons to `SUMMARY:step2`; on cold entry the same is caught
  by the `k0a = in_situ` rule in `k0.autoRoute`; or
- the patient selects **"Stage 0"** on `k1a` ("what stage were you told?") — that
  choice routes straight to the summary.

Screens A1 (in-situ framing) and A2 (the "simplified N/M confirmation" below) are
**removed**. Do not reinstate them.

~~Continue to a simplified N/M confirmation:~~

- ~~Has any doctor told you melanoma was found in lymph nodes? Yes / No / Unsure~~
- ~~Has any doctor told you melanoma spread to another organ or distant site? Yes / No / Unsure~~

~~If either is Yes, flag `STAGING_INCONSISTENCY_REQUIRES_CLINICIAN_REVIEW`. Do not attempt to reconcile.~~

Consistency trade-off: because `k1` ("has a doctor given you a stage?") is also
skipped on the in-situ branch, the `insitu_vs_advanced_doc` check cannot fire for
those patients. The summary still shows only "Stage 0 — your physician confirms
the exact stage," never a computed assertion. The check still runs for the
cold-entry / invasive-diagnosis paths that do reach `k1`.

---

# 10. T Branch — Invasive Melanoma

## Screen T2 — Breslow Thickness

Display the Step 1 value if known.

If unknown:

**You will need the Breslow thickness from your pathology report to understand the T category.**

CTA:
- Go back to Step 1
- I’ll ask my doctor
- Continue with what I know

---

# 11. T Branch — Ulceration

## Screen T3

Display:

**Ulceration is one of the features used with Breslow thickness to determine the tumor category.**

Pull:

`ulceration = present | absent | unknown`

If unknown, do not infer T subcategory.

---

# 12. T Category Education

## Screen T4 — Your T Category

The book describes T-category logic based on Breslow thickness and ulceration.

The software architecture should support a rule engine, but do not hard-code the following into production until current medical review.

### Book-derived rule reference
**REQUIRES_CURRENT_MEDICAL_REVIEW**

- T1a: < 0.8 mm without ulceration
- T1b: < 0.8 mm with ulceration OR 0.8–1.0 mm with or without ulceration
- T2a: > 1.0–2.0 mm without ulceration
- T2b: > 1.0–2.0 mm with ulceration
- T3a: > 2.0–4.0 mm without ulceration
- T3b: > 2.0–4.0 mm with ulceration
- T4a: > 4.0 mm without ulceration
- T4b: > 4.0 mm with ulceration

If enough information is known and a medically reviewed staging ruleset is enabled:

Display:

**Based on the information you entered, your tumor category may be: T2a**

Underneath:

**This is an educational staging aid, not a final medical determination. Your physician should confirm your T category and stage.**

If not enough information is known:

**We cannot estimate the T category yet because one or more required fields are missing.**

---

# 13. N — Lymph Node / Regional Disease

## Screen N1 — What N Means

Explain:

Melanoma can sometimes spread from the original tumor to nearby lymph nodes or nearby skin/subcutaneous sites.

The book distinguishes:

### Clinically detected nodal involvement
Melanoma involving a lymph node found through clinical examination or imaging and then confirmed.

### Clinically occult nodal involvement
Melanoma in a sentinel lymph node found only after sentinel lymph node biopsy.

The book also includes regional/non-regional descriptors such as:

- in-transit metastasis
- satellite metastasis
- microsatellite metastasis

Do not ask the patient to self-classify detailed N categories unless those exact findings were documented by a clinician.

---

# 14. N1 — Has a Doctor Found an Abnormal Lymph Node?

Question:

**Has a doctor told you that melanoma was found in a lymph node?**

Choices:

- Yes
- No
- I’m not sure

If Yes:

Ask:

**How was it found?**

- Sentinel lymph node biopsy
- A lymph node I or my doctor could feel
- Imaging
- Another biopsy or surgery
- I’m not sure

Store the method as descriptive information.

Do not automatically assign a full N category from patient recollection alone.

---

# 15. N2 — Sentinel Lymph Node Biopsy Education

If the patient has not had SLNB or does not know what it is, show a short explainer.

Patient-facing explanation:

The sentinel lymph node is the first lymph node or group of nodes that melanoma cells may reach as they travel away from the original melanoma. A sentinel lymph node biopsy removes selected node(s) so a pathologist can look for melanoma cells.

Do not make this screen overly procedural.

Add:

**Not every patient with melanoma needs a sentinel lymph node biopsy.**

---

# 16. N3 — “Do I Need SLNB?” Decision Support

This is a high-value part of the Navigator, but it must be designed carefully.

The book includes 2022 NCCN-based thresholds for when SLNB is not recommended, considered, or offered.

These rules are time-sensitive.

Therefore:

## MVP behavior

Do NOT tell the patient:

“You need a sentinel lymph node biopsy.”

Instead, use the Step 1 pathology information to decide whether to show:

### A. Discussion likely not central
**Based on the staging framework in the book, SLNB is generally not part of evaluation for melanoma in situ. Confirm this with your physician.**

### B. Discussion may be relevant
**Your pathology features may place you in a group where doctors discuss whether sentinel lymph node biopsy would add useful staging information.**

### C. Strong discussion prompt
**Your pathology features are in a range where sentinel lymph node biopsy is commonly discussed in the book’s cited guideline framework. Ask your surgeon or melanoma specialist whether it applies to you.**

All thresholds behind these messages must be marked:

`MEDICAL_CONTENT_REQUIRES_CURRENT_REVIEW`

The patient should never see outdated guideline-year logic presented as current.

**Product decision (2026-09-07, Dr. Wang) — T1a early exit.** For a **T1a**
tumor — invasive, Breslow **< 0.8 mm**, **no ulceration** — a sentinel lymph
node biopsy is generally not part of staging, so walking the patient through the
N and M screens adds nothing. Step 2 therefore:

- shows the recap and the doctor-stage anchor (`k1` / `k1a` / `k1b`), then routes
  straight to the **"Your stage picture"** summary — skipping the `k2` bridge
  **and** `N1…` → `M1…`. (Amended 2026-09-07, Dr. Wang: the standalone
  "T — your original tumor" education screen was removed entirely; its IA–IIC
  table and T explainer live on the summary, and the `k0` recap carries the
  Breslow/ulceration confirmation. `k2` still shows in full for every invasive
  case that does *not* early-exit.) There is no standalone T1a screen. Routing is
  `k2.autoRouteByTCat`, evaluated by `flow.js` `resolveComputedRoute()` — on
  entry to `k2`, so the screen never paints, as well as on its Continue button —
  using the **approved**
  `tCategoryFor()` (AJCC 8th) on the recorded Breslow + ulceration; it selects a
  route and computes no stage. The route `record`s `{ T1a: 'seen' }` (a state
  token — no clinical string) so the summary's T1a-keyed rules resolve, and
  carries the three T1a doctor questions on its `questions` list.
- The summary states this case as **T1a → Stage IA** (physician confirms) via its
  stage band + estimate, and shows the T1a `summary.stageEstimate.caveats` entry:
  a sentinel lymph node biopsy is generally not needed, **but** near the 0.8 mm
  cutoff (~0.7 mm) or with a **transected biopsy base** some surgeons still
  discuss one — **negative → Stage IA, positive → Stage III**.
- The summary treats this like a settled node-negative case: `estimateStageGroup`
  is called with `slnb` = not-needed → `confirmed` **Stage IA**, plus one extra
  `summary.stageEstimate.caveats` line repeating the near-cutoff / transected-base
  sentinel-node nuance. No new medical rule — the T category and the Stage IA
  grouping are the already-approved AJCC 8th tables in `medicalRules.ts`.
- **Suppressed** when the patient has reported a doctor-assigned **Stage II or
  higher** (`autoRouteByTCat.routes[].unless`), so a conflicting case still
  walks the full N/M flow and the consistency checks apply. Exactly 0.8 mm is
  T1b (per the approved rule) and is **not** early-exited.

**Product decision (2026-09-07, Dr. Wang) — T2a–T4b early exit.** The same early
exit is extended to the thicker Stage I/II tumors — **T2a, T2b, T3a, T3b, T4a,
T4b** (Stage **IB / IIA / IIB / IIC**). Once the recap or cold-capture has a
Breslow thickness **and** an ulceration status, `k2.autoRouteByTCat` resolves the
T category and routes straight to the **"Your stage picture"** summary, skipping
the `k2` bridge, `N1…`, and `M1…` exactly as the T1a route does. Differences from T1a:

- The route `record`s `{ earlyStage: 'seen' }` and carries four doctor questions
  (current stage + clinical/pathologic, whether an SLNB is recommended and when,
  what a negative vs positive node changes, whether imaging is needed and what
  distant spread would change).
- A sentinel lymph node biopsy **is** usually part of staging for these tumors,
  so the summary shows the sub-group as **provisional**: `estimateStageGroup` is
  called with `slnb` left **unknown** → `provisional` **Stage IB/IIA/IIB/IIC**,
  and the `earlyStage` `summary.stageEstimate.caveats` entry states the stage is
  not final — **negative sentinel node → same stage, positive → Stage III,
  distant spread on imaging → Stage IV**. The `copy.provisional` template also
  gains the "distant spread on imaging → Stage IV" clause (it previously named
  only the positive-node → III escalation).
- No new medical rule — the T category and the IB–IIC groupings are the
  already-approved AJCC 8th tables in `medicalRules.ts`.
- **Suppressed** when the patient has reported a doctor-assigned **Stage III or
  IV** (`autoRouteByTCat.routes[].unless`), so a conflicting case still walks the
  full N/M flow and the consistency checks apply. A doctor-reported Stage I or II
  is consistent with this range and does **not** suppress the early exit.

---

# 17. N4 — SLNB Status

Ask:

**What is your sentinel lymph node biopsy status?**

Choices:

- My doctor said I do not need one
- We are still deciding
- It is scheduled
- It was done and was negative
- It was done and was positive
- I have not discussed this yet
- I’m not sure

If positive:

`node_status_summary = positive_slnb`

Explain:

**A positive sentinel lymph node means melanoma cells were found in a regional lymph node. In the staging framework described in the book, this moves the disease into Stage III rather than Stage I or II, assuming there is no distant metastasis. Your doctor determines the exact Stage III subgroup.**

Do not calculate IIIA/B/C/D from limited patient-entered information in MVP.

If negative:

`node_status_summary = negative_slnb`

Explain:

**A negative sentinel lymph node means melanoma was not found in the sampled sentinel node(s). Your final stage still depends on the primary tumor features and the rest of your clinical evaluation.**

---

# 18. N5 — Nearby Skin / In-Transit / Satellite Disease

Question:

**Has a doctor told you there are melanoma deposits in nearby skin or tissue separate from the original melanoma?**

Choices:

- Yes
- No
- I’m not sure

If Yes:

Ask:

**Did your doctor use any of these terms?**

- In-transit metastasis
- Satellite metastasis
- Microsatellite metastasis
- Another term
- I don’t remember

Store exactly as reported by patient.

Show:

**These findings can affect the N category and Stage III classification. Your melanoma specialist should determine the exact stage.**

Do not automatically subtype Stage III in MVP.

---

# 19. M — Distant Metastasis

## Screen M1 — What M Means

Explain:

**M describes whether melanoma has spread to a distant part of the body.**

The book gives examples including:

- distant skin or soft tissue
- lung
- liver or other visceral organs
- brain

Do not imply that the absence of imaging equals M0 unless that status has been clinically established.

---

# 20. M2 — Has Distant Spread Been Found?

Question:

**Has a doctor told you that melanoma has spread to a distant organ or distant part of the body?**

Choices:

- Yes
- No
- I’m not sure
- I have not had this evaluated

If Yes:

Ask:

**Where has your doctor told you melanoma was found?**

Allow multiple selections:

- Distant skin / soft tissue
- Lung
- Liver
- Brain
- Other
- I’m not sure

Do not ask the user to interpret scans themselves.

If Yes:

Display:

**In the staging framework described in the book, distant metastasis is classified as Stage IV. Your oncology team determines the detailed M category and treatment plan.**

---

# 21. Imaging Question

## Screen M3

Question:

**Have you had imaging as part of melanoma staging?**

Choices:

- CT
- PET/CT
- MRI
- More than one of these
- No
- I’m not sure

This field is informational.

Do not use “No imaging” to infer absence of metastasis.

If the patient has symptoms or concerns, the Navigator should not decide what imaging is required.

Suggested message:

**Your doctor decides whether imaging is appropriate based on your melanoma stage, examination, symptoms, and other clinical factors.**

---

# 22. Build the Stage Conceptually

## Screen S1 — Put T, N, and M Together

Show three cards:

**T**
- Example: T2a
- Source: pathology report

**N**
- Example: Sentinel lymph node negative
- Source: surgical pathology

**M**
- Example: No distant disease reported to you
- Source: clinician / imaging discussion

Then:

**These pieces are combined to determine the overall stage.**

Important:
If any critical element is unknown, visually show:

**Stage not yet complete**

This is preferable to forcing a stage.

---

# 23. Book-Derived Stage Grouping Reference

This table is for the implementation spec and medical review team.

Do not publish as an unchecked rule engine.

## `MEDICAL_CONTENT_REQUIRES_CURRENT_REVIEW`

The book describes:

- Stage 0 — melanoma in situ / lentigo maligna; N0, M0
- Stage IA — T1a or T1b with N0, M0
- Stage IB — T2a with N0, M0
- Stage IIA — T2b or T3a with N0, M0
- Stage IIB — T3b or T4a with N0, M0
- Stage IIC — T4b with N0, M0
- Stage III — regional nodal or regional/non-regional metastatic findings as defined in the book, with no distant organ involvement
- Stage IV — distant metastasis

The book further divides Stage III into IIIA–IIID based on combinations of tumor and nodal features.

For MVP:
Do not derive IIIA–IIID automatically unless a physician-approved current AJCC ruleset is implemented.

**Product decision (2026-09-07, Dr. Wang) — Stage I/II delineation is education-only.**
Originally Step 2 gained a standalone `T1` ("T — your original tumor") screen
between the doctor-stage anchor and the `k2` N/M bridge that:

- explained that Breslow thickness + ulceration are what divide Stage I from II
  and IA/IB/IIA/IIB/IIC from each other;
- offered a **click-to-reveal** table of the T1a–T4b → IA–IIC groupings
  (spec §12 + §23), shown with `MEDICAL_CONTENT_REQUIRES_CURRENT_REVIEW`;
- computed **nothing** — no T category, no sub-stage.

**Superseded 2026-09-07 (Dr. Wang) — the standalone `T1` screen was removed.**
The `k0` recap already confirms Breslow thickness + ulceration, and the summary's
`stageEstimate` carries the IA–IIC breakdown table and the T explainer. Step 2
now goes straight from the doctor-stage anchor (`k1` / `k1b`) to the `k2` bridge;
`k2` carries the `autoRouteByTCat` early-exit hook that `T1` used to hold.

The T1b row is reconciled to **AJCC 8th** (all 0.8–1.0 mm = T1b regardless of
ulceration), not the narrower wording in an early content draft.

The "do I need SLNB?" nuance from §16 is delivered as contextual copy, not a
computed recommendation: `k2` and `N2explain` now state that for any invasive
melanoma past the thinnest group the Stage I/II is **provisional until the node
is confirmed clear**; `N2none` ("doctor said I don't need one") adds that for
thin lesions near the 0.8 mm cutoff — or with a transected base / involved deep
margin — it is reasonable to ask whether SLNB should still be considered.

A gated, physician-approved computed sub-stage (Option B) remains a possible
later pass; it is explicitly **not** in this change.

**Product decision (2026-09-07, Dr. Wang) — Option B enabled: the summary now
computes an educational Stage I/II sub-group.** Superseding the "computes
nothing" line above for the summary only.

- Dr. Wang (Editor-in-Chief, board-certified dermatologist) reviewed
  `T_CATEGORY_RULESET` and `STAGE_GROUPING_REFERENCE` in `medicalRules.ts`
  against **AJCC 8th edition** and marked both `status: 'approved'`
  (`reviewedBy: 'Steven Q. Wang, MD'`, `reviewedDate: '2026-09-07'`).
  `STAGING_RULES_ENABLED` is now `true`.
- New pure functions in `medicalRules.ts`: `tCategoryFor(breslowMm, ulceration)`
  → AJCC 8th T category, and `estimateStageGroup(input)` → one of
  `confirmed` / `provisional` (Stage IA–IIC) or `regional` / `distant` /
  `in_situ` / `insufficient` (defer to the coarse band). Scope is Stage I/II
  only; T2+ with unknown ulceration, or any missing Breslow, returns
  `insufficient`.
- New `summary.stageEstimate` config in `step2Staging.ts` carries every string
  (input-mapping rule lists, `{stage}`/`{t}` copy templates, the notice, and
  the IA–IIC `tableRows`). `flow.js` `renderStageEstimate()` reads the recorded
  answers, calls `estimateStageGroup()`, and — only for `confirmed` /
  `provisional` — fills the block, marks the patient's T-category row, and hides
  the coarse `stageBand`. Any other result hides the estimate and shows the band
  as before.
- The table the patient asked to see on the result screen is rendered there
  under the "Every row below assumes the lymph nodes are clear…" sentence.
- `provisional` (sentinel node not yet negative) is shown as
  "Stage IIx (provisional)" with copy that a positive node moves it to III.
- The doctor-reported stage box is unchanged and still authoritative; a
  conflict still trips the neutral consistency note.

---

# 24. Navigator Result Screen

## Page title
**Your Staging Summary**

Two separate boxes are essential.

### Box 1 — What your doctor has told you
Example:

**Doctor-reported stage: Stage IB**

If unknown:

**You have not entered a doctor-confirmed stage yet.**

### Box 2 — Information collected in the Navigator

Example:

- Tumor: invasive melanoma
- Breslow thickness: 1.2 mm
- Ulceration: absent
- T category: may fit T2a under the reviewed staging ruleset
- Sentinel lymph node biopsy: not yet done
- Distant spread: not reported to you
- Overall stage: not finalized

This distinction prevents the Navigator from appearing to overrule the physician.

---

# 25. “Why Isn’t My Stage Final Yet?” Screen

This should appear when staging information is incomplete.

Possible reasons:

- pathology information is missing
- surgery has not yet occurred
- sentinel lymph node biopsy is still being considered or is pending
- lymph node pathology is pending
- imaging is pending
- the treating physician has not finalized staging

Patient-facing text:

**It is common for melanoma staging to become clearer as additional information is collected.**

---

# 26. Questions to Ask My Doctor

Generate a personalized checklist based on missing information.

Examples:

- What is my current melanoma stage?
- Is this a clinical stage or a pathologic stage?
- What is my T category?
- Do my Breslow thickness and ulceration affect my T category?
- Do I need to discuss sentinel lymph node biopsy?
- If I already had SLNB, was it positive or negative?
- Is there any evidence of in-transit, satellite, or microsatellite disease?
- Do I need any additional tests before my stage is final?
- Has melanoma spread anywhere outside the original site?
- Is my stage final, or could it change after surgery or additional testing?

Allow:
**Print / save my questions**

---

# 27. Step 2 Completion States

## Complete
Use when:
- patient has reviewed T, N, and M
- doctor-reported stage captured OR explicitly marked unknown
- outstanding staging questions are summarized
- patient reviewed final staging summary

Status:
`complete`

Important:
“Complete” means the patient completed the educational Navigator step.

It does **not** mean the melanoma stage is medically finalized.

---

## Waiting
Examples:
- surgery pending
- SLNB pending
- pathology pending
- imaging pending
- doctor has not finalized stage

Status:
`waiting_for_staging_information`

---

## Needs Clarification
Examples:
- patient reports Stage I but also reports a positive lymph node
- patient reports Stage 0 but also reports invasive melanoma
- patient reports no distant spread but separately reports melanoma in the liver or brain
- Step 1 values conflict with clinician-reported information

Status:
`needs_clinician_clarification`

Never tell the patient which entry is “wrong.”

---

# 28. Staging Consistency Checks

These checks are for UX safety, not diagnosis.

Examples:

### Rule
If:
`invasion_category = in_situ`
AND
`doctor_reported_stage = Stage III`

Then:
Show:

**The information entered does not fit together in the way the staging framework is usually described. Please review the entries and ask your doctor to confirm your stage.**

### Rule
If:
`positive_slnb = true`
AND
`doctor_reported_stage = Stage I`

Show the same neutral clarification message.

### Rule
If:
`distant_metastasis_reported = true`
AND
`doctor_reported_stage != Stage IV`

Show clarification message.

Do not correct the stage automatically.

---

# 29. Carry-Forward Data for Step 3

```ts
type MelanomaStagingSummary = {
  doctorReportedStage?: string;
  stageTypeKnown?: "clinical" | "pathologic" | "unknown";

  definitiveSurgeryStatus?:
    | "completed"
    | "not_completed"
    | "unknown";

  invasionCategory?:
    | "in_situ"
    | "invasive"
    | "unknown";

  breslowMm?: number;
  ulceration?: "present" | "absent" | "unknown";

  tCategory?: string;
  tCategoryStatus?:
    | "doctor_confirmed"
    | "navigator_educational_estimate"
    | "unknown";

  slnbStatus?:
    | "not_discussed"
    | "not_needed_per_doctor"
    | "considering"
    | "scheduled"
    | "negative"
    | "positive"
    | "unknown";

  clinicallyDetectedNode?: "yes" | "no" | "unknown";

  regionalDiseaseTerms?: string[];

  distantMetastasisReported?:
    | "yes"
    | "no"
    | "unknown"
    | "not_evaluated";

  distantSites?: string[];

  imagingStatus?: string[];

  navigatorStageEstimate?: string;
  navigatorStageEstimateStatus?:
    | "available"
    | "incomplete"
    | "not_enabled";

  outstandingQuestions?: string[];

  status:
    | "complete"
    | "waiting_for_staging_information"
    | "needs_clinician_clarification";
};
```

---

# 30. What Step 2 Must NOT Do

Do not:

- claim to medically stage the patient
- infer N0 because no enlarged lymph node was noticed by the patient
- infer M0 because the patient has not had imaging
- tell a patient that SLNB is required
- tell a patient that SLNB is unnecessary based on an unreviewed rule
- recommend CT, PET/CT, MRI, or laboratory testing
- predict survival
- recommend treatment
- resolve contradictory information
- derive Stage III subgroup unless a current, physician-approved AJCC rule engine is intentionally implemented
- mix uveal, mucosal, or other non-cutaneous melanoma staging into this pathway unless separate modules are created

---

# 31. Important Scope Limitation

This Step 2 design is based on the book's discussion of cutaneous melanoma staging.

The book notes that melanoma can also arise in non-skin sites such as mucosal or uveal regions.

Therefore, if the user selects:

**My melanoma started in the eye / mucosal area / another non-skin site**

Route to:

`SPECIALIZED_MELANOMA_PATHWAY_REQUIRED`

Message:

**This Navigator pathway is designed for cutaneous melanoma. Staging for some other melanoma types uses different systems. Please discuss your specific staging system with your specialist.**

---

# 32. Suggested Visual Design

Top progress indicator:

**Mad Rush — Step 2 of 5**

Sub-progress:

1. Do I already know my stage? ✓
2. Understand T ●
3. Understand N ○
4. Understand M ○
5. Put it together ○
6. Questions for my doctor ○

For TNM, use three visually distinct cards with large letters:

**T**
Original tumor

**N**
Lymph nodes / nearby spread

**M**
Distant spread

Do not overwhelm the patient with full AJCC tables unless they click:

**Show me the detailed staging table**

---

# 33. Recommended Interaction Pattern

The ideal patient experience:

**Step 1 tells us:**
“Your melanoma is invasive, 1.2 mm, no ulceration.”

↓

**Step 2 says:**
“Those two findings help determine the T part of staging.”

↓

**Navigator explains T**

↓

**Navigator asks:**
“Have you had a sentinel lymph node biopsy?”

↓

**Patient:**
“Not yet.”

↓

**Navigator:**
“Your final pathologic stage may not yet be complete. Here is the question to ask your doctor.”

↓

**Patient receives:**
“What is my current stage, and could it change after sentinel lymph node biopsy?”

That is the Navigator behavior we want.

---

# 34. Analytics Events

Do not transmit actual stage, Breslow thickness, lymph-node status, organ involvement, or other medical values to general analytics.

Track only flow events such as:

- `melanoma_step2_started`
- `step2_doctor_stage_question_completed`
- `step2_t_section_completed`
- `step2_n_section_completed`
- `step2_slnb_education_viewed`
- `step2_m_section_completed`
- `step2_staging_summary_viewed`
- `melanoma_step2_completed`

Analytics should answer:

- How many people started Step 2?
- Where do users stop?
- How many view SLNB education?
- How many reach the staging summary?
- How many proceed to Step 3?

Not:
- What stage do they have?
- What is their Breslow thickness?
- Do they have metastatic disease?

---

# 35. Claude Code Implementation Instruction

When implementing Step 2:

1. Read `MAD_RUSH_STEP1_DEEP_SPEC.md` first.
2. Reuse the structured Step 1 pathology state.
3. Inspect the existing BeatingSkinCancer.com components and design system.
4. Build TNM as reusable components.
5. Separate clinical rules from UI code.
6. Put any staging rules in a versioned medical configuration file.
7. Every rule must include:
   - guideline/system name
   - edition/version
   - review date
   - clinician reviewer
   - status: draft / approved / retired
8. Never bury medical thresholds in React components.
9. Unknown must remain a first-class state.
10. Preserve doctor-reported stage separately from Navigator-derived educational estimates.
11. Add inconsistency checks but never auto-correct patient-entered medical information.
12. Keep the Step 2 summary printable and easy to show at a medical visit.

Suggested configuration structure:

```ts
type MedicalRuleSetMetadata = {
  source: string;
  edition: string;
  effectiveDate?: string;
  reviewedDate?: string;
  reviewedBy?: string;
  status: "draft" | "approved" | "retired";
};
```

---

# 36. Acceptance Criteria

Step 2 is ready for review when a test user can:

1. enter Step 2 from Step 1
2. state whether a doctor has already assigned a stage
3. understand clinical vs pathologic staging at a basic level
4. understand T, N, and M without reading a dense medical table
5. reuse pathology information from Step 1
6. understand why Breslow thickness and ulceration matter to T
7. understand what sentinel lymph node biopsy contributes to staging
8. record whether SLNB has been discussed, scheduled, negative, or positive
9. understand that nearby/regional melanoma findings can affect Stage III
10. record whether a physician has identified distant spread
11. understand that distant metastasis corresponds to Stage IV in the book's staging framework
12. see a clear staging summary
13. distinguish doctor-reported stage from Navigator educational output
14. see exactly which staging information is still missing
15. generate personalized questions for the physician
16. continue to Step 3 without Step 2 making treatment recommendations

---

# 37. Design Philosophy

The patient should enter Step 2 thinking:

**“I have no idea what Stage I, II, III, or IV really means.”**

And leave thinking:

**“I understand that my stage comes from the original tumor, lymph nodes, and whether there is distant spread. I know which pieces are already known, which are still pending, and what I need to ask my doctor.”**

That is the goal of Step 2.
