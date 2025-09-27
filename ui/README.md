# Nordia ISP Suite – UI Prototype

This directory hosts a **white-label web UI** prototype for Nordia ISP Suite. It stays isolated from the production CLI so we can iterate without risk.

## Structure (proposed)

```
ui/
├── README.md                 # This guide
├── backend/                  # FastAPI service exposing ISP metrics
│   ├── pyproject.toml
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py           # FastAPI app + tenant-aware endpoints
│   │   ├── deps.py           # Shared dependencies/services
│   │   └── routers/
│   │       ├── dashboard.py  # /api/dashboard
│   │       └── tenants.py    # /api/tenants
│   └── services/
│       ├── __init__.py
│       ├── data_loader.py    # Reuses CSV/JSON from scripts/
│       └── reporting.py      # Hooks to cut_service reports
├── frontend/
│   ├── package.json
│   ├── next.config.js
│   ├── tailwind.config.ts
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx      # Gradient hero + KPI cards
│   │   ├── components/
│   │   │   ├── brand-provider.tsx
│   │   │   ├── kpi-card.tsx
│   │   │   ├── jobs-timeline.tsx
│   │   │   ├── clients-table.tsx
│   │   │   └── tenant-switcher.tsx
│   │   └── lib/
│   │       ├── api.ts        # Fetchers via React Query/SWR
│   │       └── theme.ts      # White-label token definitions
│   └── public/
│       └── themes/
│           ├── default.json
│           └── sample-isp.json
└── ops/
    ├── docker-compose.yml    # Optional stack (FastAPI + Next.js)
    └── Makefile              # Helper commands
```

## Implementation Plan

1. **Backend (FastAPI)**
   - Load data from `data/sample_morosos.csv` and `output/` reports using the existing business logic.
   - Expose `/api/dashboard`, `/api/jobs`, `/api/reports`, `/api/tenants`.
   - Derive tenant themes from `frontend/public/themes/*.json`.

2. **Frontend (Next.js 14 + Tailwind + shadcn/ui)**
   - White-label friendly: brand tokens in `src/lib/theme.ts`.
   - Components built with gradient backgrounds, glass panels, Framer Motion micro-interactions.
   - React Query/SWR for data fetching.

3. **Branding**
   - Default theme: “Nordia ISP Suite”.
   - Tenant override via query string (`?tenant=telecorr`) or header.
   - Show "Powered by Nordia" badge while letting ISP logo dominate hero.

4. **Deployment**
   - Keep CLI untouched.
   - Optional Docker Compose to run `frontend` (Next dev server) + `backend` (uvicorn).
   - Later integrate behind authentication (Auth0, clerk, or custom).

## Quick Start (once dependencies are installed)

```bash
# Backend
cd ui/backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt  # to be generated via uv
uvicorn app.main:app --reload

# Frontend
cd ui/frontend
npm install
npm run dev
```

Both services remain opt-in until the team validates with clients.
