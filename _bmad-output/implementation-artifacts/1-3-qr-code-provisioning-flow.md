# Story 1.3: QR Code Provisioning Flow (Nice-to-Have)

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **Member**,
I want to scan a QR code to automatically join the camp intranet and sync my data,
So that I don't need to manually enter WiFi passwords or server settings.

## Acceptance Criteria

**Given** camp staff has generated a provisioning QR code
**When** member opens the app and selects "Scan QR to Sync"
**Then** camera opens for QR code scanning

**Given** member scans a valid camp provisioning QR code
**When** QR is decoded
**Then** the app extracts server URLs array, sync code, and camp ID
**And** displays "Connecting to camp server..." message

**Given** the QR contains multiple server URLs
**When** the app attempts connection until successful connection
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

## Business Context

### Why This Story Exists

This is a **NICE-TO-HAVE story for the March 6th demo**. It significantly improves user experience by automating the WiFi connection and server provisioning process, but is not critical for demo success. The demo can work with manual WiFi setup if this story is not completed.

**Demo Value:**

- **Streamlined UX** - One QR scan handles WiFi + server configuration + authentication
- **Reduced Errors** - No manual typing of server URLs or credentials
- **Impressive Tech Demo** - Shows sophisticated provisioning workflow
- **Real-World Readiness** - Mimics production camp scenario

**Fallback Plan:**

- Manual WiFi connection (user joins camp network manually)
- Manual server URL entry or hardcoded URL in environment config
- Still achieves demo objectives, just less polished

### Epic Context

**Epic 1: Demo Sprint - Offline Registration & Basic Triage**

- **Goal:** Members can install app, register offline, sync to camp, and staff can triage to Red/Green camps
- **Demo Date:** March 6th, 2026 (IMMINENT)
- **This Story's Role:** Optional enhancement to sync workflow - improves UX but not required for demo success
- **Dependencies:**
  - Backend API must support `/auth/camp/exchange` endpoint (for sync code → token exchange)
  - QR code generation on backend (outside scope of this story)

## Dev Agent Guardrails

### CRITICAL - Read This First

**⚠️ NICE-TO-HAVE STORY - March 6th demo can succeed without this**
**📱 MOBILE APP FEATURE** - QR scanning uses device camera (Android/iOS)
**🎯 SCOPE: SCAN ONLY** - This story implements QR scanning and parsing; backend QR generation is separate
**🔌 SEQUENTIAL URL TESTING** - Try each server URL until one succeeds (handles multiple network interfaces)
**🔐 SYNC TOKEN FLOW** - Exchange short-lived code for temporary sync token
**📡 EXISTING SYNC INTEGRATION** - Use existing SyncService and ApiService; don't reimplement sync logic

### What You MUST NOT Do

❌ **DO NOT** implement WiFi auto-connect (iOS restrictions make this impractical for MVP)
❌ **DO NOT** implement backend QR generation (separate story/project)
❌ **DO NOT** modify existing DatabaseService or SyncService core logic
❌ **DO NOT** implement manual WiFi setup UI (that's a fallback, out of scope)
❌ **DO NOT** implement retry logic beyond sequential URL testing (SyncService handles sync retries)
❌ **DO NOT** store sync token or base URL permanently (clear after sync)
❌ **DO NOT** skip camera permissions check (must request and handle denial)

### What You MUST Do

✅ **MUST** use @capacitor-mlkit/barcode-scanning for QR scanning (2025 best practice)
✅ **MUST** parse QR JSON payload: serverUrls[], syncCode, campId
✅ **MUST** try each server URL sequentially with timeout (10 seconds per URL)
✅ **MUST** use successful URL for all subsequent requests (save to ApiService base URL)
✅ **MUST** call existing SyncService.sync() after token exchange (don't reimplement)
✅ **MUST** clear sync token + base URL from storage after successful sync
✅ **MUST** handle errors gracefully with Afrikaans user messages
✅ **MUST** request CAMERA permission before scanning
✅ **MUST** test on Android device (primary platform)

## Technical Requirements

### QR Code Scanner Integration

**Recommended Plugin:** `@capacitor-mlkit/barcode-scanning`

**Why ML Kit?**

- Google's ML Kit SDK with fast, accurate scanning
- Works in challenging conditions (poor lighting, angles)
- Supported by Capacitor team for Ionic 8
- Cross-platform (Android + iOS)
- Modern 2025 best practice

**Installation:**

```bash
npm install @capacitor-mlkit/barcode-scanning
npx cap sync
```

**Android Configuration:**
Update `android/variables.gradle`:

```gradle
minSdkVersion = 26  # ML Kit requirement
```

**iOS Configuration:**
Update `ios/App/App/Info.plist`:

```xml
<key>NSCameraUsageDescription</key>
<string>App needs camera access to scan QR codes for camp server provisioning</string>
```

### QR Payload Specification

**Format:** JSON string (minified for compact QR)

```typescript
{
  "serverUrls": [
    "http://192.168.1.100:3000",  // Ethernet IP
    "http://192.168.43.1:3000",   // AP Mode IP
    "http://camp.local:3000"      // mDNS hostname
  ],
  "syncCode": "ABC123XYZ",         // Short-lived code (expires in 15 minutes)
  "campId": "camp-uuid-1234"       // Camp identifier
}
```

**Why Multiple URLs?**

- Raspberry Pi may have multiple network interfaces (Ethernet, WiFi AP, mDNS)
- App doesn't know which one will work (depends on device's network)
- Sequential testing finds working URL automatically

**Sync Code:**

- Generated by backend when staff creates QR
- Short-lived (15-minute expiry)
- One-time use (consumed after token exchange)
- Prevents unauthorized access if QR is leaked

### QR Scanning Component

**Location:** Create new component

```
src/app/components/qr-scanner/
├── qr-scanner.component.ts
├── qr-scanner.component.html
├── qr-scanner.component.scss
└── qr-scanner.component.spec.ts
```

**Component Responsibilities:**

1. Request camera permission
2. Start ML Kit barcode scanner
3. Decode QR payload (JSON parsing)
4. Validate payload structure
5. Emit scanned data to parent
6. Handle errors and cancellation

**TypeScript Implementation Pattern:**

```typescript
import { BarcodeScanner } from "@capacitor-mlkit/barcode-scanning";

export class QRScannerComponent {
  async scanQRCode(): Promise<QRPayload | null> {
    try {
      // 1. Request permission
      const { camera } = await BarcodeScanner.requestPermissions();
      if (camera === "denied" || camera === "restricted") {
        this.showPermissionDeniedError();
        return null;
      }

      // 2. Start scan
      const { barcodes } = await BarcodeScanner.scan({
        formats: [BarcodeFormat.QrCode],
      });

      // 3. Parse first QR code
      if (barcodes.length > 0) {
        const rawValue = barcodes[0].rawValue;
        return this.parseQRPayload(rawValue);
      }

      return null;
    } catch (error) {
      console.error("QR scan failed:", error);
      this.showScanError();
      return null;
    }
  }

  private parseQRPayload(rawValue: string): QRPayload {
    // Parse JSON, validate structure
    const payload = JSON.parse(rawValue);

    if (!payload.serverUrls || !payload.syncCode || !payload.campId) {
      throw new Error("Invalid QR code format");
    }

    return payload as QRPayload;
  }
}
```

### URL Testing Strategy

**Sequential Testing with Timeout:**

```typescript
async testServerURLs(urls: string[]): Promise<string | null> {
  for (const url of urls) {
    try {
      // Test with health check endpoint
      const isReachable = await this.pingServer(url, 10000); // 10-second timeout

      if (isReachable) {
        console.log(`Connected to: ${url}`);
        return url; // Success - use this URL
      }
    } catch (error) {
      console.log(`Failed to reach ${url}, trying next...`);
      continue; // Try next URL
    }
  }

  return null; // All URLs failed
}

async pingServer(url: string, timeout: number): Promise<boolean> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    // Ping health endpoint
    const response = await fetch(`${url}/api/members/health`, {
      method: 'GET',
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    return response.ok;

  } catch (error) {
    clearTimeout(timeoutId);
    return false;
  }
}
```

**Why Sequential (Not Parallel)?**

- Avoids race conditions
- Clearer error messages (shows which URLs failed)
- Predictable behavior (uses first working URL in priority order)
- Simpler implementation

### Sync Token Exchange Flow

**Backend Endpoint (Assumed):**

```
POST /api/auth/camp/exchange
Body: { "syncCode": "ABC123XYZ", "campId": "camp-uuid-1234" }
Response: { "syncToken": "short-lived-jwt-token", "expiresIn": 3600 }
```

**Frontend Implementation:**

```typescript
async exchangeSyncCode(
  baseUrl: string,
  syncCode: string,
  campId: string
): Promise<string | null> {
  try {
    const response = await this.apiService.post<{ syncToken: string }>(
      `${baseUrl}/api/auth/camp/exchange`,
      { syncCode, campId }
    );

    return response.syncToken;

  } catch (error) {
    console.error('Sync code exchange failed:', error);
    return null;
  }
}
```

**Token Storage (Temporary):**

```typescript
// Store temporarily for sync
localStorage.setItem("camp_sync_token", syncToken);
localStorage.setItem("camp_base_url", baseUrl);

// Clear after sync
localStorage.removeItem("camp_sync_token");
localStorage.removeItem("camp_base_url");
```

### Integration with Existing SyncService

**After QR Scan:**

1. Extract QR payload
2. Test server URLs → get working URL
3. Exchange sync code for token
4. Save token + base URL to ApiService
5. Call `SyncService.sync()` (existing method)
6. Clear token + URL after sync

**Code Flow:**

```typescript
async handleQRProvisioning() {
  // 1. Scan QR
  const payload = await this.qrScanner.scanQRCode();
  if (!payload) return;

  // 2. Test URLs
  const workingUrl = await this.testServerURLs(payload.serverUrls);
  if (!workingUrl) {
    this.showError('Kon nie kamp bediener bereik nie');
    return;
  }

  // 3. Exchange code for token
  const syncToken = await this.exchangeSyncCode(
    workingUrl,
    payload.syncCode,
    payload.campId
  );
  if (!syncToken) {
    this.showError('Sinchronisasie kode is ongeldig of verval');
    return;
  }

  // 4. Save to ApiService
  this.apiService.setBaseUrl(workingUrl);
  this.apiService.setSyncToken(syncToken);

  // 5. Trigger sync (existing logic)
  const syncResult = await this.syncService.sync();

  if (syncResult.success) {
    this.showSuccess('Sinkronisasie suksesvol voltooi');

    // 6. Clear temporary credentials
    this.apiService.clearSyncToken();
    this.apiService.clearBaseUrl();
  } else {
    this.showError('Sinkronisasie het misluk');
  }
}
```

### UI Integration

**Add "Scan QR to Sync" Button:**

Update Home Page (or create dedicated Sync page):

```html
<!-- src/app/pages/home/home.page.html -->
<ion-content>
  <ion-button expand="block" (click)="scanQRToSync()">
    <ion-icon name="qr-code-outline" slot="start"></ion-icon>
    Skandeer QR Kode
  </ion-button>

  <ion-button expand="block" fill="outline" (click)="manualSync()">
    <ion-icon name="sync-outline" slot="start"></ion-icon>
    Sinkronisasie
  </ion-button>
</ion-content>
```

**Loading States:**

```typescript
async scanQRToSync() {
  const loading = await this.loadingController.create({
    message: 'Maak gereed om QR te skandeer...'
  });
  await loading.present();

  try {
    await this.handleQRProvisioning();
  } finally {
    await loading.dismiss();
  }
}
```

### Error Handling

**Error Scenarios:**

1. **Permission Denied:**

   - Message: "Kamera toegang geweier. Gee asseblief toestemming in toestel instellings."
   - Action: Open app settings link (Capacitor App plugin)

2. **Invalid QR Code:**

   - Message: "Ongeldige QR kode. Vra kamp personeel vir nuwe QR."
   - Action: Allow retry

3. **All Server URLs Failed:**

   - Message: "Kon nie kamp bediener bereik nie. Maak seker jy is gekoppel aan kamp WiFi."
   - Action: Offer manual WiFi setup or retry

4. **Sync Code Expired:**

   - Message: "Sinkronisasie kode het verval. Vra kamp personeel vir nuwe QR."
   - Action: Return to scan mode

5. **Sync Failed:**
   - Message: "Sinkronisasie het misluk. Probeer asseblief weer."
   - Action: Retry button (calls SyncService.sync() again)

**Toast Notifications:**

```typescript
async showError(message: string) {
  const toast = await this.toastController.create({
    message,
    duration: 5000,
    color: 'danger',
    position: 'bottom',
    buttons: [
      {
        text: 'Probeer Weer',
        handler: () => this.scanQRToSync()
      }
    ]
  });
  await toast.present();
}

async showSuccess(message: string) {
  const toast = await this.toastController.create({
    message,
    duration: 3000,
    color: 'success',
    position: 'bottom'
  });
  await toast.present();
}
```

## Architecture Compliance

### Service Layer Integration

**Use Existing Services:**

- **ApiService**: Set base URL and sync token dynamically
- **SyncService**: Call existing `sync()` method (no modifications)
- **QRService**: Extend existing QR service or create new QRProvisioningService

**New Service: QRProvisioningService**

```typescript
@Injectable({ providedIn: "root" })
export class QRProvisioningService {
  constructor(private apiService: ApiService, private syncService: SyncService) {}

  async scanAndProvision(): Promise<boolean> {
    // 1. Scan QR
    // 2. Test URLs
    // 3. Exchange token
    // 4. Trigger sync
    // 5. Clear credentials
  }
}
```

### Platform Compatibility

**Android:**

- ✅ Full support for ML Kit barcode scanning
- ✅ Camera permissions requestable at runtime
- ✅ Tested platform for demo

**iOS:**

- ✅ ML Kit barcode scanning supported
- ⚠️ WiFi auto-connect NOT supported (iOS restrictions)
- ℹ️ User must join WiFi manually, then scan QR for server provisioning

**Web:**

- ❌ Camera access via browser (requires HTTPS in production)
- ℹ️ Desktop/web version doesn't need provisioning (direct URL entry)

**Strategy:** Focus on Android for MVP/demo. iOS manual WiFi + QR provisioning is acceptable.

### Data Flow Diagram

```
┌─────────────────┐
│   User Action   │
│  "Scan QR"      │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│  QRScannerComponent     │
│  Request permission     │
│  Start ML Kit scan      │
└────────┬────────────────┘
         │
         ▼ (QR scanned)
┌─────────────────────────┐
│  Parse QR JSON          │
│  Extract:               │
│  - serverUrls[]         │
│  - syncCode             │
│  - campId               │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  Test Server URLs       │
│  Sequential with timeout│
│  Find working URL       │
└────────┬────────────────┘
         │
         ▼ (URL found)
┌─────────────────────────┐
│  Exchange Sync Code     │
│  POST /auth/camp/exchange│
│  Get syncToken          │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  Save to ApiService     │
│  setBaseUrl()           │
│  setSyncToken()         │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  Trigger Sync           │
│  SyncService.sync()     │
│  (existing logic)       │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  Clear Credentials      │
│  clearSyncToken()       │
│  clearBaseUrl()         │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  Show Success Message   │
│  "Sinkronisasie suksesvol"│
└─────────────────────────┘
```

## File Structure Requirements

### Files You WILL Create

**QR Scanner Component:**

```
src/app/components/qr-scanner/
├── qr-scanner.component.ts (scan logic)
├── qr-scanner.component.html (minimal - scanner is native view)
├── qr-scanner.component.scss (background transparency)
└── qr-scanner.component.spec.ts (unit tests)
```

**QR Provisioning Service:**

```
src/app/services/qr-provisioning.service.ts (orchestration)
src/app/services/qr-provisioning.service.spec.ts (unit tests)
```

**TypeScript Interfaces:**

```
src/app/models/qr-payload.model.ts
```

```typescript
export interface QRPayload {
  serverUrls: string[];
  syncCode: string;
  campId: string;
}

export interface ProvisioningResult {
  success: boolean;
  error?: string;
}
```

### Files You WILL Modify

**ApiService:**

```
src/app/services/api.service.ts
```

**Changes:**

- Add `setBaseUrl(url: string)` method (save temporarily)
- Add `setSyncToken(token: string)` method
- Add `clearBaseUrl()` method
- Add `clearSyncToken()` method
- Modify HTTP interceptor to include sync token if present

**Home Page (or Sync Page):**

```
src/app/pages/home/home.page.ts
src/app/pages/home/home.page.html
```

**Changes:**

- Add "Scan QR to Sync" button
- Call QRProvisioningService on button click
- Show loading states and error messages

**Global Styles:**

```
src/global.scss
```

**Add for ML Kit scanner:**

```scss
body.scanner-active {
  --background: transparent;
  --ion-background-color: transparent;
}
```

### Files You Will NOT Modify

❌ DatabaseService (database.service.ts) - No changes needed
❌ SyncService (sync.service.ts) - Use existing sync() method as-is
❌ Form components - Not involved in provisioning flow
❌ Story 1.1/1.2 files - Keep existing triage and dashboard logic intact

### Files to Reference (Read Only)

📖 QRService (qr.service.ts) - Existing QR generation logic (for reference)
📖 SyncService (sync.service.ts) - Understand existing sync flow
📖 ApiService (api.service.ts) - Understand HTTP client patterns

## Testing Requirements

### Manual Test Cases (Android Device Required)

**Prerequisites:**

- Android device or emulator
- Camera permission granted
- Backend running with QR generation endpoint
- Test QR code generated (with valid serverUrls, syncCode, campId)

---

**Test Case 1: Camera Permission Request**

**Purpose:** Verify app requests camera permission correctly

**Steps:**

1. Install app on Android device (fresh install)
2. Open app, navigate to Home
3. Tap "Skandeer QR Kode" button
4. Verify permission dialog appears: "Allow app to access camera?"
5. Tap "DENY"
6. Verify error toast: "Kamera toegang geweier..."
7. Tap button again
8. Tap "ALLOW"
9. Verify camera view opens for scanning

**Expected:** ✅ Permission requested, denial handled, camera opens after grant

---

**Test Case 2: Valid QR Code Scan**

**Purpose:** Verify successful QR provisioning flow

**Setup:**

**Backend Setup:**

1. Navigate to the backend directory:
   ```bash
   cd /path/to/suidlanders-app/backend
   ```
2. Ensure dependencies are installed:
   ```bash
   npm install
   ```
3. Start the backend server:

   ```bash
   npm start
   ```

   The server should start on `http://localhost:3000` or your configured port.

4. Verify the server is running by accessing `http://localhost:3000/api/members/health` in a browser. You should see a health status response.

**QR Code Generation (Using Reception Dashboard):**

1. Open the reception dashboard in your browser `http://localhost:4200/reception`.

2. Click the **"Genereer QR Kode"** button in the top-right corner

3. The backend will automatically:

   - Generate a short-lived sync code (expires in 15 minutes)
   - Detect all available server URLs (localhost, LAN IP, etc.)
   - Create the QR payload with serverUrls, syncCode, and campId

4. The QR code will be displayed on screen - ready for scanning!

**Note:** The QR code automatically includes all your computer's network interfaces, so Android devices on the same network will be able to connect.

**Device Setup:**

1. Ensure your Android device is connected to the **same WiFi network** as the computer running the backend.
2. Build and install the app on your Android device:
   ```bash
   npm run buildAndroid
   ```
3. Install the APK located at `android/app/build/outputs/apk/debug/app-debug.apk`

**Steps:**

1. Open app on Android device, tap "Skandeer QR Kode"
2. Point camera at the displayed test QR code
3. Wait for scan (should be instant with good lighting)
4. Verify loading message: "Verbind met kamp bediener..."
5. Verify success toast: "Sinkronisasie suksesvol voltooi"
6. Verify data synced to backend:
   - Check backend console logs for sync requests
   - Or query the database directly to verify member data was received

**Expected:** ✅ QR scanned, server reached, token exchanged, data synced

**Troubleshooting:**

- If "Kon nie kamp bediener bereik nie" appears, verify both devices are on the same network
- If QR scan fails, ensure good lighting and hold phone steady
- If camera permission is denied, go to Android Settings → Apps → Suidlanders App → Permissions → Camera

---

**Test Case 3: Multiple Server URLs (Failover)**

**Purpose:** Verify sequential URL testing

**Setup:**

- Generate QR with multiple URLs (first two invalid, third valid):
  ```json
  {
    "serverUrls": [
      "http://192.168.99.99:3000", // Invalid
      "http://camp.local:3000", // Invalid (mDNS not configured)
      "http://192.168.1.100:3000" // Valid
    ],
    "syncCode": "TEST123",
    "campId": "test-camp"
  }
  ```

**Steps:**

1. Scan QR code
2. Wait for URL testing (should take ~20 seconds - 2 failures × 10s timeout)
3. Verify console logs show:
   - "Trying http://192.168.99.99:3000... Failed"
   - "Trying http://camp.local:3000... Failed"
   - "Trying http://192.168.1.100:3000... Success"
4. Verify sync proceeds with third URL
5. Verify success toast appears

**Expected:** ✅ First two URLs fail, third succeeds, sync completes

---

**Test Case 4: Invalid QR Code Format**

**Purpose:** Verify error handling for malformed QR

**Setup:**

- Create QR code with invalid JSON:
  ```
  not a json string
  ```

**Steps:**

1. Scan invalid QR code
2. Verify error toast: "Ongeldige QR kode. Vra kamp personeel vir nuwe QR."
3. Tap "Probeer Weer"
4. Verify scanner reopens

**Expected:** ✅ Error message shown, retry option works

---

**Test Case 5: Missing QR Fields**

**Purpose:** Verify validation of QR payload structure

**Setup:**

- Create QR with missing `syncCode`:
  ```json
  {
    "serverUrls": ["http://192.168.1.100:3000"],
    "campId": "test-camp"
  }
  ```

**Steps:**

1. Scan QR code
2. Verify error toast: "Ongeldige QR kode..."
3. Verify sync does NOT proceed

**Expected:** ✅ Validation fails, sync prevented

---

**Test Case 6: Expired Sync Code**

**Purpose:** Verify handling of expired or invalid sync code

**Setup:**

- Backend configured to reject sync code "EXPIRED123"
- QR code with:
  ```json
  {
    "serverUrls": ["http://192.168.1.100:3000"],
    "syncCode": "EXPIRED123",
    "campId": "test-camp"
  }
  ```

**Steps:**

1. Scan QR code
2. Verify URLs tested successfully
3. Verify token exchange fails (backend returns 401)
4. Verify error toast: "Sinkronisasie kode is ongeldig of verval"
5. Verify sync does NOT proceed

**Expected:** ✅ Token exchange fails gracefully, error shown

---

**Test Case 7: All Server URLs Unreachable**

**Purpose:** Verify handling when no URLs work

**Setup:**

- QR with only invalid URLs:
  ```json
  {
    "serverUrls": ["http://192.168.99.99:3000", "http://192.168.88.88:3000"],
    "syncCode": "TEST123",
    "campId": "test-camp"
  }
  ```

**Steps:**

1. Scan QR code
2. Wait for all URL tests to fail (~20 seconds)
3. Verify error toast: "Kon nie kamp bediener bereik nie..."
4. Tap "Probeer Weer"
5. Verify scanner reopens

**Expected:** ✅ All URLs fail, error shown, retry works

---

**Test Case 8: Scanner Cancellation**

**Purpose:** Verify user can cancel QR scan

**Steps:**

1. Tap "Skandeer QR Kode"
2. Camera view opens
3. Press device BACK button (or tap cancel if UI provided)
4. Verify camera closes
5. Verify no error message shown
6. Verify app returns to previous screen

**Expected:** ✅ User can cancel without errors

---

**Test Case 9: Sync Failure After Token Exchange**

**Purpose:** Verify handling when sync fails after provisioning succeeds

**Setup:**

- Valid QR and backend, but backend returns error during sync
- Modify backend to fail sync endpoint temporarily

**Steps:**

1. Scan valid QR code
2. Verify URLs tested successfully
3. Verify token exchanged successfully
4. Verify sync fails (backend sync endpoint returns 500)
5. Verify error toast: "Sinkronisasie het misluk. Probeer asseblief weer."
6. Verify credentials are NOT cleared (token still saved for retry)
7. Tap "Probeer Weer"
8. Fix backend sync endpoint
9. Verify retry succeeds

**Expected:** ✅ Sync failure handled, credentials preserved for retry

---

**Test Case 10: Token and URL Cleanup After Success**

**Purpose:** Verify credentials are cleared after successful sync

**Steps:**

1. Scan valid QR and complete successful sync
2. Open Chrome DevTools (if web) or use ADB to inspect localStorage:
   ```bash
   adb shell
   run-as com.suidlanders.app
   cat /data/data/com.suidlanders.app/shared_prefs/*.xml | grep camp_sync_token
   ```
3. Verify `camp_sync_token` is NOT present
4. Verify `camp_base_url` is NOT present
5. Tap "Skandeer QR Kode" again
6. Verify new scan required (old token not reused)

**Expected:** ✅ Credentials cleared after sync, not persisted

---

### Raspberry Pi Specific Test Cases

**Test Case 11: QR Scan with Raspberry Pi Backend (Ethernet)**

**Purpose:** Verify QR provisioning works with Pi backend over Ethernet connection

**Setup:**

**Raspberry Pi Backend Setup:**

1. SSH into your Raspberry Pi:

   ```bash
   ssh pi@raspberrypi.local
   # Default password is usually 'raspberry'
   ```

2. Navigate to the backend directory on Pi:

   ```bash
   cd ~/suidlanders-app/backend
   ```

3. Ensure backend is running (or start it):

   ```bash
   # Check if already running
   pm2 list

   # If not running, start it
   npm start
   # Or if using pm2:
   pm2 start npm --name "suidlanders-backend" -- start
   ```

4. Find Pi's Ethernet IP address:

   ```bash
   hostname -I
   # Example output: 192.168.1.150 (first IP is usually Ethernet)
   ```

5. Verify backend is accessible from your network:
   ```bash
   # From your laptop/desktop on same network
   curl http://192.168.1.150:3000/api/members/health
   # Should see health status response
   ```

**QR Code Generation:**

1. Generate QR with Pi's Ethernet IP:

   ```json
   {
     "serverUrls": ["http://192.168.1.150:3000"],
     "syncCode": "PI-TEST-ETH",
     "campId": "pi-camp-1"
   }
   ```

   (Replace `192.168.1.150` with your Pi's actual IP from step 4 above)

2. Create QR code using online generator or qrencode (see Test Case 2 for options)

**Device Setup:**

1. Connect Android device to the **same WiFi network** as the Raspberry Pi's Ethernet connection
2. Install latest app build on Android device

**Steps:**

1. Open app, tap "Skandeer QR Kode"
2. Scan the generated QR code
3. Verify app shows: "Verbind met kamp bediener..."
4. Verify successful connection to Pi backend
5. Verify sync completes: "Sinkronisasie suksesvol voltooi"
6. On Pi, check backend logs for sync activity:

   ```bash
   # If using pm2:
   pm2 logs suidlanders-backend --lines 50

   # Or check standard logs:
   tail -f ~/suidlanders-app/backend/logs/app.log
   ```

**Expected:** ✅ App successfully connects to Pi over Ethernet, syncs data

---

**Test Case 12: QR Scan with Raspberry Pi Backend (WiFi AP Mode)**

**Purpose:** Verify QR provisioning works when Pi is in Access Point mode (offline camp scenario)

**Setup:**

**Raspberry Pi AP Mode Setup:**

1. Configure Pi as WiFi Access Point (if not already configured):

   ```bash
   # This should already be configured per deployment docs
   # AP typically creates network: "SuidlandersKamp"
   # Default AP IP is usually: 192.168.4.1
   ```

2. Verify backend is running on Pi (same as Test Case 11, step 3)

3. Verify AP IP address:
   ```bash
   ifconfig wlan0
   # Look for inet address, typically 192.168.4.1
   ```

**QR Code Generation:**

1. Generate QR with Pi's AP IP and multiple fallback URLs:

   ```json
   {
     "serverUrls": ["http://192.168.4.1:3000", "http://camp.local:3000", "http://192.168.1.150:3000"],
     "syncCode": "PI-TEST-AP",
     "campId": "pi-camp-ap"
   }
   ```

   **Note:** Multiple URLs allow fallback if AP IP differs or mDNS is available

2. Create QR code and display it

**Device Setup:**

1. **Disconnect** Android device from regular WiFi
2. Connect to Pi's Access Point WiFi network:
   - Network name: `SuidlandersKamp` (or your configured AP name)
   - Password: (as configured in Pi setup)
3. Verify connection:
   - Open browser on Android, navigate to `http://192.168.4.1:3000/api/members/health`
   - Should show health status response

**Steps:**

1. Open app, tap "Skandeer QR Kode"
2. Scan QR code containing AP URLs
3. Observe URL testing in action (first URL should succeed: 192.168.4.1:3000)
4. Verify successful connection and sync
5. Check Pi backend logs for sync requests

**Expected:** ✅ App connects via AP mode (192.168.4.1), syncs successfully in offline scenario

**Troubleshooting:**

- If connection fails, verify Android is connected to Pi's AP network (check WiFi settings)
- If all URLs fail, check backend is running: `pm2 list` on Pi
- Verify firewall isn't blocking port 3000: `sudo ufw status` (should show port 3000 allowed)

---

**Test Case 13: QR Scan with Multiple Pi Network Interfaces (Failover)**

**Purpose:** Verify app correctly tests multiple Pi network interfaces and uses first working one

**Setup:**

**Raspberry Pi Multi-Interface Setup:**

1. Ensure Pi has both Ethernet and WiFi AP active:

   ```bash
   ifconfig
   # Should show:
   # - eth0 with IP (e.g., 192.168.1.150)
   # - wlan0 with AP IP (e.g., 192.168.4.1)
   ```

2. Backend should be accessible via both interfaces

**QR Code Generation:**

1. Create QR with all possible Pi URLs (realistic camp scenario):
   ```json
   {
     "serverUrls": ["http://192.168.4.1:3000", "http://192.168.1.150:3000", "http://camp.local:3000"],
     "syncCode": "PI-MULTI",
     "campId": "pi-camp-multi"
   }
   ```

**Test Scenario A: Device on Pi's AP Network**

**Steps:**

1. Connect Android to Pi's AP network (`SuidlandersKamp`)
2. Scan QR code
3. Verify app tests URLs sequentially:
   - First URL (192.168.4.1) should **succeed** immediately
   - Remaining URLs skipped (success found)
4. Verify sync completes using first URL

**Expected:** ✅ App uses AP IP (192.168.4.1), skips remaining URLs

---

**Test Scenario B: Device on Same LAN as Pi's Ethernet**

**Steps:**

1. Connect Android to regular WiFi network (same as Pi's Ethernet)
2. Scan same QR code
3. Verify app tests URLs sequentially:
   - First URL (192.168.4.1) should **fail** (not on AP network)
   - Second URL (192.168.1.150) should **succeed**
   - Third URL skipped
4. Verify sync completes using second URL (Ethernet IP)

**Expected:** ✅ App fails over to Ethernet IP (192.168.1.150), syncs successfully

**Timing Note:** Expect ~10 seconds delay for first URL timeout before second URL is tried

---

**Test Case 14: Pi Deployment - End-to-End Demo Rehearsal**

**Purpose:** Full rehearsal of demo scenario with Raspberry Pi as intended for March 6th demo

**Setup:**

**Camp Scenario Simulation:**

1. **Pi Setup (Reception Table):**

   - Pi running in kiosk mode with backend and reception dashboard
   - Pi acting as WiFi AP (`SuidlandersKamp` network)
   - QR code displayed on monitor connected to Pi

2. **Member Device Setup:**
   - Fresh Android device (simulating new member arrival)
   - App installed but never used
   - Device NOT connected to camp WiFi yet

**Demo Script (Full Workflow):**

**Step 1: Member Arrival**

- Simulate member (Pieter) arriving at camp reception

**Step 2: WiFi Connection**

1. Reception staff: "Welcome! Please connect to our WiFi network: SuidlandersKamp"
2. Staff provides password verbally
3. Member connects Android device to `SuidlandersKamp` WiFi
4. Verify connection successful (WiFi icon shows connected)

**Step 3: App First Launch**

1. Member opens Suidlanders app for first time
2. App loads, shows Home screen
3. No sync has occurred yet (offline data if any)

**Step 4: QR Provisioning**

1. Reception staff: "Please scan this QR code to sync your data"
2. Staff points to QR code displayed on monitor
3. Member taps "Skandeer QR Kode" button
4. Camera permission dialog appears → Member taps "ALLOW"
5. Camera opens
6. Member points camera at QR on monitor
7. QR scans instantly (within 1-2 seconds)

**Step 5: Sync Process**

1. App shows: "Verbind met kamp bediener..."
2. App tests server URL from QR (http://192.168.4.1:3000)
3. Connection succeeds
4. App exchanges sync code for temporary token
5. App syncs member's registration data to Pi backend
6. App shows: "Sinkronisasie suksesvol voltooi"
7. App clears sync token

**Step 6: Reception Dashboard Update**

1. Reception staff's tablet/monitor shows dashboard auto-refresh (30-second polling)
2. Pieter's name appears on dashboard within 30 seconds
3. Dashboard shows triage result: "Rooi Kamp" with medical indicator
4. Staff directs Pieter to Red Camp medical area

**Expected Results:**

- ✅ Entire flow completes in under 60 seconds (excluding WiFi connection time)
- ✅ QR scan is fast and reliable (good lighting conditions)
- ✅ No errors or failed connections
- ✅ Dashboard updates automatically with correct triage result
- ✅ Member data persists in Pi database (survives Pi reboot)

**Verification After Demo:**

1. Check Pi database for member entry:

   ```bash
   ssh pi@192.168.4.1
   sqlite3 ~/suidlanders-app/backend/db/camp.db
   SELECT * FROM members WHERE name LIKE '%Pieter%';
   ```

2. Verify sync token was cleared on device:
   ```bash
   # Via ADB if device connected to laptop
   adb shell
   run-as com.suidlanders.app
   cat shared_prefs/*.xml | grep camp_sync_token
   # Should return nothing
   ```

**Failure Recovery Plan:**

- If QR scan fails → Use "Sinkronisasie" button (manual sync with pre-configured URL)
- If Pi backend crashes → Restart: `pm2 restart suidlanders-backend`
- If WiFi AP fails → Restart Pi networking: `sudo systemctl restart networking`
- If all else fails → Show backup video recording of successful flow

---

### Unit Test Cases

**QRProvisioningService Tests:**

```typescript
describe("QRProvisioningService", () => {
  it("should parse valid QR payload", () => {
    const rawQR = '{"serverUrls":["http://test"],"syncCode":"ABC","campId":"123"}';
    const payload = service.parseQRPayload(rawQR);
    expect(payload.serverUrls).toEqual(["http://test"]);
    expect(payload.syncCode).toBe("ABC");
  });

  it("should reject invalid QR JSON", () => {
    const rawQR = "not json";
    expect(() => service.parseQRPayload(rawQR)).toThrow();
  });

  it("should test server URLs sequentially", async () => {
    const urls = ["http://fail1", "http://fail2", "http://success"];
    spyOn(service, "pingServer").and.returnValues(Promise.resolve(false), Promise.resolve(false), Promise.resolve(true));

    const result = await service.testServerURLs(urls);
    expect(result).toBe("http://success");
  });

  it("should return null if all URLs fail", async () => {
    const urls = ["http://fail1", "http://fail2"];
    spyOn(service, "pingServer").and.returnValue(Promise.resolve(false));

    const result = await service.testServerURLs(urls);
    expect(result).toBeNull();
  });

  it("should exchange sync code for token", async () => {
    spyOn(apiService, "post").and.returnValue(Promise.resolve({ syncToken: "test-token" }));

    const token = await service.exchangeSyncCode("http://test", "CODE123", "camp-1");

    expect(token).toBe("test-token");
  });

  it("should clear credentials after sync", async () => {
    spyOn(apiService, "clearSyncToken");
    spyOn(apiService, "clearBaseUrl");

    await service.scanAndProvision();

    expect(apiService.clearSyncToken).toHaveBeenCalled();
    expect(apiService.clearBaseUrl).toHaveBeenCalled();
  });
});
```

### Demo Rehearsal Checklist

Before March 6th demo:

**Backend Setup:**

- [ ] Backend `/auth/camp/exchange` endpoint working
- [ ] Backend `/health` endpoint responding
- [ ] Test QR code generated with valid URLs
- [ ] Backend sync endpoint functional

**App Setup:**

- [ ] ML Kit plugin installed and configured
- [ ] Camera permission granted on demo device
- [ ] Scan QR button visible on Home page
- [ ] Test scan with real QR code works

**Network Setup:**

- [ ] Raspberry Pi camp server on local network
- [ ] Demo device connected to same network (or Pi's AP)
- [ ] Test QR contains correct IP address for Pi
- [ ] Manual ping confirms connectivity before demo

**Failure Recovery:**

- [ ] Manual sync button works (fallback)
- [ ] Pre-populated sync token for emergency demo path
- [ ] Backup: Video of working QR scan if live demo fails

### Edge Cases to Test

1. **QR code with whitespace/newlines**: Trim and parse JSON
2. **Case sensitivity in JSON keys**: Validate exact field names
3. **Extra fields in QR**: Ignore unknown fields, validate required ones
4. **Duplicate URLs in array**: Handle gracefully (test each once)
5. **Empty serverUrls array**: Show error "No server URLs provided"
6. **Extremely long timeout**: Test with 1-second timeout for demo speed
7. **Poor lighting QR scan**: ML Kit should handle, but test in demo environment
8. **QR code at angle**: ML Kit should handle, but verify in testing

## Previous Story Intelligence

### Learnings from Story 1.1 (Simple Triage Logic)

**Relevant Context:**

- Triage logic runs in backend when member syncs
- Backend assigns camp_assignment field during sync
- QR provisioning triggers this sync → triage runs automatically

**How This Story Relates:**

- QR scan → token exchange → `SyncService.sync()` → backend triage → member assigned to camp
- This story is the UX layer that triggers the sync workflow

### Learnings from Story 1.2 (Reception Staff Dashboard)

**Relevant Context:**

- Reception dashboard polls backend API for synced members
- Dashboard auto-updates every 30 seconds
- After QR scan completes, member appears on dashboard within 30 seconds

**Demo Flow:**

1. Member scans QR (this story)
2. Member data syncs to backend
3. Backend runs triage (Story 1.1)
4. Reception dashboard updates (Story 1.2)
5. Staff sees member with camp assignment

**Testing Integration:**

- Test end-to-end: Scan QR → wait 30 seconds → verify member on Reception dashboard
- Verify camp assignment appears correctly (Red/Green badge)

### Code Patterns from Previous Stories

**Service Pattern:**

- All services use `providedIn: 'root'` (singleton)
- Constructor injection for dependencies
- Async/await for asynchronous operations
- Try-catch error handling with user-friendly messages in Afrikaans

**API Integration Pattern:**

- Use ApiService for all HTTP requests
- Use environment config for base URLs (but override with QR provisioned URL)
- Handle 401 (unauthorized), 500 (server error), network timeout

**UI Feedback Pattern:**

- LoadingController for async operations
- ToastController for success/error messages
- Afrikaans text for user-facing messages
- English for code/comments

## Git Intelligence

**Recent Commits:**

- `81bff4b` - docs: add kiosk keyring fix and exit instructions for Raspberry Pi
- `a854110` - fix: allow all origins for CORS in offline camp scenario
- `0ea7325` - fix: use dynamic API URL and auto-move build files from browser/ subdirectory
- `10dcdb6` - chore: remove npm cache files from repository

**Insights:**

- Pi deployment is active (kiosk mode, CORS fixes)
- Dynamic API URL already supported (good foundation for QR provisioning)
- CORS enabled for LAN scenario (QR scan will work with local IPs)

**Commit Message for This Story:**

```
feat: implement QR code provisioning for camp sync

- Add ML Kit barcode scanning (@capacitor-mlkit/barcode-scanning)
- Create QRProvisioningService for orchestration
- Implement sequential server URL testing with timeout
- Add sync code to token exchange flow
- Integrate with existing SyncService for data sync
- Add "Scan QR to Sync" button to Home page
- Handle errors with Afrikaans user messages
- Clear sync credentials after successful sync
- Add camera permission request and handling

Story 1.3 - Nice-to-have for March 6th demo
```

## Latest Technical Information

### ML Kit Barcode Scanning (2025 Best Practice)

**Plugin:** `@capacitor-mlkit/barcode-scanning`
**Version:** Latest (check npm for current version)
**Maintained By:** Capawesome.io (Capacitor community partner)

**Why ML Kit over alternatives:**

- **Fast & accurate** - Google's ML Kit SDK with on-device ML
- **Works offline** - No internet required for scanning
- **Handles difficult conditions** - Poor lighting, angles, motion
- **Cross-platform** - Android + iOS support
- **Modern** - Actively maintained for Capacitor 6/7 and Ionic 8

**Installation:**

```bash
npm install @capacitor-mlkit/barcode-scanning
npx cap sync android
npx cap sync ios
```

**Android minSdkVersion Requirement:**

- ML Kit requires **Android API 26+** (Android 8.0)
- Update `android/variables.gradle`:
  ```gradle
  ext {
    minSdkVersion = 26
    compileSdkVersion = 33
    targetSdkVersion = 33
  }
  ```

**iOS Configuration:**

- Add camera usage description to Info.plist (see Technical Requirements)
- CocoaPods required (not SPM)

**Ionic 8 CSS Fix:**
Ionic adds CSS variables that hide the scanner. Add to global.scss:

```scss
body.scanner-active {
  --background: transparent;
  --ion-background-color: transparent;
}
```

### QR Code Scanning API

**Basic Usage:**

```typescript
import { BarcodeScanner, BarcodeFormat } from "@capacitor-mlkit/barcode-scanning";

// Request permission
const { camera } = await BarcodeScanner.requestPermissions();

if (camera === "granted") {
  // Start scan
  const { barcodes } = await BarcodeScanner.scan({
    formats: [BarcodeFormat.QrCode],
  });

  // Get result
  const qrValue = barcodes[0]?.rawValue;
}

// Stop scan (if needed)
await BarcodeScanner.stopScan();
```

**Supported Formats:**

- QR Code (use for this story)
- Barcode (Code 128, EAN, UPC, etc. - not needed)

**Best Practices:**

- Always request permission before scanning
- Handle permission denial gracefully
- Use `stopScan()` if user cancels
- Add listener for back button to stop scan
- Use transparent background CSS for scanner visibility

### WiFi Auto-Connect Limitations (Important!)

**iOS Restrictions:**

- **NO WiFi auto-connect API available**
- Apple's WiFi APIs are private (App Store rejection if used)
- User MUST join WiFi manually via iOS Settings

**Android Capabilities:**

- Android 10+ supports WiFi suggestions API
- Requires WifiWizard2 plugin or similar
- Complex implementation, unreliable across devices

**Recommendation for MVP:**

- **DO NOT** implement WiFi auto-connect (scope creep, low value)
- **User joins WiFi manually** (documented in demo script)
- **QR scan only handles server provisioning** (URL + token)

**Demo Script Adjustment:**

```
1. Staff provides WiFi password verbally: "Connect to Camp-WiFi, password: camp2026"
2. Member connects to WiFi manually
3. Member opens app, scans QR code
4. QR provides server URL + sync credentials
5. App syncs automatically
```

### Fetch API with Timeout (Server Testing)

**AbortController Pattern (Modern):**

```typescript
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 10000);

try {
  const response = await fetch(url, {
    method: "GET",
    signal: controller.signal,
  });

  clearTimeout(timeoutId);

  if (response.ok) {
    return true; // Server reachable
  }
} catch (error) {
  clearTimeout(timeoutId);

  if (error.name === "AbortError") {
    console.log("Request timed out");
  }

  return false; // Server unreachable
}
```

**Why Fetch over HttpClient:**

- Simpler timeout handling
- No dependency on Angular HttpClient
- Direct access to AbortController
- Suitable for health check pings

**Alternative (Angular HttpClient with timeout):**

```typescript
this.http
  .get(`${url}/api/members/health`, {
    observe: "response",
  })
  .pipe(
    timeout(10000),
    catchError(() => of(null))
  )
  .subscribe((response) => {
    if (response?.ok) {
      // Server reachable
    }
  });
```

## Project Context Reference

**CRITICAL PROJECT RULES** (from CLAUDE.md):

1. **Language Consistency:**

   - UI text: **Afrikaans** ("Skandeer QR Kode", "Sinkronisasie", "Sinkronisasie suksesvol voltooi")
   - Code/variables: **English** (scanQRCode, provisioningService, serverUrls)
   - Comments: **English**

2. **Service Abstraction:**

   - Use ApiService for HTTP requests
   - Use SyncService for sync orchestration (don't reimplement)
   - Create QRProvisioningService for new provisioning logic

3. **Offline-First Design:**

   - QR scan works offline (ML Kit is on-device)
   - Token exchange requires network (expected)
   - Sync uses existing offline queue if network drops mid-sync

4. **Platform Support:**

   - **Primary:** Android (test on device)
   - **Secondary:** iOS (manual WiFi, QR for provisioning)
   - **Desktop/Web:** Not applicable (admin access, direct URL entry)

5. **Educational Approach:**
   - Comment TypeScript interfaces clearly
   - Explain ML Kit setup in README or docs
   - Document QR payload structure for future developers

## Demo Scenario Context

**Pieter's Journey (with QR Provisioning):**

**Setup Phase:**

1. Staff boots Raspberry Pi camp server
2. Staff generates QR code on backend (contains server URLs + sync code)
3. Staff displays QR on monitor or prints QR code

**Pieter Arrives at Camp:**

1. Pieter arrives at camp reception area
2. Reception staff: "Welcome! First, connect to Camp-WiFi, password: camp2026"
3. Pieter connects to WiFi manually on his phone

**QR Provisioning (This Story):**

1. Reception staff: "Now open the Suidlanders app and scan this QR code"
2. Pieter opens app, taps "Skandeer QR Kode"
3. Camera opens, Pieter points at QR code on monitor
4. QR scans instantly
5. App shows: "Verbind met kamp bediener..."
6. App tests URLs (Ethernet IP succeeds)
7. App exchanges sync code for token
8. App calls SyncService.sync()
9. Pieter's registration data uploads to backend
10. Backend runs triage (Story 1.1) → Red Camp (diabetes, no medication)
11. App shows: "Sinkronisasie suksesvol voltooi"
12. App clears token and URL

**Reception Dashboard Update (Story 1.2):**

1. Reception staff's tablet auto-refreshes (30-second polling)
2. Pieter appears on dashboard with "Rooi Kamp" badge + [MEDIESE] indicator
3. Staff directs Pieter to Red Camp medical area

**This Story's Role in Demo:**

- **Streamlines UX** - One QR scan instead of manual URL entry
- **Impressive Tech** - Shows sophisticated provisioning
- **Realistic** - Mimics real camp workflow
- **Optional** - Demo succeeds even if this fails (fallback: manual sync button)

**Fallback Demo Path (if QR fails):**

1. Staff provides server URL verbally: "Server is at http://192.168.1.100:3000"
2. Pieter taps "Sinkronisasie" button
3. App uses hardcoded URL from environment config
4. Sync proceeds normally
5. Demo still succeeds (less polished but functional)

## Story Completion Checklist

**Plugin Installation:**

- [ ] Install @capacitor-mlkit/barcode-scanning
- [ ] Update android/variables.gradle (minSdkVersion 26)
- [ ] Update ios Info.plist (camera usage description)
- [ ] Run `npx cap sync`
- [ ] Add global.scss CSS for scanner transparency

**Component Creation:**

- [ ] Generate QRScannerComponent
- [ ] Implement camera permission request
- [ ] Implement ML Kit scan method
- [ ] Implement QR payload parsing
- [ ] Add error handling for scan failures
- [ ] Add unit tests for component

**Service Creation:**

- [ ] Create QRProvisioningService
- [ ] Implement testServerURLs() with sequential testing
- [ ] Implement exchangeSyncCode() for token exchange
- [ ] Implement scanAndProvision() orchestration method
- [ ] Add error handling for all failure scenarios
- [ ] Add unit tests for service

**API Service Updates:**

- [ ] Add setBaseUrl() method
- [ ] Add setSyncToken() method
- [ ] Add clearBaseUrl() method
- [ ] Add clearSyncToken() method
- [ ] Modify HTTP interceptor to include sync token
- [ ] Add unit tests for new methods

**UI Integration:**

- [ ] Add "Scan QR to Sync" button to Home page
- [ ] Add loading indicators for async operations
- [ ] Add success/error toast messages (Afrikaans)
- [ ] Add retry button for failed scans
- [ ] Test UI flow end-to-end

**Testing:**

- [ ] Test Case 1: Camera permission request/denial
- [ ] Test Case 2: Valid QR scan → successful sync
- [ ] Test Case 3: Multiple server URLs (failover)
- [ ] Test Case 4: Invalid QR JSON
- [ ] Test Case 5: Missing QR fields
- [ ] Test Case 6: Expired sync code
- [ ] Test Case 7: All server URLs unreachable
- [ ] Test Case 8: Scanner cancellation
- [ ] Test Case 9: Sync failure after token exchange
- [ ] Test Case 10: Credential cleanup after success
- [ ] Unit tests pass (QRProvisioningService, ApiService updates)
- [ ] Build succeeds with no errors

**Android Device Testing:**

- [ ] Test on Android device (not just emulator)
- [ ] Verify camera opens correctly
- [ ] Test QR scan in various lighting conditions
- [ ] Test QR scan at different angles
- [ ] Verify entire flow: scan → sync → dashboard update

**Demo Preparation:**

- [ ] Backend QR generation working
- [ ] Test QR printed/displayed for demo
- [ ] Demo device WiFi connected to camp network
- [ ] Test scan with real backend
- [ ] Verify Reception dashboard updates after sync
- [ ] Create demo script with QR scan steps
- [ ] Prepare fallback (manual sync button)

**Documentation:**

- [ ] Add JSDoc comments to QRProvisioningService methods
- [ ] Document QR payload structure in code
- [ ] Add README section for ML Kit setup
- [ ] Update CLAUDE.md with new /sync route (if created)
- [ ] Document camera permission requirements

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.5 (claude-sonnet-4-5-20250929)

### Debug Log References

**Build Output**: Build completed successfully with only minor warnings (unused imports)
**Test Execution**: Unit tests created for QRProvisioningService and QRScannerComponent

### Completion Notes

Successfully implemented QR code provisioning flow for camp sync with the following key features:

1. **ML Kit Integration**: Installed and configured @capacitor-mlkit/barcode-scanning plugin (v7.5.0) compatible with Capacitor 7
2. **Sequential URL Testing**: Implemented testServerURLs() method that tries each server URL sequentially with 10-second timeout per URL
3. **Token Exchange Flow**: Implemented exchangeSyncCode() to exchange short-lived sync code for temporary sync token via backend endpoint
4. **Complete Orchestration**: Created QRProvisioningService that handles the full flow: URL testing → token exchange → save credentials → trigger sync → clear credentials
5. **UI Integration**: Added "Skandeer QR Kode" and "Sinkronisasie" buttons to Home page
6. **Error Handling**: Comprehensive error handling with Afrikaans user messages for all failure scenarios
7. **Platform Configuration**: Updated android/variables.gradle to set minSdkVersion to 26 for ML Kit compatibility
8. **Scanner Transparency**: Added CSS to global.scss for transparent background during ML Kit scanning
9. **API Token Management**: Updated ApiService to include sync token in Authorization header when available
10. **Testing**: Created comprehensive unit tests for both QRProvisioningService and QRScannerComponent

**Implementation Approach:**

- Used existing AuthService methods (setCampBaseUrl, setSyncToken, exchangeCampCodeAt) instead of modifying ApiService
- Integrated directly with existing SyncService.sync() method as specified in story requirements
- QR scanning logic implemented directly in Home page using ML Kit for better service injection
- QRScannerComponent available as standalone component for future reuse

**Known Limitations:**

- WiFi auto-connect NOT implemented (iOS restrictions make this impractical for MVP as noted in story)
- QR test page deprecated (noted in comments) - use Home page for QR provisioning
- Backend QR generation endpoint is assumed to exist (not implemented in this story)

**Testing Considerations:**

- Manual testing requires Android device with camera
- Backend must implement /api/auth/camp/exchange endpoint
- Backend must provide /health endpoint for URL testing
- Test QR code must contain valid JSON with serverUrls[], syncCode, and campId fields

### File List

**Created Files:**

- src/app/models/qr-payload.model.ts (QR payload interfaces)
- src/app/services/qr-provisioning.service.ts (provisioning orchestration)
- src/app/services/qr-provisioning.service.spec.ts (unit tests)
- src/app/components/qr-scanner/qr-scanner.component.html (minimal template)
- src/app/components/qr-scanner/qr-scanner.component.scss (scanner styles)
- src/app/components/qr-scanner/qr-scanner.component.spec.ts (unit tests)

**Modified Files:**

- src/app/components/qr-scanner/qr-scanner.component.ts (replaced ZXing with ML Kit)
- src/app/services/api.service.ts (added sync token to Authorization header)
- src/app/pages/home/home.page.ts (added scanQRToSync() and manualSync() methods, added QR scan button, integrated QRProvisioningService)
- src/global.scss (added scanner-active CSS for transparent background)
- android/variables.gradle (updated minSdkVersion from 23 to 26)
- src/app/pages/qr-test/qr-test.page.ts (deprecated old scanner usage)
- package.json (added @capacitor-mlkit/barcode-scanning@7.5.0)

## Story Notes

**Nice-to-Have Status:**
This story is marked as "Nice-to-Have" for the March 6th demo because:

- Manual sync is acceptable fallback (button click instead of QR scan)
- Demo succeeds without QR provisioning (staff can configure app beforehand)
- Adds UX polish but not critical functionality
- Implementation complexity may delay demo if issues arise

**If Time Constrained:**

- Skip this story, use manual sync button
- Hardcode server URL in environment config
- Demo still impresses with triage and dashboard features

**If Implemented:**

- Significantly improves UX
- Shows technical sophistication
- Realistic camp scenario simulation
- Valuable feature for production deployment

---

**Story Status:** ready-for-dev
**Ready for Sprint:** Yes - Story 1.1 and 1.2 provide foundation; this is optional enhancement
**Dependencies:** Backend `/auth/camp/exchange` endpoint (assumed available)
**Next Story:** 1-4-role-based-ui-demonstration (demo mode toggle)
