# Backend Documentation

## Overview

The Suidlanders Backend API is a NestJS application that provides REST endpoints for member management and automated triage. It runs on the Raspberry Pi camp server and supports the Reception Dashboard and mobile app sync.

## Quick Start

```bash
# Navigate to backend directory
cd backend

# Install dependencies (first time only)
npm install

# Create demo data (6 members: 2 Red Camp, 4 Green Camp)
npm run seed

# Start backend server
npm start
```

Backend starts on **http://localhost:3000**

## Architecture

### Technology Stack

- **Framework:** NestJS 10
- **Database:** SQLite (file-based, no server required)
- **ORM:** TypeORM 0.3
- **Language:** TypeScript
- **Validation:** class-validator, class-transformer

### Directory Structure

```
backend/
├── src/
│   ├── entities/
│   │   └── member.entity.ts           Database schema
│   ├── dto/
│   │   └── member.dto.ts              ReceptionMemberDTO, CreateMemberDTO
│   ├── services/
│   │   ├── triage.service.ts          Red/Green camp triage logic
│   │   ├── members.service.ts         Business logic
│   │   └── camp-auth.service.ts       QR sync-code generation + exchange
│   ├── controllers/
│   │   ├── members.controller.ts      Member + health endpoints
│   │   └── camp-auth.controller.ts    Camp QR provisioning endpoints
│   ├── app.module.ts                  NestJS module config
│   ├── main.ts                        Server entry point
│   └── seed.ts                        Demo data creation
├── data/
│   └── camp.db                        SQLite database (auto-created)
├── package.json
├── tsconfig.json
└── README.md
```

## API Endpoints

### GET /api/members/health

Health check. Returns service status and the current member count. This is the
endpoint the mobile app pings to find a reachable camp server during QR provisioning.

**Response:**
```json
{
  "status": "ok",
  "service": "suidlanders-backend",
  "members": 6,
  "timestamp": "2026-03-04T10:00:00Z"
}
```

> Note: the health route lives **under** `/api/members` (not `/api/health`), so that
> it is matched before the `GET /api/members/:id` route.

### GET /api/members

Returns all members with camp assignments (medical data excluded for privacy).

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

**Privacy Enforcement:**
- ❌ NO chronicConditions
- ❌ NO medication
- ❌ NO bloodType
- ❌ NO allergies
- ❌ NO triageReason
- ❌ NO idNumber, email, phone

### POST /api/members

Create new member with automatic triage.

**Request:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "familySize": 3,
  "chronicConditions": "Diabetes",
  "medication": "Insulin",
  "bloodType": "A+",
  "allergies": "None"
}
```

**Response:**
```json
{
  "id": "uuid",
  "firstName": "John",
  "lastName": "Doe",
  "familySize": 3,
  "campAssignment": "green",
  "syncedAt": "2026-03-04T11:00:00Z"
}
```

### GET /api/members/:id

Returns a single member in the same Reception-safe shape as `GET /api/members`
(no medical data). Responds `404` if the member is not found.

## Camp Provisioning Endpoints (QR sync)

These power the offline LAN sync flow. Staff generate a QR code on the camp server;
a member's app scans it and exchanges the code for a short-lived sync token. See
[Camp Sync Flow in CLAUDE.md](./CLAUDE.md#camp-sync-flow) for the end-to-end picture.

### POST /api/auth/camp/generate-qr

Generates the QR payload (WiFi details, `serverUrls[]`, a short-lived `syncCode`, and
`campId`). Used by the Reception Dashboard "Genereer QR Kode" button.

**Request:**
```json
{ "campId": "default-camp" }
```

**Response:**
```json
{
  "success": true,
  "payload": {
    "syncCode": "ABC123XYZ",
    "campId": "default-camp",
    "serverUrls": ["http://camp.local:3000/api", "http://192.168.4.1:3000/api"]
  },
  "message": "QR code generated successfully"
}
```

### POST /api/auth/camp/exchange

Exchanges a short-lived `syncCode` for a temporary sync token. Used by the mobile app
after scanning the QR code.

**Request:**
```json
{ "syncCode": "ABC123XYZ", "campId": "default-camp" }
```

**Response:**
```json
{ "success": true, "syncToken": "<token>", "expiresIn": 3600 }
```

Returns `401` if the code is invalid or expired, and `400` if `syncCode`/`campId` are missing.

## Triage Logic

**Triage Rule:**
- Has chronic condition + no medication → **Red Camp** (requires medical oversight)
- Otherwise → **Green Camp** (standard assignment)

**Implementation:** `src/services/triage.service.ts`

```typescript
performTriage(member: Member): { campAssignment: string; triageReason: string } {
  const hasChronicCondition = this.hasChronicCondition(member.chronicConditions);
  const hasMedication = this.hasMedication(member.medication);

  if (hasChronicCondition && !hasMedication) {
    return {
      campAssignment: 'red',
      triageReason: 'Has chronic condition without medication - requires medical oversight',
    };
  }

  return {
    campAssignment: 'green',
    triageReason: 'Standard camp assignment - no immediate medical concerns',
  };
}
```

## Demo Data

The seed script creates 6 members for testing:

**Red Camp Members (2):**
- **Pieter van der Merwe** (Family: 5) - Diabetes, no medication
- **Susan Kruger** (Family: 2) - Hypertension, no medication

**Green Camp Members (4):**
- **Johan Botha** (Family: 3) - Healthy
- **Marie du Plessis** (Family: 4) - Healthy
- **Hendrik Nel** (Family: 6) - Healthy
- **Anna Venter** (Family: 3) - Asthma with medication

## Development

### Scripts

```bash
# Start backend
npm start

# Start with auto-reload (development)
npm run start:dev

# Seed demo data
npm run seed

# Build for production
npm run build

# Run production build
npm run start:prod
```

### Database

**SQLite Database:** `backend/data/camp.db`

**Advantages for Raspberry Pi:**
- ✅ File-based (no server required)
- ✅ Zero configuration
- ✅ Lightweight (< 1 MB library)
- ✅ Perfect for embedded systems
- ✅ Easy backup (just copy the file)

**Schema Management:**
- Auto-created by TypeORM on first start (`synchronize: true`)
- Based on `Member` entity definition
- Tables: `members` (with all fields including medical data)

### Testing API

**Using curl:**
```bash
# Get all members
curl http://localhost:3000/api/members

# Create new member
curl -X POST http://localhost:3000/api/members \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "familySize": 2,
    "chronicConditions": "None",
    "medication": "None"
  }'

# Get specific member
curl http://localhost:3000/api/members/<member-id>
```

**Using Reception Dashboard:**
1. Start backend: `npm start`
2. Start frontend: `npm start` (from project root)
3. Navigate to: http://localhost:4200/reception
4. See all members with camp badges

## Privacy & Security

### Multi-Layer Privacy Enforcement

1. **Entity Level** - Full member data stored in database
2. **DTO Level** - `ReceptionMemberDTO` excludes medical fields (TypeScript enforced)
3. **Service Level** - `mapToReceptionDTO()` only maps safe fields
4. **API Level** - Controller returns only `ReceptionMemberDTO`

This **defense-in-depth** approach ensures medical data cannot accidentally be exposed to Reception staff.

### Data Segregation by Role (Future)

- **Reception Staff**: Name, family size, camp assignment only
- **Medical Staff**: Full medical data, triage reason
- **Admin**: All data including audit logs

Currently implemented: Reception-safe endpoint only.

## Raspberry Pi Deployment

### Copy Backend to Pi

```bash
# From project root
scp -r backend pi@192.168.1.100:/home/pi/backend
```

### Install and Run on Pi

```bash
# SSH into Pi
ssh pi@192.168.1.100

# Navigate to backend
cd /home/pi/backend

# Install dependencies
npm install

# Create demo data
npm run seed

# Start backend
npm start
```

### Auto-Start on Boot (Systemd)

Create service file:
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
sudo systemctl status backend.service
```

## Troubleshooting

### Port 3000 Already in Use

```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>
```

Or change port in `src/main.ts`:
```typescript
const PORT = process.env.PORT || 3001;
```

### Database Locked

SQLite allows only one writer at a time. Ensure no other process is accessing the database.

### CORS Errors

Update `src/main.ts` to add your frontend URL:
```typescript
app.enableCors({
  origin: ['http://localhost:8100', 'http://your-pi-ip:8080'],
  credentials: true,
});
```

## Educational Notes

### Why NestJS?

- **TypeScript-native**: Shares language with frontend
- **Dependency injection**: Clean architecture
- **Decorators**: Clear, readable code
- **TypeORM integration**: Type-safe database access
- **Well-documented**: Great for learning

### Why SQLite vs PostgreSQL?

**SQLite wins for Raspberry Pi because:**
- No separate server process (saves RAM)
- File-based (easy backup/restore)
- Zero configuration
- Perfect for single-camp deployment
- Used by millions of apps (SQLite is in every iPhone/Android)

**PostgreSQL would be better if:**
- Multiple camps accessing one database
- Need advanced replication
- > 100 concurrent writers
- Complex transactions required

For your use case, SQLite is the right choice!

## Related Documentation

- **Frontend README**: See `/README.md`
- **Manual testing guides**: See `/docs/testing/`
- **Architecture**: See `/docs/architecture.md`
- **CLAUDE.md**: Project guidelines and architecture decisions
