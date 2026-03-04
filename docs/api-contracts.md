# API Contracts - Suidlanders Emergency Plan App

## Overview

The application communicates with a **camp server backend** via HTTP REST API. The API client is implemented in `ApiService` with authentication handled by `AuthService`.

**Key Architecture:**
- **Base URL**: Configurable (environment.apiUrl or camp-specific LAN URL)
- **Authentication**: JWT tokens + short-lived sync tokens
- **Network Mode**: LAN-based (camp scenarios) or internet-based
- **Error Handling**: Centralized via RxJS catchError operators

---

## Authentication Endpoints

### POST /auth/login
**Purpose:** User login (staff/admin access)

**Request:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "accessToken": "string (JWT)"
}
```

**Implementation:** `AuthService.login()`

---

### POST /auth/register
**Purpose:** User registration (staff/admin)

**Request:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "message": "string",
  "userId": "string"
}
```

**Implementation:** `AuthService.register()`

---

### POST /auth/camp/exchange
**Purpose:** Exchange QR code for temporary sync token

**Request:**
```json
{
  "code": "string (short-lived code from QR)",
  "campId": "string"
}
```

**Response:**
```json
{
  "syncToken": "string (short-lived token)",
  "expiresAt": "number (timestamp)",
  "serverUrls": ["string (array of LAN URLs)"]
}
```

**Implementation:** `AuthService.exchangeCampCode()` and `AuthService.exchangeCampCodeAt(baseUrl, ...)`

**Notes:**
- Used for device provisioning in offline camp scenarios
- Supports multiple base URLs (mDNS/IP/AP addresses)
- App tries each URL until connection succeeds

---

## Sync Endpoints

### POST /sync/push
**Purpose:** Push local changes to server

**Request:**
```json
{
  "changes": [
    {
      "operation": "create | update | delete",
      "table": "string",
      "recordId": "string",
      "data": "object",
      "timestamp": "number"
    }
  ]
}
```

**Response:**
```json
{
  "success": "boolean",
  "syncedRecords": "number",
  "conflicts": [
    {
      "recordId": "string",
      "serverTimestamp": "number",
      "resolution": "string"
    }
  ]
}
```

**Implementation:** `ApiService.syncChanges(changes)`

**Authentication:** Requires sync token (via `Authorization: Bearer <syncToken>`)

---

### GET /sync/pull
**Purpose:** Retrieve server changes since last sync

**Query Parameters:**
- `lastSync`: number (UNIX timestamp)

**Response:**
```json
{
  "changes": [
    {
      "operation": "create | update | delete",
      "table": "string",
      "recordId": "string",
      "data": "object",
      "timestamp": "number"
    }
  ],
  "serverTimestamp": "number"
}
```

**Implementation:** `ApiService.getServerChanges(lastSyncTime)`

**Authentication:** Requires sync token

---

## Member Endpoints

### POST /members
**Purpose:** Create new member record

**Request:**
```json
{
  "id": "string (UUID)",
  "basicInfo": { ... },
  "memberInfo": { ... },
  "addressInfo": { ... },
  "medicalInfo": { ... },
  "vehicleInfo": [ ... ],
  "skillsInfo": { ... },
  "equipmentInfo": { ... },
  "campInfo": { ... },
  "otherInfo": { ... }
}
```

**Response:**
```json
{
  "success": "boolean",
  "memberId": "string",
  "created_at": "number"
}
```

**Implementation:** `ApiService.createMember(memberData)`

---

### PUT /members/:memberId
**Purpose:** Update existing member record

**Request:**
```json
{
  "basicInfo": { ... },
  ... (same structure as POST /members)
}
```

**Response:**
```json
{
  "success": "boolean",
  "updated_at": "number"
}
```

**Implementation:** `ApiService.updateMember(memberId, memberData)`

---

### GET /members/:memberId
**Purpose:** Retrieve single member record

**Response:**
```json
{
  "id": "string",
  "basicInfo": { ... },
  "memberInfo": { ... },
  ... (full member object with all sections)
}
```

**Implementation:** `ApiService.getMember(memberId)`

---

### GET /members
**Purpose:** Retrieve all members (with optional filtering)

**Query Parameters (optional):**
- `status`: string ('active' | 'inactive' | 'deleted')
- `camp`: string (camp name filter)
- `province`: string (province filter)
- `limit`: number
- `offset`: number

**Response:**
```json
{
  "members": [
    {
      "id": "string",
      "basicInfo": { ... },
      "memberInfo": { ... },
      ... (full member objects)
    }
  ],
  "total": "number",
  "limit": "number",
  "offset": "number"
}
```

**Implementation:** `ApiService.getAllMembers(params)`

---

### DELETE /members/:memberId
**Purpose:** Soft delete member record (sets status='deleted')

**Response:**
```json
{
  "success": "boolean",
  "message": "string"
}
```

**Implementation:** `ApiService.deleteMember(memberId)`

---

## HTTP Client Architecture

### ApiService Implementation
**Location:** `src/app/services/api.service.ts`

**Generic HTTP Methods:**
```typescript
private get(path: string, options?: any): Observable<any>
private post(path: string, body?: any, options?: any): Observable<any>
private put(path: string, body?: any, options?: any): Observable<any>
private delete(path: string, options?: any): Observable<any>
```

**Features:**
- Automatic header injection (Authorization, Content-Type)
- Centralized error handling
- Camp base URL support (LAN mode)
- RxJS Observable-based

---

## Authentication Flow

### Standard Authentication (Staff/Admin)
1. User enters email/password
2. `POST /auth/login` → receives JWT token
3. Token stored in localStorage (`access_token`)
4. Token included in all API requests via `Authorization: Bearer <token>`

### Camp Sync Authentication (Device Provisioning)
1. Staff generates QR code on camp server (`/api/auth/camp/init`)
2. QR contains: `serverUrls[]`, `syncCode`, `campId`
3. Device scans QR via `QRScannerComponent`
4. App tries each `serverUrls` until one connects
5. `POST <serverUrl>/auth/camp/exchange` with code → receives sync token
6. Sync token stored temporarily (session-based)
7. Device syncs data using sync token
8. Token + base URL cleared after sync

---

## Error Handling

### HTTP Status Codes
- **200**: Success
- **201**: Created
- **400**: Bad Request (validation errors)
- **401**: Unauthorized (invalid/expired token)
- **403**: Forbidden (insufficient permissions)
- **404**: Not Found
- **409**: Conflict (sync conflicts)
- **500**: Server Error

### Error Response Format
```json
{
  "error": "string (error code)",
  "message": "string (human-readable)",
  "details": "object (optional validation errors)"
}
```

**Implementation:** `ApiService.handleError()` (private method)

---

## Network Modes

### Internet Mode
- Uses `environment.apiUrl`
- Standard HTTP(S) communication
- Requires internet connectivity

### LAN Mode (Camp Scenarios)
- Uses camp-specific base URL from QR code
- mDNS/IP/AP addresses (`http://192.168.x.x`, `http://camp.local`)
- **No internet required** - local network only
- Stored in `AuthService.setCampBaseUrl()`

**Priority:** Camp base URL > environment.apiUrl

---

## Rate Limiting & Sync Strategy

### Auto-Sync Configuration
- **Interval**: 5 minutes (configurable via `SyncService.SYNC_INTERVAL`)
- **Trigger**: Automatic background timer
- **Manual Trigger**: User-initiated via UI
- **Queue-Based**: Changes queued locally if offline

### Conflict Resolution
- **Strategy**: Timestamp-based (last-write-wins)
- **Server Authority**: Server timestamp used for resolution
- **Logged Conflicts**: Returned in sync responses for user review

---

## Security Considerations

### Token Storage
- **JWT Token**: localStorage (`access_token`)
- **Sync Token**: localStorage (`camp_sync_token`) - temporary
- **Camp Base URL**: localStorage (`camp_base_url`) - temporary
- **Production Note**: Consider secure storage (Capacitor Preferences with encryption)

### Data Transmission
- **Encryption**: HTTPS recommended for internet mode
- **LAN Mode**: HTTP acceptable (isolated network)
- **Sensitive Data**: Client-side encryption before transmission (CryptoJS)

---

## Notes

- All endpoints return JSON
- Timestamps are UNIX format (milliseconds)
- Member IDs are UUIDs (v4)
- RxJS Observables used throughout for reactive programming
- Automatic retry logic handled by `SyncQueueService` (3 retries default)
