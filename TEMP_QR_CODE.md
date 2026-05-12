# QR Codes — What We're Building

## The Two Scenarios

### Scenario 1: Joining the Camp Network

A member arrives at camp and needs to get their device connected and synced.

**What happens today:**

1. A reception staff member opens the app and taps a button to generate a QR code.
2. The QR code is shown on screen — it contains the camp WiFi details and a one-time access code.
3. The member opens their app, taps "Skandeer QR Kode", and points their camera at the screen.
4. The app automatically connects their phone to the camp WiFi, contacts the camp server, and downloads all the member data.
5. Done — the device is now fully synced and works offline from here.

**What doesn't work yet:**

- On Android this is fully automatic. On iPhone, the user has to connect to the WiFi manually first before scanning. We need a clear step-by-step instruction screen for iPhone users so they know what to do.

---

### Scenario 2: A Member's Personal QR Card

Each member can have a QR code that represents their basic info — think of it like a digital ID card.

**What happens today:**

1. On the member form overview, there is a "Genereer QR Kode" button.
2. Tapping it generates a QR image with the member's surname, name, member number, and rescue reference.
3. The member can save that image to their phone as a PNG file.

**What doesn't work yet:**

- The QR card is just a bare image right now. It would be much more useful as a proper printable membership card with the QR code, the member's name, and the Suidlanders logo laid out nicely.
- When a dependent is promoted to a full member ("Bevorder na Lid"), they don't automatically get their own QR card generated. That should happen on its own.
- Reception staff should be able to scan a member's QR card to instantly pull up that person's record on their device. The scanning ability is there — it just isn't connected to member lookup yet.

---

## Nice-to-Have for Later

- **Multi-page QR** — We have the building blocks to split a large amount of data across several QR codes (scan page 1, then page 2, etc.). This could be a backup way to transfer data between devices when the WiFi isn't working. Not urgent, but the groundwork is already done.

---

## Summary: What Still Needs to Be Done

| #   | What                                                           | How urgent |
| --- | -------------------------------------------------------------- | ---------- |
| 1   | iPhone instruction screen for manual WiFi before scanning      | High       |
| 2   | Reception staff can scan a member QR to look up their record   | High       |
| 3   | Auto-generate a QR card when a dependent is promoted to member | Medium     |
| 4   | Printable membership card layout (not just a bare QR image)    | Medium     |
| 5   | App download via QR code (Android only — camp server hosts.    | Medium     |
| 6   | Multi-page QR as a WiFi-free data transfer fallback            | Low        |
