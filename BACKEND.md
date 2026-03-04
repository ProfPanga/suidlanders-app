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
│   │   ├── triage.service.ts          Story 1.1: Triage logic
│   │   └── members.service.ts         Business logic
│   ├── controllers/
│   │   └── members.controller.ts      API endpoints
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

## Triage Logic (Story 1.1)

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
2. Start frontend: `ionic serve` (from project root)
3. Navigate to: http://localhost:8100/reception
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
- **Story 1.1**: Triage Logic Implementation
- **Story 1.2**: Reception Staff Dashboard (uses this backend)
- **CLAUDE.md**: Project guidelines and architecture decisions
