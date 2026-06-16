# Suidlanders App — Status & TODO

This is the single source of truth for where the project stands and what remains.
It is a **proof of concept (POC)** being handed over to Suidlanders to take further.

> Architecture and how things work: see [`README.md`](./README.md), [`docs/architecture.md`](./docs/architecture.md), and [`BACKEND.md`](./BACKEND.md).
> How to test every part of the app: see [`docs/testing/`](./docs/testing/).

---

## Handover acceptance goals

The handover is considered ready when:

1. **It works in a real-world environment** — a full camp dry-run on the Raspberry Pi (offline, WiFi AP mode) has been completed using the guides in `docs/testing/`.
2. **There are no outdated documents** — every doc in the repo reflects how the app actually behaves today.
3. **There are no unnecessary files** — no unused code, scratch files, or stale config ships in the handover.

---

## Status — Done ✅

- Member registration form — 9 sections (address merged into Basic Info)
- Offline database — SQLite on Android, IndexedDB on web/desktop
- QR code generation and scanning
- HTML export of member data
- Camp server (NestJS + SQLite + Red/Green triage logic)
- LAN sync via QR provisioning (WiFi auto-connect on Android + token exchange)
- Reception staff dashboard (privacy-enforced — no medical data)
- Journey selector on the Settings page (4 roles: Member, Reception, Medical, Security)
- Medical Staff triage page with clinical assessment fields
- Security Information section (member-facing weapon/security fields)
- Brand colour system (`brand.scss` → `variables.scss`, light/dark mode)
- Dark-mode white icons/labels on home and member-form overview

---

## Status — Remaining / Known gaps

### Functionality
- [ ] **Camp colour triage UI** — surface Red/Green assignment visually for staff/members
- [ ] **People without phones at reception** — a flow for registering members who have no device
- [ ] **Required fields** — decide and enforce which fields are mandatory before a member counts as "registered"
- [ ] **Wire staff pages to member DB records** — Medical/Security staff pages currently capture data standalone; connect them to the member they are assessing
- [ ] **Member QR card** — make the generated member QR a proper printable card (currently a bare QR image)
- [ ] **Reception QR lookup** — let reception scan a member's personal QR to pull up their record
- [ ] **Security Staff page content** — currently "under development" (`securityStaff` placeholder)
- [ ] **App sharing** — let one device share the app to another, for use at an entry gate:
  - QR code to share/install the app (scan from an official device or printed paper)
  - Share via Bluetooth
  - Share via a (mobile) hotspot QR
- [ ] **Backup / device recovery** — restore a member's data onto a lost or new phone

### Platform & compatibility
- [ ] **iOS WiFi auto-connect** — Android auto-connects to camp WiFi; iOS still needs manual connection
- [ ] **Cross-browser validation** — Chrome / Firefox / Safari / Edge (see `docs/testing/08-browser-and-device-matrix.md`)
- [ ] **Cross-device validation** — different phone types / screen sizes

### Authentication & RBAC (in progress — `feature/auth` branch)
- [x] **Backend auth** — `accounts` table, JWT login (`/api/auth/login`), `JwtAuthGuard` + `RolesGuard`, guarded member-read endpoints, `npm run seed:users`. Roles: member/reception/medical/security/admin.
- [x] **Frontend wiring** — role-aware `roleGuard`, role captured from login, interceptor token-selection fix, login page (error UI + role redirect). Demo switcher honoured in `demoMode`, real login required in production.
- [x] **Member account-creation UI** — optional recovery-account card on the member-form overview (email pre-filled + editable).
- [x] **Reception device-token UI** — admin in-app action (Settings) provisions the device as a reception kiosk.
- [ ] **Device-recovery restore flow** — the member account exists; restoring data onto a new phone from it is separate.
- [ ] **Credential hardening** — member login uses **email + ID number** (POC choice; ID isn't secret). The hashing means it can be swapped for a member-chosen PIN with no schema change. Also: rotate the default seeded staff passwords and set a real `JWT_SECRET` on the Pi.

### Production-readiness (decisions for the new owner)
- [ ] **`demoMode` for production** — `environment.prod.ts` has `demoMode: true`, so a production build still boots into the `/settings` demo role-switcher and the role guards run in demo (bypass) mode. Set to `false` to switch to real login enforcement for a handover.
- [ ] **Security** — investigate stronger at-rest/in-transit protections for sensitive fields (the original notes mentioned blockchain-style encryption — scope this realistically before committing)

---

## Code-cleanup backlog (intentionally NOT done on the docs-cleanup branch)

These were identified during the documentation cleanup but left for a separate, code-focused branch so each change can be reviewed and smoke-tested in isolation:

- [ ] **Dev/debug routes** — decide whether to keep or remove `/db-test`, `/qr-test`, `/qr-debug`, and the auth-gated `/data-viewer` for the handover. They are useful for diagnostics but are developer tools.
- [ ] **`AddressInfo` / `OtherInfo` data tables** — the *UI components* for these were removed (address is merged into Basic Info; "Other" is unused), but the `AddressInfo`/`OtherInfo` interfaces, Dexie tables (`indexed-db.service.ts`), and export logic (`export.service.ts`) are still present. Decide whether to migrate the data model to drop them, or keep for backward compatibility.

---

## Already cleaned up (for reference)

Done on the `chore/documentation-cleanup` branch:
- Removed stale docs: `DOCUMENTATION_STATUS.md`, `TESTING.md` (pointed at a backend repo that no longer exists), and the `TEMP_*` scratch files.
- Created the verbose, non-technical testing suite under `docs/testing/`.
- Consolidated the duplicate backend docs (`BACKEND.md` is authoritative; `backend/README.md` is a short quick-start).
- Deleted confirmed-unused code: `qr-generator` component, the legacy monolithic `member-form.component.ts`, the `address-info`/`other-info` UI components, and `src/assets/test-data.json`.
