# Suidlanders Emergency Plan App

An Ionic/Angular application for managing Suidlanders emergency plan information with integrated NestJS backend for camp server operations.

> **📚 Backend Documentation:** See [BACKEND.md](./BACKEND.md) for complete backend API documentation, deployment guide, and triage logic details.

## Project Structure

This is a **monorepo** containing:
- **Frontend**: Ionic/Angular mobile app (`src/`)
- **Backend**: NestJS camp server API (`backend/`)

## Description

This application is designed to manage and store emergency plan information for Suidlanders members. It provides a comprehensive form that includes the following information:

### Main Sections

1. **Basic Information** — personal details, contact info, ID number, residential address, membership details, emergency contacts, and dependents — all on one page
2. **Medical Information** — blood type, chronic conditions, allergies, medication, medical fund, GP
3. **Vehicle Information** — primary/secondary vehicles, trailer
4. **Skills & Experience** — occupation, qualifications, driver's licence, radio licence
5. **Equipment & Resources** — communications, power generation, water sources, camping, emergency supplies
6. **Camp Information** — assigned camp, arrival date
7. **Documents** — ID, driver's licence, firearm licence, EHBO certificate
8. **Security Information** — firearm ownership, licence, ammunition, shooting experience, security training

**Staff-only pages** (role-gated, not visible to members):
- **Medical Staff** (`/member-form/medicalStaff`) — clinical triage fields: vitals, symptoms, mobility, GI, diabetic assessment
- **Security Staff** (`/member-form/securityStaff`) — security personnel questionnaire (content TBD)

## Features

### 1. Form Validation

- Required field validation
- Format validation for:
  - ID numbers
  - Phone numbers
  - Email addresses
  - GPS coordinates
  - Dates

### 2. Document Upload

- Supports PDF, JPG, and PNG formats
- Maximum file size: 5MB
- Multiple documents under "Other"

### 3. Data Export

- HTML export option
- QR code generation for basic information
- Automatic save function

### 4. QR Code Functionality

- Generate QR codes with basic member information
- Scan QR codes for quick information retrieval
- Save QR codes as PNG images

### 5. Offline Camp Sync

- 100% offline architecture with a local camp-server (NestJS) running on a Raspberry Pi
- Staff generates a QR code containing WiFi credentials + server URLs + a short-lived sync token
- Android devices **automatically connect to the camp WiFi** when scanning the QR
- Devices try each URL sequentially until one responds, exchange the code for a sync token, then sync
- USB-based encrypted export/import as fallback when networking is unavailable

### 6. Role-Based UI (Demo Mode)

- App supports four roles: **Member**, **Reception Staff**, **Medical Staff**, **Security**
- Choose your journey from the Settings page (gear icon always visible in the header)
- Role-based routing: each role navigates to its own starting page on selection
- `demoMode: true` in both dev and prod environments — full RBAC is planned for a future release

## Technical Specifications

### Requirements

- Node.js
- Ionic Framework
- Angular
- Capacitor (for mobile functionality)

### Core Components

- Standalone Angular components
- Reactive forms
- Ionic UI components
- QR code generation and scanning

### Data Management

- Local data storage
- Secure data encryption
- Document handling

## Installation

1. Clone the repository:

```bash
git clone [repository-url]
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm start   # prints the settings URL, then starts at localhost:4200/settings
```

## Icon Generation (logo)

1. Create the folder `resources/` at the project root if it does not exist.
2. Save your square logo PNG as `resources/icon.png` (ideally 1024×1024 with transparency).
3. Generate platform assets:

```bash
npm run assets:generate
````

This will update Android launcher icons and web favicon/manifest icons. Re-run after changing the logo.

```

## Camp Sync (LAN)

1. Staff calls `POST /api/auth/camp/init` → backend returns QR with WiFi credentials + `serverUrls[]` + sync code
2. App scans QR → automatically connects to camp WiFi (Android; iOS requires manual connect)
3. Tests each URL sequentially until one responds (10s timeout each)
4. Exchanges code for sync token via `CapacitorHttp` (bypasses WebView CORS on LAN)
5. Syncs member data; token is cleared after sync (base URL kept for future syncs)

Navigate to `/qr-debug` in the browser dev server for an end-to-end test without a physical device.

## Contributing

Contact the project manager for more information about contributing to the project.

## License

Private - All rights reserved

## Contact

For any inquiries, contact the Suidlanders management.

## Testing

Step-by-step manual testing guides — written for non-technical users and covering every part of the app — live in **[`docs/testing/`](./docs/testing/)**. Start with [`docs/testing/01-getting-started.md`](./docs/testing/01-getting-started.md).

## Project Status & Roadmap

This is a **proof of concept** being prepared for handover to Suidlanders. The full status — what is done, what remains, and the production-readiness decisions for the new owner — is tracked in **[`TODO.md`](./TODO.md)**.

At a glance, the following are **done**: member registration form (9 sections), offline database (SQLite/IndexedDB), QR generation & scanning, HTML export, the NestJS camp server with Red/Green triage, LAN sync via QR provisioning, the reception dashboard, the 4-role journey selector, the medical triage page, the member security section, and the brand/dark-mode system.

Key items still **open** include: Security Staff page content, wiring the staff pages to member records, full production RBAC, and iOS WiFi auto-connect. See [`TODO.md`](./TODO.md) for the complete list.
