# Database Schema

## Tables

### 1. members
```sql
CREATE TABLE members (
    id TEXT PRIMARY KEY,                -- UUID
    created_at INTEGER NOT NULL,        -- UNIX timestamp
    updated_at INTEGER NOT NULL,        -- UNIX timestamp
    status TEXT NOT NULL,              -- 'active', 'inactive', 'deleted'
    version INTEGER NOT NULL DEFAULT 1  -- For schema versioning
);
```

### 2. basic_info
```sql
CREATE TABLE basic_info (
    member_id TEXT PRIMARY KEY,
    van TEXT NOT NULL,                  -- Surname
    noem_naam TEXT NOT NULL,            -- First name
    tweede_naam TEXT,                   -- Second name
    huistaal TEXT NOT NULL,             -- Home language
    geslag TEXT NOT NULL,               -- Gender
    ouderdom INTEGER NOT NULL,          -- Age
    geboorte_datum TEXT NOT NULL,       -- Birth date (ISO format)
    id_nommer TEXT NOT NULL UNIQUE,     -- ID number
    cell_nommer TEXT NOT NULL,          -- Cell number
    email TEXT NOT NULL,                -- Email
    huwelik_status TEXT NOT NULL,       -- Marital status
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
);
```

### 3. member_info
```sql
CREATE TABLE member_info (
    member_id TEXT PRIMARY KEY,
    lid_nommer TEXT UNIQUE,             -- Member number
    reddings_verwysing TEXT,            -- Emergency reference
    bevelstruktuur TEXT,                -- Command structure
    radio_roepsein TEXT,                -- Radio callsign
    nood_kontak_naam TEXT NOT NULL,     -- Emergency contact name
    nood_kontak_nommer TEXT NOT NULL,   -- Emergency contact number
    nood_kontak_verwantskap TEXT NOT NULL, -- Emergency contact relationship
    wapenlisensie BOOLEAN NOT NULL DEFAULT 0, -- Firearm license
    skiet_ervaring TEXT,                -- Shooting experience
    ehbo_kwalifikasie BOOLEAN NOT NULL DEFAULT 0, -- First aid qualification
    ehbo_vlak TEXT,                     -- First aid level
    ehbo_verval_datum TEXT,             -- First aid expiry date (ISO format)
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
);
```

### 4. address_info
```sql
CREATE TABLE address_info (
    member_id TEXT PRIMARY KEY,
    straat_adres TEXT NOT NULL,         -- Street address
    voorstad TEXT NOT NULL,             -- Suburb
    stad TEXT NOT NULL,                 -- City
    provinsie TEXT NOT NULL,            -- Province
    pos_kode TEXT NOT NULL,             -- Postal code
    gps_lat REAL,                       -- GPS coordinates
    gps_lng REAL,                       -- GPS coordinates
    naaste_hospitaal TEXT,              -- Nearest hospital
    naaste_polisie TEXT,                -- Nearest police station
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
);
```

### 5. medical_info
```sql
CREATE TABLE medical_info (
    member_id TEXT PRIMARY KEY,
    bloed_groep TEXT NOT NULL,          -- Blood group
    chroniese_siektes TEXT,             -- Chronic conditions
    medikasie TEXT,                     -- Medication
    allergies TEXT,                     -- Allergies
    mediese_fonds TEXT,                 -- Medical aid
    mediese_fonds_nommer TEXT,          -- Medical aid number
    huis_dokter TEXT,                   -- Family doctor
    huis_dokter_nommer TEXT,            -- Doctor's number
    mediese_notas TEXT,                 -- Medical notes
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
);
```

### 6. vehicle_info
```sql
CREATE TABLE vehicle_info (
    id TEXT PRIMARY KEY,                -- UUID
    member_id TEXT NOT NULL,
    is_primary BOOLEAN NOT NULL,        -- Primary or secondary vehicle
    fabrikaat TEXT NOT NULL,            -- Make
    model TEXT NOT NULL,                -- Model
    jaar INTEGER NOT NULL,              -- Year
    registrasie_nommer TEXT NOT NULL,   -- Registration number
    brandstof_tipe TEXT NOT NULL,       -- Fuel type
    kilometer_stand INTEGER NOT NULL,    -- Mileage
    bande_toestand TEXT,                -- Tire condition
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
);
```

### 7. skills_info
```sql
CREATE TABLE skills_info (
    member_id TEXT PRIMARY KEY,
    beroep TEXT NOT NULL,               -- Occupation
    kwalifikasies TEXT,                 -- Qualifications
    spesialis_vaardighede TEXT,         -- Specialist skills
    tale_kennis TEXT,                   -- Language proficiency
    rekenaar_vaardig BOOLEAN NOT NULL DEFAULT 0, -- Computer literacy
    bestuurslisensie_kode TEXT,         -- Driver's license code
    bestuurslisensie_pdp BOOLEAN NOT NULL DEFAULT 0, -- Professional driving permit
    bestuurslisensie_verval TEXT,       -- License expiry date
    amateur_radio_lisensie BOOLEAN NOT NULL DEFAULT 0, -- Amateur radio license
    radio_roepsein TEXT,                -- Radio callsign
    radio_toerusting TEXT,              -- Radio equipment
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
);
```

### 8. equipment_info
```sql
CREATE TABLE equipment_info (
    member_id TEXT PRIMARY KEY,
    kommunikasie_radio BOOLEAN NOT NULL DEFAULT 0,      -- Radio
    kommunikasie_satelliet BOOLEAN NOT NULL DEFAULT 0,  -- Satellite
    kommunikasie_tweerigtingradio BOOLEAN NOT NULL DEFAULT 0, -- Two-way radio
    krag_generator BOOLEAN NOT NULL DEFAULT 0,          -- Generator
    krag_sonkrag BOOLEAN NOT NULL DEFAULT 0,           -- Solar power
    krag_omvormer BOOLEAN NOT NULL DEFAULT 0,          -- Inverter
    water_boorgat BOOLEAN NOT NULL DEFAULT 0,          -- Borehole
    water_tenk BOOLEAN NOT NULL DEFAULT 0,             -- Water tank
    water_filtrasie BOOLEAN NOT NULL DEFAULT 0,        -- Water filtration
    verdediging_vuurwapens BOOLEAN NOT NULL DEFAULT 0, -- Firearms
    verdediging_lisensies BOOLEAN NOT NULL DEFAULT 0,  -- Licenses
    verdediging_opleiding BOOLEAN NOT NULL DEFAULT 0,  -- Training
    kampering_tent BOOLEAN NOT NULL DEFAULT 0,         -- Tent
    kampering_slaapsak BOOLEAN NOT NULL DEFAULT 0,     -- Sleeping bag
    kampering_toerusting BOOLEAN NOT NULL DEFAULT 0,   -- Camping equipment
    noodvoorraad_kos INTEGER,                         -- Food supply (days)
    noodvoorraad_water INTEGER,                       -- Water supply (liters)
    noodvoorraad_brandstof INTEGER,                   -- Fuel supply (liters)
    noodvoorraad_medies BOOLEAN NOT NULL DEFAULT 0,    -- Medical supplies
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
);
```

### 9. camp_info
```sql
CREATE TABLE camp_info (
    member_id TEXT PRIMARY KEY,
    kamp_provinsie TEXT NOT NULL,       -- Camp province
    kamp_naam TEXT NOT NULL,            -- Camp name
    datum_in_kamp TEXT NOT NULL,        -- Date in camp (ISO format)
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
);
```

### 10. other_info
```sql
CREATE TABLE other_info (
    member_id TEXT PRIMARY KEY,
    addisionele_notas TEXT,             -- Additional notes
    spesiale_vaardighede TEXT,          -- Special skills
    belangstellings TEXT,               -- Interests
    beskikbaarheid TEXT,                -- Availability
    vrywilliger_werk TEXT,              -- Volunteer work
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
);
```

### 11. documents
```sql
CREATE TABLE documents (
    id TEXT PRIMARY KEY,                -- UUID
    member_id TEXT NOT NULL,
    type TEXT NOT NULL,                -- 'id', 'license', 'firearm', 'firstaid', 'other'
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    size INTEGER NOT NULL,
    uploaded_at INTEGER NOT NULL,       -- UNIX timestamp
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
);
```

## Indexes
```sql
-- Performance indexes
CREATE INDEX idx_members_status ON members(status);
CREATE INDEX idx_documents_member_type ON documents(member_id, type);
CREATE INDEX idx_vehicle_member ON vehicle_info(member_id);
```

## Version Control
- Schema version: 1.0.0
- Migration tables will be added for schema updates
- Each member record stores its own schema version for safe migrations 