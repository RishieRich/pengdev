# Strategy And Next Steps

## Goal

Keep the Pawan Engineering KPI dashboard live from the client's Tally data with minimal manual work.

Target workflow:

1. Client PC is switched on.
2. A small Python sync script runs on that PC.
3. The script fetches latest sales and purchase data from Tally.
4. The script uploads refreshed files/data to the live app backend.
5. The Vercel link shows the latest KPIs.
6. The script repeats every 4 hours while the PC is online.

## 1. Python Script To Fetch Data From Client Tally Server

Recommended approach: run a local sync agent on the client's Windows PC where Tally is installed.

### Tally Setup

1. Open Tally Prime on the client machine.
2. Enable Tally HTTP server.
3. Use a fixed port, usually `9000`.
4. Keep the company open in Tally when sync is expected.
5. Confirm the local endpoint works:

```powershell
Invoke-WebRequest http://localhost:9000
```

### Python Sync Script Shape

Create a script like:

```text
client_sync/
  tally_sync.py
  requirements.txt
  .env
```

The script should:

1. Call Tally XML API on `http://localhost:9000`.
2. Request sales register and purchase register for the selected date range.
3. Convert the response into the same structure this app expects.
4. Write `Sale 25-26.xlsx` and `Purchase 25-26.xlsx`, or directly upload normalized JSON.
5. Push the result to the hosted backend with an API key.

Example `.env`:

```text
TALLY_URL=http://localhost:9000
SYNC_API_URL=https://your-backend-url.com/api/sync/upload
SYNC_API_KEY=strong-client-specific-key
COMPANY_NAME=Pawan Engineering
SYNC_FROM_DATE=20250401
```

### Sync Interval

Use Windows Task Scheduler:

1. Create Task.
2. Trigger: At startup.
3. Repeat task every: 4 hours.
4. Action:

```powershell
python D:\pawan-sync\tally_sync.py
```

Also add retry logic in Python:

1. If Tally is closed, log failure and exit.
2. If internet is down, save local export and retry next run.
3. If upload fails, keep the last successful app data unchanged.

## 2. Vercel Live Hosting Strategy

Best production setup:

1. Frontend on Vercel.
2. Backend/API on Render, Railway, Fly.io, or a small VPS.
3. Client PC sync agent pushes data to backend.
4. Vercel frontend reads KPIs from backend API.

Reason: Vercel frontend is excellent for React, but the client PC cannot directly write files into a deployed Vercel build. The live data should be stored in a backend database/object store, not inside the Git repo or Vercel build folder.

### Practical Storage Options

Option A: Backend disk/object storage

- Sync agent uploads latest workbook files.
- Backend stores them in durable storage.
- Dashboard API reads latest uploaded files.

Option B: Database tables

- Sync agent parses Tally and uploads JSON rows.
- Backend stores sales, purchases, customers, vendors, products.
- Dashboard API computes KPIs by tenure and filters.

Option B is better long term.

## 3. GitHub And Deployment Workflow

Recommended repositories:

```text
github.com/arq-one/pawan-engineering-dashboard
```

Branches:

```text
main        production
develop     testing
```

Workflow:

1. Code changes pushed to GitHub.
2. Vercel auto-deploys frontend from `frontend/`.
3. Backend host auto-deploys API from `backend/`.
4. Client PC sync agent keeps sending fresh Tally data.
5. Client opens Vercel link and sees latest KPIs.

## 4. Live Data Refresh Workflow

Runtime flow:

```text
Tally on client PC
  -> Python sync agent every 4 hours
  -> Backend upload API
  -> Database or object storage
  -> Dashboard API
  -> Vercel UI
  -> Client sees live KPIs
```

When client PC is off:

1. No new refresh happens.
2. Dashboard continues showing last successful sync.
3. UI should show `Last synced at` timestamp.

When client PC comes back on:

1. Startup task runs sync.
2. App refreshes data.
3. Next sync repeats every 4 hours.

## 5. Product Next Steps

### Data Model

Move from workbook parsing to normalized records:

```text
sales:
  date, customer, product, quantity, rate, amount

purchases:
  date, vendor, material, quantity, rate, amount

sync_runs:
  started_at, finished_at, status, row_counts, error
```

### Dashboard Features

Already started in this app:

1. Tenure toggle: FY, Q1, Q2, Q3, Q4, H1, H2, last 90 days.
2. Filter input: customer, vendor, product, or material.
3. Missing input behavior: no KPIs shown if required files are absent.

Recommended next:

1. Custom date range picker.
2. Customer dropdown.
3. Vendor dropdown.
4. Product/material dropdown.
5. Last synced timestamp.
6. Sync health indicator.
7. Download latest raw export.
8. Admin-only sync logs.

## 6. Security Requirements

1. Do not expose Tally directly to the internet.
2. The Python sync agent should call outbound HTTPS only.
3. Upload API must require `SYNC_API_KEY`.
4. Store secrets in environment variables.
5. Use HTTPS for all production URLs.
6. Keep one client isolated from another client if this becomes multi-tenant.

## 7. Immediate Build Plan

Phase 1:

1. Keep current workbook input flow.
2. Add backend upload endpoint for the two Excel files.
3. Store latest uploaded files in backend storage.
4. Show `lastSyncAt` in UI.

Phase 2:

1. Build `tally_sync.py`.
2. Install it on client PC.
3. Schedule every 4 hours.
4. Test with Tally open and closed.

Phase 3:

1. Replace workbook parsing with normalized database rows.
2. Add richer filters and trend comparisons.
3. Add admin sync monitoring.
