# Source Tree Analysis - Suidlanders Emergency Plan App

## Overview

This document provides an annotated directory tree showing the project structure and the purpose of each major folder.

**Project Type:** Monolith (single cohesive mobile application)
**Architecture:** Ionic/Angular/Capacitor mobile app with offline-first design

---

## Root Directory Structure

```
suidlanders-app/
├── src/                          # Source code (Angular application)
├── android/                      # Android native platform (Capacitor)
├── resources/                    # Asset generation source files
├── docs/                         # Generated project documentation (this folder)
├── _bmad-output/                 # BMAD workflow artifacts
├── .vscode/                      # VS Code workspace settings
├── .cursor/                      # Cursor IDE configuration
├── .claude/                      # Claude Code configuration
├── package.json                  # Node.js dependencies and scripts
├── angular.json                  # Angular CLI configuration
├── capacitor.config.ts           # Capacitor native bridge configuration
├── ionic.config.json             # Ionic framework configuration
├── tsconfig.json                 # TypeScript compiler configuration
├── karma.conf.js                 # Karma test runner configuration
├── README.md                     # Project overview and setup guide
├── CLAUDE.md                     # Claude Code development guidelines
└── TESTING.md                    # Testing documentation
```

---

## Source Code (`src/`)

The main application source code following Angular + Ionic architecture patterns.

### Application Structure

```
src/
├── app/                          # Angular application root
│   ├── components/               # Reusable UI components
│   │   ├── sections/             # Form section components (member registration)
│   │   │   ├── basic-info/       # Personal/contact info section
│   │   │   ├── member-info/      # Suidlander-specific data + emergency contacts
│   │   │   ├── address-info/     # Residential location + GPS
│   │   │   ├── medical-info/     # Blood type, conditions, medication
│   │   │   ├── vehicle-info/     # Vehicles and trailers
│   │   │   ├── skills-info/      # Occupation, qualifications, licenses
│   │   │   ├── equipment-info/   # Communication, power, water, defense gear
│   │   │   ├── other-info/       # Additional notes and supplies
│   │   │   ├── camp-info/        # Camp location and arrival
│   │   │   ├── documents-info/   # ID, licenses, certificates (file upload)
│   │   │   ├── dependents/       # Dependent information (Phase 2)
│   │   │   └── member-form/      # Parent container coordinating all sections
│   │   ├── header/               # App header with navigation
│   │   ├── theme-toggle/         # Dark/light mode toggle
│   │   ├── qr-generator/         # QR code generation (member cards, provisioning)
│   │   ├── qr-scanner/           # QR code scanning (device provisioning)
│   │   ├── data-viewer/          # Member data inspection tool
│   │   └── db-test/              # Database testing component
│   ├── pages/                    # Route-based page components
│   │   ├── home/                 # Main page with member form
│   │   ├── login/                # Authentication page (staff/admin)
│   │   └── qr-test/              # QR functionality testing page
│   ├── services/                 # Business logic layer
│   │   ├── database.service.ts   # Dual-database abstraction (SQLite ↔ IndexedDB)
│   │   ├── api.service.ts        # HTTP client for camp server
│   │   ├── auth.service.ts       # JWT + sync token management
│   │   ├── sync.service.ts       # Offline sync orchestration
│   │   ├── sync-queue.service.ts # Sync queue with conflict resolution
│   │   ├── indexed-db.service.ts # Dexie wrapper for IndexedDB
│   │   ├── export.service.ts     # HTML export and USB bundle creation
│   │   ├── qr.service.ts         # QR generation/scanning logic
│   │   └── theme.service.ts      # Theme management (dark/light mode)
│   ├── guards/                   # Route guards
│   │   └── auth.guard.ts         # Authentication route protection
│   ├── interfaces/               # TypeScript type definitions
│   │   └── form-sections.interface.ts  # Form data interfaces
│   ├── database/                 # Database schemas and migrations
│   │   └── schema.md             # Database schema documentation
│   └── http/                     # HTTP interceptors
│       └── auth.interceptor.ts   # JWT token injection
├── assets/                       # Static assets
│   ├── icon/                     # App icons
│   └── images/                   # Images and graphics
├── environments/                 # Environment configurations
│   ├── environment.ts            # Development environment
│   └── environment.prod.ts       # Production environment
├── theme/                        # Ionic theme customization
│   └── variables.scss            # CSS custom properties (theming)
├── global.scss                   # Global styles
├── index.html                    # HTML entry point
├── main.ts                       # Angular bootstrap
├── polyfills.ts                  # Browser polyfills
├── test.ts                       # Test configuration
└── zone-flags.ts                 # Zone.js configuration
```

---

## Critical Directories Explained

### `/src/app/services/` - Service Layer
**Purpose:** Business logic, data access, and external communication

**Key Services:**
- `DatabaseService`: Platform-aware database abstraction
  - Mobile: SQLite via Capacitor
  - Web: IndexedDB via Dexie
  - Automatic fallback on errors
  - Encryption with CryptoJS
- `SyncService`: Offline-first sync with 5-minute auto-sync
- `ApiService`: REST API client for camp server
- `AuthService`: JWT + short-lived sync token management

**Pattern:** Singleton services (providedIn: 'root')

---

### `/src/app/components/sections/` - Form Sections
**Purpose:** Modular form sections for member registration

**Pattern:**
- All implement `ControlValueAccessor`
- Integrated into `MemberFormComponent` via reactive forms
- Each section maps to a database table
- Ionic UI components (ion-item, ion-input, etc.)
- Afrikaans UI language

**Sections (12 total):**
1. **basic-info**: Personal/contact data
2. **member-info**: Emergency contacts + qualifications
3. **address-info**: Location + GPS
4. **medical-info**: Health information
5. **vehicle-info**: Vehicles (multi-entry)
6. **skills-info**: Occupation + licenses
7. **equipment-info**: Gear inventory (checkboxes)
8. **other-info**: Additional notes
9. **camp-info**: Camp assignment
10. **documents-info**: File uploads (PDF/JPG/PNG)
11. **dependents**: Dependent information (new)
12. **member-form**: Parent container

---

### `/src/app/pages/` - Route Pages
**Purpose:** Top-level routed components

**Routes:**
- `/home` - Main registration form
- `/login` - Staff/admin authentication
- `/qr-test` - QR functionality testing

---

### `/src/app/database/` - Database Layer
**Purpose:** Database schema definitions and migration logic

**Contents:**
- `schema.md` - Complete database schema documentation (11 tables)
- Migration scripts (managed by DatabaseService)

---

### `/android/` - Android Platform
**Purpose:** Native Android application wrapper (Capacitor)

**Key Files:**
- `app/build.gradle` - Android build configuration
- `app/src/main/AndroidManifest.xml` - App manifest
- `app/src/main/res/` - Android resources (icons, splash screens)

**Build Process:**
1. Angular builds to `www/browser/`
2. Script moves to `www/` (Capacitor requirement)
3. `cap sync android` syncs web assets
4. Gradle builds APK

---

### `/resources/` - Asset Sources
**Purpose:** Source files for asset generation

**Contents:**
- `icon.png` - App icon source (1024x1024)
- `README.md` - Asset generation instructions

**Workflow:**
```bash
npm run assets:generate        # Android only
npm run assets:generate:all    # Android + iOS
```

Generates:
- Launcher icons (multiple densities)
- Splash screens (portrait/landscape)
- Adaptive icons (Android)

---

### `/docs/` - Generated Documentation
**Purpose:** AI-generated project documentation (this folder)

**Generated Files:**
- `project-scan-report.json` - Workflow state tracking
- `data-models.md` - Database schema documentation
- `api-contracts.md` - REST API endpoints
- `component-inventory.md` - UI components catalog
- `source-tree-analysis.md` - This file
- `index.md` - Master documentation index (generated last)

---

### `/_bmad-output/` - BMAD Workflow Artifacts
**Purpose:** BMad Method planning and implementation artifacts

**Structure:**
- `planning-artifacts/` - PRD, architecture, epics/stories
- `implementation-artifacts/` - Sprint status, test results

---

## Entry Points

### Application Bootstrap
**File:** `src/main.ts`
```typescript
platformBrowserDynamic().bootstrapModule(AppModule)
```

**Flow:**
1. `main.ts` bootstraps Angular
2. `AppModule` (or standalone app config) loads
3. Router initializes and loads first route
4. DatabaseService initializes (platform detection)
5. App ready for use

### Android Entry
**File:** `android/app/src/main/java/.../MainActivity.java`
- Extends `BridgeActivity` (Capacitor)
- Loads web view with `www/index.html`

---

## Build Outputs

### Development Build
```
www/
└── browser/          # Angular output (needs flattening for Capacitor)
```

### Production Build
```
www/                  # Flattened for Capacitor
├── index.html
├── main.*.js
├── polyfills.*.js
├── runtime.*.js
└── assets/
```

### Android APK
```
android/app/build/outputs/apk/debug/
└── app-debug.apk
```

---

## Configuration Files

| File | Purpose |
|------|---------|
| `package.json` | Node dependencies, npm scripts |
| `angular.json` | Angular CLI build configuration |
| `tsconfig.json` | TypeScript compiler options (ES2022, strict mode) |
| `capacitor.config.ts` | Native bridge configuration (appId, webDir) |
| `ionic.config.json` | Ionic framework settings |
| `karma.conf.js` | Karma test runner configuration |
| `.eslintrc.json` | ESLint rules and Angular-specific linting |

---

## Testing Structure

### Unit Tests
**Pattern:** `*.spec.ts` files alongside components/services

**Test Framework:** Jasmine + Karma

**Test Routes:**
- `/db-test` - Database CRUD testing
- `/qr-test` - QR generation/scanning testing
- `/data-viewer` - Data inspection

---

## Excluded Directories

These directories are excluded from source control and documentation:

```
.angular/          # Angular build cache
node_modules/      # npm dependencies (890 packages)
www/               # Build output (regenerated)
dist/              # Distribution builds
.npm-cache/        # npm cache
android/build/     # Android build artifacts
```

---

## Notes

- **Standalone Components**: Angular 19 pattern used throughout
- **Offline-First**: All functionality works without network
- **Dual-Database**: Automatic platform detection (SQLite vs IndexedDB)
- **Ionic UI**: Mobile-first design with Ionic components
- **Language**: UI in Afrikaans, code in English
- **TypeScript**: Strict mode enabled for type safety
