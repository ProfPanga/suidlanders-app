# Data Models - Suidlanders Emergency Plan App

## Overview

The application uses a **dual-database architecture** with automatic platform detection:
- **Mobile (iOS/Android)**: SQLite via `@capacitor-community/sqlite`
- **Web/Desktop**: IndexedDB via Dexie wrapper
- **Abstraction**: `DatabaseService` provides unified interface with automatic fallback

## Database Schema

### Core Tables (11)

The database uses a normalized relational schema with **11 tables** organized around member registration data.

#### 1. members (Primary Table)
**Purpose:** Root table for all member records

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | TEXT | PRIMARY KEY | UUID |
| created_at | INTEGER | NOT NULL | UNIX timestamp |
| updated_at | INTEGER | NOT NULL | UNIX timestamp |
| status | TEXT | NOT NULL | 'active', 'inactive', 'deleted' |
| version | INTEGER | NOT NULL, DEFAULT 1 | Schema version tracking |

**Indexes:**
- `idx_members_status` ON status

---

#### 2. basic_info
**Purpose:** Personal and contact information

| Column | Type | Description |
|--------|------|-------------|
| member_id | TEXT PRIMARY KEY | FK → members(id) CASCADE |
| van | TEXT NOT NULL | Surname |
| noem_naam | TEXT NOT NULL | First name |
| tweede_naam | TEXT | Second name |
| huistaal | TEXT NOT NULL | Home language |
| geslag | TEXT NOT NULL | Gender |
| ouderdom | INTEGER NOT NULL | Age |
| geboorte_datum | TEXT NOT NULL | Birth date (ISO format) |
| id_nommer | TEXT NOT NULL UNIQUE | ID number |
| cell_nommer | TEXT NOT NULL | Cell number |
| email | TEXT NOT NULL | Email |
| huwelik_status | TEXT NOT NULL | Marital status |

---

#### 3. member_info
**Purpose:** Suidlander-specific member data, emergency contacts, qualifications

| Column | Type | Description |
|--------|------|-------------|
| member_id | TEXT PRIMARY KEY | FK → members(id) CASCADE |
| lid_nommer | TEXT UNIQUE | Member number |
| reddings_verwysing | TEXT | Emergency reference |
| bevelstruktuur | TEXT | Command structure |
| radio_roepsein | TEXT | Radio callsign |
| nood_kontak_naam | TEXT NOT NULL | Emergency contact name |
| nood_kontak_nommer | TEXT NOT NULL | Emergency contact number |
| nood_kontak_verwantskap | TEXT NOT NULL | Emergency contact relationship |
| wapenlisensie | BOOLEAN NOT NULL DEFAULT 0 | Firearm license |
| skiet_ervaring | TEXT | Shooting experience |
| ehbo_kwalifikasie | BOOLEAN NOT NULL DEFAULT 0 | First aid qualification |
| ehbo_vlak | TEXT | First aid level |
| ehbo_verval_datum | TEXT | First aid expiry date (ISO) |

---

#### 4. address_info
**Purpose:** Residential location and GPS coordinates

| Column | Type | Description |
|--------|------|-------------|
| member_id | TEXT PRIMARY KEY | FK → members(id) CASCADE |
| straat_adres | TEXT NOT NULL | Street address |
| voorstad | TEXT NOT NULL | Suburb |
| stad | TEXT NOT NULL | City |
| provinsie | TEXT NOT NULL | Province |
| pos_kode | TEXT NOT NULL | Postal code |
| gps_lat | REAL | GPS latitude |
| gps_lng | REAL | GPS longitude |
| naaste_hospitaal | TEXT | Nearest hospital |
| naaste_polisie | TEXT | Nearest police station |

---

#### 5. medical_info
**Purpose:** Blood type, chronic conditions, medication, medical aid

| Column | Type | Description |
|--------|------|-------------|
| member_id | TEXT PRIMARY KEY | FK → members(id) CASCADE |
| bloed_groep | TEXT NOT NULL | Blood group |
| chroniese_siektes | TEXT | Chronic conditions |
| medikasie | TEXT | Medication |
| allergies | TEXT | Allergies |
| mediese_fonds | TEXT | Medical aid provider |
| mediese_fonds_nommer | TEXT | Medical aid number |
| huis_dokter | TEXT | Family doctor |
| huis_dokter_nommer | TEXT | Doctor's number |
| mediese_notas | TEXT | Medical notes |

---

#### 6. vehicle_info
**Purpose:** Primary/secondary vehicles and trailers

| Column | Type | Description |
|--------|------|-------------|
| id | TEXT PRIMARY KEY | UUID |
| member_id | TEXT NOT NULL | FK → members(id) CASCADE |
| is_primary | BOOLEAN NOT NULL | Primary or secondary vehicle |
| fabrikaat | TEXT NOT NULL | Make |
| model | TEXT NOT NULL | Model |
| jaar | INTEGER NOT NULL | Year |
| registrasie_nommer | TEXT NOT NULL | Registration number |
| brandstof_tipe | TEXT NOT NULL | Fuel type |
| kilometer_stand | INTEGER NOT NULL | Mileage |
| bande_toestand | TEXT | Tire condition |

**Indexes:**
- `idx_vehicle_member` ON member_id

---

#### 7. skills_info
**Purpose:** Occupation, qualifications, licenses, specialist skills

| Column | Type | Description |
|--------|------|-------------|
| member_id | TEXT PRIMARY KEY | FK → members(id) CASCADE |
| beroep | TEXT NOT NULL | Occupation |
| kwalifikasies | TEXT | Qualifications |
| spesialis_vaardighede | TEXT | Specialist skills |
| tale_kennis | TEXT | Language proficiency |
| rekenaar_vaardig | BOOLEAN NOT NULL DEFAULT 0 | Computer literacy |
| bestuurslisensie_kode | TEXT | Driver's license code |
| bestuurslisensie_pdp | BOOLEAN NOT NULL DEFAULT 0 | Professional driving permit |
| bestuurslisensie_verval | TEXT | License expiry date |
| amateur_radio_lisensie | BOOLEAN NOT NULL DEFAULT 0 | Amateur radio license |
| radio_roepsein | TEXT | Radio callsign |
| radio_toerusting | TEXT | Radio equipment |

---

#### 8. equipment_info
**Purpose:** Communication, power, water, defense, camping gear

| Column | Type | Description |
|--------|------|-------------|
| member_id | TEXT PRIMARY KEY | FK → members(id) CASCADE |
| kommunikasie_radio | BOOLEAN NOT NULL DEFAULT 0 | Radio |
| kommunikasie_satelliet | BOOLEAN NOT NULL DEFAULT 0 | Satellite |
| kommunikasie_tweerigtingradio | BOOLEAN NOT NULL DEFAULT 0 | Two-way radio |
| krag_generator | BOOLEAN NOT NULL DEFAULT 0 | Generator |
| krag_sonkrag | BOOLEAN NOT NULL DEFAULT 0 | Solar power |
| krag_omvormer | BOOLEAN NOT NULL DEFAULT 0 | Inverter |
| water_boorgat | BOOLEAN NOT NULL DEFAULT 0 | Borehole |
| water_tenk | BOOLEAN NOT NULL DEFAULT 0 | Water tank |
| water_filtrasie | BOOLEAN NOT NULL DEFAULT 0 | Water filtration |
| verdediging_vuurwapens | BOOLEAN NOT NULL DEFAULT 0 | Firearms |
| verdediging_lisensies | BOOLEAN NOT NULL DEFAULT 0 | Licenses |
| verdediging_opleiding | BOOLEAN NOT NULL DEFAULT 0 | Training |
| kampering_tent | BOOLEAN NOT NULL DEFAULT 0 | Tent |
| kampering_slaapsak | BOOLEAN NOT NULL DEFAULT 0 | Sleeping bag |
| kampering_toerusting | BOOLEAN NOT NULL DEFAULT 0 | Camping equipment |
| noodvoorraad_kos | INTEGER | Food supply (days) |
| noodvoorraad_water | INTEGER | Water supply (liters) |
| noodvoorraad_brandstof | INTEGER | Fuel supply (liters) |
| noodvoorraad_medies | BOOLEAN NOT NULL DEFAULT 0 | Medical supplies |

---

#### 9. camp_info
**Purpose:** Camp location and arrival date

| Column | Type | Description |
|--------|------|-------------|
| member_id | TEXT PRIMARY KEY | FK → members(id) CASCADE |
| kamp_provinsie | TEXT NOT NULL | Camp province |
| kamp_naam | TEXT NOT NULL | Camp name |
| datum_in_kamp | TEXT NOT NULL | Date in camp (ISO format) |

---

#### 10. other_info
**Purpose:** Water, food, supplies, additional notes

| Column | Type | Description |
|--------|------|-------------|
| member_id | TEXT PRIMARY KEY | FK → members(id) CASCADE |
| addisionele_notas | TEXT | Additional notes |
| spesiale_vaardighede | TEXT | Special skills |
| belangstellings | TEXT | Interests |
| beskikbaarheid | TEXT | Availability |
| vrywilliger_werk | TEXT | Volunteer work |

---

#### 11. documents
**Purpose:** ID, licenses, certificates (PDF/JPG/PNG upload)

| Column | Type | Description |
|--------|------|-------------|
| id | TEXT PRIMARY KEY | UUID |
| member_id | TEXT NOT NULL | FK → members(id) CASCADE |
| type | TEXT NOT NULL | 'id', 'license', 'firearm', 'firstaid', 'other' |
| file_name | TEXT NOT NULL | Original filename |
| file_path | TEXT NOT NULL | Local storage path |
| mime_type | TEXT NOT NULL | File MIME type |
| size | INTEGER NOT NULL | File size in bytes |
| uploaded_at | INTEGER NOT NULL | UNIX timestamp |

**Indexes:**
- `idx_documents_member_type` ON (member_id, type)

---

## Data Security

### Encryption
- **Client-side encryption**: CryptoJS for sensitive data fields
- **Encryption key**: Stored in `DatabaseService` (production: use secure storage)
- **Encrypted fields**: Personal information, medical data, ID numbers

### Migration Strategy
- **Schema versioning**: Each member record tracks its schema version
- **Version field**: `members.version` column
- **Migration handling**: `DatabaseService.handleMigrations()`
- **Safe upgrades**: Version-aware data transformations

---

## Sync Architecture

### Offline-First Design
- Local database is **source of truth**
- Changes tracked in `sync_queue` table (not shown in schema - managed by SyncQueueService)
- Timestamp-based conflict resolution
- Auto-sync every 5 minutes (configurable via SyncService)

### Sync Queue (Managed by SyncQueueService)
```typescript
interface SyncQueueItem {
  id: string;
  operation: 'create' | 'update' | 'delete';
  table: string;
  recordId: string;
  data: any;
  timestamp: number;
  retries: number;
}
```

---

## Notes

- **Schema Version**: 1.0.0
- **Foreign Keys**: All use `ON DELETE CASCADE`
- **Timestamps**: UNIX format (milliseconds since epoch)
- **Dates**: ISO 8601 format (YYYY-MM-DD)
- **UUIDs**: Generated via `uuid` library (v4)
- **Platform Detection**: Automatic switch between SQLite (mobile) and IndexedDB (web)
