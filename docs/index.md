# Project Documentation Index

**Generated:** 2026-02-22
**Scan Type:** Exhaustive (all source files analyzed)
**Project:** Suidlanders Emergency Plan App

---

## Project Overview

**Type:** Monolith (single cohesive mobile application)
**Primary Language:** TypeScript
**Architecture:** Component-based (Angular) with offline-first mobile architecture

### Quick Reference

| Category | Technology | Version |
|----------|-----------|---------|
| **Framework** | Angular | 19.2.11 |
| **UI Library** | Ionic | 8.5.7 |
| **Mobile Bridge** | Capacitor | 7.2.0 |
| **Language** | TypeScript | 5.6.3 |
| **Mobile DB** | SQLite (@capacitor-community/sqlite) | 7.0.0 |
| **Web DB** | Dexie (IndexedDB wrapper) | 4.0.11 |
| **Encryption** | CryptoJS | 4.2.0 |
| **State** | RxJS | 7.8.0 |

**Architecture Pattern:** Component-based with service layer, dual-database (SQLite mobile, IndexedDB web)

**Entry Point:** `src/main.ts` (Angular bootstrap)

---

## Generated Documentation

### Core Documentation

- **[Project Overview](./project-overview.md)** 📋
  - Executive summary
  - Technology stack
  - Quick start guide
  - Key features overview

- **[Architecture](./architecture.md)** 🏗️
  - System architecture diagrams
  - Design patterns
  - Dual-database strategy
  - Security architecture
  - Offline-first design
  - Network architecture (LAN + Internet)

### Technical Documentation

- **[Data Models](./data-models.md)** 💾
  - Complete database schema (11 tables)
  - Table relationships and indexes
  - Encryption strategy
  - Sync architecture
  - Migration strategy

- **[API Contracts](./api-contracts.md)** 🔌
  - REST API endpoints (auth, sync, members)
  - Request/response schemas
  - Authentication flows (JWT + sync tokens)
  - Error handling
  - Network modes (LAN vs Internet)

- **[Component Inventory](./component-inventory.md)** 🎨
  - All 18 UI components cataloged
  - Form sections (12) with field details
  - Utility components (6)
  - Component patterns and conventions
  - Ionic UI components used

### Development Resources

- **[Development Guide](./development-guide.md)** 🛠️
  - Prerequisites and setup
  - Development commands (start, build, test)
  - Android build process
  - Asset generation workflow
  - Testing strategy
  - Debugging techniques
  - Common troubleshooting

- **[Source Tree Analysis](./source-tree-analysis.md)** 📂
  - Annotated directory structure
  - Critical folders explained
  - Build outputs
  - Configuration files
  - Entry points

---

## Existing Documentation

The following documentation existed before this scan (may be outdated per user):

- **[README.md](../README.md)** - Project overview and setup
- **[CLAUDE.md](../CLAUDE.md)** - Claude Code development guidelines
- **[TESTING.md](../TESTING.md)** - Testing documentation
- **[src/app/components/sections/README.md](../src/app/components/sections/README.md)** - Form sections overview
- **[src/app/database/schema.md](../src/app/database/schema.md)** - Database schema
- **[resources/README.md](../resources/README.md)** - Asset generation instructions

**Note:** Prioritize the newly generated documentation in this folder (docs/) as it reflects the actual current codebase state.

---

## Getting Started

### For New Developers

1. **Start here:** [Project Overview](./project-overview.md)
2. **Understand architecture:** [Architecture](./architecture.md)
3. **Setup environment:** [Development Guide](./development-guide.md)
4. **Explore codebase:** [Source Tree Analysis](./source-tree-analysis.md)

### For AI-Assisted Development

When creating a brownfield PRD or working with AI tools, reference:
- **Primary:** `docs/index.md` (this file)
- **Architecture:** `docs/architecture.md`
- **Data Models:** `docs/data-models.md`
- **API Contracts:** `docs/api-contracts.md`
- **Components:** `docs/component-inventory.md`

### For Feature Development

**Planning a new feature?**
1. Review [Architecture](./architecture.md) for design patterns
2. Check [Data Models](./data-models.md) for database schema
3. See [Component Inventory](./component-inventory.md) for reusable components
4. Follow [Development Guide](./development-guide.md) for workflows

**Working on UI?**
1. Review [Component Inventory](./component-inventory.md) for existing patterns
2. Check Ionic component usage (ion-*)
3. Follow ControlValueAccessor pattern for form sections

**Working on sync/offline?**
1. See [Architecture](./architecture.md) → Offline-First Design
2. Review [API Contracts](./api-contracts.md) for sync endpoints
3. Check SyncService and SyncQueueService patterns

---

## Project Statistics

**Generated Files:** 8 documentation files
**Total Source Files Scanned:** 50+ files (exhaustive scan)
**Lines of Documentation:** 3,000+ lines

**Codebase Metrics:**
- **Services:** 9 (DatabaseService, SyncService, ApiService, AuthService, etc.)
- **Database Tables:** 11 (normalized relational schema)
- **UI Components:** 18 (12 form sections + 6 utilities)
- **Pages/Routes:** 5 (home, login, qr-test, db-test, data-viewer)
- **Dependencies:** 890+ npm packages

---

## Key Architectural Decisions

### Dual-Database Strategy
**Decision:** Use SQLite for mobile, IndexedDB for web, with automatic platform detection

**Rationale:**
- SQLite provides native performance on mobile
- IndexedDB is browser-native for web/desktop
- DatabaseService abstracts implementation details
- Automatic fallback if SQLite fails

**Implementation:** `src/app/services/database.service.ts`

---

### Offline-First Design
**Decision:** Local database is source of truth, eventual consistency with server

**Rationale:**
- Emergency camp scenarios have no internet
- LAN-only sync via Raspberry Pi servers
- Queue-based sync with automatic retry
- 100% offline operation capability

**Implementation:**
- `src/app/services/sync.service.ts` (orchestration)
- `src/app/services/sync-queue.service.ts` (queue management)

---

### QR Code Provisioning
**Decision:** Use QR codes for device-to-server pairing in offline environments

**Rationale:**
- No manual IP entry required
- Supports multiple network interfaces (Ethernet, WiFi AP, mDNS)
- Short-lived sync tokens for security
- Simple user experience (scan and sync)

**Implementation:**
- `src/app/services/qr.service.ts`
- `src/app/components/qr-scanner/` and `qr-generator/`

---

### Component-Based Forms
**Decision:** Each form section is a standalone component implementing ControlValueAccessor

**Rationale:**
- Reusability across different contexts
- Two-way data binding with parent form
- Modular validation per section
- Maps cleanly to database table structure

**Implementation:** `src/app/components/sections/*`

---

## Development Workflows

### Start Development Server
```bash
npm start
# Access: http://localhost:8100
```

### Build Android APK
```bash
npm run buildAndroid
# Output: android/app/build/outputs/apk/debug/app-debug.apk
```

### Run Tests
```bash
npm test
```

### Generate Assets
```bash
npm run assets:generate
# Generates from resources/icon.png
```

---

## Testing Routes (Manual QA)

| Route | Purpose | Key Features |
|-------|---------|--------------|
| `/home` | Main registration form | All 12 form sections, save functionality |
| `/login` | Staff authentication | JWT login, session management |
| `/db-test` | Database testing | CRUD operations, migration tests |
| `/data-viewer` | Data inspection | View all members, search, export |
| `/qr-test` | QR functionality | Generation and scanning verification |

---

## Security Considerations

### Data Encryption
- **Client-Side:** CryptoJS (AES encryption)
- **Fields Encrypted:** Personal info, medical data, ID numbers
- **Key Storage:** DatabaseService (dev: hardcoded, prod: Capacitor Preferences)

### Authentication
- **Staff/Admin:** JWT tokens (long-lived)
- **Device Sync:** Short-lived sync tokens (expire after use)
- **Storage:** localStorage (dev), secure storage (prod recommended)

### Network Security
- **Internet Mode:** HTTPS recommended
- **LAN Mode:** HTTP acceptable (isolated network)
- **Data Transmission:** Encrypted before transmission

---

## Deployment

### Android
```bash
# Debug APK (testing)
npm run buildAndroid

# Release APK (Play Store)
cd android
./gradlew assembleRelease
```

### Web
```bash
# Build
npm run build

# Deploy www/ folder to web server
```

---

## Documentation Maintenance

**Last Generated:** 2026-02-22
**Scan Level:** Exhaustive (all source files read)
**Method:** BMad document-project workflow

**To Update Documentation:**
Run the document-project workflow again when significant changes are made to the codebase.

**To Add New Documentation:**
Place markdown files in `docs/` and update this index.

---

## Notes

- All generated documentation is based on **actual source code** (not outdated docs)
- UI language is **Afrikaans**, code comments in **English**
- Built for **offline emergency scenarios** with no internet dependency
- Platform-aware: **SQLite** (mobile) ↔ **IndexedDB** (web) automatic switching
- **Junior developer friendly** - comprehensive documentation provided

---

## Quick Links

| Document | Best For |
|----------|----------|
| [Project Overview](./project-overview.md) | High-level understanding |
| [Architecture](./architecture.md) | System design and patterns |
| [Data Models](./data-models.md) | Database work |
| [API Contracts](./api-contracts.md) | Backend integration |
| [Component Inventory](./component-inventory.md) | UI development |
| [Development Guide](./development-guide.md) | Getting started, workflows |
| [Source Tree Analysis](./source-tree-analysis.md) | Navigating codebase |

---

**For AI-Assisted Development:** This index.md is your primary entry point. All documentation reflects the actual current state of the codebase as of 2026-02-22.
