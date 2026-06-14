# 5. Security Staff

**Goal:** confirm the security staff page loads.

**Who:** the **Sekuriteit** (security staff) role.
**Backend needed?** No.

---

## Important: this page is not built yet

The security staff page is currently a **placeholder**. It is wired up and reachable, but its content is still **under development**. There is nothing to fill in yet.

> The member-facing security/firearm fields (vuurwapen, lisensie, skietervaring, opleiding) **do** exist — but those are part of the member form's **Sekuriteits Inligting** section, tested in [guide 2, Test C.7](./02-member-registration.md). This page is the separate *staff* tool, which has not been built.

---

## Test A — The placeholder loads

| # | Step | Expected result |
|---|------|-----------------|
| A.1 | From Settings, tap **Sekuriteit** | You land on the Security Staff page (titled **Sekuriteit Personeel**) |
| A.2 | Read the page | It shows a message that the section is under development ("This section is under development. Coming soon...") |
| A.3 | The header back button works | Returns you to `/member-form` |

> **Result:** ✅ if the page loads and shows the "coming soon" message without errors.

---

## Remaining work

Building the security staff questionnaire is an open item — see [`../../TODO.md`](../../TODO.md). Once content is added, this guide should be expanded to test its fields (like the medical staff guide).

---

Next: [6. QR codes & camp sync](./06-qr-and-camp-sync.md)
