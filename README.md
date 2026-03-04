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

1. **Basic Information**

   - Personal details
   - Contact information
   - ID and documentation

2. **Suidlander Information**

   - Member details
   - Emergency contacts
   - EHBO qualifications
   - Weapon license information

3. **Address Information**

   - Residential address
   - GPS coordinates
   - Nearby services (hospital, police, shops)

4. **Medical Information**

   - Blood type
   - Chronic diseases
   - Medication
   - Medical fund details

5. **Vehicle Information**

   - Primary and secondary vehicles
   - Trailer details

6. **Skills & Experience**

   - Occupation
   - Qualifications
   - Management license
   - Radio license

7. **Equipment & Resources**

   - Communication equipment
   - Power generation
   - Water resource
   - Defense
   - Camping
   - Emergency supplies

8. **Inventory**

   - Water and food supplies
   - Equipment
   - Electronic devices

9. **Camp Information**

   - Camp location
   - Arrival date

10. **Documents**
    - ID document
    - Management license
    - Firearm license
    - EHBO certificate
    - Other documents

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

### 5. Offline Camp Sync (New)

- 100% offline architecture with a local camp-server (NestJS) running on a Raspberry Pi
- Devices sync over LAN using a QR-provisioned server URL list (mDNS/IP/AP) and a short-lived sync token
- USB-based encrypted export/import as fallback when networking is unavailable

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

````bash
ionic serve
## Icon generation (logo)

1. Create the folder `resources/` at the project root if it does not exist.
2. Save your square logo PNG as `resources/icon.png` (ideally 1024×1024 with transparency).
3. Generate platform assets:

```bash
npm run assets:generate
````

This will update Android launcher icons and web favicon/manifest icons. Re-run after changing the logo.

```

## Camp Sync (LAN)

- Staff generates a camp QR from the backend: `/api/auth/camp/init`
- The app scans the QR, tries the provided `serverUrls`, exchanges the code for a temporary sync token, and syncs
- The chosen camp base URL and token are stored temporarily and cleared after successful sync

See `TESTING.md` for a step-by-step simulation of QR exchange and sync in the browser.

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

### Current Phase: 0

- [x] Basic form implementation
- [x] Ionic/Angular setup
- [x] QR code functionality
- [x] HTML export
- [ ] Database setup
- [ ] Core services implementation

_Last updated: [DATE]_
```
