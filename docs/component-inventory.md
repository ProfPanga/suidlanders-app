# Component Inventory - Suidlanders Emergency Plan App

## Overview

The application uses **Angular 19 standalone components** with Ionic 8 UI framework. Components follow a clear separation between **form sections** (data collection) and **utility components** (UI features).

**Total Components:** 18
- **Form Sections:** 12 components
- **Utility Components:** 6 components

---

## Form Section Components (12)

All form section components implement `ControlValueAccessor` for reactive form integration and are located in `src/app/components/sections/`.

### Pattern: Standalone Form Sections
- **Interface**: Implements `ControlValueAccessor`
- **Parent**: Integrated into `MemberFormComponent`
- **Data Binding**: Two-way via `formControl` attribute
- **Validation**: Built-in Angular validators
- **State Management**: RxJS BehaviorSubjects for field values

---

### 1. BasicInfoComponent
**Location:** `src/app/components/sections/basic-info/`

**Purpose:** Personal and contact information collection

**Fields:**
- Surname (van)
- First name (noem_naam)
- Second name (tweede_naam)
- Home language (huistaal)
- Gender (geslag)
- Age (ouderdom)
- Birth date (geboorte_datum)
- ID number (id_nommer)
- Cell number (cell_nommer)
- Email
- Marital status (huwelik_status)

**Validation:**
- All fields required except second name
- ID number: South African ID format validation
- Email: Email format validation
- Cell number: Phone format validation

---

### 2. MemberInfoComponent
**Location:** `src/app/components/sections/member-info/`

**Purpose:** Suidlander-specific data, emergency contacts, qualifications

**Fields:**
- Member number (lid_nommer)
- Emergency reference (reddings_verwysing)
- Command structure (bevelstruktuur)
- Radio callsign (radio_roepsein)
- Emergency contact: name, number, relationship (required)
- Firearm license (checkbox)
- Shooting experience
- First aid qualification (checkbox)
- First aid level
- First aid expiry date

**Validation:**
- Emergency contact fields required
- Date validation for expiry dates

---

### 3. AddressInfoComponent
**Location:** `src/app/components/sections/address-info/`

**Purpose:** Residential location and GPS coordinates

**Fields:**
- Street address (straat_adres)
- Suburb (voorstad)
- City (stad)
- Province (provinsie) - Dropdown
- Postal code (pos_kode)
- GPS coordinates (lat/lng) - Auto-capture
- Nearest hospital
- Nearest police station

**Features:**
- GPS auto-capture via Capacitor Geolocation
- Province dropdown (9 South African provinces)

---

### 4. MedicalInfoComponent
**Location:** `src/app/components/sections/medical-info/`

**Purpose:** Blood type, chronic conditions, medication

**Fields:**
- Blood group (required) - Dropdown (A+, A-, B+, B-, AB+, AB-, O+, O-)
- Chronic conditions
- Medication
- Allergies
- Medical aid provider
- Medical aid number
- Family doctor
- Doctor's phone number
- Medical notes

**UI:** Ionic ion-select for blood group, ion-textarea for notes

---

### 5. VehicleInfoComponent
**Location:** `src/app/components/sections/vehicle-info/`

**Purpose:** Primary/secondary vehicles and trailers

**Features:**
- **Multi-entry**: Add multiple vehicles
- **Primary/Secondary**: Toggle for primary vehicle

**Fields per vehicle:**
- Make (fabrikaat)
- Model
- Year
- Registration number
- Fuel type
- Mileage (kilometer_stand)
- Tire condition

**UI:** Dynamic list with add/remove buttons

---

### 6. SkillsInfoComponent
**Location:** `src/app/components/sections/skills-info/`

**Purpose:** Occupation, qualifications, licenses

**Fields:**
- Occupation (beroep)
- Qualifications
- Specialist skills
- Language proficiency
- Computer literacy (checkbox)
- Driver's license code
- Professional driving permit (PDP) - checkbox
- License expiry date
- Amateur radio license (checkbox)
- Radio callsign
- Radio equipment

---

### 7. EquipmentInfoComponent
**Location:** `src/app/components/sections/equipment-info/`

**Purpose:** Communication, power, water, defense, camping gear

**Categories (all checkboxes):**

**Communication:**
- Radio
- Satellite
- Two-way radio

**Power:**
- Generator
- Solar power
- Inverter

**Water:**
- Borehole
- Water tank
- Filtration system

**Defense:**
- Firearms
- Licenses
- Training

**Camping:**
- Tent
- Sleeping bag
- Equipment

**Supplies (numeric inputs):**
- Food supply (days)
- Water supply (liters)
- Fuel supply (liters)
- Medical supplies (checkbox)

**UI:** Organized in Ionic ion-grid with categorized sections

---

### 8. OtherInfoComponent
**Location:** `src/app/components/sections/other-info/`

**Purpose:** Additional notes, special skills, interests

**Fields:**
- Additional notes
- Special skills
- Interests
- Availability
- Volunteer work

**UI:** All fields are ion-textarea for free-form text

---

### 9. CampInfoComponent
**Location:** `src/app/components/sections/camp-info/`

**Purpose:** Camp location and arrival date

**Fields:**
- Camp province (dropdown)
- Camp name (dropdown - filtered by province)
- Date in camp (date picker)

**Validation:**
- All fields required
- Date must be present or future

---

### 10. DocumentsInfoComponent
**Location:** `src/app/components/sections/documents-info/`

**Purpose:** ID, licenses, certificates upload (PDF/JPG/PNG)

**Features:**
- **File upload**: Via Capacitor Filesystem
- **Camera integration**: Take photos directly
- **Multiple documents**: Categorized by type

**Document Types:**
- ID document
- Driver's license
- Firearm license
- First aid certificate
- Other

**File Validation:**
- Max size: 10MB (configurable)
- Allowed formats: PDF, JPG, PNG
- Preview thumbnails

---

### 11. DependentsComponent
**Location:** `src/app/components/sections/dependents/`

**Purpose:** Dependent information (new feature - Phase 2)

**Fields (per dependent):**
- Name
- Relationship
- Age/Birth date
- Medical notes

**Features:**
- Multi-entry (add/remove dependents)
- Collapsed/expandable cards

**Status:** Recently added (not in original database schema - likely in development)

---

### 12. MemberFormComponent (Container)
**Location:** `src/app/components/sections/member-form/`

**Purpose:** Parent container coordinating all form sections

**Architecture:**
- **FormGroup**: Reactive form with nested FormControls
- **Section Management**: Accordion/stepper UI
- **Validation**: Aggregate validation across all sections
- **Save Logic**: Coordinates with DatabaseService
- **Progress Tracking**: Visual progress indicator

**Features:**
- Step-by-step navigation
- Save & Continue
- Form state persistence
- Validation summary

---

## Utility Components (6)

Located in `src/app/components/`

### 1. HeaderComponent
**Location:** `src/app/components/header/`

**Purpose:** App header with navigation and user info

**Features:**
- App title/logo
- Navigation menu (Ionic ion-menu integration)
- User profile indicator
- Sync status display

---

### 2. ThemeToggleComponent
**Location:** `src/app/components/theme-toggle/`

**Purpose:** Dark/light mode toggle

**Implementation:**
- Uses `ThemeService` to manage theme state
- Persists preference in localStorage
- Ionic CSS variables for theming
- Toggle UI: ion-toggle or icon button

---

### 3. QRGeneratorComponent
**Location:** `src/app/components/qr-generator/`

**Purpose:** Generate QR codes for member cards and provisioning

**Features:**
- Member card QR: Contains member ID + basic info
- Camp provisioning QR: Server URLs + sync code
- Uses `qrcode` library for generation
- Canvas-based rendering

**Use Cases:**
- Member ID cards
- Camp server provisioning (staff)

---

### 4. QRScannerComponent
**Location:** `src/app/components/qr-scanner/`

**Purpose:** Scan QR codes for provisioning

**Features:**
- Uses `@zxing/library` for scanning
- Camera access via Capacitor
- Auto-detect and parse QR data
- Provisioning flow integration

**Use Cases:**
- Device provisioning (scan camp QR)
- Member verification

---

### 5. DataViewerComponent
**Location:** `src/app/components/data-viewer/`

**Purpose:** Inspect stored member data (debug/admin tool)

**Features:**
- List all members from local database
- View full member record
- Search/filter members
- Export functionality

**UI:** Ionic ion-list with ion-items

---

### 6. DbTestComponent
**Location:** `src/app/components/db-test/`

**Purpose:** Database connection and CRUD testing

**Features:**
- Test SQLite/IndexedDB connection
- CRUD operations test
- Migration test
- Performance benchmarks

**Usage:** Developer/QA testing route (`/db-test`)

---

## Component Patterns

### Reactive Forms Integration
All form sections follow this pattern:
```typescript
@Component({
  selector: 'app-section-name',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IonicModule],
  templateUrl: './section-name.component.html',
  styleUrls: ['./section-name.component.scss']
})
export class SectionNameComponent implements ControlValueAccessor {
  formGroup: FormGroup;

  writeValue(value: any): void { ... }
  registerOnChange(fn: any): void { ... }
  registerOnTouched(fn: any): void { ... }
  setDisabledState?(isDisabled: boolean): void { ... }
}
```

### Ionic UI Components Used
- `ion-item`, `ion-label`, `ion-input` - Form inputs
- `ion-select`, `ion-select-option` - Dropdowns
- `ion-checkbox`, `ion-toggle` - Boolean inputs
- `ion-datetime` - Date pickers
- `ion-textarea` - Multi-line text
- `ion-button` - Action buttons
- `ion-card` - Grouped content
- `ion-list`, `ion-item-sliding` - Lists
- `ion-accordion` - Collapsible sections
- `ion-grid`, `ion-row`, `ion-col` - Layout

---

## Design System

### Styling Approach
- **Global Styles**: `src/global.scss`
- **Theme Variables**: `src/theme/variables.scss`
- **Component Styles**: Scoped SCSS per component
- **Ionic CSS Variables**: Custom properties for theming

### Theme Support
- **Light Mode**: Default Ionic theme
- **Dark Mode**: Custom dark theme variables
- **Toggle**: Via `ThemeToggleComponent` + `ThemeService`

---

## Notes

- All components are **standalone** (Angular 19 pattern)
- Components use **signals** where applicable (new Angular feature)
- Form validation uses **Angular validators**
- UI language: **Afrikaans** (South African)
- Components follow **Ionic mobile-first** design principles
