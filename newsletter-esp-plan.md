# Newsletter / Email Subscription Plan

Status: **decided, not yet implemented** — 0 subscribers as of 2026-09-06.
Owner: Steven Wang. Revisit before building the signup form.

---

## Current state (what exists today)

- The site has **no email storage of its own**. It is a static Astro site on **Vercel** (deployed from GitHub).
- Both subscribe entry points just link out to a hosted page:
  - `src/components/NewsletterPopup.astro` — the modal; "Subscribe Now" does `window.open(newsletterUrl, '_blank')`. No form on our side.
  - `src/components/Footer.astro` — same URL as a plain link.
- The URL is `https://newsletter.beatingskincancer.com/hp/Rj20gf-NywoxZFOkP_ZuaQ/signup`.
- `newsletter.beatingskincancer.com` is a CNAME to `cname.maileon.com` → the current provider is **Maileon** (XQueue GmbH, EU), bundled via the IONOS domain.
- Domain is registered at **IONOS**; DNS is at IONOS. Planned move to **Cloudflare** (nameservers + registrar), no fixed date — roughly 45 days out from early Sept 2026.

### Problems with today's setup
1. The popup opens the signup in a **new tab** on a hosted page — high friction, loses a large share of would-be subscribers.
2. `src/pages/privacy-policy.astro` (line ~29) mentions newsletter signup but never names a third-party processor or EU data processing. It will need updating for whichever ESP we use.

---

## DECISION: ESP = Resend

**Chosen provider: [Resend](https://resend.com).** Plan to send a 5-email welcome sequence on subscribe, plus ~1 broadcast per week to all subscribers.

### Why Resend works for this use case

| Need | Resend |
|---|---|
| 5-email welcome sequence | **Native.** [Automations](https://resend.com/features/automations) — event-triggered, multi-step, time delays in minutes/hours/days/weeks, conditional branching, "wait for event" steps. Free tier: 10,000 automation runs/month, unlimited steps. |
| ~1 email/week to all subscribers | **Native.** Broadcasts — send/schedule one email to an audience. Basic editor, fine for a text newsletter. |
| Unsubscribe / suppression | **Native.** Broadcasts handle unsubscribe flows automatically; dynamic suppression list; optional Topics for preferences. |
| Deliverability | Dedicated IP option with auto warm-up, DKIM/SPF/DMARC, blocklist monitoring, BIMI. |
| Signup form + double opt-in | **DIY.** No hosted/embeddable form. Build our own form + endpoint calling the Contacts API. Double opt-in is a pattern, not a toggle — Resend publishes a reference example: <https://github.com/resend/resend-double-opt-in-example> (add contact as `unsubscribed` → send confirmation email → click flips to `subscribed` and fires the automation). |

### Pricing notes (at our scale)
- Marketing free tier = **1,000 contacts**; next step ~$40/mo for 5,000 contacts.
- Transactional free tier = **3,000 emails/mo, capped at 100/day** — not a concern now; watch the daily cap only once the list is large enough that a weekly broadcast + concurrent sequence sends approach 100/day.

### When we'd reconsider (switch to MailerLite or Kit instead)
- If a **non-technical person** ends up managing campaigns, or
- If we want a **visual form builder** and a polished campaign editor out of the box.

Neither is the current constraint. Migrating away later is easy while the list is small (just an export).

---

## Migration ordering (IONOS → Cloudflare, + Resend)

Separate two things that get conflated:
- **Nameserver change** (DNS resolution moves to Cloudflare) — this is what could affect uptime.
- **Registrar transfer** (domain registration IONOS → Cloudflare) — paperwork; zero effect on resolution once nameservers are already at Cloudflare. Cloudflare Registrar *requires* Cloudflare nameservers, so it must come second anyway.

**Order: demo → Cloudflare DNS → verify → Resend → registrar transfer.**

Rationale: set up the Resend sending domain **once**, in its permanent home. Doing Resend first at IONOS means re-creating every DKIM/SPF/DMARC record perfectly during the DNS cutover (more records = more migration risk). With 0 subscribers there's no cost to waiting on email.

### Steps

1. **Demo first — change nothing.** Don't start the migration right before showing the site.
2. **Move DNS to Cloudflare:**
   - Add the domain as a zone in Cloudflare (free plan).
   - Let it import records, then **diff manually against the IONOS zone**. Records that must exist:
     - Apex `A` → Vercel's IP; `www` `CNAME` → Vercel's target. **Copy exact values from the Vercel dashboard** (Project → Settings → Domains) — Vercel has changed its IPs; don't use remembered values.
     - `newsletter` `CNAME` → maileon (keep until Resend replaces it).
     - Any `MX` / SPF / DKIM / DMARC `TXT` for mailboxes, plus verification `TXT` records.
   - Set the Vercel records to **grey cloud (DNS only)** — do **not** proxy Vercel through Cloudflare's orange cloud (double CDN, breaks Vercel TLS/analytics, redirect loops).
   - A day ahead: drop IONOS TTLs to 300s.
   - Change nameservers at IONOS → the two Cloudflare NS.
   - Verify HTTPS load from multiple locations. **Leave IONOS records in place ~1 week** — rollback = switch nameservers back.
   - Nothing to change inside Vercel (domain unchanged there; cert keeps auto-renewing as long as records match).
3. **Set up Resend** (once DNS is stable on Cloudflare):
   - Add Resend's DNS records; verify the domain.
   - Use a dedicated sending subdomain, e.g. `send.beatingskincancer.com`, to isolate sending reputation from the root domain.
   - Remove the old `newsletter` → maileon CNAME; cancel Maileon.
4. **Transfer the registrar** IONOS → Cloudflare whenever convenient (unlock domain, get EPP/auth code, initiate at Cloudflare, ~5–7 days). Invisible to visitors since nameservers are already at Cloudflare.

---

## The 5 recommendations: collection → compliance

### 1. Collection — what good looks like

- **Replace the new-tab popup with an inline, native form.** Email field + optional first name, submit in place, success message without navigating away. Place one in the footer, one in the popup, and ideally a contextual one at the end of disease articles.
- **Double opt-in (confirmed opt-in).** Subscriber clicks a link in a confirmation email before becoming active. Effectively required for EU/GDPR and the single biggest deliverability lever for a new list (bots and typos never get in). With Resend this is the DIY flow linked above.
- **Explicit consent, unchecked by default**, with a one-line purpose statement and a link to the privacy policy next to the button.
- **Minimal fields** — email only is fine; first name enables personalization. Every extra field lowers conversion.
- **Spam protection:** hidden honeypot field + the ESP's built-in captcha. Avoid a visible reCAPTCHA if possible.
- **Capture the source** (which page / which form) as a tag or hidden field — tells us what content drives signups and lets us tailor the welcome.
- **Never** buy lists, pre-check consent, or add people who only used a contact form.

### 2. Storage — ESP as the single system of record

- Keep **Resend** as the only place subscriber data lives. Do **not** mirror it into a spreadsheet or a separate DB — that just creates a second copy to keep in sync and secure.
- The only state we host is whatever the double-opt-in endpoint needs transiently (a pending-confirmation token). Once confirmed, the contact lives in Resend.
- If we build the signup endpoint on the planned Cloudflare stack: Cloudflare Worker (form handler + honeypot + source tag) → optional Cloudflare KV/D1 for the pending token → Resend Contacts API. Keep the Resend API key server-side only.

### 3. Architecture on the Astro/Vercel side

Two viable shapes — both keep the API key server-side and store nothing long-term locally:

- **A. Vercel serverless function** (`/api/subscribe`): our own styled form posts to it; it validates, checks the honeypot, adds the contact to Resend as `unsubscribed`, sends the confirmation email, returns JSON so we control success/error states. A second route (`/api/confirm`) handles the click, flips the contact to `subscribed`, and triggers the welcome automation. Simplest given the site is already on Vercel.
- **B. Cloudflare Worker** — same logic, lives with the future Cloudflare stack. Choose this only if/when we consolidate there.

Start with A (Vercel). Author templates with [React Email](https://react.email) (by Resend) if we want component-based emails.

### 4. How to use it — the sending plan

**Welcome sequence (Resend Automation, ~5 emails over ~2 weeks), triggered on confirmed opt-in:**

1. **Immediately** — Welcome + deliver a lead magnet (e.g. an "ABCDE self-check" PDF, or the site's discussion-guide checklists). Sets the expectation that emails contain useful things.
2. **Day 2** — Early detection: warning signs + link the image gallery.
3. **Day 5** — Prevention basics: sunscreen, shade, self-exams; link the relevant hub pages.
4. **Day 9** — "Newly diagnosed or worried about someone?" — melanoma / BCC / SCC hubs + the "questions to ask your doctor" library.
5. **Day 14** — Who's behind this: Dr. Wang + editorial board, how content is reviewed; set cadence expectations ("about one email a month" — adjust to match reality).

**Ongoing:** the weekly broadcast. Better one genuinely useful email than several thin ones — if weekly content is hard to sustain, drop to biweekly/monthly.

**Segmentation:** tag by signup source (melanoma vs. prevention vs. AK). Lets later sends differ by interest.

**List hygiene:** after ~6 months, stop mailing people who have never opened, or send a single "still want these?" re-engagement email and remove non-responders. Protects deliverability for everyone else.

### 5. Compliance checklist (health content raises the bar)

- [ ] Every email includes a **physical mailing address** and a working **unsubscribe link**; opt-outs honored automatically (Resend Broadcasts do this — don't override).
- [ ] **Double opt-in** live before any real collection; store the **consent record** (timestamp, IP, form source). Resend stores this — don't disable it.
- [ ] Every email footer carries a **medical disclaimer**: "Educational information only — not medical advice. Consult a physician." Consistent with the site's on-page disclaimer boxes.
- [ ] **Update `src/pages/privacy-policy.astro`**: name the processor (Resend / Resend, Inc.), link its DPA, state the legal basis (consent), state where data is processed, and retention. Remove/replace any mention of the old provider.
- [ ] No sharing or selling the list — state this explicitly in the privacy policy.
- [ ] Re-confirm or cleanly retire the Maileon list (currently 0 subscribers, so nothing to migrate — just cancel Maileon after Resend is live).
- [ ] `List-Unsubscribe` header present on sequence emails too (not just broadcasts) — verify in the Automation setup; check the suppression list before every send.

---

## Open items / next actions

1. Do the Cloudflare DNS move after the upcoming demo (see ordering above).
2. Set up Resend on `send.beatingskincancer.com` once DNS is stable.
3. Build the inline signup form + `/api/subscribe` + `/api/confirm` on Vercel; replace the new-tab popup behavior in `NewsletterPopup.astro` and `Footer.astro`.
4. Write the 5 welcome emails + first month of weekly content.
5. Update `privacy-policy.astro` per the compliance checklist.
6. Cancel Maileon; remove the `newsletter` → maileon DNS record.
7. Complete the registrar transfer to Cloudflare when convenient.
