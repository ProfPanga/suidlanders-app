# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Suidlanders Emergency Plan App — a monorepo containing:
- **Frontend**: Ionic/Angular mobile app (`src/`)
- **Backend**: NestJS camp server API (`backend/`)

Built for 100% offline operation in emergency camp scenarios. Members register via the app; data syncs to a local Raspberry Pi server over LAN.

**Tech Stack**: Angular 19, Ionic 8, Capacitor 7, TypeScript (frontend) · NestJS 10, SQLite, TypeORM (backend)

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
- `export.service.ts` — HTML export and data formatting
- `theme.service.ts` — dark/light mode

### Member Form Structure
10 sections, all in `src/app/components/sections/`, each implementing `ControlValueAccessor` for reactive form integration:
1. Basic Info, 2. Member Info, 3. Address Info, 4. Medical Info, 5. Vehicle Info
6. Skills Info, 7. Equipment Info, 8. Inventory, 9. Camp Info, 10. Documents Info

### Database Schema (11 tables)
`members`, `addresses`, `medical_info`, `vehicles`, `dependents`, `skills`, `equipment`, `inventory`, `camps`, `documents`, `sync_queue`

Sensitive fields are encrypted with CryptoJS. Sync queues changes through `sync_queue` and uses timestamp-based conflict resolution.

### Backend (`backend/`)
NestJS app using SQLite (`data/camp.db`) + TypeORM. Key modules:
- `MembersController/Service` — member CRUD + triage logic
- `CampAuthController/Service` — generates short-lived sync codes, exchanges them for tokens
- `TriageService` — assigns members to Red/Green camp based on criteria

## Camp Sync Flow

1. Staff calls `POST /api/auth/camp/init` → backend returns QR payload with WiFi credentials + `serverUrls[]` + sync code
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

## Android Build Process

Angular outputs to `www/browser/` but Capacitor expects `www/`. The `buildAndroid` script handles this:
```bash
ionic build                               # → www/browser/
mv www/browser/* www/ && rmdir www/browser
npx cap sync android
cd android && ./gradlew clean assembleDebug
```

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
