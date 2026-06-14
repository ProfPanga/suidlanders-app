# 3. Reception Staff

**Goal:** confirm the reception dashboard lists members, can be searched, and **never shows medical details**.

**Who:** the **Ontvangs Personeel** (reception staff) role.
**Backend needed?** **Yes** for the full test (the member list comes from the camp server). It still loads with an empty state if the backend is off.

---

## Setup

1. Make sure the **backend is running** and you have run `npm run seed` (see [guide 1](./01-getting-started.md)). The seed creates 6 demo members.
2. From Settings, tap **Ontvangs Personeel**. You land on the **Reception** screen.

---

## Test A — Without the backend running (empty state)

| # | Step | Expected result |
|---|------|-----------------|
| A.1 | Open Reception while the backend is **off** | The page still loads — it shows an empty state or no members, and does **not** crash |
| A.2 | The search bar is visible | You can tap it and type into it |
| A.3 | The settings gear icon in the header works | Tapping it returns you to Settings |

---

## Test B — With the backend running (member list)

| # | Step | Expected result |
|---|------|-----------------|
| B.1 | With the backend running and seeded, open Reception | The list loads with the demo members |
| B.2 | Each member shows a **camp badge** | Members are marked **Red Camp** or **Green Camp** |
| B.3 | The two Red Camp members appear (Pieter van der Merwe, Susan Kruger) | Shown with the red badge |
| B.4 | The four Green Camp members appear | Shown with the green badge |

---

## Test C — Search

| # | Step | Expected result |
|---|------|-----------------|
| C.1 | Type part of a name into the search bar (e.g. `Botha`) | The list filters to matching members |
| C.2 | Clear the search | The full list returns |

---

## Test D — Privacy (important)

Reception staff direct families to the right camp; they must **not** see sensitive medical information.

| # | Step | Expected result |
|---|------|-----------------|
| D.1 | Look closely at what each member row shows | Only name, family size, and camp assignment — **no** chronic conditions, medication, blood type, allergies, ID number, email, or phone |

> If any medical detail is visible on the reception screen, that is a **failure** — record it clearly, as privacy is a core requirement.

---

Next: [4. Medical staff](./04-medical-staff.md)
