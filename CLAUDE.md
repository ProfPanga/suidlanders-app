# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Suidlanders Emergency Plan App — a monorepo containing:
- **Frontend**: Ionic/Angular mobile app (`src/`)
- **Backend**: NestJS camp server API (`backend/`)

Built for 100% offline operation in emergency camp scenarios. Members register via the app; data syncs to a local Raspberry Pi server over LAN.

**Tech Stack**: Angular 19, Ionic 8, Capacitor 7, TypeScript (frontend) · NestJS 10, SQLite, TypeORM (backend)

**Status & roadmap**: see [`TODO.md`](./TODO.md) (this is a POC being prepared for handover). **Manual testing guides** (non-technical, cover every part of the app): see [`docs/testing/`](./docs/testing/).

## Common Commands

### Frontend
```bash
npm start                   # Dev server at localhost:4200
npm run build               # Production build (also fixes www/browser → www)
npm test                    # Run all unit tests (Karma/Jasmine)
ng test --include="**/database.service.spec.ts"  # Run a single test file
npm run lint
npm run buildAndroid        # Full Android APK build (see Android Build section)
```

### Backend
```bash
cd backend
npm install                 # First time only
npm run seed                # Create demo data (6 members: 2 Red, 4 Green camp)
npm start                   # Start server at localhost:3000
```

### Asset Generation
```bash
npm run assets:generate       # Android assets from resources/icon.png (1024×1024)
npm run assets:generate:all   # Android + iOS
```

## Architecture Overview

### Offline-First Design
- **100% offline operation** — designed for emergency camp scenarios with no internet
- **LAN sync via QR** — staff generates QR with WiFi credentials + server URLs + sync token; devices scan and auto-connect
- **USB fallback** — encrypted export/import bundles when networking unavailable
- **Dual database**:
  - Mobile → SQLite via `@capacitor-community/sqlite`
  - Web/Desktop → IndexedDB via Dexie
  - Detection is automatic based on `Platform.is('desktop' | 'mobileweb')`

### User Modes
- **Guest mode** — members register without login; `home` and `member-form` routes are publicly accessible
- **Staff mode** — login required for `data-viewer` and other protected routes; uses JWT via `AuthGuard`

### Demo / Dev Roles (`demoMode: true`)
Both `environment.ts` and `environment.prod.ts` have `demoMode: true`. The app starts at `/settings` where you pick a journey:
- **Lid** → `/home` → `/member-form`
- **Ontvangs Personeel** → `/reception`
- **Mediese Personeel** → `/member-form/medicalStaff`
- **Sekuriteit Personeel** → `/member-form/securityStaff`

Roles are managed by `RoleService` (`src/app/services/role.service.ts`) with `UserRole` enum: `MEMBER | RECEPTION_STAFF | MEDICAL_STAFF | SECURITY_STAFF`. Role is persisted to `localStorage`.

### Service Layer (`src/app/services/`)
- `database.service.ts` — abstraction layer switching SQLite ↔ IndexedDB; **always use this, never access storage directly from components**
- `sync.service.ts` — LAN data sync with camp server (auto-sync every 5 min)
- `sync-queue.service.ts` — queue-based offline sync with timestamp conflict resolution
- `indexed-db.service.ts` — Dexie wrapper
- `api.service.ts` — HTTP client for camp server
- `qr-provisioning.service.ts` — orchestrates QR scan → WiFi connect → token exchange → sync flow
- `qr.service.ts` — QR code generation/scanning
- `auth.service.ts` — JWT + short-lived sync tokens
- `role.service.ts` — guest/staff role management
- `member-form-state.service.ts` — in-memory cache of the current member entry shared across the form section pages
- `export.service.ts` — HTML export and data formatting
- `theme.service.ts` — dark/light mode

### Member Form Structure
9 section cards on the overview in `src/app/components/sections/`, each implementing `ControlValueAccessor` for reactive form integration. Address fields are merged into Basic Info (no separate Address section).

| Key | Label | Notes |
|---|---|---|
| `basicInfo` | Basiese Inligting | Includes address, member info (lid nommer, nood kontak), and dependents — all on one page |
| `required-fields` | Verpligte Velde | Info page — no form component |
| `medicalInfo` | Mediese Inligting | Member-facing fields only (vaccines, chronic, allergies, etc.) |
| `vehicleInfo` | Voertuig Inligting | |
| `skillsInfo` | Vaardighede | |
| `equipmentInfo` | Toerusting | Communications, power, water, camping, emergency supplies — defence/weapon fields removed |
| `campInfo` | Kamp Inligting | |
| `documentsInfo` | Dokumente | |
| `sekuriteitsInfo` | Sekuriteits Inligting | Member-facing weapon/security fields (vuurwapen, lisensie, skietervaring, opleiding) |

**Embedded sections** (not standalone cards — rendered inside `basicInfo` page):
- `memberInfo` — lid nommer, reddings verwysing, nood kontak details
- `dependents` — family members; "Voeg Afhanklike By" button at bottom of basicInfo

**Staff-only routes** (no form component — triage fields only):
- `/member-form/medicalStaff` — clinical triage fields (gait, vitals, symptoms, etc.)
- `/member-form/securityStaff` — security personnel questionnaire (content TBD)

### Database Schema (mobile/local — 12 tables)
The device-local store (SQLite on Android, IndexedDB/Dexie on web) is normalized:
`members`, `basic_info`, `member_info`, `address_info`, `medical_info`, `vehicle_info`, `skills_info`, `equipment_info`, `camp_info`, `other_info`, `documents`, `dependents`. Full field-level definition: [`src/app/database/schema.md`](src/app/database/schema.md).

The **backend camp server** is separate — a single flat `members` table (one TypeORM entity), not this schema.

Sensitive fields are encrypted with CryptoJS. The offline sync queue is persisted in `localStorage` (key `sync_queue`) by `SyncQueueService` and uses timestamp-based conflict resolution.

### Backend (`backend/`)
NestJS app using SQLite (`data/camp.db`) + TypeORM. Key modules:
- `MembersController/Service` — member CRUD + triage logic
- `CampAuthController/Service` — generates short-lived sync codes, exchanges them for tokens
- `TriageService` — assigns members to Red/Green camp based on criteria

## Camp Sync Flow

1. Staff calls `POST /api/auth/camp/generate-qr` → backend returns QR payload with WiFi credentials + `serverUrls[]` + sync code
2. App scans QR → `QRProvisioningService.scanAndProvision()` orchestrates:
   - Connects to camp WiFi via `@falconeta/capacitor-wifi-connect` (Android only; iOS needs manual WiFi)
   - Tests `serverUrls` sequentially (10s timeout each) until one responds
   - Exchanges code for sync token via `CapacitorHttp.post()` ← **must use CapacitorHttp, not HttpClient**
   - Triggers `SyncService` sync
   - Clears token after sync (base URL kept for future syncs)

**Why CapacitorHttp?** Angular `HttpClient` is subject to WebView CORS policies. `CapacitorHttp` uses the native HTTP stack, bypassing WebView restrictions that cause `"Http failure response: 0 Unknown Error"` on LAN requests.

## Testing & Debugging

Built-in test routes (no auth required):
- `/db-test` — database connection and CRUD testing
- `/qr-test` — QR code generation/scanning
- `/qr-debug` — full provisioning debug (health check, generate codes, test exchange)
- `/data-viewer` — inspect stored members (requires staff login)

**Local QR provisioning test** (no physical device needed):
1. `cd backend && npm start`
2. `npm start` (frontend at localhost:4200)
3. Navigate to `/qr-debug`

Always update these test components when modifying related services.

For end-user / handover testing (non-technical, step-by-step, covering every feature), see [`docs/testing/`](./docs/testing/).

## Android Build Process

Angular outputs to `www/browser/` but Capacitor expects `www/`. The `buildAndroid` script handles this:
```bash
ionic build                               # → www/browser/
mv www/browser/* www/ && rmdir www/browser
npx cap sync android
cd android && ./gradlew clean assembleDebug
```

## Theme & Brand System

Colours live in two files — edit `brand.scss` first, then mirror the change in `variables.scss`:

| File | Purpose |
|---|---|
| `src/theme/brand.scss` | Single source of truth — all `--color-brand-*` and `--color-neutral-*` CSS variables |
| `src/theme/variables.scss` | Maps brand values to Ionic's system (`--ion-color-primary` etc.) using **literal hex values** |

**Important:** `variables.scss` must use literal hex/rgb values, not `var(--color-brand-*)` chains. Ionic's Shadow DOM CSS cannot reliably resolve chained custom properties. When you change a colour in `brand.scss`, update the matching line in `variables.scss` too.

Both files are imported in `src/global.scss`. Only `global.scss` appears in `angular.json` styles — do not add `variables.scss` as a separate entry.

Light mode `ion-item` background is set globally in `global.scss` to `var(--color-neutral-grey-80)` so form fields have a consistent grey appearance matching dark mode.

## Development Guidelines

### Language Consistency
- **UI and validation messages**: Afrikaans
- **Code, comments, variable names**: English

### Code Changes
- Focus only on the specific feature/bug — do not touch unrelated code
- Suggest improvements before implementing them
- Follow the pattern of existing form section components

### Educational Approach
The project owner is a **junior developer**. Always explain the reasoning behind architectural decisions and break complex concepts into simple steps.
