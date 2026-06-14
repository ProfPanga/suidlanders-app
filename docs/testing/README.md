# Manual Testing Guides — Suidlanders App

Welcome. These guides let you (Suidlanders) check that **every part of the app works** before and during a real camp. You do **not** need to be a programmer — each guide tells you exactly what to tap, what to type, and what you should see.

Work through them in order the first time. After that, you can pick the guide for whatever part you want to re-check.

## What's in here

| # | Guide | What it checks |
|---|---|---|
| 1 | [Getting started](./01-getting-started.md) | Installing, starting the app, and choosing your role |
| 2 | [Member registration](./02-member-registration.md) | A member filling in and saving their information |
| 3 | [Reception staff](./03-reception-staff.md) | The reception dashboard and member search |
| 4 | [Medical staff](./04-medical-staff.md) | The medical triage assessment page |
| 5 | [Security staff](./05-security-staff.md) | The security staff page |
| 6 | [QR codes & camp sync](./06-qr-and-camp-sync.md) | Generating/scanning QR codes and syncing to the camp server |
| 7 | [Raspberry Pi deployment](./07-raspberry-pi-deployment.md) | The real-world camp test on the Pi (offline / WiFi) |
| 8 | [Browser & device matrix](./08-browser-and-device-matrix.md) | Checking it works across browsers and phones |

## Before you start

You need two things running for most tests:

1. **The backend (camp server)** — the part that stores members centrally. See [Getting started](./01-getting-started.md).
2. **The frontend (the app)** — what people see and use on their phone or in a browser.

Some tests (like reception, medical triage, and camp sync) only fully work when the **backend is running too**. Each guide says clearly when the backend is required.

## How to record results

As you go through a guide, mark each step with one of these:

| Mark | Meaning |
|---|---|
| ✅ | **Pass** — it did what the guide said |
| ❌ | **Fail** — write down what happened instead |
| ⚠️ | **Partial** — it works but looks wrong or behaves oddly |
| — | **Not tested** |

If something fails, note **which guide, which step, which browser/phone**, and what you saw. That is exactly the information a developer needs to fix it.

## A note on "demo mode"

Right now the app starts on a **Settings** screen where you pick who you are (Member, Reception, Medical, or Security). This is a demo convenience so one device can act as any role. In a finished production version this picker would be replaced by proper logins. This is expected for the current proof-of-concept — see [`../../TODO.md`](../../TODO.md).
