# 4. Medical Staff

**Goal:** confirm the medical triage assessment page loads and all its fields work.

**Who:** the **Mediese Personeel** (medical staff) role.
**Backend needed?** No — the page works on its own. (Connecting these answers to a specific member's record is **planned future work** — see [`../../TODO.md`](../../TODO.md).)

---

## What this page is for

This is a **clinical triage questionnaire** for medical staff to assess a person — gait, neck/headache, fever, breathing, stomach/GI symptoms, diabetic status, when they last ate/drank, water source, and free-text medical notes. It is in Afrikaans.

---

## Getting there

From Settings, tap **Mediese Personeel**. You land directly on the medical triage page (titled **Mediese Personeel**).

---

## Test A — The page loads and scrolls

| # | Step | Expected result |
|---|------|-----------------|
| A.1 | Open the medical staff page | The form loads with many assessment fields |
| A.2 | Scroll from top to bottom | The whole questionnaire scrolls smoothly; nothing is cut off |
| A.3 | The header back button goes back to the member form | Tapping back returns you to `/member-form` |

---

## Test B — The fields work

You don't need clinical knowledge — just confirm each **type** of control responds.

| # | Step | Expected result |
|---|------|-----------------|
| B.1 | Open a **dropdown** (e.g. "Hoe loop die pasiënt?" — gait) | Options appear (Regop, Kreupel, Vooroor gebuig, Gedra) and one can be selected |
| B.2 | Use a **Ja / Nee** (Yes/No) dropdown (e.g. "Koorsig?" — feverish) | You can pick Ja or Nee |
| B.3 | Type into a **text** field (e.g. "Hoe lank (koors)?") | Text is accepted |
| B.4 | Type into a **notes** box (e.g. "Mediese Notas" at the bottom) | The box grows as you type multiple lines |
| B.5 | Try the diabetic section (Diabeet? → behandeling → medikasie) | The related dropdowns all respond |

> **Result:** ✅ if every type of field (dropdown, Yes/No, text, notes) accepts input.

---

## Known limitation

Right now this page captures the assessment **on its own** — it is not yet linked to the specific member being assessed, and the answers are not yet saved to the member's record. This is expected for the proof-of-concept and is tracked as remaining work in [`../../TODO.md`](../../TODO.md). For now, this guide only verifies that the page and its fields function.

---

Next: [5. Security staff](./05-security-staff.md)
