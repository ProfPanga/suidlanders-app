# Architecture Documentation - Suidlanders Emergency Plan App

## Executive Summary

The Suidlanders Emergency Plan App is an **offline-first mobile application** built with Ionic/Angular/Capacitor, designed for emergency camp scenarios where internet connectivity is unavailable. The app enables member registration and data synchronization via local network (LAN) using QR code provisioning.

**Key Architectural Characteristics:**
- **100% offline operation** - No internet dependency
- **Dual-database architecture** - SQLite (mobile) + IndexedDB (web) with automatic detection
- **LAN-based sync** - Camp server communication over local network
- **Client-side encryption** - Sensitive data encrypted before storage
- **Cross-platform** - Android, iOS (capable), and web/desktop

---

## Architecture Pattern

**Primary Pattern:** **Component-Based Architecture** (Angular)

**Supporting Patterns:**
- **Service Layer Pattern** - Business logic abstraction
- **Repository Pattern** - Database abstraction (DatabaseService)
- **Observer Pattern** - RxJS Observables for reactive data flow
- **Strategy Pattern** - Platform-specific database strategies

---

## Technology Stack

### Frontend Framework
| Technology | Version | Purpose |
|-----------|---------|---------|
| **Angular** | 19.2.11 | Core web framework, component architecture |
| **Ionic** | 8.5.7 | Cross-platform mobile UI components |
| **TypeScript** | 5.6.3 | Statically-typed JavaScript, strict mode |
| **RxJS** | 7.8.0 | Reactive programming, Observables |
| **SCSS** | - | CSS preprocessor for styling |

### Mobile Platform
| Technology | Version | Purpose |
|-----------|---------|---------|
| **Capacitor** | 7.2.0 | Native device API bridge |
| **Android SDK** | 33+ | Android platform support |
| **Gradle** | 8.x | Android build system |

### Data Layer
| Technology | Version | Purpose |
|-----------|---------|---------|
| **SQLite** | 7.0.0 | Mobile local database (@capacitor-community/sqlite) |
| **Dexie** | 4.0.11 | IndexedDB wrapper for web/desktop |
| **CryptoJS** | 4.2.0 | Client-side data encryption |

### Utilities
| Technology | Version | Purpose |
|-----------|---------|---------|
| **qrcode** | 1.5.4 | QR code generation |
| **@zxing/library** | 0.21.3 | QR code scanning |
| **pako** | 2.1.0 | Data compression (USB bundles) |
| **uuid** | 11.1.0 | UUID generation |

---

## System Architecture

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Presentation Layer                       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Ionic UI Components (ion-*)                        │   │
│  │  • Form Sections (12 components)                    │   │
│  │  • Utility Components (Header, QR, Theme, etc.)     │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                      Application Layer                       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Angular Services (9 services)                      │   │
│  │  • DatabaseService (dual-database abstraction)      │   │
│  │  • SyncService (offline sync orchestration)         │   │
│  │  • ApiService (HTTP client)                         │   │
│  │  • AuthService (JWT + sync tokens)                  │   │
│  │  • QRService, ExportService, ThemeService, etc.     │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                       Data Layer                             │
│  ┌──────────────────────┐      ┌──────────────────────┐    │
│  │   Mobile Platform    │      │   Web Platform       │    │
│  │  ┌────────────────┐  │      │  ┌────────────────┐  │    │
│  │  │  SQLite DB     │  │      │  │  IndexedDB     │  │    │
│  │  │  (Capacitor)   │  │      │  │  (Dexie)       │  │    │
│  │  └────────────────┘  │      │  └────────────────┘  │    │
│  └──────────────────────┘      └──────────────────────┘    │
│           Platform Detection (Ionic Platform)               │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                    Native Device APIs                        │
│  • Camera (QR Scanning, Document Photos)                    │
│  • Filesystem (Document Storage)                            │
│  • Geolocation (GPS Coordinates)                            │
│  • Preferences (Secure Key-Value Storage)                   │
│  • Share (USB Export)                                        │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                     External Systems                         │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Camp Server (LAN/Internet)                         │   │
│  │  • REST API (sync, auth, member CRUD)               │   │
│  │  • QR Provisioning Endpoint                         │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## Data Architecture

### Dual-Database Strategy

**Problem:** Mobile apps need SQLite for native performance, but web/desktop uses IndexedDB.

**Solution:** `DatabaseService` provides unified interface with automatic platform detection.

```typescript
Platform Detection:
┌─────────────────────────────────────┐
│  platform.is('desktop') ||          │
│  platform.is('mobileweb')           │
└──────────────┬──────────────────────┘
               │
        ┌──────┴──────┐
        │             │
     YES │             │ NO
        ▼             ▼
  IndexedDB       SQLite
   (Dexie)    (Capacitor)
```

**Fallback Mechanism:**
If SQLite initialization fails → automatically falls back to IndexedDB

### Database Schema

**11 Normalized Tables:**
1. `members` - Root table (UUID primary key)
2. `basic_info` - Personal/contact information
3. `member_info` - Emergency contacts, qualifications
4. `address_info` - Location, GPS coordinates
5. `medical_info` - Blood type, conditions, medication
6. `vehicle_info` - Vehicles (multi-entry, 1:N relationship)
7. `skills_info` - Occupation, licenses, skills
8. `equipment_info` - Gear inventory (boolean flags)
9. `camp_info` - Camp assignment
10. `other_info` - Additional notes, supplies
11. `documents` - File uploads (PDF/JPG/PNG)

**Relationships:**
- All tables use `member_id` foreign key → `members(id)`
- All foreign keys have `ON DELETE CASCADE`
- `vehicle_info` and `documents` support multiple entries per member

**Encryption:**
- Sensitive fields encrypted with CryptoJS (AES)
- Encryption key stored in DatabaseService (production: use Capacitor Preferences)
- Encrypted: ID numbers, medical data, personal info

---

## Component Architecture

### Component Hierarchy

```
AppComponent (Root)
├── HeaderComponent
│   ├── ThemeToggleComponent
│   └── Navigation Menu
├── Router Outlet
│   ├── HomePage
│   │   └── MemberFormComponent (Container)
│   │       ├── BasicInfoComponent
│   │       ├── MemberInfoComponent
│   │       ├── AddressInfoComponent
│   │       ├── MedicalInfoComponent
│   │       ├── VehicleInfoComponent
│   │       ├── SkillsInfoComponent
│   │       ├── EquipmentInfoComponent
│   │       ├── OtherInfoComponent
│   │       ├── CampInfoComponent
│   │       ├── DocumentsInfoComponent
│   │       └── DependentsComponent
│   ├── LoginPage
│   │   └── AuthService Integration
│   └── QRTestPage
│       ├── QRGeneratorComponent
│       └── QRScannerComponent
└── (Debug Routes)
    ├── DbTestComponent
    └── DataViewerComponent
```

### Form Architecture

**Pattern:** Reactive Forms with `ControlValueAccessor`

**Flow:**
1. `MemberFormComponent` creates `FormGroup`
2. Each section component implements `ControlValueAccessor`
3. Sections bind to FormControl via `formControlName`
4. Two-way data binding between parent and child
5. Parent validates aggregate form
6. On submit → `DatabaseService.createMember()`

**Validation Strategy:**
- Angular built-in validators (required, email, etc.)
- Custom validators for ID numbers, phone numbers
- Aggregate validation at form level
- Visual feedback via Ionic error states

---

## Service Layer Architecture

### Core Services

#### DatabaseService
**Responsibility:** Unified database interface with platform detection

**Key Methods:**
- `createMember(data)` - Insert new member record
- `updateMember(id, data)` - Update existing member
- `deleteMember(id)` - Soft delete (status='deleted')
- `getMember(id)` - Retrieve single member
- `getAllMembers()` - Retrieve all members
- `encrypt(data)` / `decrypt(data)` - CryptoJS encryption

**Platform Strategy:**
```typescript
if (platform.is('desktop') || platform.is('mobileweb')) {
  useIndexedDB = true;
  initializeIndexedDB();
} else {
  initializeDatabase(); // SQLite
}
```

---

#### SyncService
**Responsibility:** Offline sync orchestration

**Features:**
- Auto-sync every 5 minutes (configurable)
- Manual sync trigger
- Queue-based offline sync
- Conflict resolution (timestamp-based)

**Sync Flow:**
```
1. Check for pending changes (SyncQueueService)
2. Push changes to server (ApiService.syncChanges)
3. Pull server changes since lastSyncTime
4. Apply server changes locally
5. Resolve conflicts (last-write-wins)
6. Update lastSyncTime
```

---

#### ApiService
**Responsibility:** HTTP client for camp server

**Base URL Priority:**
1. Camp base URL (from QR scan, stored temporarily)
2. environment.apiUrl (fallback)

**Endpoints:**
- Auth: `/auth/login`, `/auth/camp/exchange`
- Sync: `/sync/push`, `/sync/pull`
- Members: `/members` (CRUD operations)

**Authentication:**
- JWT token for staff/admin (`Authorization: Bearer`)
- Sync token for device provisioning (short-lived)

---

#### AuthService
**Responsibility:** Authentication and token management

**Token Types:**
1. **JWT Token** (staff/admin)
   - Long-lived session token
   - Stored: localStorage (`access_token`)
   - Use: Staff accessing camp server backend

2. **Sync Token** (device provisioning)
   - Short-lived (expires after sync)
   - Stored: localStorage (`camp_sync_token`)
   - Use: Device syncing member data

**Camp Base URL:**
- Stored temporarily during sync
- Cleared after sync completes
- Multiple URLs tried (mDNS, IP, AP)

---

### Supporting Services

| Service | Purpose |
|---------|---------|
| **SyncQueueService** | Manages offline sync queue, retry logic (3 attempts) |
| **IndexedDbService** | Dexie wrapper for IndexedDB operations |
| **ExportService** | HTML export, USB encrypted bundle creation |
| **QRService** | QR generation (qrcode lib) and scanning (@zxing) |
| **ThemeService** | Dark/light mode management, localStorage persistence |

---

## Offline-First Design

### Principles
1. **Local-First:** Database is source of truth
2. **Eventual Consistency:** Changes sync when network available
3. **Queue-Based:** Failed syncs queued for retry
4. **No Internet Required:** All core features work offline

### Sync Strategy

**Queue Table:** (Managed by SyncQueueService, not in schema)
```typescript
{
  id: string;
  operation: 'create' | 'update' | 'delete';
  table: string;
  recordId: string;
  data: any;
  timestamp: number;
  retries: number;
}
```

**Auto-Sync:**
- Interval: 5 minutes
- Trigger: `setInterval()` in SyncService constructor
- Can be stopped/restarted: `stopAutoSync()`, `startAutoSync()`

**Manual Sync:**
- User-triggered via UI button
- Force sync: `SyncService.sync()`

**Conflict Resolution:**
- **Strategy:** Last-write-wins (server timestamp authority)
- **Detection:** Server compares timestamps
- **Resolution:** Server wins, conflicts returned in response
- **Logging:** Conflicts displayed to user for review

---

## Security Architecture

### Client-Side Encryption
**Library:** CryptoJS (AES encryption)

**Encrypted Fields:**
- Personal information (ID numbers, names)
- Medical data (blood type, conditions, medications)
- Contact information (phone, email)

**Key Storage:**
- **Development:** Hardcoded in DatabaseService
- **Production:** Should use Capacitor Preferences with encryption

**Encryption Flow:**
```
User Input → Encrypt (CryptoJS) → Store in DB
DB Read → Decrypt (CryptoJS) → Display to User
```

---

### Authentication Flow

#### Standard Auth (Staff/Admin)
```
1. User enters email/password
2. POST /auth/login → JWT token
3. Store token in localStorage
4. Include in all API requests (Authorization header)
```

#### Camp Sync Auth (Device Provisioning)
```
1. Staff generates QR on camp server
2. QR contains: serverUrls[], syncCode, campId
3. Device scans QR
4. For each serverUrl:
   - Try POST /auth/camp/exchange
   - If success → sync token received
   - If fail → try next URL
5. Device syncs with sync token
6. Clear sync token + base URL after sync
```

---

### Data Transmission Security
- **Internet Mode:** HTTPS recommended
- **LAN Mode:** HTTP acceptable (isolated network)
- **Encryption:** Data encrypted before transmission (CryptoJS)
- **Token Expiry:** Sync tokens expire after use

---

## Network Architecture

### LAN Mode (Camp Scenario)

**Problem:** No internet in emergency camp environments

**Solution:** Local Raspberry Pi server with multiple network interfaces

**QR Provisioning Flow:**
```
1. Camp Server generates QR:
   {
     "serverUrls": [
       "http://192.168.1.100:3000",  // Ethernet
       "http://192.168.43.1:3000",   // AP Mode
       "http://camp.local:3000"      // mDNS
     ],
     "syncCode": "ABC123",
     "campId": "camp-uuid"
   }

2. Device scans QR

3. Device tries each URL sequentially until one succeeds

4. Exchange sync code for token at successful URL

5. Use that URL as base for all sync requests

6. Clear URL + token after sync
```

**Network Modes:**
- **Ethernet:** 192.168.x.x (wired LAN)
- **WiFi AP:** 192.168.43.x (server as access point)
- **mDNS:** camp.local (Bonjour/Avahi discovery)

---

### Internet Mode

**Standard Configuration:**
- Base URL: environment.apiUrl
- HTTPS recommended
- Standard REST API communication

---

## Deployment Architecture

### Mobile Deployment (Android)

**Build Process:**
```
1. Angular Build:
   ionic build → www/browser/

2. Flatten Output:
   mv www/browser/* www/ && rmdir www/browser

3. Capacitor Sync:
   npx cap sync android

4. Gradle Build:
   ./gradlew clean assembleDebug

5. APK Output:
   android/app/build/outputs/apk/debug/app-debug.apk
```

**Distribution:**
- **Debug APK:** Direct install via USB/file
- **Release APK:** Google Play Store (requires signing)

---

### Web Deployment

**Build:**
```bash
npm run build
```

**Output:** `www/` folder (static files)

**Deployment:**
- Copy `www/` to web server
- Configure API base URL in environment
- Serve via Nginx, Apache, or static host

**Database:** IndexedDB (browser-native)

---

## Testing Strategy

### Unit Testing
- **Framework:** Jasmine + Karma
- **Pattern:** `*.spec.ts` files alongside components/services
- **Coverage:** Reports generated in `coverage/` directory

### Manual Testing Routes
| Route | Purpose |
|-------|---------|
| `/db-test` | Database CRUD operations |
| `/data-viewer` | Inspect stored data |
| `/qr-test` | QR generation/scanning |

### Platform Testing
- **Android:** Emulator + physical devices
- **Web:** Chrome DevTools device emulation
- **Database:** Both SQLite and IndexedDB tested

---

## Performance Considerations

### Database Performance
- **Indexes:** Created on frequently queried columns
  - `idx_members_status` ON members(status)
  - `idx_documents_member_type` ON documents(member_id, type)
  - `idx_vehicle_member` ON vehicle_info(member_id)

- **Batch Operations:** Sync uses batch inserts/updates

### Build Size
- **Budget Limits:** Configured in angular.json
  - Initial bundle: 5MB max (warning at 2MB)
  - Component styles: 4KB max (warning at 2KB)

### Lazy Loading
- Pages loaded on-demand via Angular routing
- Reduces initial bundle size

---

## Scalability Considerations

### Current Limitations
- **Single Device:** No multi-device sync (yet)
- **File Storage:** Documents stored locally (no cloud backup)
- **Sync Queue:** In-memory (cleared on app restart)

### Future Enhancements
- **Persistent Sync Queue:** Store in database table
- **Cloud Backup:** Optional cloud sync for documents
- **Multi-Device:** Sync across multiple devices per member

---

## Development Patterns

### Reactive Programming (RxJS)
- Services use `BehaviorSubject` for state
- Observables for async operations
- Operators: `map`, `tap`, `catchError`, `switchMap`

### Dependency Injection
- All services: `providedIn: 'root'` (singleton)
- Constructor injection pattern
- Testability via dependency injection

### Error Handling
- Centralized in ApiService: `handleError()`
- User-friendly error messages
- Logging for debugging

---

## Notes

- **Architecture Type:** Component-based with service layer
- **Pattern:** Offline-first with eventual consistency
- **Database:** Dual-mode (SQLite + IndexedDB)
- **Security:** Client-side encryption, JWT + sync tokens
- **Platform:** Cross-platform (Android primary, iOS capable, web/desktop)
- **Network:** LAN-based sync for offline camp scenarios
