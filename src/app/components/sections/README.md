# Form Section Components

This directory holds the reusable form-section components used by the member registration form. Each is a **standalone Angular component implementing `ControlValueAccessor`**, so it plugs into the parent reactive form as a single form control.

> Section labels, the overview cards, and which sections are member-facing vs staff-only are documented in [`CLAUDE.md`](../../../../CLAUDE.md#member-form-structure). This file describes the component pattern.

## The components

| Directory | Section | Notes |
|---|---|---|
| `basic-info/` | Basiese Inligting | Personal details **and address** (address is merged in here, not a separate section) |
| `member-info/` | Lid Inligting | Embedded inside the Basiese Inligting page (lid nommer, reddings verwysing, nood kontak) |
| `dependents/` | Afhanklikes | Embedded inside the Basiese Inligting page ("Voeg Afhanklike By") |
| `medical-info/` | Mediese Inligting | Member-facing medical fields |
| `vehicle-info/` | Voertuig Inligting | |
| `skills-info/` | Vaardighede | |
| `equipment-info/` | Toerusting | |
| `camp-info/` | Kamp Inligting | |
| `documents-info/` | Dokumente | Document uploads |
| `sekuriteits-info/` | Sekuriteits Inligting | Member-facing weapon/security fields |

The overview/section host pages live in `src/app/pages/member-form/`. The host page (`member-form-section.page.ts`) chooses which component to render from the route's `:section` key.

## The pattern

Each section component:

1. Is `standalone: true` and implements `ControlValueAccessor` (`writeValue`, `registerOnChange`, `registerOnTouched`).
2. Exposes its data as one value, so the parent binds it with `formControlName`.
3. Handles its own field-level layout and validation; the parent page handles **saving** (via `DatabaseService`) and the success/error toast.

### Adding a new section

1. Create a `your-section/` folder with a standalone component implementing `ControlValueAccessor`.
2. Add it to the host page's imports and `@switch` in `member-form-section.page.ts` / `.page.html`.
3. Add a card to the `SECTIONS` list in `member-form-overview.page.ts` (key, label, icon).
4. Persist/read the section under its key in the member entry (see how `medicalInfo` etc. are handled).

Follow the structure of an existing section (e.g. `equipment-info/`) for consistency.
