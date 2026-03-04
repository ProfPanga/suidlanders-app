# Project Overview - Suidlanders Emergency Plan App

## Project Information

**Name:** Suidlanders Emergency Plan App
**Version:** 0.0.1
**Type:** Mobile Application (Cross-Platform)
**Repository Type:** Monolith
**Primary Language:** TypeScript
**UI Language:** Afrikaans

---

## Purpose

Emergency member registration and data management application designed for offline camp environments. Enables Suidlanders members to register and sync data without internet connectivity using local Raspberry Pi servers over LAN.

---

## Technology Stack Summary

### Frontend
- **Framework:** Angular 19.2.11
- **UI Library:** Ionic 8.5.7
- **Language:** TypeScript 5.6.3 (strict mode)
- **Reactive:** RxJS 7.8.0

### Mobile Platform
- **Native Bridge:** Capacitor 7.2.0
- **Target Platform:** Android (primary), iOS (capable)
- **Build Tool:** Gradle 8.x

### Data Layer
- **Mobile Database:** SQLite (@capacitor-community/sqlite 7.0.0)
- **Web Database:** IndexedDB (Dexie 4.0.11)
- **Encryption:** CryptoJS 4.2.0
- **Compression:** pako 2.1.0

### Key Features
- **QR Code:** qrcode 1.5.4 (generation), @zxing/library 0.21.3 (scanning)
- **UUID:** uuid 11.1.0
- **Testing:** Jasmine 5.1.0 + Karma 6.4.0
- **Linting:** ESLint 9.16.0 + Angular ESLint 19.0.0

---

## Architecture Type

**Primary Pattern:** Component-Based Architecture

**Key Characteristics:**
- **Offline-First:** 100% offline operation capability
- **Dual-Database:** Platform-aware (SQLite mobile, IndexedDB web)
- **Service Layer:** Business logic abstraction
- **Reactive Data Flow:** RxJS Observables throughout
- **LAN Sync:** Local network synchronization via QR provisioning

---

## Project Structure

```
suidlanders-app/
├── src/app/                    # Angular application
│   ├── components/             # UI components (18 total)
│   │   ├── sections/           # Form sections (12)
│   │   └── ...                 # Utilities (6)
│   ├── pages/                  # Routes (home, login, qr-test)
│   ├── services/               # Business logic (9 services)
│   ├── database/               # Schema definitions
│   └── interfaces/             # TypeScript types
├── android/                    # Android platform (Capacitor)
├── docs/                       # Generated documentation
├── resources/                  # Asset generation sources
└── package.json                # Dependencies & scripts
```

---

## Key Features

### Member Registration
- **10 Form Sections** for comprehensive data collection
  1. Basic Info - Personal/contact data
  2. Member Info - Emergency contacts, qualifications
  3. Address Info - Location, GPS coordinates
  4. Medical Info - Blood type, conditions, medication
  5. Vehicle Info - Vehicles and trailers (multi-entry)
  6. Skills Info - Occupation, licenses, skills
  7. Equipment Info - Gear inventory
  8. Other Info - Supplies and notes
  9. Camp Info - Camp assignment
  10. Documents Info - File uploads (PDF/JPG/PNG)

### Offline Capability
- **100% offline operation** - No internet required
- **Local database** - SQLite (mobile) or IndexedDB (web)
- **Encrypted storage** - Client-side encryption with CryptoJS
- **USB export** - Encrypted data bundles for backup

### Synchronization
- **LAN-based sync** - QR code provisioning for camp servers
- **Auto-sync** - Every 5 minutes when server reachable
- **Queue-based** - Failed syncs queued for retry
- **Conflict resolution** - Timestamp-based (last-write-wins)

### QR Code Integration
- **Member Cards** - Generate QR codes for member IDs
- **Device Provisioning** - Scan QR to connect to camp server
- **Multi-URL Support** - Try multiple server addresses (mDNS, IP, AP)

---

## Database Schema

**11 Normalized Tables:**
- `members` (root table)
- `basic_info`, `member_info`, `address_info`
- `medical_info`, `vehicle_info`, `skills_info`
- `equipment_info`, `camp_info`, `other_info`
- `documents`

**Relationships:**
- Star schema with `members` at center
- Foreign keys: `ON DELETE CASCADE`
- Multi-entry support: `vehicle_info`, `documents`

---

## Development Setup

### Prerequisites
- Node.js v18+ (v20 LTS recommended)
- Android Studio (for Android builds)
- JDK 17 or 21 (for Gradle)

### Quick Start
```bash
# Install dependencies
npm install

# Start dev server
npm start
# or
ionic serve

# Build Android APK
npm run buildAndroid
```

### Testing Routes
- `/home` - Main registration form
- `/login` - Staff authentication
- `/db-test` - Database testing
- `/data-viewer` - Data inspection
- `/qr-test` - QR functionality test

---

## Deployment

### Android
```bash
npm run buildAndroid
```
Output: `android/app/build/outputs/apk/debug/app-debug.apk`

### Web
```bash
npm run build
```
Output: `www/` folder (deploy to web server)

---

## Documentation Index

This project includes comprehensive AI-generated documentation:

1. **[Project Overview](./project-overview.md)** (this file)
2. **[Architecture](./architecture.md)** - System design and patterns
3. **[Data Models](./data-models.md)** - Database schema (11 tables)
4. **[API Contracts](./api-contracts.md)** - REST endpoints
5. **[Component Inventory](./component-inventory.md)** - UI components (18)
6. **[Source Tree Analysis](./source-tree-analysis.md)** - Directory structure
7. **[Development Guide](./development-guide.md)** - Setup and workflows

---

## Quick Reference

### npm Scripts
| Command | Purpose |
|---------|---------|
| `npm start` | Start dev server (http://localhost:8100) |
| `npm run build` | Build for production |
| `npm run buildAndroid` | Build Android APK |
| `npm test` | Run unit tests |
| `npm run lint` | Lint code |
| `npm run assets:generate` | Generate app icons/splash screens |

### Environment Variables
- **Development:** `src/environments/environment.ts` (localhost:3000)
- **Production:** `src/environments/environment.prod.ts` (relative /api)

### Entry Points
- **Web:** `src/main.ts` (Angular bootstrap)
- **Android:** `android/app/src/main/java/.../MainActivity.java`

---

## Security Notes

- **Encryption:** CryptoJS for sensitive data (client-side)
- **Tokens:** JWT (staff), short-lived sync tokens (devices)
- **Storage:** localStorage (dev), Capacitor Preferences (prod recommended)
- **Network:** HTTPS (internet), HTTP (LAN - isolated network)

---

## Architecture Highlights

### Dual-Database Strategy
```
Platform Detection
├── Mobile (Android/iOS) → SQLite
└── Web/Desktop → IndexedDB (Dexie)
```

**Automatic Fallback:** SQLite fails → IndexedDB

### Offline-First Sync
```
Local DB (Source of Truth)
  ↓
Sync Queue (Changes tracked)
  ↓
Auto-Sync (5 min interval)
  ↓
Camp Server (LAN or Internet)
  ↓
Conflict Resolution (Timestamp-based)
```

---

## Current Status

**Phase:** Development (v0.0.1)
**Platform:** Android (primary)
**Database:** SQLite + IndexedDB dual-mode
**Network:** LAN sync operational
**CI/CD:** Manual builds
**Documentation:** AI-generated (exhaustive scan)

---

## Getting Started

1. **Clone repository**
2. **Install dependencies:** `npm install`
3. **Start dev server:** `npm start`
4. **Access:** http://localhost:8100
5. **Read docs:** Start with [Development Guide](./development-guide.md)

---

## Notes

- UI language is **Afrikaans** (South African)
- Code comments in **English**
- Built for **offline emergency scenarios**
- **No internet dependency** for core features
- Designed for **junior developers** - comprehensive documentation provided
