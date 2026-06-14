# 1. Getting Started

**Goal:** get the app running on a computer and confirm you can choose a role and reach each role's starting screen.

This is the foundation for every other guide. Do this one first.

---

## What you need

- A computer (Mac, Windows, or Linux) with **Node.js** installed.
- The project code on that computer.
- A web browser (Chrome is recommended for the first run).

> You only need a physical phone for the mobile and camp-sync tests (guides 6, 7, 8). Everything else can be done in a browser on the computer.

---

## Part A — Start the backend (camp server)

The backend is the central store that the reception, medical, and sync features talk to.

1. Open a **Terminal** window.
2. Go into the backend folder. Type this and press Enter:
   ```bash
   cd backend
   ```
3. **First time only**, install its building blocks:
   ```bash
   npm install
   ```
   This can take a minute or two. Wait until you get the prompt back.
4. Create the demo members (6 example people to test with):
   ```bash
   npm run seed
   ```
   **Expected:** a message that members were created (2 Red Camp, 4 Green Camp).
5. Start the server:
   ```bash
   npm start
   ```
   **Expected:** it stays running and mentions `http://localhost:3000`. **Leave this window open** — closing it stops the server.

> **Result:** ✅ if the server is running on port 3000.

---

## Part B — Start the app (frontend)

1. Open a **second** Terminal window (leave the backend one running).
2. Make sure you are in the main project folder (not inside `backend`).
3. **First time only**, install the app's building blocks:
   ```bash
   npm install
   ```
4. Start the app:
   ```bash
   npm start
   ```
   **Expected:** after it finishes building, it prints a web address — **http://localhost:4200**.
5. Open that address in your browser.

> **Result:** ✅ if the app opens in the browser.

---

## Part C — Choose a role

When the app opens it should take you to a **Settings** screen titled "Kies Jou Reis" ("Choose your journey").

| # | Step | Expected result |
|---|------|-----------------|
| C.1 | The app loads and shows the Settings / journey screen | Four role cards are visible |
| C.2 | All four cards are readable: **Lid**, **Ontvangs Personeel**, **Mediese Personeel**, **Sekuriteit** | Each has an icon and a short description |
| C.3 | Tap **Lid** | You land on the **Home** screen |
| C.4 | Go back to Settings, tap **Ontvangs Personeel** | You land on the **Reception** screen |
| C.5 | Go back to Settings, tap **Mediese Personeel** | You land on the **Medical Staff** triage screen |
| C.6 | Go back to Settings, tap **Sekuriteit** | You land on the **Security Staff** screen |

> To get back to Settings at any time, use the **gear / settings icon** in the header, or the back button.

---

## Troubleshooting

- **`npm: command not found`** → Node.js is not installed. Install Node.js, then try again.
- **The app opens but reception/medical show nothing** → the backend (Part A) is probably not running. Check the first Terminal window.
- **"Port already in use"** → something is already running on that port. Close other Terminal windows running the app/server and try again.

---

Next: [2. Member registration](./02-member-registration.md)
