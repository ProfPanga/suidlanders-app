# 2. Member Registration (the "Lid" journey)

**Goal:** confirm a member can fill in their information, add dependents, save it, and that the information is still there later.

**Who:** the **Lid** (member) role.
**Backend needed?** No — registration works fully offline. (Syncing to the camp server is covered in [guide 6](./06-qr-and-camp-sync.md).)

---

## Getting to the member form

1. From the Settings screen, tap **Lid**. You land on **Home**.
2. On Home, tap the first card (**Lid Inligting** / **Opdateer Inligting**). This opens the **member form overview**.
3. The overview shows a grid of section cards:
   - Basiese Inligting · Verpligte Velde · Mediese Inligting · Voertuig Inligting · Vaardighede · Toerusting · Kamp Inligting · Dokumente · Sekuriteits Inligting
   - plus a **Genereer QR Kode** button.

> A section card shows a **filled/coloured icon** once it contains saved information — this is how a member sees what they have completed.

---

## Test A — Basiese Inligting (the most important section)

This section holds personal details, address, member info, **and** dependents — all on one page.

| # | Step | Expected result |
|---|------|-----------------|
| A.1 | Open **Basiese Inligting** | The page loads with all fields visible |
| A.2 | Fill in **Van** (surname), **Volle Naam**, and **ID Nommer** | No errors for valid entries |
| A.3 | Enter a valid 13-digit **ID Nommer** | The app auto-fills **Geboortedatum** (date of birth), **Geslag** (gender), and **Ouderdom** (age) from the ID number |
| A.4 | Scroll down to the **Lid Inligting** fields (Lid Nommer, Reddings Verwysing, Nood Kontak, etc.) | They are visible and editable |
| A.5 | Tap **Voeg Afhanklike By** ("Add dependent") at the bottom | A new dependent card appears |
| A.6 | Fill the dependent's **Verhouding** (relationship), **Van**, and **Naam** | Accepts the input |
| A.7 | Tap **Stoor** ("Save") | A green **"Gestoor"** ("Saved") message appears at the top |

> **Result:** ✅ if you saw the "Gestoor" message and no errors.

---

## Test B — The information persists

This proves the data is really stored, not just held on screen.

| # | Step | Expected result |
|---|------|-----------------|
| B.1 | After saving, go back to the overview | The **Basiese Inligting** card now shows as completed (coloured icon) |
| B.2 | Open **Basiese Inligting** again | All the values you entered (including the dependent) are still there |
| B.3 | **Refresh the whole page** in the browser (Ctrl/Cmd + Shift + R) | The app reloads |
| B.4 | Navigate back to **Basiese Inligting** | Your data is **still there** after the refresh |

> **Safari note:** if data disappears after a refresh in Safari specifically, Safari may have cleared local storage on its own. This is a known Safari limitation, not an app fault — note it and move on.

---

## Test C — The other sections

You don't need to fill every field; just confirm each section opens, lets you enter data, and saves.

| # | Section | Expected result |
|---|---------|-----------------|
| C.1 | **Mediese Inligting** | Loads; fields (vaccines, chronic conditions, allergies, etc.) are usable; **Stoor** works |
| C.2 | **Voertuig Inligting** | Loads and saves |
| C.3 | **Vaardighede** | Loads and saves |
| C.4 | **Toerusting** | Loads; on/off toggles and the day-sliders (food / water / fuel days) work; **Stoor** works |
| C.5 | **Kamp Inligting** | Loads and saves |
| C.6 | **Dokumente** | Loads (document upload area is visible) |
| C.7 | **Sekuriteits Inligting** | Loads; toggles and dropdowns (vuurwapen, lisensie, etc.) work; **Stoor** works |
| C.8 | **Verpligte Velde** | Opens as an information page (it explains required fields — there is nothing to save here) |
| C.9 | Back on the overview, each completed section shows a filled icon | Completed sections are visually distinct |

---

## Test D — Input validation (optional but recommended)

| # | Step | Expected result |
|---|------|-----------------|
| D.1 | In Basiese Inligting, enter an ID number that is **not** 13 digits | An Afrikaans error message appears (e.g. about the ID needing 13 digits) |
| D.2 | Enter an obviously invalid email in a field that takes email | An Afrikaans validation message appears |

---

Next: [3. Reception staff](./03-reception-staff.md)
