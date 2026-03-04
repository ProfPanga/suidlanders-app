# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Suidlanders Emergency Plan App - A cross-platform Ionic/Angular application for managing emergency plan information with 100% offline capability. Built for Suidlanders members to register and sync data in offline camp environments using a local Raspberry Pi server.

**Tech Stack**: Angular 19, Ionic 8, Capacitor 7, TypeScript

## Common Commands

### Development
```bash
# Start development server
npm start
# or
ionic serve

# Build for production
npm run build

# Run tests
npm test

# Lint code
npm run lint

# Build Android APK
npm run buildAndroid
# Note: This builds the Angular app, moves browser output to www root, syncs with Capacitor, and builds Android debug APK
```

### Asset Generation
```bash
# Generate Android assets from resources/icon.png
npm run assets:generate

# Generate all platform assets (Android + iOS)
npm run assets:generate:all
```

## Architecture Overview

### Offline-First Design
- **100% offline operation** - No internet required; designed for emergency camp scenarios
- **LAN sync via QR** - Staff generates QR with server URLs + sync token; devices scan and sync over local network
- **USB fallback** - Encrypted export/import bundles when networking unavailable
- **Dual database system** - Automatic platform detection:
  - **Mobile**: SQLite via @capacitor-community/sqlite
  - **Web/Desktop**: IndexedDB via Dexie
  - Automatic fallback if platform detection fails

### Service Layer Architecture

**Core Services** (src/app/services/):
- `database.service.ts` - Database abstraction layer, handles SQLite ↔ IndexedDB switching
- `sync.service.ts` - Manages data synchronization with camp server (LAN-based)
- `sync-queue.service.ts` - Queue-based offline sync with conflict resolution
- `indexed-db.service.ts` - Dexie wrapper for web storage
- `api.service.ts` - HTTP client for camp server communication
- `export.service.ts` - HTML export and data formatting
- `qr.service.ts` - QR code generation/scanning for provisioning and member cards
- `auth.service.ts` - JWT + short-lived sync token handling
- `theme.service.ts` - Dark/light mode management

**Important**: Always use DatabaseService abstraction - never access SQLite/IndexedDB directly from components.

### Form Structure

Member registration divided into **10 sections** (all in src/app/components/sections/):
1. Basic Info - Personal details, contact info
2. Member Info - Suidlander-specific data, emergency contacts, qualifications
3. Address Info - Residential location, GPS coordinates
4. Medical Info - Blood type, chronic conditions, medication
5. Vehicle Info - Primary/secondary vehicles, trailers
6. Skills Info - Occupation, qualifications, licenses
7. Equipment Info - Communication, power, water, defense, camping gear
8. Inventory (Other Info) - Water, food, supplies
9. Camp Info - Camp location, arrival date
10. Documents Info - ID, licenses, certificates (PDF/JPG/PNG upload)

**Pattern**: Each section is a standalone Angular component implementing ControlValueAccessor for reactive form integration.

### Database Schema

11 tables with encrypted sensitive data:
- members (primary table)
- addresses, medical_info, vehicles, dependents
- skills, equipment, inventory
- camps, documents, sync_queue

**Sync Strategy**:
- Changes queued in sync_queue table
- Auto-sync every 5 minutes (when LAN server reachable)
- Manual sync trigger available
- Timestamp-based conflict resolution

## Testing & Debugging

Built-in test routes:
- `/db-test` - Database connection and CRUD testing
- `/data-viewer` - Inspect stored member data
- `/qr-test` - QR code generation/scanning verification

**Important**: Always update these test components when modifying related services (database, QR, sync).

## Development Guidelines

### Language Consistency
- **UI**: All user-facing text must be in Afrikaans
- **Code**: Comments and variable names in English
- **Validation messages**: Afrikaans

### Code Changes
- Focus only on the specific feature/bug being addressed
- **Do not** modify unrelated code without explicit permission
- Follow existing patterns (see form section components as templates)
- Suggest improvements before implementing them

### Mobile Considerations
- Test on Android device/emulator after changes
- Use Ionic components for native feel
- Verify camera and file system permissions work
- Test offline functionality thoroughly

### Educational Approach
The project owner is a **junior developer**. Always:
- Explain reasoning behind architectural decisions
- Break down complex concepts into simple parts
- Reference why certain patterns are used
- Encourage questions and provide detailed answers

## Camp Sync Flow

1. Staff accesses camp server backend: `/api/auth/camp/init`
2. Backend generates QR with `serverUrls` array (mDNS/IP/AP addresses) + short-lived sync code
3. App scans QR, tries each URL until one connects
4. Device exchanges code for temporary sync token
5. Syncs member data over LAN
6. Token + base URL cleared after sync

Alternative: USB encrypted bundle export/import when network unavailable.

## Current Development Phase

**Phase 2** - Medical Intake Form + Dependents
- Update medical intake form structure
- Add dependent information capability
- App sharing without internet

See `.cursor/rules/project-guidelines.mdc` for complete phase checklist and master task list.

## Platform-Specific Notes

### Android Build Process
The `buildAndroid` script handles the quirk where Angular outputs to `www/browser/` instead of `www/`:
```bash
ionic build                          # Builds to www/browser
mv www/browser/* www/                # Moves to www root
npx cap sync android                 # Syncs with Capacitor
cd android && ./gradlew clean assembleDebug  # Builds APK
```

### Asset Generation
Logo stored in `resources/icon.png` (1024×1024 recommended). Run `npm run assets:generate` after updating logo to regenerate launcher icons, splash screens, and web assets.

## Security Notes

- Local data encrypted using CryptoJS (key in DatabaseService - needs secure storage in production)
- USB bundles encrypted and integrity-checked
- JWT auth for staff; short-lived sync-only tokens for device sync
- File upload validation: PDF/JPG/PNG, 10MB max (configurable)
- No internet dependency reduces attack surface
