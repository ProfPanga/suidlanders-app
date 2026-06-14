# Suidlanders Backend API

NestJS camp-server API for the Suidlanders Emergency Plan App. Runs on the Raspberry Pi camp server, provides member sync + automatic Red/Green triage, and powers the Reception Dashboard.

> **Full documentation** — API endpoints, triage logic, privacy enforcement, Raspberry Pi deployment, and troubleshooting — lives in [`../BACKEND.md`](../BACKEND.md). This file is just the quick start.

## Quick Start

```bash
cd backend
npm install        # first time only
npm run seed       # create 6 demo members (2 Red Camp, 4 Green Camp)
npm start          # → http://localhost:3000
```

Then start the frontend from the project root (`npm start`) and open
http://localhost:4200/reception to see the members with camp badges.

## Scripts

| Command | What it does |
|---|---|
| `npm start` | Start the server (http://localhost:3000) |
| `npm run start:dev` | Start with auto-reload (development) |
| `npm run seed` | Reset and seed the 6 demo members |
| `npm run build` | Build for production |
| `npm run start:prod` | Run the production build |

## Tech Stack

NestJS 10 · TypeORM 0.3 · SQLite (file-based, `data/camp.db`) · TypeScript · class-validator

See [`../BACKEND.md`](../BACKEND.md) for everything else.
