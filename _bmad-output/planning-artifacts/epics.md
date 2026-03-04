---
stepsCompleted: ['step-01-validate-prerequisites', 'step-02-design-epics', 'step-03-create-stories', 'step-04-final-validation']
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/planning-artifacts/architecture.md
workflowComplete: true
validationStatus: passed
totalEpics: 5
totalStories: 27
frsCovered: 47
nfrsCovered: 8
architectureRequirementsCovered: 12
---

# suidlanders-app - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for suidlanders-app, decomposing the requirements from the PRD and Architecture into implementable stories.

## Requirements Inventory

### Functional Requirements

**FR-1.1: Offline Member Registration**
- Members shall be able to register their family information completely offline without any network connection
- Registration form shall include 10 sections: Basic Info, Member Info, Address Info, Medical Info, Vehicle Info, Skills Info, Equipment Info, Other Info, Camp Info, Documents Info
- System shall save registration data locally to device storage
- System shall display "Vorm suksesvol ingedien" confirmation when registration is submitted

**FR-1.2: Family Member Management**
- Members shall be able to add dependents (family members) to their registration
- Each dependent shall have: name, relationship, age/birth date, medical notes
- Members shall be able to add/remove/edit dependent information

**FR-1.3: Non-Family Member Registration**
- Members shall be able to register non-family members (helping strangers) on their device
- Non-family registrations shall be isolated from the member's own family data
- System shall prevent data corruption between family and non-family registrations

**FR-1.4: Registration Updates**
- Members shall be able to update their registration information at any time
- Updates shall be saved locally and queued for synchronization
- Updated data shall replace previous version when synced

**FR-1.5: Document Upload**
- Members shall be able to upload documents (ID, licenses, certificates)
- Supported formats: PDF, JPG, PNG
- Maximum file size: 10MB per document
- Documents shall be captured via camera or selected from device storage

**FR-1.6: GPS Coordinate Capture**
- System shall auto-capture GPS coordinates for address registration
- Members shall be able to manually enter coordinates if GPS unavailable
- Coordinates shall be stored with address data

**FR-1.7: Distributed Family Registration**
- Family members at different locations shall be able to register independently
- System shall link separate registrations to single family unit
- Members shall indicate which family members are present vs absent during registration
- Members shall specify location of absent family members (e.g., "at different camp in Free State")

**FR-2.1: Reception Dashboard**
- Reception staff shall see list of all synced members
- Each entry shall display: member name, family size, camp assignment (Red/Green)
- Reception staff shall NOT see medical details, private data, or sensitive information
- Reception staff shall see "[MEDICAL - See Medical Staff]" or "[SECURITY FLAG - See Security Staff]" indicators only

**FR-2.2: Medical Staff Access**
- Medical staff shall have full access to medical profiles
- Medical data shall include: blood type, chronic conditions, medications, allergies, medical aid info
- Medical staff shall see critical medical flags (insulin, heart conditions, post-stroke)
- Medical staff shall be able to search members by name or medical condition

**FR-2.3: Security Staff Access**
- Security staff shall see firearms declarations (type, license, ammunition)
- Security staff shall see shooting experience level (military, sport, hunting, none)
- Security staff shall be able to identify potential defense volunteers
- Security staff shall perform identity verification against ID numbers

**FR-2.4: Logistics Staff Access**
- Logistics staff shall see aggregate resource needs (water, food, medical supplies)
- Logistics staff shall see skills inventory (mechanics, medics, farmers)
- Logistics staff shall see vehicle and fuel availability
- Logistics staff shall track supply levels and shortages

**FR-2.5: Communication Staff Access**
- Communication staff shall search for members by name, ID number, or vehicle registration
- Communication staff shall see family member locations (including other camps)
- Communication staff shall facilitate family reunification
- Communication staff shall see inter-camp family notifications

**FR-2.6: Admin Operations**
- Admin shall have full system access (all data, all roles)
- Admin shall monitor system status (sync success, failed attempts, errors)
- Admin shall manage user roles and permissions
- Admin shall perform database backups manually or view automated backup status
- Admin shall troubleshoot failed syncs
- Admin shall delete member data on request (POPIA compliance)

**FR-3.1: Automatic Sync on WiFi Connection**
- System shall automatically sync when device joins camp WiFi network
- Sync shall happen in background without user intervention
- System shall display sync status ("Syncing..." → "Sync successful")

**FR-3.2: QR Code Provisioning**
- Members shall be able to scan QR code to auto-join camp WiFi and sync
- QR code shall contain: server URLs, sync credentials, camp ID
- System shall try multiple server URLs until successful connection
- Manual WiFi join shall work as fallback if QR scan unavailable

**FR-3.3: Sync Retry Logic**
- System shall retry failed syncs up to 3 times with exponential backoff
- System shall log failed sync attempts with error details
- System shall alert admin after 3 failed attempts
- Members shall see clear failure messages with next steps

**FR-3.4: Manual USB Sync Fallback**
- Admin shall be able to perform manual USB sync when network unavailable
- System shall support encrypted USB data transfer
- USB sync shall work for both member devices and staff tablets

**FR-3.5: Family Data Merge**
- System shall merge separate family member registrations into single family unit
- Merge shall occur when both family members sync to same or different camps
- System shall preserve all data from both registrations (no data loss)
- Conflicts shall be resolved using timestamp-based last-write-wins

**FR-3.6: Inter-Camp Sync**
- Camps shall be able to sync data with other camps (satellite, radio, physical transfer)
- Communication staff shall receive notifications when family members sync at other camps
- System shall support family member migration between camps
- Inter-camp sync shall preserve data integrity across databases

**FR-3.7: Offline Data Persistence**
- System shall store data locally for 30+ days without sync
- Data shall persist through device restart, low battery, app force-quit
- Local database shall be encrypted at rest

**FR-3.8: Sync Queue Management**
- System shall queue changes when offline
- Queue shall preserve order of changes
- Queue shall clear after successful sync
- System shall display pending sync count to user

**FR-4.1: Automatic Triage Logic**
- System shall automatically assign members to Red Camp or Green Camp based on data
- Demo MVP triage logic: Member has medical condition → Red Camp, else → Green Camp
- Post-MVP: Advanced triage matrix with weighted scoring (medical needs, supplies, skills)
- System shall surface critical medical flags (insulin, heart medication, chronic conditions)

**FR-4.2: Manual Triage Override**
- Reception or Medical staff shall be able to manually override camp assignment
- Overrides shall be logged with staff ID and reason
- Original triage recommendation shall be preserved for audit

**FR-4.3: Camp Assignment Visibility**
- Members shall see their camp assignment after sync
- Staff shall see camp assignment for all members on dashboard
- Camp assignment shall be clearly indicated (Red Camp vs Green Camp)

**FR-5.1: Role-Based Access Control (RBAC)**
- System shall support 7 roles: Member, Reception, Medical, Security, Logistics, Communication, Admin
- Each role shall have specific data access permissions
- Staff shall only see data required for their role
- System shall enforce role restrictions at all access points

**FR-5.2: Medical Data Privacy**
- Medical data shall ONLY be accessible to Medical staff and Admin
- Reception, Logistics, Security, Communication roles shall NOT see medical details
- Medical data access shall be logged (who accessed what, when)

**FR-5.3: Firearms Data Security**
- Firearms data shall ONLY be accessible to Security staff and Admin
- Firearms data access shall be logged
- No printed reports allowed (or must be destroyed after use)

**FR-5.4: Audit Logging**
- System shall log all data access by staff (timestamp, user, member viewed)
- Logs shall be retained for 90 days minimum
- Admin shall be able to review access logs
- Inappropriate access shall trigger alerts

**FR-5.5: Data Consent**
- Members shall provide consent during registration
- Consent shall acknowledge data collection, storage, and camp usage
- Members shall acknowledge system limitations (no guarantees in emergency)

**FR-5.6: Data Deletion**
- Members shall be able to request data deletion at any time
- Admin shall fulfill deletion requests (permanent, unrecoverable)
- Audit logs shall record deletion requests and fulfillment

**FR-6.1: System Monitoring**
- Admin shall see system health dashboard (uptime, sync status, errors)
- Admin shall see active user roles and connected staff
- Admin shall see database size and storage usage
- Admin shall receive alerts for critical issues (failed syncs, errors, security violations)

**FR-6.2: Database Backup & Restore**
- System shall perform automated daily backups to USB (midnight cron job)
- Admin shall trigger manual backup anytime
- Admin shall restore database from USB backup
- Backups shall be encrypted

**FR-6.3: User Role Management**
- Admin shall assign roles to staff (Reception, Medical, Security, etc.)
- Admin shall revoke roles (e.g., after inappropriate access)
- Admin shall view active staff sessions

**FR-6.4: Inter-Camp Administration**
- Admin shall initiate inter-camp sync (satellite, radio link)
- Admin shall monitor inter-camp sync status
- Admin shall resolve inter-camp conflicts manually if needed

**FR-6.5: Identity Verification**
- System shall validate South African ID numbers (13-digit format, checksum)
- System shall flag duplicate ID numbers (same person registered twice)
- System shall detect potential fraud (same ID used multiple times)

**FR-6.6: APK Distribution Support**
- System shall support APK sharing via WhatsApp, Bluetooth, USB
- APK shall be signed for sideload distribution
- System shall track app version (display in settings)

**FR-6.7: Multi-Language Support**
- System shall support Afrikaans (primary) and English (toggle)
- All UI labels, buttons, messages shall be translatable
- Language preference shall be stored per device
- Future: Zulu, Xhosa languages (Vision phase)

### NonFunctional Requirements

**NFR-1: Offline Resilience**
- App works 100% offline for 30+ days
- Data persists through device restart, low battery, force quit
- Local database encryption

**NFR-2: Sync Reliability**
- 100% sync success rate (zero data loss tolerance for life-safety)
- Automatic retry on failure - 3 attempts with exponential backoff
- Clear failure logging - staff can see which records didn't sync and why
- Manual USB/Bluetooth fallback - if network sync fails after 3 attempts

**NFR-3: Data Integrity**
- 100% accuracy in family merge scenarios
- Conflict resolution that favors safety - if medical info conflicts, flag for manual review
- Audit trail - every sync, merge, update logged

**NFR-4: Performance**
- Registration form loads in < 2 seconds
- Sync completes in < 30 seconds for typical family (5 members)
- Backend supports 500 concurrent syncs

**NFR-5: Disaster Recovery**
- Backend daily backups
- Export full dataset to USB
- Multi-device redundancy - multiple Pis for failover

**NFR-6: App Launch Performance**
- App launch: < 3 seconds cold start on mid-range Android device
- Form load: < 2 seconds to display registration form
- Sync duration: < 30 seconds for typical family (5 members) over LAN WiFi

**NFR-7: Device Support**
- Target devices: Mid-range Android phones (2GB+ RAM, quad-core CPU)
- Low-end support: Should work on 1GB RAM devices (degraded performance acceptable)
- High-end support: Optimized for flagship devices (smooth 60fps animations)

**NFR-8: Battery Consumption**
- Registration: Minimal battery impact (form filling doesn't drain battery)
- Sync: Brief network activity (< 1% battery per sync)
- Background: No background processes (app doesn't run when closed)

### Additional Requirements

**Architecture Requirements:**

**AR-1: Dual-Database Architecture**
- Platform-specific database strategy: SQLite for mobile (Android/iOS), IndexedDB for web/desktop
- Automatic platform detection using Ionic Platform API
- Graceful fallback from SQLite to IndexedDB if initialization fails
- Unified DatabaseService interface abstracting platform differences

**AR-2: Client-Side Encryption**
- CryptoJS (AES encryption) for sensitive data
- Encrypted fields: Personal info (ID numbers, names), medical data, contact information
- Encryption key storage: Development uses hardcoded key, production should use Capacitor Preferences with encryption

**AR-3: Service Layer Architecture**
- Core services: DatabaseService, SyncService, ApiService, AuthService, SyncQueueService, IndexedDbService, ExportService, QRService, ThemeService
- All services use singleton pattern (providedIn: 'root')
- Dependency injection for testability

**AR-4: Component Architecture**
- Reactive forms with ControlValueAccessor pattern
- 10 section components implementing ControlValueAccessor
- Parent MemberFormComponent manages aggregate FormGroup
- Visual feedback via Ionic error states

**AR-5: Authentication Flow**
- JWT tokens for staff/admin (long-lived session)
- Sync tokens for device provisioning (short-lived, expires after sync)
- Camp base URL stored temporarily during sync, cleared after completion

**AR-6: Network Architecture**
- LAN mode for camp scenarios (no internet)
- QR provisioning with multiple server URLs (Ethernet, WiFi AP, mDNS)
- Sequential URL trial until successful connection
- HTTPS for internet mode, HTTP acceptable for isolated LAN

**AR-7: Build Process**
- Angular build outputs to www/browser/, requires flattening to www/ for Capacitor
- Custom build script handles Angular → Capacitor quirk
- Gradle build for Android APK
- Debug APK for MVP (sideload), release APK for Play Store (future)

**AR-8: Database Schema**
- 11 normalized tables: members (root), basic_info, member_info, address_info, medical_info, vehicle_info, skills_info, equipment_info, camp_info, other_info, documents
- All tables use member_id foreign key with ON DELETE CASCADE
- Indexes on frequently queried columns for performance

**AR-9: Sync Strategy**
- Queue-based offline sync with retry logic
- Auto-sync every 5 minutes (configurable)
- Manual sync trigger available
- Conflict resolution: timestamp-based last-write-wins
- Sync queue persists operation, table, recordId, data, timestamp, retry count

**AR-10: Platform Permissions (Android)**
- CAMERA: QR scanning, document photo capture
- ACCESS_FINE_LOCATION: GPS coordinate auto-capture
- READ_EXTERNAL_STORAGE, WRITE_EXTERNAL_STORAGE: Document upload, USB export
- ACCESS_NETWORK_STATE, ACCESS_WIFI_STATE: LAN sync
- BLUETOOTH: APK sharing
- No internet permission required (offline-only)

**AR-11: Error Handling**
- Centralized error handling in ApiService
- User-friendly error messages
- Logging for debugging
- RxJS operators: map, tap, catchError, switchMap

**AR-12: Testing Infrastructure**
- Manual testing routes: /db-test, /data-viewer, /qr-test
- Unit testing: Jasmine + Karma
- Platform testing: Android emulator + physical devices, web browser emulation

### FR Coverage Map

**Epic 1 (Demo Sprint):**
- FR-1.1: Offline Member Registration → Epic 1
- FR-1.4: Registration Updates → Epic 1
- FR-1.5: Document Upload → Epic 1
- FR-1.6: GPS Coordinate Capture → Epic 1
- FR-2.1: Reception Dashboard → Epic 1
- FR-3.1: Automatic Sync on WiFi Connection → Epic 1
- FR-3.2: QR Code Provisioning → Epic 1
- FR-4.1: Automatic Triage Logic → Epic 1
- FR-4.3: Camp Assignment Visibility → Epic 1
- FR-5.1: Role-Based Access Control (basic) → Epic 1
- FR-6.6: APK Distribution Support → Epic 1

**Epic 2 (Family & Data Management):**
- FR-1.2: Family Member Management → Epic 2
- FR-1.3: Non-Family Member Registration → Epic 2
- FR-1.7: Distributed Family Registration → Epic 2
- FR-3.3: Sync Retry Logic → Epic 2
- FR-3.4: Manual USB Sync Fallback → Epic 2
- FR-3.5: Family Data Merge → Epic 2
- FR-3.7: Offline Data Persistence → Epic 2
- FR-3.8: Sync Queue Management → Epic 2

**Epic 3 (Staff Operations):**
- FR-2.2: Medical Staff Access → Epic 3
- FR-2.3: Security Staff Access → Epic 3
- FR-2.4: Logistics Staff Access → Epic 3
- FR-2.5: Communication Staff Access → Epic 3
- FR-2.6: Admin Operations → Epic 3
- FR-5.1: Role-Based Access Control (full) → Epic 3
- FR-5.2: Medical Data Privacy → Epic 3
- FR-5.3: Firearms Data Security → Epic 3
- FR-5.4: Audit Logging → Epic 3
- FR-5.5: Data Consent → Epic 3
- FR-5.6: Data Deletion → Epic 3

**Epic 4 (System Administration):**
- FR-4.2: Manual Triage Override → Epic 4
- FR-6.1: System Monitoring → Epic 4
- FR-6.2: Database Backup & Restore → Epic 4
- FR-6.3: User Role Management → Epic 4
- FR-6.4: Inter-Camp Administration → Epic 4
- FR-6.5: Identity Verification → Epic 4
- FR-6.7: Multi-Language Support → Epic 4

**Epic 5 (Inter-Camp Sync):**
- FR-3.6: Inter-Camp Sync → Epic 5

## Epic List

### Epic 1: Demo Sprint - Offline Registration & Basic Triage (March 6th Deadline)
Members can install the app, register offline, sync to camp network via QR, and staff can triage members to Red/Green camps based on medical conditions.

**FRs covered:** FR-1.1, FR-1.4, FR-1.5, FR-1.6, FR-2.1, FR-3.1, FR-3.2, FR-4.1, FR-4.3, FR-5.1 (basic), FR-6.6

**Demo Success Criteria:** Install APK → Register offline → Scan QR → Auto-sync → Staff sees triage assignment (Red/Green)

---

### Epic 2: Post-Demo Foundation - Family & Data Management
Members can manage complete family units (add dependents), help strangers register without data corruption, and update their information after initial registration with robust sync capabilities.

**FRs covered:** FR-1.2, FR-1.3, FR-1.7, FR-3.3, FR-3.4, FR-3.5, FR-3.7, FR-3.8

**User Value:** Enables distributed family scenarios (Journey 2), helper scenarios (Journey 3), and production-grade sync reliability.

---

### Epic 3: Staff Operations - Role-Based Access & Privacy
Camp staff (Medical, Security, Logistics, Communication, Admin) can access member data according to their role with privacy protections and audit logging.

**FRs covered:** FR-2.2, FR-2.3, FR-2.4, FR-2.5, FR-2.6, FR-5.1 (full), FR-5.2, FR-5.3, FR-5.4, FR-5.5, FR-5.6

**User Value:** Enables Journeys 5-9 (all staff roles), enforces privacy, enables field-test readiness.

---

### Epic 4: System Administration & Reliability
Admins can monitor system health, manage backups, troubleshoot sync issues, manage user roles, and ensure data integrity across camps.

**FRs covered:** FR-4.2, FR-6.1, FR-6.2, FR-6.3, FR-6.4, FR-6.5, FR-6.7

**User Value:** Enables Journey 9 (Admin operations), operational readiness, multi-language support.

---

### Epic 5: Inter-Camp Sync & Advanced Features
Multiple camps can sync member data, families separated across camps can be reunited, and the system supports multi-camp federation.

**FRs covered:** FR-3.6

**User Value:** Enables multi-camp scenarios (distributed family reunion across provinces).

---

## Epic 1: Demo Sprint - Offline Registration & Basic Triage

**Goal:** Members can install the app, register offline, sync to camp network via QR, and staff can triage members to Red/Green camps based on medical conditions.

**Demo Deadline:** March 6th, 2026 (6 days from now)

### Story 1.1: Simple Triage Logic Implementation

As a **Camp Staff Member**,
I want the system to automatically assign members to Red Camp or Green Camp based on medical conditions,
So that I can quickly triage arriving families without manual assessment.

**Acceptance Criteria:**

**Given** a member has completed registration with medical information
**When** the member's data syncs to the camp server
**Then** the system evaluates if any medical conditions are flagged
**And** assigns Red Camp if medical conditions exist, Green Camp otherwise
**And** stores the camp assignment with the member record

**Given** a member has chronic conditions (diabetes, heart condition, etc.)
**When** triage logic runs
**Then** member is assigned to Red Camp
**And** assignment displays "[MEDICAL - See Medical Staff]" indicator

**Given** a member has NO medical conditions flagged
**When** triage logic runs
**Then** member is assigned to Green Camp
**And** no medical indicator is shown

**Given** staff views a member record
**When** displaying camp assignment
**Then** assignment shows clearly as "Red Camp" or "Green Camp"
**And** color coding is used (red badge for Red Camp, green badge for Green Camp)

---

### Story 1.2: Reception Staff Dashboard

As a **Reception Staff Member**,
I want to see a list of all synced members with their camp assignments,
So that I can direct arriving families to the correct camp area without accessing sensitive medical data.

**Acceptance Criteria:**

**Given** members have synced their registration data to the camp server
**When** Reception staff opens the dashboard
**Then** a list of all synced members is displayed
**And** each entry shows: member name, family size (number of people), and camp assignment (Red/Green)

**Given** a member is assigned to Red Camp due to medical reasons
**When** Reception staff views the member entry
**Then** camp assignment shows "Red Camp"
**And** indicator displays "[MEDICAL - See Medical Staff]"
**And** NO medical details are visible (blood type, conditions, medications hidden)

**Given** a member is assigned to Green Camp
**When** Reception staff views the member entry
**Then** camp assignment shows "Green Camp"
**And** no special indicators are displayed

**Given** Reception staff is viewing the dashboard
**When** a new member syncs in real-time
**Then** the dashboard automatically updates with the new entry
**And** displays sync timestamp

**Given** Reception staff needs to search for a specific family
**When** typing a member name in search field
**Then** the list filters to show matching members only

---

### Story 1.3: QR Code Provisioning Flow (Nice-to-Have)

As a **Member**,
I want to scan a QR code to automatically join the camp WiFi and sync my data,
So that I don't need to manually enter WiFi passwords or server settings.

**Acceptance Criteria:**

**Given** camp staff has generated a provisioning QR code
**When** member opens the app and selects "Scan QR to Sync"
**Then** camera opens for QR code scanning

**Given** member scans a valid camp provisioning QR code
**When** QR is decoded
**Then** the app extracts server URLs array, sync code, and camp ID
**And** displays "Connecting to camp server..." message

**Given** the QR contains multiple server URLs (Ethernet, AP, mDNS)
**When** the app attempts connection
**Then** it tries each URL sequentially until one succeeds
**And** uses the successful URL for all subsequent requests

**Given** connection to a server URL succeeds
**When** exchanging sync code for token
**Then** the app receives a temporary sync token
**And** initiates data synchronization automatically

**Given** sync completes successfully
**When** all member data is transferred
**Then** the app displays "Sync successful - Data received by camp"
**And** clears the sync token and base URL from storage

**Given** QR scan or connection fails
**When** error occurs
**Then** the app displays clear error message
**And** offers "Try Again" or "Manual WiFi Setup" options

---

### Story 1.4: Role-Based UI Demonstration

As a **Demo Presenter**,
I want to switch between Member view and Staff view in the app,
So that I can demonstrate different user experiences during the March 6th demo.

**Acceptance Criteria:**

**Given** the app is running in demo mode
**When** user accesses Settings or a demo control panel
**Then** a "Role Switcher" option is visible

**Given** user selects "Role Switcher"
**When** the role selection menu displays
**Then** options show: "Member", "Reception Staff"
**And** current role is highlighted

**Given** user switches to "Member" role
**When** role change is applied
**Then** the app displays member registration form and member-specific features
**And** no staff dashboards are accessible

**Given** user switches to "Reception Staff" role
**When** role change is applied
**Then** the app displays Reception dashboard
**And** member registration features are hidden
**And** only non-sensitive member data is visible (name, family size, camp assignment)

**Given** role switcher is used during demo
**When** switching between roles
**Then** transition is smooth (< 1 second)
**And** data persists between role switches

---

### Story 1.5: Demo Scenario Documentation

As a **Demo Presenter**,
I want step-by-step documentation for executing the March 6th demo,
So that I can confidently demonstrate the app's capabilities without missing critical steps.

**Acceptance Criteria:**

**Given** demo documentation is created
**When** the document is opened
**Then** it contains the following sections:
- Setup Instructions (devices, Pi, WiFi, QR generation)
- Demo Script (exact steps to follow)
- Expected Outcomes (what audience should see at each step)
- Troubleshooting (common issues and fixes)

**Given** the Setup Instructions section
**When** following the steps
**Then** clear instructions exist for:
- Starting the Raspberry Pi backend server
- Generating the camp provisioning QR code
- Setting up camp WiFi network
- Installing APK on demo device(s)

**Given** the Demo Script section
**When** following the narrative
**Then** it tells the "Pieter's story" from the PRD:
- Install APK via WhatsApp/USB
- Fill registration form offline (update medical condition)
- Scan QR code to join camp network
- Auto-sync demonstration
- Staff dashboard showing triage assignment (Red Camp due to diabetes)
- Data update demonstration (change medical info → triage changes)

**Given** the Expected Outcomes section
**When** executing each demo step
**Then** clear descriptions exist for what should appear on screen
**And** screenshots or mockups illustrate key moments

**Given** the Troubleshooting section
**When** an issue occurs during demo
**Then** common problems are documented with solutions:
- QR scan fails → use manual WiFi join
- Sync fails → check Pi network connection
- Dashboard doesn't update → refresh manually

---

## Epic 2: Post-Demo Foundation - Family & Data Management

**Goal:** Members can manage complete family units (add dependents), help strangers register without data corruption, and update their information after initial registration with robust sync capabilities.

### Story 2.1: Dependent Management - Add Family Members

As a **Primary Member (Family Head)**,
I want to add my dependents (spouse, children, elderly parents) to my registration,
So that my entire family is registered as a single unit for camp planning.

**Acceptance Criteria:**

**Given** a member is filling out or editing their registration
**When** they navigate to the "Dependents" section
**Then** they see an "ADD DEPENDENT" button (Afrikaans: "VOEG AFHANKLIKE BY")

**Given** member clicks "ADD DEPENDENT"
**When** the dependent form opens
**Then** fields display: Full Name, Relationship (dropdown), Date of Birth, Medical Notes (optional)
**And** relationship options include: Spouse, Child, Parent, Sibling, Other

**Given** member fills out dependent information
**When** they save the dependent
**Then** the dependent is added to a list under the member's registration
**And** dependent data is stored in the database linked to the member's ID
**And** dependent count updates family size

**Given** member has added multiple dependents
**When** viewing the dependents list
**Then** each dependent shows: name, relationship, age
**And** "Edit" and "Remove" buttons are available for each dependent

**Given** member needs to update dependent information
**When** they click "Edit" on a dependent
**Then** the dependent form opens with existing data
**And** member can modify any field
**And** changes save to the database

**Given** member needs to remove a dependent
**When** they click "Remove"
**Then** a confirmation dialog appears: "Remove [Name] from your family?"
**And** if confirmed, dependent is deleted from the database

---

### Story 2.2: Non-Family Member Registration Isolation

As a **Helper Member (Good Samaritan)**,
I want to register a stranger who needs help without mixing their data with my family's registration,
So that both registrations remain separate and accurate.

**Acceptance Criteria:**

**Given** a member wants to help someone without a phone
**When** they open the app
**Then** a menu option displays: "REGISTER OTHER PERSON" (Afrikaans: "REGISTREER ANDER PERSOON")

**Given** member selects "REGISTER OTHER PERSON"
**When** the registration mode selection appears
**Then** the app asks: "Is this person part of your family?" (Afrikaans: "Is hierdie persoon deel van jou familie?")
**And** options show: "YES - Family Member" or "NO - Helping Someone Else"

**Given** member selects "NO - Helping Someone Else"
**When** proceeding to registration
**Then** a NEW member record is created with a separate UUID
**And** the new registration is NOT linked to the helper's family unit
**And** visual indicator shows "Registering: [Other Person's Name]" at top of form

**Given** member completes the non-family registration
**When** they submit the form
**Then** both registrations are saved separately in the database
**And** member can switch back to their own registration view

**Given** member device has multiple registrations (own family + helped others)
**When** viewing registration list
**Then** each registration displays clearly with member name
**And** member can select which registration to view/edit
**And** member can switch between registrations without data corruption

**Given** both registrations sync to camp server
**When** sync completes
**Then** camp staff sees two separate family units
**And** each unit is triaged independently

---

### Story 2.3: Distributed Family Registration & Linking

As a **Family Member Registering Independently**,
I want to register separately from my spouse/family at a different location and link our registrations,
So that camp staff know we're one family unit even though we arrived from different places.

**Acceptance Criteria:**

**Given** a member is registering independently from their spouse
**When** filling out the Member Info section
**Then** a field displays: "Is your family member present?" (Afrikaans: "Is jou familielid teenwoordig?")
**And** options show: "YES - All family members present" or "NO - Family members elsewhere"

**Given** member selects "NO - Family members elsewhere"
**When** additional fields appear
**Then** member can enter: Absent family member names, their location/camp (e.g., "Free State Camp"), relationship

**Given** member submits registration with absent family members noted
**When** data syncs to camp server
**Then** the registration includes family linking information
**And** member's registration is flagged as "partial family unit"

**Given** the absent family member later registers at a different camp
**When** their registration syncs
**Then** the system detects matching family member information (name, relationship, etc.)
**And** links the two registrations as a single family unit

**Given** two family members have registered separately at different camps
**When** both registrations are synced
**Then** Communication staff at both camps see family reunification notification
**And** family unit shows members at multiple locations

**Given** distributed family members later reunite at one camp
**When** one member migrates their data
**Then** the family unit consolidates to show all members at the current camp

---

### Story 2.4: Sync Retry Logic & Queue Management

As a **Member with Intermittent Network**,
I want the app to automatically retry failed syncs and queue my changes,
So that my data eventually reaches the camp server even if the network is unreliable.

**Acceptance Criteria:**

**Given** member makes changes to their registration offline
**When** changes are saved
**Then** the changes are added to the sync queue
**And** sync queue displays pending sync count in the UI

**Given** member connects to camp WiFi but sync fails
**When** the first sync attempt fails
**Then** the app logs the error with details (timestamp, error message)
**And** schedules a retry after 10 seconds (exponential backoff: 10s, 30s, 90s)

**Given** sync fails on first attempt
**When** the retry timer expires
**Then** the app attempts sync again (attempt 2 of 3)
**And** displays "Retrying sync... (Attempt 2 of 3)"

**Given** sync fails after 3 attempts
**When** all retry attempts are exhausted
**Then** the app displays clear error message: "Sync failed after 3 attempts. Please contact camp admin for manual sync."
**And** the failed sync is logged for admin review
**And** sync queue retains the pending changes

**Given** sync eventually succeeds
**When** connection is restored and sync completes
**Then** sync queue is cleared
**And** UI displays "Sync successful - Data received by camp"
**And** pending sync count returns to zero

**Given** member has multiple queued changes
**When** sync succeeds
**Then** all queued changes are sent in order
**And** server processes them sequentially
**And** timestamp-based conflict resolution is applied if needed

---

### Story 2.5: Manual USB Sync Fallback

As an **Admin**,
I want to perform manual USB sync when network connectivity fails completely,
So that member data can still reach the camp server without WiFi.

**Acceptance Criteria:**

**Given** a member's device cannot connect to camp WiFi after multiple attempts
**When** admin connects member device via USB to admin laptop
**Then** the app detects USB connection
**And** displays "USB Sync Mode" option

**Given** admin selects "USB Sync Mode"
**When** the sync process starts
**Then** member data is exported as an encrypted bundle
**And** bundle is transferred to admin laptop via USB file transfer

**Given** encrypted bundle is on admin laptop
**When** admin runs the import script on camp server
**Then** server decrypts the bundle using sync key
**And** imports member data into the database
**And** member record shows "Synced via USB" indicator

**Given** USB sync completes successfully
**When** member checks sync status
**Then** app displays "Sync successful via USB"
**And** sync queue is cleared

**Given** USB bundle transfer fails
**When** error occurs during transfer
**Then** clear error message displays with retry option
**And** bundle remains available for re-export

---

### Story 2.6: Offline Data Persistence & Encryption

As a **Member**,
I want my registration data to persist securely on my device for 30+ days offline,
So that I don't lose my information even if I can't sync immediately.

**Acceptance Criteria:**

**Given** member completes registration offline
**When** data is saved
**Then** data is encrypted using CryptoJS (AES encryption)
**And** encrypted data is stored in local SQLite database (mobile) or IndexedDB (web)

**Given** member's device is restarted
**When** the app reopens
**Then** all registration data loads from local database
**And** data is decrypted and displayed correctly

**Given** member's device runs out of battery and shuts down
**When** device is recharged and app reopens
**Then** all data persists without loss
**And** sync queue retains pending changes

**Given** member force-quits the app
**When** app is reopened
**Then** registration data and sync queue are intact
**And** no data corruption occurs

**Given** member's data has been stored offline for 30+ days
**When** member opens the app
**Then** all data is still accessible
**And** data can be edited and re-saved
**And** sync can be initiated when network becomes available

**Given** sensitive data (ID numbers, medical info) is stored
**When** accessing the database directly (via file explorer)
**Then** data is encrypted and unreadable without decryption key
**And** encryption key is not stored in plaintext

---

## Epic 3: Staff Operations - Role-Based Access & Privacy

**Goal:** Camp staff (Medical, Security, Logistics, Communication, Admin) can access member data according to their role with privacy protections and audit logging.

### Story 3.1: Full Role-Based Access Control (RBAC) System

As a **Camp Admin**,
I want to assign specific roles to staff members that control what data they can access,
So that privacy is enforced and staff only see information necessary for their duties.

**Acceptance Criteria:**

**Given** the RBAC system is implemented
**When** defining roles
**Then** 7 roles exist: Member, Reception, Medical, Security, Logistics, Communication, Admin
**And** each role has specific data access permissions defined

**Given** a staff member logs into the system
**When** authentication succeeds
**Then** their assigned role determines which dashboards and data they can access
**And** unauthorized features are hidden from the UI

**Given** Reception role is assigned to staff
**When** they access member data
**Then** they see: member name, family size, camp assignment (Red/Green)
**And** they see indicators like "[MEDICAL - See Medical Staff]"
**And** they CANNOT see: medical details, firearms data, sensitive personal info

**Given** Medical role is assigned to staff
**When** they access member data
**Then** they see: full medical profiles (blood type, conditions, medications, allergies)
**And** they CANNOT see: firearms data, detailed financial info

**Given** Security role is assigned to staff
**When** they access member data
**Then** they see: firearms declarations, ammunition, shooting experience, ID verification
**And** they CANNOT see: medical details beyond basic emergency contact info

**Given** Admin role is assigned to staff
**When** they access the system
**Then** they have full access to all data and all dashboards
**And** they can assign/revoke roles for other staff

---

### Story 3.2: Medical Staff Dashboard with Privacy Enforcement

As a **Medical Staff Member**,
I want to access complete medical profiles of members with critical flags highlighted,
So that I can provide appropriate emergency medical care.

**Acceptance Criteria:**

**Given** Medical staff logs into their dashboard
**When** the dashboard loads
**Then** a list of all members is displayed
**And** members with critical medical flags are highlighted at the top

**Given** a member has critical medical conditions
**When** Medical staff views the member list
**Then** critical flags display: "INSULIN REQUIRED", "HEART CONDITION", "POST-STROKE", etc.
**And** visual indicators (red icons/badges) highlight urgency

**Given** Medical staff selects a member
**When** the medical profile opens
**Then** complete medical data displays:
- Blood type
- Chronic conditions
- Current medications (with dosages)
- Allergies
- Medical aid information
- Emergency medical contacts

**Given** Medical staff needs to search for members by condition
**When** using the search/filter function
**Then** they can filter by: blood type, specific conditions, medication requirements
**And** filtered results display matching members

**Given** Medical staff accesses a member's medical profile
**When** viewing sensitive data
**Then** access is logged (timestamp, staff ID, member ID, action)
**And** log is stored for audit trail

**Given** non-Medical staff attempts to access medical details
**When** they try to view a medical profile
**Then** access is denied
**And** error message displays: "Access denied - Medical role required"
**And** attempted access is logged for security review

---

### Story 3.3: Security Staff Dashboard with Firearms Tracking

As a **Security Staff Member**,
I want to see which members have declared firearms and their shooting experience,
So that I can plan camp defense and maintain internal safety.

**Acceptance Criteria:**

**Given** Security staff logs into their dashboard
**When** the dashboard loads
**Then** a summary displays:
- Total members with firearms declared
- Total ammunition count
- Members with shooting experience (by category: military, sport, hunting)

**Given** Security staff views the firearms list
**When** browsing declared firearms
**Then** each entry shows: Member name, firearm type, license status, ammunition count, shooting experience level
**And** entries are sortable by experience level or firearm type

**Given** Security staff selects a member with firearms
**When** the detailed view opens
**Then** complete firearms data displays:
- Firearm type(s) and make/model
- License number and expiry date
- Ammunition quantity declared
- Shooting experience (military/sport/hunting/none)
- Training certifications (if any)

**Given** Security staff needs to identify defense volunteers
**When** filtering by criteria
**Then** they can filter for: "Military experience" or "Sport shooting >5 years"
**And** potential defense volunteers are identified

**Given** Security staff accesses firearms data
**When** viewing sensitive firearms information
**Then** access is logged (timestamp, staff ID, member ID, action)
**And** log entry includes "FIREARMS DATA ACCESS" flag for enhanced audit

**Given** non-Security/non-Admin staff attempts to access firearms data
**When** they try to view firearms information
**Then** access is denied
**And** error message displays: "Access denied - Security role required"
**And** security violation is logged and Admin is alerted

---

### Story 3.4: Logistics Staff Dashboard for Resource Management

As a **Logistics Staff Member**,
I want to see aggregate resource data and skills inventory,
So that I can plan supply distribution and identify members with critical skills.

**Acceptance Criteria:**

**Given** Logistics staff logs into their dashboard
**When** the dashboard loads
**Then** aggregate resource summary displays:
- Total members/families count
- Average days of water supply per family
- Average days of food supply per family
- Medical supply needs (insulin, heart meds, etc.) with quantities
- Vehicle and fuel availability

**Given** Logistics staff views skills inventory
**When** browsing member skills
**Then** skills are categorized: Medical (doctors, nurses), Mechanical (mechanics, engineers), Agricultural (farmers), Communication (radio operators), etc.
**And** count of members per skill category is displayed

**Given** Logistics staff needs to identify specific skills
**When** searching for a skill (e.g., "mechanic")
**Then** all members with that skill are listed
**And** contact information is displayed for coordination

**Given** Logistics staff views supply shortages
**When** analyzing resource needs
**Then** critical shortages are highlighted (e.g., "Heart medication: 3 people need, only 10 days stock")
**And** recommendations display for supply requests

**Given** Logistics staff needs to plan vehicle assignments
**When** viewing vehicle inventory
**Then** list shows: member name, vehicle type, fuel level, capacity
**And** vehicles available for supply runs are flagged

**Given** Logistics staff accesses resource data
**When** viewing member supplies and skills
**Then** they see aggregate data and non-sensitive member info
**And** they CANNOT see: medical details, firearms data, personal ID numbers

---

### Story 3.5: Communication Staff Dashboard for Family Reunification

As a **Communication Staff Member**,
I want to search for members and see family member locations across camps,
So that I can facilitate family reunification during emergencies.

**Acceptance Criteria:**

**Given** Communication staff logs into their dashboard
**When** the dashboard loads
**Then** a search interface displays with fields: Name, ID Number, Vehicle Registration

**Given** Communication staff searches for a member by name
**When** entering partial or full name
**Then** matching results display with: Full name, family size, current camp location, sync status
**And** family member links show if distributed across camps

**Given** a family member registered separately at another camp
**When** Communication staff views the member record
**Then** inter-camp family notification displays: "Family member [Name] registered at [Other Camp Name]"
**And** contact information for the other camp is provided

**Given** Communication staff receives a family reunification request
**When** searching for a missing family member
**Then** they can search by name, ID number, or vehicle registration
**And** if found, location and status display
**And** if not found, status shows "Not yet synced" or "Not registered"

**Given** family members need to be contacted
**When** Communication staff views member contact info
**Then** emergency contact details display
**And** Communication staff can log reunion status updates

**Given** Communication staff facilitates reunion
**When** family members are located
**Then** reunion event is logged with timestamp and staff ID
**And** family unit status updates to "Reunited"

---

### Story 3.6: Admin Operations Dashboard

As an **Admin**,
I want full system access to monitor health, manage roles, and troubleshoot issues,
So that I can ensure the camp system operates reliably.

**Acceptance Criteria:**

**Given** Admin logs into their dashboard
**When** the main dashboard loads
**Then** system health overview displays:
- System uptime
- Total members synced
- Pending syncs count
- Failed syncs count with details
- Active staff sessions (by role)
- Database size and storage usage

**Given** Admin views sync monitoring
**When** checking sync status
**Then** recent sync activity displays with: timestamp, member ID, sync result (success/failure), error details if failed
**And** failed syncs are highlighted for investigation

**Given** Admin needs to manage staff roles
**When** accessing user role management
**Then** list of all staff accounts displays with current role assignments
**And** Admin can assign/change/revoke roles for any staff member
**And** role changes take effect immediately

**Given** Admin assigns a new role to staff
**When** role assignment is saved
**Then** staff member's access permissions update
**And** role change is logged in audit trail

**Given** Admin needs to troubleshoot a failed sync
**When** viewing failed sync details
**Then** complete error log displays: timestamp, member device ID, error message, retry attempts
**And** Admin can manually trigger USB sync or data review

**Given** Admin needs to fulfill a data deletion request
**When** selecting a member for deletion
**Then** confirmation prompt appears: "Permanently delete [Member Name]? This cannot be undone."
**And** if confirmed, member data is permanently deleted from database
**And** deletion is logged with Admin ID and timestamp

---

### Story 3.7: Audit Logging for Data Access & Privacy Compliance

As an **Admin**,
I want all staff data access logged with timestamp and user details,
So that I can audit data access and detect inappropriate usage.

**Acceptance Criteria:**

**Given** any staff member accesses member data
**When** viewing a member record
**Then** access is logged with: timestamp, staff ID, staff role, member ID, action (view/edit/delete)
**And** log entry is stored in audit log table

**Given** Medical staff accesses medical profiles
**When** viewing sensitive medical data
**Then** log entry includes flag: "MEDICAL DATA ACCESS"
**And** member ID and specific data accessed is recorded

**Given** Security staff accesses firearms data
**When** viewing firearms information
**Then** log entry includes flag: "FIREARMS DATA ACCESS"
**And** enhanced audit trail is created for compliance

**Given** Admin reviews audit logs
**When** accessing the audit log dashboard
**Then** logs are searchable by: date range, staff member, member accessed, action type
**And** logs display in reverse chronological order (newest first)

**Given** inappropriate data access is detected
**When** Admin reviews suspicious activity (e.g., Reception staff attempting Medical data access)
**Then** violations are flagged with red indicator
**And** Admin can generate report of violations
**And** Admin can revoke staff access immediately

**Given** audit logs reach 90 days retention
**When** old logs expire
**Then** logs older than 90 days are archived (not deleted)
**And** Admin can access archives if needed for investigation

---

### Story 3.8: Data Consent & Member Rights

As a **Member**,
I want to provide consent for data collection and be able to request data deletion,
So that I have control over my personal information.

**Acceptance Criteria:**

**Given** a member starts registration for the first time
**When** opening the registration form
**Then** a consent screen displays before accessing the form
**And** consent text explains: data collection purpose, storage location (local + camp server), usage (camp planning only), no third-party sharing

**Given** member reads consent information
**When** reviewing consent screen
**Then** checkbox displays: "I acknowledge and consent to data collection as described"
**And** "Proceed" button is disabled until checkbox is checked

**Given** member checks consent checkbox
**When** clicking "Proceed"
**Then** consent is recorded with timestamp
**And** member proceeds to registration form

**Given** member wants to request data deletion
**When** accessing Settings or Help menu
**Then** option displays: "Request Data Deletion"
**And** explanation shows: "Your data will be permanently deleted. This cannot be undone."

**Given** member initiates data deletion request
**When** confirming deletion request
**Then** request is flagged for Admin review
**And** member receives confirmation: "Deletion request submitted. Admin will process within 7 days."

**Given** Admin receives deletion request
**When** reviewing pending requests
**Then** member name and request date display
**And** Admin can approve deletion (permanent) or contact member for clarification

**Given** Admin approves deletion
**When** deletion is executed
**Then** all member data is permanently removed from database
**And** deletion is logged with Admin ID, member ID, and timestamp
**And** member receives notification: "Your data has been deleted"

---

## Epic 4: System Administration & Reliability

**Goal:** Admins can monitor system health, manage backups, troubleshoot sync issues, manage user roles, and ensure data integrity across camps.

### Story 4.1: System Health Monitoring Dashboard

As an **Admin**,
I want a comprehensive system health dashboard showing uptime, sync status, and errors,
So that I can proactively identify and resolve issues before they impact camp operations.

**Acceptance Criteria:**

**Given** Admin logs into the system health dashboard
**When** the dashboard loads
**Then** key metrics display:
- System uptime (hours/days online)
- Total members synced (count)
- Pending syncs (count with details)
- Failed syncs (count with error details)
- Active staff sessions (count by role)
- Database size (MB/GB) and storage usage percentage
- Last backup timestamp

**Given** the dashboard is displaying metrics
**When** data updates
**Then** metrics refresh automatically every 30 seconds
**And** critical alerts appear as notifications (red badges)

**Given** failed syncs exist
**When** Admin clicks on "Failed Syncs" metric
**Then** detailed list displays: device ID, member name (if known), timestamp, error message, retry count
**And** Admin can select individual failures for troubleshooting

**Given** critical system issues occur
**When** errors are detected (e.g., database full, sync failures >10)
**Then** alerts display prominently with red indicators
**And** notification includes recommended action (e.g., "Clear old logs" or "Check network connectivity")

**Given** Admin needs historical data
**When** viewing system metrics
**Then** time-series graphs display for: sync activity (last 24 hours), error rates, storage usage over time
**And** Admin can export metrics as CSV for reporting

---

### Story 4.2: Database Backup & Restore System

As an **Admin**,
I want to perform manual backups and restore from backup files,
So that member data is protected against system failure or data corruption.

**Acceptance Criteria:**

**Given** Admin accesses the backup management interface
**When** the backup page loads
**Then** current backup status displays:
- Last automated backup timestamp
- Backup file size
- Backup location (USB drive path)
- Next scheduled backup time (automated daily backup at midnight)

**Given** Admin needs to create a manual backup
**When** clicking "Create Backup Now"
**Then** backup process initiates
**And** progress indicator shows: "Creating backup... (encrypting data)"
**And** upon completion: "Backup created successfully: backup-[timestamp].enc"
**And** backup file is saved to configured USB drive location

**Given** backup file is created
**When** checking backup integrity
**Then** backup file is encrypted using AES encryption
**And** file includes: all member data, sync queue, audit logs, system configuration
**And** backup manifest includes: timestamp, record count, database schema version

**Given** Admin needs to restore from backup
**When** selecting "Restore from Backup"
**Then** file selector displays available backup files (sorted by date, newest first)
**And** each backup shows: timestamp, file size, record count

**Given** Admin selects a backup file to restore
**When** confirming restoration
**Then** warning displays: "This will replace current database. Current data will be backed up first. Continue?"
**And** if confirmed, current database is backed up automatically before restoration

**Given** restoration proceeds
**When** restoring from backup file
**Then** backup file is decrypted
**And** database is replaced with backup data
**And** progress shows: "Restoring... X of Y records"
**And** upon completion: "Restore successful. System restarting..."

**Given** automated daily backup is configured
**When** midnight cron job executes
**Then** backup is created automatically
**And** backup files older than 30 days are archived or deleted (configurable retention)
**And** Admin receives notification if automated backup fails

---

### Story 4.3: Manual Triage Override

As a **Reception or Medical Staff Member**,
I want to manually override the automatic triage assignment,
So that I can correct assignments based on on-the-ground assessment.

**Acceptance Criteria:**

**Given** Reception or Medical staff views a member's camp assignment
**When** the assignment displays (e.g., "Red Camp")
**Then** an "Override Assignment" button is visible (only for Reception/Medical/Admin roles)

**Given** staff clicks "Override Assignment"
**When** the override dialog opens
**Then** current assignment displays with reason (e.g., "Red Camp - [MEDICAL - See Medical Staff]")
**And** dropdown allows selection: "Red Camp" or "Green Camp"
**And** text field requires: "Reason for override" (mandatory)

**Given** staff selects new assignment and enters reason
**When** clicking "Save Override"
**Then** camp assignment is updated immediately
**And** override is logged with: staff ID, staff role, old assignment, new assignment, reason, timestamp
**And** original automatic triage recommendation is preserved in database (for audit)

**Given** member record displays after override
**When** viewing camp assignment
**Then** visual indicator shows: "Red Camp (MANUALLY ASSIGNED)"
**And** tooltip displays: "Overridden by [Staff Name] on [Date]: [Reason]"

**Given** Admin reviews triage overrides
**When** accessing override audit log
**Then** all overrides display with: member name, staff who overrode, old/new assignment, reason, timestamp
**And** Admin can filter by staff member or date range

**Given** override was made in error
**When** staff or Admin wants to revert
**Then** "Revert to Automatic Triage" button is available
**And** system re-applies original triage logic
**And** reversion is logged in audit trail

---

### Story 4.4: User Role Management Interface

As an **Admin**,
I want to assign and revoke staff roles through a management interface,
So that I can control who has access to what data.

**Acceptance Criteria:**

**Given** Admin accesses the User Role Management page
**When** the page loads
**Then** list of all staff accounts displays with: Name, Email, Current Role, Status (Active/Inactive), Last Login

**Given** Admin needs to add a new staff member
**When** clicking "Add Staff Member"
**Then** form displays with fields: Name, Email, Password (initial), Role (dropdown)
**And** role dropdown shows: Reception, Medical, Security, Logistics, Communication, Admin

**Given** Admin fills in new staff details
**When** clicking "Create Account"
**Then** staff account is created with assigned role
**And** staff member receives login credentials (email or printed sheet)
**And** account creation is logged with Admin ID and timestamp

**Given** Admin needs to change a staff member's role
**When** selecting a staff member and clicking "Change Role"
**Then** role dropdown displays with current role pre-selected
**And** Admin can select new role from dropdown

**Given** Admin saves role change
**When** clicking "Save Role Change"
**Then** confirmation prompt displays: "Change [Staff Name]'s role from [Old Role] to [New Role]?"
**And** if confirmed, role is updated immediately
**And** staff member's active session is terminated (requires re-login)
**And** role change is logged in audit trail

**Given** Admin needs to revoke access (e.g., inappropriate data access)
**When** selecting a staff member and clicking "Revoke Access"
**Then** confirmation prompt displays: "Revoke access for [Staff Name]? They will be immediately logged out."
**And** if confirmed, staff account is set to Inactive
**And** all active sessions for that staff member are terminated
**And** revocation is logged with reason field

**Given** Admin views active staff sessions
**When** accessing "Active Sessions" tab
**Then** list shows: Staff Name, Role, Login Time, Last Activity, IP Address
**And** Admin can terminate individual sessions if needed

---

### Story 4.5: Identity Verification & Duplicate Detection

As an **Admin**,
I want the system to validate South African ID numbers and detect duplicates,
So that fraudulent registrations and duplicate entries are flagged for review.

**Acceptance Criteria:**

**Given** a member enters their South African ID number during registration
**When** the ID number field loses focus (blur event)
**Then** system validates ID number format (13 digits)
**And** validates checksum using Luhn algorithm (South African ID checksum)
**And** if invalid, error displays: "Invalid ID number format. Please check and re-enter."

**Given** member enters a valid ID number format
**When** validation succeeds
**Then** green checkmark appears next to field
**And** registration can proceed

**Given** member enters an ID number that already exists in the database
**When** sync occurs or database check runs
**Then** system flags duplicate ID number
**And** Admin notification displays: "Duplicate ID detected: [ID Number] - [Member Name 1] and [Member Name 2]"

**Given** Admin receives duplicate ID alert
**When** reviewing the alert
**Then** both member records display side-by-side for comparison
**And** Admin can determine if: (a) Legitimate - same person registered twice, merge records, or (b) Fraud - different person using same ID, investigate

**Given** Admin identifies legitimate duplicate (same person, double registration)
**When** selecting "Merge Records"
**Then** system combines both records, preserving most recent data
**And** older record is marked as "Merged" with reference to active record
**And** merge action is logged

**Given** Admin identifies fraudulent use
**When** selecting "Flag for Investigation"
**Then** both records are flagged with "FRAUD INVESTIGATION" status
**And** Security staff is notified
**And** records are locked from further updates until investigation resolves

**Given** system performs routine duplicate checks
**When** nightly batch job runs
**Then** all ID numbers are checked for duplicates
**And** any new duplicates are flagged and Admin is notified

---

### Story 4.6: Inter-Camp Administration & Sync Coordination

As an **Admin**,
I want to initiate and monitor inter-camp sync operations,
So that family data can be shared across camps for reunification.

**Acceptance Criteria:**

**Given** Admin accesses the Inter-Camp Sync page
**When** the page loads
**Then** list of known camps displays with: Camp Name, Camp ID, Last Sync Timestamp, Sync Status (Connected/Disconnected)

**Given** Admin needs to sync with another camp
**When** selecting a camp and clicking "Initiate Sync"
**Then** sync method selection displays: "Satellite Link", "Radio Data Transfer", "USB Physical Transfer"
**And** Admin selects appropriate method based on available connectivity

**Given** Admin initiates satellite link sync
**When** sync process starts
**Then** progress indicator shows: "Connecting to [Camp Name]... Sending data... Receiving data..."
**And** data exchanged includes: new member registrations, updates, family linking information

**Given** inter-camp sync completes successfully
**When** sync finishes
**Then** status displays: "Sync successful - X records sent, Y records received"
**And** Communication staff receives notifications for any family reunification opportunities
**And** sync timestamp is updated for the camp

**Given** inter-camp sync fails
**When** connection error occurs
**Then** error message displays with details: "Sync failed - [Error: Connection timeout]"
**And** Admin can retry or switch to alternative sync method (e.g., USB transfer)

**Given** Admin needs to resolve inter-camp conflicts
**When** both camps have updates to the same member record
**Then** conflict resolution screen displays: Camp A data vs Camp B data
**And** Admin can select which version to keep or manually merge
**And** timestamp-based last-write-wins is suggested default

**Given** Admin reviews inter-camp sync history
**When** accessing sync logs
**Then** history displays: Sync timestamp, Partner camp, Records sent/received, Status, Conflicts resolved
**And** Admin can export sync logs for reporting

---

### Story 4.7: Multi-Language Support (Afrikaans & English Toggle)

As a **Member or Staff User**,
I want to switch between Afrikaans and English languages,
So that I can use the app in my preferred language.

**Acceptance Criteria:**

**Given** user opens the app for the first time
**When** the app launches
**Then** language selection prompt displays: "Select Language / Kies Taal"
**And** options show: "English" and "Afrikaans"

**Given** user selects a language
**When** confirming selection
**Then** language preference is saved to device storage (localStorage or Preferences)
**And** entire app UI updates to selected language
**And** all labels, buttons, messages, error texts display in selected language

**Given** user is using the app in Afrikaans
**When** accessing Settings menu
**Then** language option displays: "Taal: Afrikaans"
**And** toggle switch shows "Afrikaans | English"

**Given** user switches from Afrikaans to English
**When** toggling language setting
**Then** app immediately updates all UI text to English
**And** language preference is saved
**And** app remembers preference across sessions (persists after restart)

**Given** app is using i18n translation system
**When** displaying any text
**Then** translation keys are used (not hardcoded strings)
**And** missing translations display fallback (English) with warning logged

**Given** staff uses app with language toggle
**When** switching roles (e.g., Member to Reception Staff)
**Then** language preference persists across role switches
**And** dashboards display in selected language

**Given** future language expansion is needed (Zulu, Xhosa - Vision phase)
**When** adding new language
**Then** i18n framework supports adding new language files without code changes
**And** language dropdown simply adds new option

---

## Epic 5: Inter-Camp Sync & Advanced Features

**Goal:** Multiple camps can sync member data, families separated across camps can be reunited, and the system supports multi-camp federation.

### Story 5.1: Inter-Camp Data Synchronization & Family Reunification

As a **Communication Staff Member across multiple camps**,
I want camps to automatically sync member data and notify me when family members are at different camps,
So that separated families can be reunited even when they arrived at different locations.

**Acceptance Criteria:**

**Given** two camps have established inter-camp sync connection
**When** member data syncs at Camp A
**Then** system checks if member has indicated "family members elsewhere"
**And** if family linking data exists, sync includes family reunion metadata

**Given** a spouse registered at Camp A with note "husband at Camp B"
**When** Camp A syncs with Camp B
**Then** system searches Camp B database for matching family member (by name, ID, relationship)
**And** if match found, creates family link between the two registrations

**Given** family link is established between camps
**When** Communication staff at Camp A logs in
**Then** notification displays: "Family reunion opportunity: [Member Name] has spouse [Spouse Name] at Camp B"
**And** notification includes contact info for Camp B Communication staff

**Given** family member at Camp A wants to migrate to Camp B
**When** Communication staff initiates migration request
**Then** migration request is sent to Camp B Admin
**And** Camp B Admin reviews and approves migration
**And** member data is transferred from Camp A to Camp B
**And** Camp A marks member as "Migrated to Camp B on [Date]"

**Given** inter-camp sync occurs regularly
**When** scheduled sync runs (e.g., every 6 hours via satellite/radio)
**Then** new registrations, updates, and family linking data are exchanged
**And** conflicts are resolved using timestamp-based last-write-wins
**And** sync log records: timestamp, records exchanged, family links created

**Given** separated family members are reunited at one camp
**When** family status updates
**Then** both camps receive notification: "Family [Family Name] reunited at Camp B"
**And** consolidated family unit displays all members together
**And** original separate registrations are preserved in history for audit

**Given** camps lose connectivity after initial sync
**When** inter-camp link is unavailable
**Then** each camp continues operating independently with last known data
**And** when connectivity restores, delta sync occurs (only changes since last sync)
**And** no data is lost during disconnection period

**Given** Communication staff searches for a member across camps
**When** using cross-camp search feature
**Then** search queries both local database and last known inter-camp sync data
**And** results show: Member name, current camp location, last sync timestamp
**And** if member location is uncertain, status shows "Last known: Camp A (3 days ago)"

**Given** inter-camp sync encounters data conflicts
**When** same member record updated at both camps
**Then** conflict resolution uses timestamp (most recent update wins)
**And** for medical data conflicts, both versions are flagged for manual review
**And** Admin at both camps receives conflict notification with details

**Given** Admin needs to verify inter-camp data integrity
**When** reviewing inter-camp sync logs
**Then** detailed log displays: sync events, family links created, migrations, conflicts resolved
**And** data integrity metrics show: total members across all camps, family units spanning camps, sync success rate

