# 6. QR Codes & Camp Sync

**Goal:** confirm QR codes generate correctly, the scanner fails gracefully in a browser, and member data can sync to the camp server.

**Backend needed?** **Yes** for the camp-sync parts.

This guide has two parts:
- **Part 1 — QR generation** (works in a browser, no phone needed)
- **Part 2 — Camp sync** (the offline LAN flow; uses the built-in debug page so you don't need a physical device)

---

## How camp sync works (plain-English overview)

The whole system is built to work **with no internet**. At a camp:

1. A staff member's device/server generates a **QR code** containing the camp WiFi details, the camp server's address, and a short-lived **sync code**.
2. A member scans that QR code with the app.
3. On Android, the app **connects to the camp WiFi automatically**; on iPhone the member connects to the WiFi by hand.
4. The app finds the camp server, exchanges the code for a temporary token, and **uploads the member's data**.

You don't need to memorise this — the tests below check each piece.

---

## Part 1 — QR generation (browser only)

### Test A — Member QR code

| # | Step | Expected result |
|---|------|-----------------|
| A.1 | As **Lid**, fill and save at least the **Basiese Inligting** section (see [guide 2](./02-member-registration.md)) | Section is saved |
| A.2 | On the member form overview, find and tap **Genereer QR Kode** | A QR code image appears on screen |
| A.3 | Tap the dismiss / close option (e.g. **Maak QR Kode Toe**) | The QR code closes |

### Test B — Scanner in a browser (expected graceful failure)

| # | Step | Expected result |
|---|------|-----------------|
| B.1 | Tap a **Skandeer QR** ("Scan QR") button while running in a desktop browser | It shows a **graceful message/error**, not a crash. (Real camera scanning only works in the installed mobile app, not a desktop browser — this failure is expected.) |

> A clean error here is a **pass**. A frozen or crashed page is a **fail**.

---

## Part 2 — Camp sync end-to-end (using the debug page)

You can test the entire sync flow on one computer, **without a phone or Raspberry Pi**, using the built-in debug page.

### Setup

1. Make sure the **backend is running** (see [guide 1](./01-getting-started.md)).
2. In the browser, go to **http://localhost:4200/qr-debug**.

### Test C — Health check & code exchange

| # | Step | Expected result |
|---|------|-----------------|
| C.1 | On the `/qr-debug` page, run the **health check** | It reports the camp server is reachable |
| C.2 | **Generate** a sync code | A code (and the QR payload with server addresses) is shown |
| C.3 | **Exchange** that code for a sync token | It succeeds and returns a token |
| C.4 | Trigger a **sync** | The sync completes and reports success |

> `/qr-debug` is a developer/diagnostic page. It is the easiest way to confirm the camp-sync plumbing works before doing the real on-the-Pi test in [guide 7](./07-raspberry-pi-deployment.md).

### Test D — Reception sees synced members

| # | Step | Expected result |
|---|------|-----------------|
| D.1 | After a successful sync, switch to **Ontvangs Personeel** and open Reception | Members that were synced appear in the list (see [guide 3](./03-reception-staff.md)) |

---

## What needs a real device or Pi

- **Automatic WiFi connection on Android**, **scanning a printed QR with the camera**, and **iPhone manual WiFi** can only be tested on real phones at a camp / on the Pi. Those are covered in [guide 7](./07-raspberry-pi-deployment.md).

---

Next: [7. Raspberry Pi deployment](./07-raspberry-pi-deployment.md)
