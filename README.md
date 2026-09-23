# Isa FitHub

Multi-store inventory, point-of-sale and staff time-tracking app built for a gym supplement retailer.
This is a **public showcase copy** of a private client project: credentials, client data and internal notes were removed from the whole history.

## Stack

- React 19 + TypeScript 5.8, Vite 7
- TanStack Router (file-based routes), TanStack Table, TanStack Query provider
- Tailwind CSS 4, shadcn/ui (Radix)
- Supabase (auth, Postgres, realtime)
- Recharts, xlsx / jsPDF exports

## What I built

- **State architecture:** six React contexts (`src/context/`) — auth, inventory, profile, time log, visits and active store — on top of a service layer (`src/services/*.service.ts`).
- **Offline-first operation queue** (`src/lib/offline.ts` + `InventoryContext.tsx`): sales, stock adjustments, new products/batches and write-offs are queued in localStorage with optimistic UI when the device is offline, then replayed and reconciled against Supabase on reconnect.
- **Multi-store inventory:** batches with expiry tracking (`src/lib/expiry.ts`), inter-store stock transfers, write-offs, undo-sale.
- **Screens:** dashboard, inventory, reports (Excel/PDF export), staff schedules/time logs, settings.
- **Tests:** service and transfer integration scripts in `tests/`.

## Run locally

```bash
npm install
# create .env.local with your own Supabase project
# VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
# VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
npm run dev
```

Author: Mathew Ospino Hernandez — [github.com/MathenoMMG](https://github.com/MathenoMMG)
