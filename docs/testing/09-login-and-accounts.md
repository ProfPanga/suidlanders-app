# 9. Login & Accounts

**Goal:** confirm staff can log in and only reach their own area, an admin can turn a device into a reception kiosk, and a member can create an optional recovery account and log in with it.

**Backend needed?** **Yes** — logins are checked by the camp server.

---

## Before you start

1. Start the backend and seed both members and staff accounts (see [guide 1](./01-getting-started.md)):
   ```bash
   cd backend
   npm run seed          # demo members
   npm run seed:users    # default staff accounts
   ```
2. The staff seed prints the default accounts. They are:

   | Role | E-pos | Wagwoord |
   |---|---|---|
   | Admin | `admin@suidlanders.local` | `Suidlanders1!` |
   | Mediese | `mediese@suidlanders.local` | `Suidlanders1!` |
   | Sekuriteit | `sekuriteit@suidlanders.local` | `Suidlanders1!` |

   > These are **first-time defaults** — they must be changed before real use.

> **About demo mode:** while the app is in *demo mode* it starts on the **Settings** screen with the role switcher, which lets you jump between roles **without** logging in (handy for demos). To test **real** login and access control as below, use a build with demo mode **off**. In either case you can always reach the login screen directly at **http://localhost:4200/login**.

---

## Test A — Staff login & role redirect

| # | Step | Expected result |
|---|------|-----------------|
| A.1 | Go to the login screen (`/login`, or **Personeel Aanmelding** on Home) | A form with **E-pos** and **Wagwoord / ID Nommer** |
| A.2 | Log in as **Mediese** (`mediese@suidlanders.local` / `Suidlanders1!`) | You are taken straight to the **Medical Staff** page |
| A.3 | Log out, log in as **Sekuriteit** | You are taken to the **Security Staff** page |
| A.4 | Enter a **wrong** password | An Afrikaans error appears ("Ongeldige e-pos of wagwoord"), you stay on the login screen |

> **Result:** ✅ if each role lands on its own page and a wrong password is rejected.

## Test B — Access control (the important one)

| # | Step | Expected result |
|---|------|-----------------|
| B.1 | Logged in as **Mediese**, try to open the Security page (`/member-form/securityStaff`) | **Blocked** — you do not see the security page |
| B.2 | Logged in as **Sekuriteit**, try to open the Medical page | **Blocked** |
| B.3 | While **not logged in**, try to open `/reception`, `/member-form/medicalStaff`, or `/member-form/securityStaff` directly | Redirected to the **login** screen |
| B.4 | Log out | You can no longer reach the staff pages without logging in again |

## Test C — Admin sets up a reception device

Reception staff should never have to log in — an admin prepares the device once.

| # | Step | Expected result |
|---|------|-----------------|
| C.1 | Log in as **Admin** (`admin@suidlanders.local`) | Login succeeds |
| C.2 | Open **Settings** (gear icon) | An **admin-only** card "Toestel Opstelling (Admin)" is visible |
| C.3 | Tap **Stel op as Ontvangs Toestel** | The device is set up and you land on the **Reception** dashboard |
| C.4 | Close and reopen the app on that device | It still opens Reception **without asking for a login** |

> **Result:** ✅ if the device becomes a no-login reception kiosk.

## Test D — Member optional recovery account

| # | Step | Expected result |
|---|------|-----------------|
| D.1 | As a **member**, fill in and save **Basiese Inligting** with a valid 13-digit ID and an email | Saved (see [guide 2](./02-member-registration.md)) |
| D.2 | Return to the member-form overview | An optional **"Herstel-rekening (opsioneel)"** card appears, with the email pre-filled |
| D.3 | Tap **Skep Herstel-rekening** | A success message: the account is created |
| D.4 | Go to the login screen and log in with that **email + the ID number** (as the password) | Login succeeds; you are taken to the member area |
| D.5 | Enter the email with a **wrong** ID number | Rejected with an error |

> The recovery account is **optional** — a member can skip it and still register normally. (Actually restoring data onto a new phone from this account is a separate, future feature.)

---

## Notes for testers
- A member token cannot open the reception/medical/security pages — only the matching staff (or admin) can.
- Everything here works **offline** against the Pi — logins are verified on the camp server, no internet needed.

---

Back to the [testing index](./README.md).
