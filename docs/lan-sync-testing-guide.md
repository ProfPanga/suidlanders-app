# LAN Sync Testing & Validation Guide

**Last Updated:** 2026-02-23
**Purpose:** Comprehensive guide for testing offline LAN sync capabilities in a home/lab environment

---

## Overview

This guide walks you through setting up a local test environment to validate the Suidlanders app's offline LAN synchronization features. You'll test the complete flow: QR provisioning, data sync, offline queue, and conflict resolution.

**What You'll Test:**

- QR code provisioning (device-to-server pairing)
- Member data sync (app → server)
- Offline queue and retry logic
- Server-to-device sync (server → app)
- Conflict resolution
- Database integrity after sync

**Test Environment:**

- Backend server: Laptop/PC running NestJS backend
- Network: Local router (WiFi/Ethernet)
- Client: Android device with Suidlanders app

---

## Prerequisites

### Hardware

- ✅ Laptop/PC (backend server)
- ✅ Router (creating local network)
- ✅ Android device (or emulator)
- ✅ USB cable (for initial APK install and debugging)

### Software

- ✅ Node.js v18+ installed on laptop
- ✅ Backend code: `/Users/corneloots/Development/suidlanders-backend`
- ✅ Android app APK: Built from `/Users/corneloots/Development/suidlanders-app`
- ✅ Database browser (optional):
  - SQLite: [DB Browser for SQLite](https://sqlitebrowser.org/)
  - PostgreSQL: [pgAdmin](https://www.pgadmin.org/) or [DBeaver](https://dbeaver.io/)

---

## Part 1: Physical Test Environment Setup

### Step 1.1: Network Configuration

**Option A: Dedicated Test Network (Recommended)**

1. Connect router to power (no internet required)
2. Connect laptop to router via WiFi or Ethernet
3. Note laptop's IP address:

   ```bash
   # macOS/Linux
   ifconfig | grep "inet "

   # Windows
   ipconfig
   ```

   Look for something like `192.168.1.100` or `192.168.0.10`

**Option B: Existing Home Network**

1. Connect laptop and Android device to same WiFi
2. Note laptop's IP address (same commands as above)

**Verification:**

- Laptop and Android device must be on **same subnet** (e.g., both 192.168.1.x)
- Ping test: From laptop, try to ping another device on the network

# Ping another device (like your Android device IP)

ping 192.168.1.150

# Ping continuously (Ctrl+C to stop)

ping -t 192.168.1.150

---

### Step 1.2: Backend Server Setup

**Navigate to backend:**

```bash
cd /Users/corneloots/Development/suidlanders-backend
```

**Install dependencies (if not done):**

```bash
npm install
```

**Choose database mode:**

#### Option A: SQLite (Easier for testing, mimics Raspberry Pi)

```bash
# Create data directory
mkdir -p data

# Start in Pi mode (SQLite)
npm run start:pi:dev
```

Server will:

- Create `data/camp.sqlite` database
- Run on `http://localhost:3000`
- Auto-reload on code changes

#### Option B: PostgreSQL (More robust, better for multi-device testing)

```bash
# Ensure PostgreSQL is running
# Create database:
createdb suidlanders_test

# Set environment variables
export DB_HOST=localhost
export DB_PORT=5432
export DB_USER=your_pg_user
export DB_PASS=your_pg_password
export DB_NAME=suidlanders_test
export DB_DROP_SCHEMA=1  # Optional: clean start

# Start server
npm run start:dev
```

**Verify server is running:**

```bash
# In another terminal
curl http://localhost:3000/api/health
```

Expected response: `{"status":"ok"}`

**Find your server URLs:**

```bash
# Your laptop's local IP
ifconfig | grep "inet " | grep -v 127.0.0.1

# Example output: 192.168.1.100
# Your server URL: http://192.168.1.100:3000
```

---

### Step 1.3: Android App Setup

**Build and install APK:**

```bash
cd /Users/corneloots/Development/suidlanders-app

# Build APK
npm run buildAndroid

# Install on device via USB
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

**Alternative: Use Android emulator**

```bash
# Start emulator
npx cap run android
```

**Important:** Ensure Android device is connected to the **same WiFi network** as laptop.

---

## Part 2: Test Scenarios

### Test Scenario 1: QR Provisioning Flow

**Goal:** Verify device can scan QR code and obtain sync token

#### Step 1.1: Generate Camp QR Code

**Create a test user (staff) on backend:**

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "staff@test.com", "password": "test123"}'
```

**Login to get JWT token:**

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "staff@test.com", "password": "test123"}'
```

Copy the `accessToken` from response.

**Generate camp QR code:**

```bash
# Replace YOUR_IP and YOUR_JWT_TOKEN
curl -X POST http://YOUR_IP:3000/api/auth/camp/init \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"campId": "test-camp-001"}'
```

**Example:**

```bash
curl -X POST http://192.168.1.100:3000/api/auth/camp/init \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{"campId": "test-camp-001"}'
```

**Response (example):**

```json
{
  "success": true,
  "code": "ABC123XYZ",
  "expiresAt": 1708707600000,
  "qrData": {
    "serverUrls": ["http://192.168.1.100:3000", "http://192.168.43.1:3000", "http://camp.local:3000"],
    "syncCode": "ABC123XYZ",
    "campId": "test-camp-001"
  }
}
```

**Generate visual QR code:**

You have two options:

**Option A: Use online QR generator**

1. Copy the entire `qrData` JSON object
2. Go to https://www.qr-code-generator.com/
3. Select "Text" type
4. Paste JSON
5. Display QR on laptop screen

**Option B: Use QRGeneratorComponent in app** (if you have a staff UI)

- Navigate to QR generator page
- Input the QR data
- Display on screen

#### Step 1.2: Scan QR Code with App

1. Open Suidlanders app on Android device
2. Navigate to QR scanner (or provisioning flow)
3. Scan QR code displayed on laptop screen
4. **Expected behavior:**
   - App tries each URL in `serverUrls`
   - Successfully connects to `http://192.168.1.100:3000`
   - Exchanges sync code for token
   - Shows "Provisioning successful" or similar message

#### Step 1.3: Verify in Backend Logs

Check backend terminal for:

```
[AuthController] POST /api/auth/camp/exchange
[AuthService] Code ABC123XYZ validated for campId: test-camp-001
```

**✅ Success Criteria:**

- App successfully scans QR
- Backend logs show successful token exchange
- App stores sync token temporarily

---

### Test Scenario 2: Member Data Sync (App → Server)

**Goal:** Create member in app, sync to server, verify in database

#### Step 2.1: Create Member in App

1. Open Suidlanders app
2. Fill out member registration form (all 10 sections):
   - Basic Info (name, ID, email)
   - Member Info (emergency contact)
   - Address Info
   - Medical Info
   - Vehicle Info
   - Skills Info
   - Equipment Info
   - Other Info
   - Camp Info
   - Documents Info
3. **Save member** (this stores locally in SQLite/IndexedDB)

#### Step 2.2: Trigger Manual Sync

**Option A: Use app UI sync button**

- Tap sync button in app header/menu

**Option B: Wait for auto-sync** (5-minute interval)

#### Step 2.3: Verify Sync in Backend Logs

Check backend terminal for:

```
[SyncController] POST /api/sync/push
[SyncService] Received 1 changes
[MembersService] Upserting member: <UUID>
```

#### Step 2.4: Verify Member in Database

**SQLite (if using Pi mode):**

```bash
# Open database
sqlite3 /Users/corneloots/Development/suidlanders-backend/data/camp.sqlite

# Query members
SELECT id, entryId, nationalId, createdAt FROM members;

# View full payload
SELECT payload FROM members WHERE entryId = 'MEMBER_ID_HERE';

# Exit
.quit
```

**PostgreSQL:**

```bash
psql -d suidlanders_test -c "SELECT id, entryId, nationalId, createdAt FROM members;"
```

**Using DB Browser (GUI):**

1. Open DB Browser for SQLite
2. File → Open Database → Select `data/camp.sqlite`
3. Browse Data tab → `members` table
4. Verify:
   - Record exists with correct `entryId`
   - `nationalId` matches member's ID number
   - `payload` JSON contains all form data
   - `createdAt` and `updatedAt` timestamps are recent

**✅ Success Criteria:**

- Member record appears in backend database
- `payload` JSON contains complete form data (basic_info, medical_info, etc.)
- Timestamps are correct
- Backend logs show successful upsert

---

### Test Scenario 3: Offline Queue & Retry Logic

**Goal:** Verify app queues changes when offline and retries when back online

#### Step 3.1: Create Member While Offline

1. **Disconnect Android device from WiFi** (airplane mode or disable WiFi)
2. Create a new member in app (fill out form and save)
3. Attempt manual sync
4. **Expected behavior:**
   - Sync fails (no network)
   - Change is queued locally in `sync_queue` (managed by SyncQueueService)
   - UI shows "Sync pending" or similar

#### Step 3.2: Verify Queue in App Database

**Option A: Use DataViewerComponent** (if available in app)

- Navigate to `/data-viewer` route
- Check for pending sync items

**Option B: Inspect SQLite database on device**

```bash
# Pull database from Android device
adb pull /data/data/com.suidlanders.emergency/databases/suidlanders.db ./

# Open with DB Browser
# Check sync_queue table (if it exists) or look for queued changes
```

#### Step 3.3: Reconnect and Verify Auto-Retry

1. **Reconnect Android device to WiFi**
2. Wait for auto-sync (5 minutes) or trigger manual sync
3. **Expected behavior:**
   - App retries queued changes
   - Sync succeeds
   - Queue is cleared

#### Step 3.4: Verify in Backend

Check backend logs for:

```
[SyncController] POST /api/sync/push
[SyncService] Received 1 changes (queued while offline)
```

Query database to confirm member exists.

**✅ Success Criteria:**

- Changes are queued when offline
- Auto-retry succeeds when back online
- No data loss
- Backend receives all queued changes

---

### Test Scenario 4: Server-to-Device Sync (Pull Changes)

**Goal:** Verify app can pull changes from server

#### Step 4.1: Create Member Directly on Server

**Using curl:**

```bash
curl -X POST http://192.168.1.100:3000/api/members \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "entryId": "SERVER_MEMBER_001",
    "nationalId": "9001015800088",
    "payload": {
      "basicInfo": {
        "van": "Test",
        "noem_naam": "Server",
        "email": "server@test.com"
      }
    }
  }'
```

#### Step 4.2: Pull Changes in App

1. Open app on Android device
2. Trigger manual sync (or wait for auto-sync)
3. **Expected behavior:**
   - App calls `GET /api/sync/pull?lastSync=TIMESTAMP`
   - Server returns changes since last sync
   - App applies changes to local database

#### Step 4.3: Verify Member Appears in App

1. Navigate to member list or data viewer
2. Confirm "SERVER_MEMBER_001" appears
3. View full details to verify payload

**✅ Success Criteria:**

- App successfully pulls server changes
- New member appears in local database
- Data integrity maintained (all fields correct)

---

### Test Scenario 5: Conflict Resolution

**Goal:** Test timestamp-based conflict resolution (last-write-wins)

#### Step 5.1: Create Conflict Scenario

1. **In app:** Edit an existing member (e.g., change email to `app-edit@test.com`)
2. **Don't sync yet** - keep offline or disable sync
3. **On server (via curl):** Edit the SAME member (change email to `server-edit@test.com`)
   ```bash
   curl -X PUT http://192.168.1.100:3000/api/members/ENTRY_ID_HERE \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -d '{
       "payload": {
         "basicInfo": {
           "email": "server-edit@test.com"
         }
       }
     }'
   ```
4. **In app:** Now trigger sync

#### Step 5.2: Observe Conflict Resolution

**Expected behavior (last-write-wins):**

- If app edit has newer timestamp → app version wins
- If server edit has newer timestamp → server version wins

**Current implementation:** Based on your sync service, conflicts may be:

- **Server wins** (if server timestamp is newer)
- **App wins** (if app pushed first)

Check backend logs for conflict handling messages.

#### Step 5.3: Verify Final State

Query both databases:

- **App database:** Check member's email field
- **Server database:** Check member's email field
- **They should match** (winner's version)

**✅ Success Criteria:**

- Conflict is detected
- Resolution follows timestamp logic
- Data converges (no divergent states)
- No data corruption

---

## Part 3: Database Validation Checklist

### After Each Sync, Verify:

#### App Database (SQLite/IndexedDB)

**SQLite (on Android device):**

```bash
# Pull database
adb pull /data/data/com.suidlanders.emergency/databases/suidlanders.db ./

# Query
sqlite3 suidlanders.db "SELECT * FROM members;"
```

**IndexedDB (web/desktop):**

- Chrome DevTools → Application tab → IndexedDB → suidlanders → members
- Verify records and structure

**Check:**

- ✅ All synced members exist
- ✅ Timestamps are correct (`created_at`, `updated_at`)
- ✅ Status is 'active' (not 'deleted')
- ✅ Foreign key relationships intact (if using normalized schema)
- ✅ No duplicate records

#### Backend Database

**SQLite:**

```bash
sqlite3 /Users/corneloots/Development/suidlanders-backend/data/camp.sqlite

SELECT COUNT(*) FROM members;
SELECT * FROM members ORDER BY createdAt DESC LIMIT 5;
```

**PostgreSQL:**

```sql
SELECT COUNT(*) FROM members;
SELECT id, entryId, nationalId, payload->>'basicInfo' AS basic_info
FROM members
ORDER BY createdAt DESC
LIMIT 5;
```

**Check:**

- ✅ Member count matches expected
- ✅ `payload` JSON is valid and complete
- ✅ `entryId` and `nationalId` are unique (check for duplicates)
- ✅ Timestamps are sequential (newer edits have later timestamps)
- ✅ No orphaned records

---

## Part 4: Troubleshooting Guide

### Issue 1: QR Scanner Can't Connect to Server

**Symptoms:**

- QR scans successfully but token exchange fails
- Error: "Network error" or "Unable to connect"

**Debugging Steps:**

1. **Verify network connectivity:**
   ```bash
   # From Android device (using Termux or similar)
   ping 192.168.1.100
   ```
2. **Check firewall:** Ensure laptop firewall allows port 3000
   ```bash
   # macOS: System Preferences → Security & Privacy → Firewall → Allow Node
   # Windows: Windows Defender Firewall → Allow an app
   ```
3. **Verify server is running:**
   ```bash
   curl http://192.168.1.100:3000/api/health
   ```
4. **Check server logs:** Look for CORS errors or connection attempts
5. **Try different server URL:** If mDNS (`camp.local`) fails, use IP directly

**Fix:**

- Ensure both devices on same subnet
- Disable VPN on laptop
- Use `http://` not `https://` for local testing
- Check `serverUrls` in QR data match laptop's actual IP

---

### Issue 2: Sync Fails with 401 Unauthorized

**Symptoms:**

- Sync push/pull returns 401 error
- Backend logs: "Unauthorized"

**Debugging Steps:**

1. **Check sync token expiration:**
   - Tokens expire after use or after 15 minutes
   - Re-scan QR to get fresh token
2. **Verify token is stored:**
   - Check localStorage: `camp_sync_token`
3. **Check token format:**
   - Should be sent as `Authorization: Bearer <token>`

**Fix:**

- Re-provision device (scan QR again)
- Clear old tokens from localStorage
- Check `AuthService.exchangeCampCode()` logic in app

---

### Issue 3: Data Not Syncing

**Symptoms:**

- Member saved in app but doesn't appear in backend database
- No errors in logs

**Debugging Steps:**

1. **Check sync service logs:**
   ```bash
   # Backend terminal - look for:
   [SyncController] POST /api/sync/push
   ```
2. **Verify SyncQueueService is queueing changes:**
   - Add console.log in `SyncQueueService.queueChange()`
3. **Check network tab in Chrome DevTools** (if testing on web):
   - Look for POST to `/api/sync/push`
   - Check request payload
4. **Verify auto-sync is enabled:**
   - Check `SyncService.SYNC_INTERVAL` (should be 300000ms = 5 min)
   - Manually trigger sync

**Fix:**

- Ensure `SyncService` is initialized (check app startup)
- Verify DatabaseService is triggering sync queue on CRUD operations
- Check for JavaScript errors in console

---

### Issue 4: Conflict Resolution Not Working

**Symptoms:**

- Conflicts not detected
- Data diverges between app and server

**Debugging Steps:**

1. **Check timestamps:**

   ```sql
   -- Backend
   SELECT id, updatedAt FROM members WHERE entryId = 'ENTRY_ID';

   -- App (SQLite)
   SELECT id, updated_at FROM members WHERE id = 'UUID';
   ```

2. **Verify conflict resolution logic:**
   - Review `SyncService.resolveConflicts()` in app
   - Check backend logs for conflict messages
3. **Test with known timestamps:**
   - Manually set `updatedAt` values to create conflict
   - Verify resolution follows last-write-wins

**Fix:**

- Ensure timestamps are UNIX format (milliseconds)
- Verify server returns conflicts in sync response
- Check conflict resolution strategy matches expected behavior

---

### Issue 5: Database Schema Mismatch

**Symptoms:**

- Sync succeeds but data missing or malformed
- Frontend expects 11 tables, backend has 2

**Current State:**

- **Backend:** Stores entire form as JSON in `members.payload`
- **Frontend:** Uses 11 normalized tables

**This is OK for testing!** Backend `payload` is flexible and accepts all form data.

**Debugging Steps:**

1. **Verify payload structure:**
   ```sql
   SELECT payload FROM members LIMIT 1;
   ```
2. **Check that all sections are present:**
   - basicInfo, memberInfo, addressInfo, medicalInfo, etc.
3. **Compare with frontend schema:**
   - Review `src/app/interfaces/form-sections.interface.ts`

**Fix:**

- Ensure DatabaseService maps 11-table structure to single JSON payload before sync
- Verify SyncService serializes data correctly

---

## Part 5: Known Limitations & Notes

### Current Implementation Constraints

1. **In-Memory Sync State (Backend)**

   - `SyncService.changes` array is in-memory
   - **Impact:** Server restart clears sync queue
   - **For testing:** Not an issue (short sessions)
   - **For production:** Needs database-backed queue

2. **No Persistent Sync Queue (Backend)**

   - Changes not stored in database
   - **Impact:** Can't replay sync history
   - **For testing:** Fine for basic validation
   - **For production:** Add `sync_queue` table

3. **Basic Conflict Resolution**

   - Last-write-wins based on timestamp
   - **Impact:** No manual conflict review
   - **For testing:** Sufficient
   - **For production:** May need merge strategies

4. **No Rate Limiting**

   - Endpoints have no throttling
   - **Impact:** Can spam server
   - **For testing:** Not an issue
   - **For production:** Add rate limiting

5. **Minimal Error Handling**

   - Basic try-catch blocks
   - **Impact:** Errors may not be logged well
   - **For testing:** Check console/terminal logs
   - **For production:** Add global exception filter + logging

6. **QR Code Expiration**
   - Codes expire after 15 minutes
   - **Impact:** Must re-scan if testing takes too long
   - **For testing:** Generate fresh QR as needed
   - **For production:** Consider longer expiry or refresh mechanism

---

## Part 6: Test Results Template

Use this template to document your test results:

```markdown
## LAN Sync Test Results - [Date]

### Test Environment

- Backend: SQLite / PostgreSQL (circle one)
- Network: Router model/name
- App version: [APK build date]
- Laptop IP: 192.168.x.x

### Test Scenario 1: QR Provisioning

- [ ] QR generated successfully
- [ ] App scanned QR
- [ ] Token exchange succeeded
- [ ] Backend logs show success
      **Notes:** ****\*\*****\_\_\_****\*\*****

### Test Scenario 2: Member Data Sync

- [ ] Member created in app
- [ ] Sync triggered (manual/auto)
- [ ] Backend received data
- [ ] Database verified
      **Notes:** ****\*\*****\_\_\_****\*\*****

### Test Scenario 3: Offline Queue

- [ ] Member created offline
- [ ] Change queued
- [ ] Retry succeeded when online
      **Notes:** ****\*\*****\_\_\_****\*\*****

### Test Scenario 4: Pull Changes

- [ ] Member created on server
- [ ] App pulled changes
- [ ] Member appears in app
      **Notes:** ****\*\*****\_\_\_****\*\*****

### Test Scenario 5: Conflict Resolution

- [ ] Conflict created
- [ ] Resolution applied
- [ ] Data converged
      **Notes:** ****\*\*****\_\_\_****\*\*****

### Issues Encountered

1. ***
2. ***

### Overall Result

- [ ] All tests passed
- [ ] Some tests failed (see notes)
- [ ] Ready for field testing
```

---

## Part 7: Next Steps After Testing

### If All Tests Pass ✅

1. **Document test environment setup** (you just did this!)
2. **Create Raspberry Pi deployment guide** (backend README has basics)
3. **Plan field test in real camp scenario:**
   - Multiple devices
   - Longer duration
   - Real user workflows
4. **Consider production improvements:**
   - Persistent sync queue on backend
   - Better conflict resolution
   - Logging and monitoring
   - Error handling

### If Tests Fail ❌

1. **Document failures** using template above
2. **Review troubleshooting section**
3. **Check backend and frontend logs** for error details
4. **File issues/tickets** for bugs found
5. **Iterate and re-test**

---

## Part 8: Quick Reference Commands

### Backend Commands

```bash
# Start backend (SQLite mode)
cd /Users/corneloots/Development/suidlanders-backend
npm run start:pi:dev

# Start backend (PostgreSQL mode)
npm run start:dev

# Check health
curl http://localhost:3000/api/health

# Create test user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'

# Generate QR code
curl -X POST http://YOUR_IP:3000/api/auth/camp/init \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"campId":"test-camp"}'
```

### App Commands

```bash
# Build APK
cd /Users/corneloots/Development/suidlanders-app
npm run buildAndroid

# Install on device
adb install android/app/build/outputs/apk/debug/app-debug.apk

# View device logs
adb logcat | grep -i capacitor
```

### Database Commands

```bash
# SQLite (backend)
sqlite3 /Users/corneloots/Development/suidlanders-backend/data/camp.sqlite
SELECT * FROM members;

# SQLite (app - pull from device first)
adb pull /data/data/com.suidlanders.emergency/databases/suidlanders.db ./
sqlite3 suidlanders.db

# PostgreSQL
psql -d suidlanders_test
SELECT * FROM members;
```

### Network Debugging

```bash
# Find laptop IP
ifconfig | grep "inet " | grep -v 127.0.0.1

# Test server from device (if Termux installed)
ping 192.168.1.100
curl http://192.168.1.100:3000/api/health
```

---

## Appendix A: Expected Database States

### Backend Database (after successful sync)

**members table:**

```sql
id                  | entryId          | nationalId      | payload (JSON)              | createdAt  | updatedAt
--------------------|------------------|-----------------|----------------------------|------------|----------
uuid-1234-5678-...  | MEMBER_001       | 9001015800088   | {"basicInfo":{...},...}   | 1708707600 | 1708707600
```

**users table:**

```sql
id                  | email            | role     | createdAt  | updatedAt
--------------------|------------------|----------|------------|----------
uuid-abcd-efgh-...  | staff@test.com   | user     | 1708700000 | 1708700000
```

### App Database (SQLite - after successful sync)

**members table:**

```sql
id                  | created_at | updated_at | status  | version
--------------------|------------|------------|---------|--------
uuid-1234-5678-...  | 1708707600 | 1708707600 | active  | 1
```

**basic_info table:**

```sql
member_id           | van    | noem_naam | email
--------------------|--------|-----------|------------------
uuid-1234-5678-...  | Test   | Member    | member@test.com
```

(Plus 9 other section tables with corresponding data)

---

## Appendix B: Raspberry Pi Testing (Future)

Once laptop testing succeeds, you can deploy to Raspberry Pi for more realistic camp simulation:

1. **Flash Raspberry Pi OS** to SD card
2. **Clone backend repo** to Pi
3. **Install Node.js** on Pi
4. **Run backend in Pi mode:**
   ```bash
   npm run start:pi
   ```
5. **Configure Pi as WiFi Access Point** (optional)
   - Creates isolated network (no internet)
   - Devices connect directly to Pi
6. **Test with multiple devices** simultaneously

See backend `README.md` section "Raspberry Pi Installation" for detailed steps.

---

## Contact & Support

**Questions about this guide?**

- Review backend README: `/Users/corneloots/Development/suidlanders-backend/README.md`
- Review app CLAUDE.md: `/Users/corneloots/Development/suidlanders-app/CLAUDE.md`
- Check existing docs: `/Users/corneloots/Development/suidlanders-app/docs/`

**Found a bug during testing?**

- Document in test results template
- Create issue/ticket with:
  - Test scenario that failed
  - Expected vs actual behavior
  - Logs from backend and app
  - Database state screenshots

---

**Good luck with testing!** 🚀

Remember: The goal is to validate that the sync flow works end-to-end. Don't worry if you hit issues - that's why we test! Use the troubleshooting section and document everything.
