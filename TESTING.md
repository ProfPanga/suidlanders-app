# Suidlanders App - Testing Guide

This document provides step-by-step testing procedures for quality assurance and regression testing.

## Prerequisites

- Docker installed and running
- Node.js and npm installed
- Both backend and frontend repositories cloned and dependencies installed

## Cleanup

```bash
# Check if PostgreSQL container is running
docker ps --filter name=suidlanders-postgres

# If it's not running, start it:
docker start suidlanders-postgres

# Connect to the database
docker exec -it suidlanders-postgres psql -U suidlanders -d suidlanders
```

```sql
-- Check what's currently in the database
SELECT * FROM members;
SELECT * FROM users;

-- Clear all data for clean testing
TRUNCATE TABLE members RESTART IDENTITY CASCADE;
DELETE FROM users;

-- Verify it's clean
SELECT COUNT(*) FROM members;
SELECT COUNT(*) FROM users;

-- Exit the database
\q
```

## Backend Testing

### 1. Unit & E2E Tests

```bash
cd /Users/corneloots/Development/suidlanders-backend

# Run all automated tests
npm run test:e2e

# Expected: All tests pass (app.e2e-spec.ts, members.e2e-spec.ts, sync.e2e-spec.ts)
```

### 2. Manual API Testing

```bash
# Start PostgreSQL
docker ps --filter name=suidlanders-postgres
# If not running:
docker start suidlanders-postgres

# Start backend (keep running)
npm run start:dev

# Test health endpoint
curl -sS http://localhost:3000/api/health

# Register test user
curl -sS -X POST http://localhost:3000/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"email":"test@example.com","password":"secret123"}'

# Login and get token
TOKEN=$(curl -sS -X POST http://localhost:3000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"test@example.com","password":"secret123"}' | jq -r .accessToken)

# Test protected endpoints
curl -sS http://localhost:3000/api/members -H "Authorization: Bearer $TOKEN"
curl -sS 'http://localhost:3000/api/sync/pull?lastSync=0' -H "Authorization: Bearer $TOKEN"
```

## Frontend Testing

### 1. Overview & Environment Setup

#### Dual-Mode App Architecture

The app now supports two distinct user flows:

- **Guest Mode**: Members can register and fill forms without login (offline-first)
- **Staff Mode**: Personnel (admin/medical/security) must login to access protected features

#### Testing Matrix:

- **Online Testing**: Full connectivity, immediate sync to server
- **Offline Testing**: No network, queue-based sync, camp QR recovery
- **Desktop Testing**: Web browser on desktop/laptop (Chrome, Safari, Firefox)
- **Mobile Testing**: Android device/emulator and mobile web browsers

#### Key Features to Test:

- **Route Protection**: Guest vs staff access patterns
- **Data Persistence**: Local storage, sync queues, database
- **National ID Deduplication**: Same ID number updates existing record
- **Token Management**: User tokens vs temporary sync tokens
- **Error Handling**: Network failures, invalid data, expired tokens

#### Environment Setup

```bash
# Ensure backend is running (from previous section)

# Start frontend
cd /Users/corneloots/Development/suidlanders-app
npm start

# Open browser to http://localhost:4200
```

### 2. Guest Mode Testing (Online)

All tests in this section assume stable internet connection and immediate server sync.

#### Step 1: Home Page Access

- Navigate to `http://localhost:4200/`
- **Expected:** Goes directly to home page (no login redirect)
- **Verify Buttons:**
  - "Begin Registrasie" → enabled (guest access)
  - "Verbind na Kamp" → enabled (camp sync)
  - "Personeel Aanmelding" → enabled (staff login)
  - "Bestuur Lede" → disabled (staff only)
  - "Wys Dokumentasie" → disabled (future feature)

#### Step 2: Guest Member Registration (Online)

- Click "Begin Registrasie"
- **Expected:** Opens member form without requiring login
- **Test Route Access:**
  - Verify URL is `/member-form`
  - Verify no authentication redirect occurs
- **Fill Required Fields:**
  - Van: `OnlineTest`
  - Eerste Naam: `Guest`
  - ID Nommer: `9001011234567` (13 digits)
  - Geboortedatum: `1990-01-01`
- **Submit Form:**
  - Click "Dien Vorm In"
  - **Expected:** Form submits immediately
  - **Check Console:** "Form submitted" + "Manual sync result: { success: true, message: 'Sync completed successfully' }"
  - **Expected:** Data syncs to server immediately (online mode)

#### Step 3: Verify Guest Data Synced to Server

**Note:** Even though this is guest mode testing, we verify server-side data using staff credentials to confirm the guest sync worked.

```bash
# First, ensure test user exists (if database was cleared)
curl -sS -X POST http://localhost:3000/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"email":"test@example.com","password":"secret123"}'

# Check server immediately after form submission (using staff token for verification)
TOKEN=$(curl -sS -X POST http://localhost:3000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"test@example.com","password":"secret123"}' | jq -r .accessToken)

curl -sS http://localhost:3000/api/members -H "Authorization: Bearer $TOKEN" | jq .
```

- **Expected:** Member record present with `nationalId: "9001011234567"`
- **Expected:** Record includes all submitted form data
- **Expected:** Proves guest sync worked (guest submitted, staff can see it)

#### Step 4: Test National ID Deduplication

- Fill same form again with same ID number but different name:
  - Van: `UpdatedTest`
  - ID Nommer: `9001011234567` (same as before)
- Submit form
- **Check Server:**

```bash
curl -sS http://localhost:3000/api/members -H "Authorization: Bearer $TOKEN" | jq '.[] | select(.nationalId=="9001011234567")'
```

- **Expected:** Only ONE record with that ID
- **Expected:** Record shows updated data (`UpdatedTest`)

### 3. Staff Authentication Testing

#### Step 1: Staff Login Page

- From home page, click "Personeel Aanmelding"
- **Expected:** Navigates to `/login`
- **Test Invalid Credentials:**
  - Enter wrong email/password
  - Verify error message in Afrikaans
- **Test Valid Login:**
  - Email: `test@example.com`
  - Password: `secret123`
  - Click "Teken In"
  - **Expected:** Redirect to home page

#### Step 2: Token Persistence

- Refresh the page
- **Expected:** Should remain logged in (no redirect to login)
- Open DevTools → Application → Local Storage
- **Expected:** Should see auth token stored

### 4. Home Page Testing

#### Step 1: Navigation & UI

- Verify Afrikaans text displays correctly
- **Test Buttons:**
  - "Begin Registrasie" → enabled (guest access)
  - "Verbind na Kamp" → enabled (camp sync)
  - "Personeel Aanmelding" → enabled (staff login)
  - "Bestuur Lede" → disabled (staff only)
  - "Wys Dokumentasie" → disabled (future feature)

### 5. Form Testing

#### Step 1: Form Validation (Afrikaans)

- Navigate to member form via "Begin Registrasie"
- **Test Required Fields:**
  - Try to submit empty form
  - **Expected:** "Dien Vorm In" button should be disabled when required fields are empty
  - Open "Basiese Inligting" accordion section
  - **Expected:** All required fields show validation when touched
  - **Expected:** "Hierdie veld is verpligtend" for empty required fields
- **Test ID Number Validation:**
  - Enter 12-digit ID: `123456789012`
  - **Expected:** Error message "ID nommer moet 13 syfers wees"
- **Test Email Validation:**
  - Enter invalid email: `invalid-email`
  - **Expected:** Proper Afrikaans error message

#### Step 2: Successful Form Submission

- **Fill Required Fields:**
  - Noemnaam: `Test`
  - Van: `User`
  - ID Nommer: `9001011234567` (13 digits)
  - Geboortedatum: Select any valid date
- Click "Dien Vorm In"
- **Check Console (DevTools):**
  - Should see: "Form submitted: ..."
  - Should see: "Manual sync result: { success: true, ... }"

#### Step 3: Verify Data Persistence

```bash
# Get fresh token (in case expired)
TOKEN=$(curl -sS -X POST http://localhost:3000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"test@example.com","password":"secret123"}' | jq -r .accessToken)

# Check server has the record
curl -sS http://localhost:3000/api/members -H "Authorization: Bearer $TOKEN" | jq .
```

- **Expected:** Array with member record containing your form data
- **Note:** Records with same ID number (nationalId) will be updated, not duplicated

### 6. Authorization Testing

#### Step 1: Guest vs Staff Route Access

- **Test Guest Access (No Login Required):**

  - Open new private/incognito window
  - Navigate to `http://localhost:4200/home`
  - **Expected:** Home page loads without redirect to login
  - Navigate to `http://localhost:4200/member-form`
  - **Expected:** Member form loads without redirect to login
  - Fill and submit form with valid ID number
  - **Expected:** Form submits successfully, data syncs to server

- **Test Staff-Only Route Protection:**
  - In same incognito window (no login), navigate to `http://localhost:4200/data-viewer`
  - **Expected:** Redirects to `/login` page
  - **Check Console:** "AuthGuard: No valid token, redirecting to login"

#### Step 2: API Security (Staff Endpoints)

```bash
# Test protected staff endpoint without token
curl -i http://localhost:3000/api/members
```

- **Expected:** 401 Unauthorized response

```bash
# Test public guest endpoint (sync/push)
curl -i -X POST http://localhost:3000/api/sync/push \
  -H 'Content-Type: application/json' \
  -d '{"changes": []}'
```

- **Expected:** 201 Success response (guests can push data)

### 7. Camp Sync Testing (QR Code Flow)

#### Step 1: Staff Generates Camp QR

- Login as staff user (use "Personeel Aanmelding")
- Make API call to generate camp code:

```bash
# Get staff token
STAFF_TOKEN=$(curl -sS -X POST http://localhost:3000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"test@example.com","password":"secret123"}' | jq -r .accessToken)

# Generate camp QR code
curl -sS -X POST http://localhost:3000/api/auth/camp/init \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $STAFF_TOKEN" \
  -d '{"campId":"CAMP-001"}' | jq .
```

- **Expected:** Returns QR data with `code`, `campId`, `serverUrl`

#### Step 2: Guest Scans Camp QR

- As guest user (no login), fill out member form and submit
- Navigate to home page, click "Verbind na Kamp"
- Simulate QR scan by calling exchange endpoint:

```bash
# Extract code from previous step, then:
curl -sS -X POST http://localhost:3000/api/auth/camp/exchange \
  -H 'Content-Type: application/json' \
  -d '{"code":"<CODE_FROM_STEP_9>","campId":"CAMP-001"}' | jq .
```

- **Expected:** Returns temporary sync token
- **In App:** Should show "Suksesvol verbind na kamp" message
- **Expected:** Automatic sync should complete with success message

### 8. Offline Testing

All tests in this section simulate emergency conditions with no internet access.

#### Step 1: Prepare Offline Environment

- **Disable Network:** DevTools → Network → Offline (or disconnect WiFi)
- **Clear Local Storage:** DevTools → Application → Local Storage → Clear all
- **Reload App:** Refresh `http://localhost:4200/`
- **Expected:** App loads from browser cache (may show cached content)

#### Step 2: Offline Member Registration

- Navigate to home page (should work offline)
- Click "Begin Registrasie"
- **Expected:** Member form loads without network dependency
- **Fill Required Fields:**
  - Van: `OfflineTest`
  - Eerste Naam: `Member`
  - ID Nommer: `9002021234567` (different from online test)
  - Geboortedatum: `1990-02-02`
- **Submit Form:**
  - Click "Dien Vorm In"
  - **Expected:** Form submits successfully (local save)
  - **Check Console:** "Form submitted" + sync error (network failure)
  - **Expected:** Data saved locally, queued for later sync

#### Step 3: Verify Offline Data Persistence

- **Refresh Page:** Data should persist across reloads
- **Check Local Storage:** DevTools → Application → Local Storage
- **Expected:** Form data stored locally
- **Expected:** Sync queue contains pending changes

#### Step 4: Multiple Offline Registrations

- Register 2-3 more members offline with different ID numbers
- **Expected:** All forms submit successfully
- **Expected:** All data queued for sync
- **Check Sync Queue:** Should show multiple pending items

### 9. Offline-to-Online Recovery

#### Step 1: Restore Network Connection

- **Re-enable Network:** DevTools → Network → Online (or reconnect WiFi)
- **Wait for Auto-Sync:** App should auto-sync within 5 minutes
- **Or Trigger Manual Sync:** Submit another form to force immediate sync
- **Expected:** All queued offline data syncs to server
- **Check Console:** Should see sync success messages

#### Step 2: Verify Offline Data Reached Server

```bash
# Check server for offline-submitted records
TOKEN=$(curl -sS -X POST http://localhost:3000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"test@example.com","password":"secret123"}' | jq -r .accessToken)

curl -sS http://localhost:3000/api/members -H "Authorization: Bearer $TOKEN" | jq '.[] | .nationalId'
```

- **Expected:** Should include `9002021234567` and other offline-submitted IDs
- **Expected:** All offline registrations now present on server

#### Step 3: Test Camp QR Recovery (Offline-to-Online)

**Scenario:** Member registered offline, now at camp with QR sync

- **Start Offline:** Disable network, register new member
- **Simulate Camp Arrival:**
  - Re-enable network
  - Generate camp QR code (staff endpoint)
  - Exchange camp code for sync token
  - Verify queued data syncs via camp token

```bash
# Generate camp QR (as staff)
STAFF_TOKEN=$(curl -sS -X POST http://localhost:3000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"test@example.com","password":"secret123"}' | jq -r .accessToken)

CAMP_QR=$(curl -sS -X POST http://localhost:3000/api/auth/camp/init \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $STAFF_TOKEN" \
  -d '{"campId":"OFFLINE-RECOVERY"}' | jq .)

echo "Camp QR Data: $CAMP_QR"
```

### 10. Cross-Platform Testing

#### Step 1: Multi-Browser Compatibility

Test the complete flow in each browser:

**Chrome (Primary):**

- Follow all online and offline tests above
- **Expected:** Full functionality, best performance

**Safari (macOS):**

- Test basic registration flow
- Test offline persistence
- **Expected:** IndexedDB works correctly

**Firefox:**

- Test form validation and submission
- Test local storage persistence
- **Expected:** All features work consistently

#### Step 2: Browser Storage Limitations

- Register 50+ members to test storage limits
- **Expected:** Graceful handling of storage quotas
- **Expected:** Proper error messages if storage full

### 11. Mobile Device Testing

#### Step 1: Android Device/Emulator Testing

**Prerequisites:**

```bash
# Build Android APK
cd /Users/corneloots/Development/suidlanders-app
ionic build
ionic cap sync android
ionic cap run android
```

**Mobile-Specific Tests:**

- **Touch Navigation:** All buttons responsive to touch
- **Form Input:** Keyboard appears correctly for each field type
- **Date Picker:** Native date picker functions properly
- **Orientation:** App works in portrait and landscape
- **Performance:** Form submission under 3 seconds
- **Storage:** SQLite vs IndexedDB preference

#### Step 2: Mobile Web Browser Testing

**Test in Mobile Chrome/Safari:**

- Navigate to `http://[YOUR_COMPUTER_IP]:4200/`
- **Expected:** Responsive design works on small screens
- **Expected:** Touch targets are appropriately sized
- **Expected:** Text is readable without zooming

#### Step 3: Mobile Offline Testing

**Airplane Mode Test:**

- Enable airplane mode on device
- Complete member registration
- **Expected:** App continues to function
- **Expected:** Data persists locally
- Re-enable connectivity at "camp"
- **Expected:** Auto-sync works when connection restored

#### Step 4: Mobile Performance Testing

- **Time Registration:** Full form completion should take < 5 minutes
- **Battery Usage:** App should not drain battery excessively
- **Memory Usage:** App should not cause device slowdown
- **Storage Usage:** Check app storage in device settings

### 12. Edge Case & Error Handling Testing

#### Step 1: Invalid Data Handling

- **Test Invalid ID Numbers:**
  - Enter 12-digit ID: `900101123456`
  - **Expected:** Error message "ID nommer moet 13 syfers wees"
- **Test Invalid Email:**
  - Enter `invalid-email`
  - **Expected:** Proper Afrikaans error message
- **Test Future Birth Dates:**
  - Enter birth date in the future
  - **Expected:** Age validation error

#### Step 2: Network Interruption Testing

- **Mid-Sync Failure:**
  - Start form submission (online)
  - Quickly disable network during sync
  - **Expected:** Graceful failure, data queued for retry
- **Partial Sync Recovery:**
  - Re-enable network
  - **Expected:** Queued data syncs successfully

#### Step 3: Token Expiration Testing

- **Expired User Token:**
  - Login as staff
  - Wait for token expiration (15 minutes) or manually expire
  - Try to access protected route
  - **Expected:** Redirect to login
- **Expired Sync Token:**
  - Generate camp QR code
  - Wait for token expiration (1 hour) or manually expire
  - Try to use expired code
  - **Expected:** "Camp code expired" error

#### Step 4: Storage Full Testing

- **Fill Local Storage:**
  - Register many members to approach storage limit
  - **Expected:** Graceful handling, proper error messages
- **Database Constraints:**
  - Try to create duplicate national IDs via different methods
  - **Expected:** Proper deduplication, no database errors

### 13. Regression Testing

#### Step 1: Development Tools Still Function

- **QR Test Page:** `http://localhost:4200/qr-test`
  - Should load without errors
  - QR scanner should work for testing
- **DB Test Component:** `http://localhost:4200/db-test`
  - Should show database connection status
  - Should work with new dual-database setup
- **Data Viewer:** `http://localhost:4200/data-viewer`
  - Should display stored member data
  - Should require staff login (protected route)

#### Step 2: Console Error Check

- Open DevTools → Console
- Navigate through all pages (home, login, member-form, qr-test, data-viewer)
- **Expected:** No critical errors
- **Acceptable:** Warnings about unused imports in development
- **Expected:** No authentication errors when accessing appropriate routes

## Test Data Cleanup

After testing, you may want to clean up test data:

```bash
# Connect to database
docker exec -it suidlanders-postgres psql -U suidlanders -d suidlanders

# View test data
SELECT * FROM members;
SELECT * FROM users;

# Optional: Clear test data
TRUNCATE TABLE members;
DELETE FROM users WHERE email LIKE '%test%' OR email LIKE '%qa%';

# Exit database
\q
```

## Troubleshooting Common Issues

### Backend Won't Start

1. Check if PostgreSQL container is running: `docker ps`
2. Start if needed: `docker start suidlanders-postgres`
3. Check for port conflicts: `lsof -i :3000`

### Frontend Login Fails

1. Verify backend is running on port 3000
2. Check browser DevTools → Network for API call errors
3. Verify user exists in database

### Sync Errors

1. Check JWT token in localStorage
2. Verify API endpoints are protected but accessible with valid token
3. Check network connectivity between frontend and backend

### Database Connection Issues

1. Verify Docker container is running
2. Check connection string in backend `app.module.ts`
3. Test direct connection: `docker exec -it suidlanders-postgres psql -U suidlanders`

## Automated Test Commands Summary

```bash
# Quick test suite
cd /Users/corneloots/Development/suidlanders-backend && npm run test:e2e
cd /Users/corneloots/Development/suidlanders-app && npm start

# Manual verification
curl -sS http://localhost:3000/api/health
# Test login flow in browser at http://localhost:4200/login
```

## Cleanup

```bash
  # Stop Docker when done
  docker stop suidlanders-postgres
  # Later, restart with:
  docker start suidlanders-postgres
```

## Testing Summary

### Comprehensive Test Coverage

This guide covers **29 detailed test steps** across 4 major categories:

**A. Online Testing (Steps 1-10):**

- Guest mode registration without login
- Staff authentication and protected routes
- National ID deduplication
- Camp QR code generation and exchange
- Real-time sync verification

**B. Offline Testing (Steps 11-17):**

- Complete offline registration flow
- Data persistence across browser sessions
- Multiple offline registrations
- Offline-to-online recovery scenarios
- Camp QR sync for offline data

**C. Cross-Platform Testing (Steps 18-23):**

- Desktop browsers (Chrome, Safari, Firefox)
- Mobile device testing (Android APK)
- Mobile web browser compatibility
- Performance and storage testing

**D. Edge Cases & Regression (Steps 24-29):**

- Invalid data handling
- Network interruption recovery
- Token expiration scenarios
- Storage limitations
- Existing feature verification

### Quick Test Commands

```bash
# Backend health check
curl -sS http://localhost:3000/api/health

# Create test user
curl -sS -X POST http://localhost:3000/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"email":"qa@example.com","password":"secret123"}'

# Frontend smoke test
open http://localhost:4200/
```

### Expected Test Duration

- **Basic Smoke Test:** 15 minutes (Steps 1-6, 28-29)
- **Full Online Testing:** 45 minutes (Steps 1-10, 28-29)
- **Complete Testing:** 2-3 hours (All 29 steps)
- **Emergency-Focused Testing:** 30 minutes (Steps 11-17)

---

**Note:** Run this comprehensive testing guide before major releases, after authentication changes, or when preparing for emergency deployment scenarios.
