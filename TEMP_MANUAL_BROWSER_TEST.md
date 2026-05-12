# Manual Browser Test Checklist

Test at: `http://localhost:4200`  
Start the dev server first: `npm start`

Browsers to cover: **Chrome · Firefox · Safari · Edge**

---

## 1. Settings & Role Switching

| # | Test | Chr | FF | Saf | Edge |
|---|------|-----|----|-----|------|
| 1.1 | App loads and redirects to `/settings` | | | | |
| 1.2 | All 4 role buttons are visible and readable | | | | |
| 1.3 | Select **Lid** → lands on `/home` | | | | |
| 1.4 | Select **Ontvangs Personeel** → lands on `/reception` | | | | |
| 1.5 | Select **Mediese Personeel** → lands on `/member-form/medicalStaff` | | | | |
| 1.6 | Select **Sekuriteit** → lands on `/member-form/securityStaff` | | | | |

---

## 2. Dark Mode

| # | Test | Chr | FF | Saf | Edge |
|---|------|-----|----|-----|------|
| 2.1 | Toggle dark mode on — background turns dark | | | | |
| 2.2 | Member form overview: section icons are **white** in dark mode | | | | |
| 2.3 | Member form overview: section labels are **white** in dark mode | | | | |
| 2.4 | Toggle dark mode off — returns to light mode cleanly | | | | |

> **Known issue:** Item 2.2 and 2.3 may fail in **Firefox** (`:host-context` not supported there).

---

## 3. Member Form — Basiese Inligting

Navigate: Lid → `/home` → Basiese Inligting

| # | Test | Chr | FF | Saf | Edge |
|---|------|-----|----|-----|------|
| 3.1 | Page loads with all fields visible | | | | |
| 3.2 | Fill in Van + Volle Naam + ID Nommer — no errors | | | | |
| 3.3 | ID Nommer auto-extracts Geboortedatum, Geslag, Ouderdom | | | | |
| 3.4 | Lid Inligting fields visible below (Lid Nommer, Nood Kontak, etc.) | | | | |
| 3.5 | Tap **Voeg Afhanklike By** — new dependent card appears | | | | |
| 3.6 | Fill dependent fields — Verhouding, Van, Naam | | | | |
| 3.7 | Tap **Stoor** — success toast appears | | | | |
| 3.8 | Navigate away and back — data is still there | | | | |

---

## 4. Member Form — Other Sections

| # | Test | Chr | FF | Saf | Edge |
|---|------|-----|----|-----|------|
| 4.1 | Mediese Inligting loads and fields are usable | | | | |
| 4.2 | Toerusting loads — toggles work, sliders (kos/water/brandstof dae) work | | | | |
| 4.3 | Sekuriteits Inligting loads — toggles and selects work | | | | |
| 4.4 | Dokumente loads | | | | |
| 4.5 | Completed sections show filled (blue) icon on overview | | | | |

---

## 5. QR Code

| # | Test | Chr | FF | Saf | Edge |
|---|------|-----|----|-----|------|
| 5.1 | **Genereer QR Kode** button on overview is visible | | | | |
| 5.2 | Tapping it generates and displays a QR image | | | | |
| 5.3 | **Maak QR Kode Toe** dismisses it | | | | |
| 5.4 | On reception page: **Genereer QR Kode** works the same | | | | |
| 5.5 | QR scanner button shows graceful error (not a crash) in browser | | | | |

---

## 6. Reception Dashboard

Navigate: Ontvangs Personeel from settings

| # | Test | Chr | FF | Saf | Edge |
|---|------|-----|----|-----|------|
| 6.1 | Page loads (may show empty state if backend not running — that is fine) | | | | |
| 6.2 | Search bar is visible and accepting input | | | | |
| 6.3 | Settings gear icon navigates to `/settings` | | | | |
| 6.4 | With backend running: member list loads | | | | |
| 6.5 | With backend running: search filters the list | | | | |

---

## 7. Data Persistence (IndexedDB)

| # | Test | Chr | FF | Saf | Edge |
|---|------|-----|----|-----|------|
| 7.1 | Fill in Basiese Inligting and save | | | | |
| 7.2 | Hard-refresh the page (`Cmd+Shift+R`) | | | | |
| 7.3 | Navigate back to Basiese Inligting — data is still there | | | | |

> **Safari note:** If data disappears after refresh, Safari may have cleared IndexedDB storage (it can do this when it considers storage "non-persistent"). This is a known Safari limitation.

---

## Result Key

- ✅ Pass
- ❌ Fail (note what happened)
- ⚠️ Partial (works but looks wrong)
- — Not tested

---

## Known Issues (pre-confirmed from code analysis)

| Issue | Browsers affected |
|---|---|
| Dark mode section icons/labels stay grey (`:host-context` not supported) | Firefox |
| QR/Barcode scanner unavailable | All browsers (native only — error is expected) |
| WiFi auto-connect unavailable | All browsers (Android native only) |
