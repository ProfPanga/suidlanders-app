# Suidlanders Backend API

NestJS backend API for the Suidlanders Emergency Plan App. Runs on Raspberry Pi camp server.

## Features

✅ **Story 1.1: Triage Logic** - Automatic Red/Green camp assignment based on medical data
✅ **Story 1.2: Reception API** - Privacy-enforced endpoint for Reception Dashboard
✅ **SQLite Database** - File-based database (perfect for Raspberry Pi)
✅ **TypeORM** - Type-safe database access

## Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Create Demo Data

```bash
npm run seed
```

This creates 6 demo members:
- **Pieter van der Merwe** - Red Camp (Diabetes, no medication)
- **Susan Kruger** - Red Camp (Hypertension, no medication)
- **Johan Botha** - Green Camp (Healthy)
- **Marie du Plessis** - Green Camp (Healthy)
- **Hendrik Nel** - Green Camp (Healthy)
- **Anna Venter** - Green Camp (Asthma with medication)

### 3. Start Backend

```bash
npm start
```

Backend starts on **http://localhost:3000**

### 4. Test Reception Dashboard

```bash
# In another terminal, start frontend
cd ..
ionic serve
```

Navigate to: **http://localhost:8100/reception**

You should see all members with Red/Green camp badges!

## API Endpoints

### GET /api/members

Returns all members (medical data excluded for privacy).

**Response:**
```json
[
  {
    "id": "uuid",
    "firstName": "Pieter",
    "lastName": "van der Merwe",
    "familySize": 5,
    "campAssignment": "red",
    "syncedAt": "2026-03-04T10:00:00Z"
  }
]
```

### POST /api/members

Create new member (mobile app sync).

**Request:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "familySize": 3,
  "chronicConditions": "Diabetes",
  "medication": ""
}
```

**Response:**
```json
{
  "id": "uuid",
  "firstName": "John",
  "lastName": "Doe",
  "familySize": 3,
  "campAssignment": "red",
  "syncedAt": "2026-03-04T11:00:00Z"
}
```

### GET /api/health

Health check endpoint.

## Triage Logic (Story 1.1)

**Rule:** Has chronic condition + no medication → **Red Camp**

**Red Camp Members:**
- Require medical oversight
- Have chronic conditions without medication
- Shown with red badge + [MEDIESE] indicator

**Green Camp Members:**
- Standard camp assignment
- Either healthy OR have medication for conditions
- Shown with green badge

## Privacy Enforcement (Story 1.2)

The `/api/members` endpoint **excludes all medical data**:

❌ **NOT Included:**
- chronicConditions
- medication
- bloodType
- allergies
- triageReason
- idNumber, email, phone

✅ **Included (Reception-Safe):**
- id, firstName, lastName
- familySize
- campAssignment
- syncedAt

This ensures Reception staff can direct families without seeing sensitive medical information.

## Database

**SQLite Database:** `backend/data/camp.db`

**Location:** File-based database (no server required)

**Schema:** Auto-created by TypeORM on first start

**Backup:** Simply copy the `camp.db` file

## Development Scripts

```bash
# Start backend
npm start

# Start with auto-reload
npm start:dev

# Seed demo data
npm run seed

# Build for production
npm run build

# Run production build
npm run start:prod
```

## Raspberry Pi Deployment

### 1. Copy Backend to Pi

```bash
# From project root
scp -r backend pi@192.168.1.100:/home/pi/backend
```

### 2. Install Dependencies on Pi

```bash
ssh pi@192.168.1.100
cd /home/pi/backend
npm install
```

### 3. Seed Demo Data

```bash
npm run seed
```

### 4. Start Backend

```bash
npm start
```

### 5. Auto-Start on Boot (Optional)

Create systemd service:

```bash
sudo nano /etc/systemd/system/backend.service
```

```ini
[Unit]
Description=Suidlanders Backend API
After=network.target

[Service]
Type=simple
User=pi
WorkingDirectory=/home/pi/backend
ExecStart=/usr/bin/npm start
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
sudo systemctl enable backend.service
sudo systemctl start backend.service
```

## Troubleshooting

### Database Locked Error

SQLite allows only one writer at a time. If you get "database is locked":
- Ensure no other process is using the database
- Restart the backend

### Port 3000 Already in Use

Change port in `src/main.ts`:
```typescript
const PORT = process.env.PORT || 3001;
```

### CORS Errors

Update `src/main.ts` to add your frontend URL:
```typescript
app.enableCors({
  origin: ['http://your-frontend-url'],
  credentials: true,
});
```

## Tech Stack

- **NestJS** - Backend framework
- **TypeORM** - Database ORM
- **SQLite** - Embedded database
- **TypeScript** - Type-safe development
- **Class Validator** - DTO validation

## Educational Notes

### Why SQLite?

**SQLite is perfect for your Raspberry Pi deployment:**

1. **No Server Required** - Database is just a file
2. **Zero Configuration** - No setup, just run
3. **Lightweight** - Minimal memory footprint
4. **Reliable** - Used by millions of apps
5. **Easy Backup** - Copy the `.db` file

**PostgreSQL would require:**
- Installing and running PostgreSQL service
- More memory (scarce on Pi)
- More complex configuration
- Overkill for single-camp deployment

### Triage Service Pattern

The `TriageService` separates business logic from data access:
- ✅ Easy to test (pure functions)
- ✅ Reusable across controllers
- ✅ Single source of truth for triage rules
- ✅ Can be updated without changing database code

### DTO Pattern (Data Transfer Objects)

We use different DTOs for different roles:
- `ReceptionMemberDTO` - Safe data for Reception staff
- `MedicalStaffDTO` - Would include medical data (future)
- `CreateMemberDTO` - Data received from mobile app

This **enforces privacy at the type level** - TypeScript won't let you accidentally expose medical data!
