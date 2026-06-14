# 7. Raspberry Pi Deployment & The Real-World Camp Test

**Goal:** run the app on the actual Raspberry Pi camp server in WiFi **AP mode** (no internet, no ethernet) and confirm a phone can register and sync — the true real-world scenario.

This is the most important test for the handover: it is the closest thing to a real camp.

**Backend needed?** Yes — it runs **on the Pi**.

---

## Placeholders used in this guide

Replace these with your own values wherever they appear:

| Placeholder | Meaning | Example |
|---|---|---|
| `<HOME_WIFI>` | The normal WiFi the Pi uses for internet/setup | `Cudy-F764` |
| `<PI_USER>` | The Pi login username | `suidlanders` |
| `<PI_IP>` | The Pi's address on your home network | `192.168.1.50` |
| `<CAMP_WIFI>` | The Pi's own camp WiFi (AP mode) | `SuidlandersKamp` |
| `<CAMP_IP>` | The Pi's address in AP mode | `192.168.4.1` |
| `<APP_PORT>` | The port the app is served on, on the Pi | `8080` |

> Your specific Pi setup scripts (`switch-to-internet.sh`, `switch-to-ap.sh`) and folder paths may differ — confirm them with whoever set the Pi up.

---

## Part A — First-time deployment to the Pi

(Skip if the Pi is already set up.) Full details, including the auto-start-on-boot service, are in [`../../BACKEND.md`](../../BACKEND.md#raspberry-pi-deployment). In short:

1. Copy the backend to the Pi, install dependencies (`npm install`), seed demo data (`npm run seed`), and start it.
2. Build and serve the frontend on the Pi (on `<APP_PORT>`).
3. Optionally set up the systemd service so the backend starts automatically on boot.

---

## Part B — The no-ethernet test workflow

The challenge: when the Pi switches into camp (AP) mode it leaves your home WiFi, so you **lose your SSH/remote connection** to it. The workflow below works around that.

### Step 1 — Put the Pi on home WiFi (internet mode)

On the Pi (using a keyboard/monitor, or an existing SSH session):
```bash
~/switch-to-internet.sh
```
Wait about 10 seconds for the Pi to join `<HOME_WIFI>`.

### Step 2 — Find the Pi's home-network address

On the Pi:
```bash
hostname -I
```
Or from your laptop:
```bash
arp -a | grep raspberrypi
```
You should get something like `<PI_IP>` (a `192.168.1.x` address).

### Step 3 — Connect from your laptop

```bash
ssh <PI_USER>@<PI_IP>
```

### Step 4 — Start watching the logs (optional but useful)

In the SSH session:
```bash
tail -f ~/suidlanders-app/logs/backend.log
```
Leave it running so you can see what the server does.

### Step 5 — Switch the Pi into camp (AP) mode

> ⚠️ **Heads-up:** the moment you run this, your SSH connection **will drop**, because the Pi leaves home WiFi and starts its own `<CAMP_WIFI>` network. That is expected.

From a second laptop terminal (or directly on the Pi):
```bash
~/switch-to-ap.sh
```

### Step 6 — Test with a phone (the real scenario)

1. **Phone:** connect to the **`<CAMP_WIFI>`** WiFi network.
2. **Phone browser (or the installed app):** open `http://<CAMP_IP>:<APP_PORT>/reception`.
3. Tap **Genereer QR Kode**.
4. **App:** scan the QR code and let it sync.

| What to confirm | Expected |
|---|---|
| Phone connects to `<CAMP_WIFI>` | Connected, no internet needed |
| The app/reception page loads from the Pi | Page appears over the camp WiFi |
| A member can register and sync | Member data reaches the Pi |

---

## Part C — Checking logs after the test

Because SSH drops in AP mode, you **cannot watch logs live** during the phone test. Do this instead:

1. Run the phone test (Step 6) while the Pi is in AP mode.
2. On the Pi, switch back to internet mode: `~/switch-to-internet.sh`.
3. SSH back in from your laptop: `ssh <PI_USER>@<PI_IP>`.
4. Read the recent log lines:
   ```bash
   tail -50 ~/suidlanders-app/logs/backend.log
   ```
   Look for the sync requests that came from the phone during the test.

---

## Handover checklist

This guide passing — a phone registering and syncing to the Pi over camp WiFi, with no internet — is the key sign the POC **works in a real-world environment** (handover goal #1 in [`../../TODO.md`](../../TODO.md)).

---

Next: [8. Browser & device matrix](./08-browser-and-device-matrix.md)
