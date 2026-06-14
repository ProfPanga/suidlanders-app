# 8. Browser & Device Matrix

**Goal:** confirm the app works across the major web browsers and on real phones.

**Backend needed?** Optional — most of these checks are about the app's appearance and behaviour, which work without the backend.

Members may open the app on whatever device they have, so it needs to behave consistently. Run the key journeys from guides 2–6 in each browser and tick the boxes.

---

## How to use this guide

For each browser/phone, walk through the core flows and mark ✅ / ❌ / ⚠️ / —. The grids below give you the specific things to watch for. Test at **http://localhost:4200** (or the Pi address on a phone).

Browsers to cover: **Chrome · Firefox · Safari · Edge**

---

## 1. Settings & role switching

| # | Check | Chr | FF | Saf | Edge |
|---|-------|-----|----|-----|------|
| 1.1 | App loads and shows the Settings screen | | | | |
| 1.2 | All 4 role cards are visible and readable | | | | |
| 1.3 | **Lid** → lands on Home | | | | |
| 1.4 | **Ontvangs Personeel** → lands on Reception | | | | |
| 1.5 | **Mediese Personeel** → lands on the medical triage page | | | | |
| 1.6 | **Sekuriteit** → lands on the security page | | | | |

## 2. Dark mode

| # | Check | Chr | FF | Saf | Edge |
|---|-------|-----|----|-----|------|
| 2.1 | Turn dark mode on — the background turns dark | | | | |
| 2.2 | Member form overview: section icons are **white** in dark mode | | | | |
| 2.3 | Member form overview: section labels are **white** in dark mode | | | | |
| 2.4 | Turn dark mode off — returns to light mode cleanly | | | | |

> **Known issue:** 2.2 and 2.3 may **fail in Firefox** — Firefox does not support a CSS feature (`:host-context`) the app uses for this. This is a known limitation, not a regression.

## 3. Member form

| # | Check | Chr | FF | Saf | Edge |
|---|-------|-----|----|-----|------|
| 3.1 | Basiese Inligting loads with all fields | | | | |
| 3.2 | ID number auto-extracts birth date / gender / age | | | | |
| 3.3 | **Voeg Afhanklike By** adds a dependent card | | | | |
| 3.4 | **Stoor** shows the "Gestoor" success message | | | | |
| 3.5 | Toerusting toggles and day-sliders work | | | | |
| 3.6 | Completed sections show the filled icon on the overview | | | | |

## 4. QR code

| # | Check | Chr | FF | Saf | Edge |
|---|-------|-----|----|-----|------|
| 4.1 | **Genereer QR Kode** shows a QR image | | | | |
| 4.2 | Dismissing the QR works | | | | |
| 4.3 | The QR scanner shows a graceful error (not a crash) in a desktop browser | | | | |

## 5. Reception

| # | Check | Chr | FF | Saf | Edge |
|---|-------|-----|----|-----|------|
| 5.1 | Reception loads (empty state is fine if backend is off) | | | | |
| 5.2 | Search bar accepts input | | | | |
| 5.3 | With backend running: member list loads and search filters it | | | | |

## 6. Data persistence

| # | Check | Chr | FF | Saf | Edge |
|---|-------|-----|----|-----|------|
| 6.1 | Save Basiese Inligting | | | | |
| 6.2 | Hard-refresh the page (Ctrl/Cmd + Shift + R) | | | | |
| 6.3 | Data is still there afterwards | | | | |

> **Safari note:** if data disappears after refresh, Safari may have cleared local (IndexedDB) storage on its own when it considered the storage "non-persistent". Known Safari limitation.

---

## Phones (real devices)

| # | Check | Notes |
|---|-------|-------|
| P.1 | Open the app on an **Android** phone | Touch targets are big enough; the form is usable |
| P.2 | Open the app on an **iPhone** (Safari) | Same journeys work; note any layout issues |
| P.3 | Try one full registration on each phone type | Saves and persists |
| P.4 | (At camp / on the Pi) Android auto-connects to camp WiFi when scanning the QR | See [guide 7](./07-raspberry-pi-deployment.md) |
| P.5 | (At camp / on the Pi) iPhone requires connecting to camp WiFi by hand | Expected — iOS auto-connect is not yet built |

---

## Result key

✅ Pass · ❌ Fail (note what happened) · ⚠️ Partial (works but looks wrong) · — Not tested

## Known limitations (confirmed, not bugs to re-report)

| Limitation | Where |
|---|---|
| Dark-mode section icons/labels stay grey | Firefox only (`:host-context` unsupported) |
| QR/barcode camera scanner unavailable | All desktop browsers (works only in the installed mobile app) |
| WiFi auto-connect unavailable | All desktop browsers, and iPhone (Android native only) |
| Local data cleared after refresh | Safari only, occasionally (Safari storage policy) |

---

Back to the [testing index](./README.md).
