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

## Development Plan

### Phase 0 - Database & Core Infrastructure

#### ✅ Completed

1. **Database Implementation**

   - IndexedDB for web/desktop storage
   - SQLite for mobile storage
   - Data encryption and security
   - Migration support
   - Comprehensive schema design
   - CRUD operations service

2. **Sync System**

   - Sync queue implementation
   - Offline support with queue
   - Automatic sync (5-minute intervals)
   - Manual sync trigger
   - Conflict detection
   - Transaction support

3. **Testing Infrastructure**

   - DB test component with UI
   - Data viewer component
   - QR code scanner
   - Database connection testing
   - Sync status monitoring
   - Manual sync trigger

4. **File Structure**

   - Proper routing configuration
   - Component organization
   - Service layer architecture
   - Environment configurations

5. **Core Features**
   - Member registration form
   - Data persistence
   - Cross-platform support
   - QR code scanning

#### 🚧 In Progress/Pending

1. **Backend Integration**

   - NestJS API implementation
   - Real server synchronization
   - Authentication system
   - API documentation

2. **Data Management**

   - Member data listing/search
   - Data export functionality
   - Bulk operations
   - Advanced filtering

3. **QR Code System**

   - QR code generation for members
   - Member card system
   - QR code data format standardization
   - Batch QR code operations

4. **Testing & Documentation**

   - End-to-end testing
   - User documentation
   - Deployment guide
   - Performance testing

5. **UI/UX Improvements**
   - Loading states
   - Error handling improvements
   - Offline indicators
   - Form validation improvements
   - Progress indicators

### Phase 1 - Core Functionality & Data Persistence

1. **Form State Management**

   - Automatic save functionality
   - Storage concept
   - Session persistence
   - Blaaier renewal handling

2. **Validation & Fouthantering**

   - Full form validation rules
   - Cross-field validations
   - Standardized error messages
   - Section completion indicators

3. **API Integration**
   - API service setup
   - Basic form submission
   - Fouthantering
   - Success/failure notification

### Phase 2 - User Experience & Security

1. **UI/UX Improvements**

   - Progress indicator/stepper
   - Section navigation
   - Form preview
   - Mobile responsiveness improvements

2. **Security Implementation**

   - CSRF protection
   - Data encryption
   - Input sanitization
   - Secure storage

3. **File Handling**
   - Document upload implementation
   - File size/type restrictions
   - Secure file storage
   - Upload progress indicators

### Phase 3 - Work Completion & Testing

1. **Work Completion Optimization**

   - Lazy-loading implementation
   - Form display optimization
   - Loading time improvements
   - Kasgeheue strategy

2. **Test Suite**
   - Unit tests
   - Integration tests
   - E2E tests
   - Cross-blaaier compatibility

### Phase 4 - Documentation & Finalization

1. **Documentation**

   - API documentation
   - Component documentation
   - User guide
   - Deployment guide

2. **Final Finalization**
   - Print functionality
   - Additional UI enhancements
   - Work completion monitoring
   - Error handling

## Progress Tracking

- [x] Member registration form (9 sections, address merged into basic info)
- [x] Offline database (SQLite on Android, IndexedDB on web)
- [x] QR code generation and scanning
- [x] HTML export
- [x] Camp server (NestJS + SQLite + triage logic)
- [x] LAN sync with QR provisioning (WiFi auto-connect + token exchange)
- [x] Reception staff dashboard
- [x] Journey selector on Settings page (4 roles: Member, Reception, Medical Staff, Security Staff)
- [x] Medical Staff triage page with clinical assessment fields
- [x] Security Information section (member-facing weapon/security fields)
- [x] Brand colour system (brand.scss → variables.scss, light/dark mode)
- [x] Dark mode white icons/labels on home and member form overview
- [ ] Security Staff page content (TBD)
- [ ] Wire staff pages to member database records
- [ ] Full production RBAC
- [ ] iOS WiFi auto-connect (requires manual on iOS)
