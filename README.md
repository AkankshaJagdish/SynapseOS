# SynapseOS

SynapseOS is an executive operations-intelligence demo that connects employee observations to related organizational signals, prior solutions, implementation plans, and measurable savings.

## Architecture

### Frontend

The frontend is a standard client-rendered **Vite + React + TypeScript SPA**. It has no TanStack Start, SSR runtime, Nitro server, Cloudflare adapter, or serverless deployment target.

- `src/main.tsx` mounts React into the static `index.html` entry point.
- `src/App.tsx` defines client-side routes with React Router.
- `src/lib/api.ts` is the only frontend network layer and defines types matching the backend response schemas.
- `src/pages/` contains the executive dashboard, observation submission, and analysis/action-plan experiences.
- `src/styles.css` contains the responsive Microsoft Fluent-inspired visual system and agent animations.

The browser routes are:

| Browser route | Screen |
| --- | --- |
| `/` | Executive operations dashboard |
| `/observations/new` | Observation submission |
| `/observations/:id` | Multi-agent analysis and action plan |

### Backend

The backend is a mock-backed FastAPI service. It exposes:

- `GET /api/dashboard`
- `POST /api/observations`
- `GET /api/observations/{id}/analysis`
- `POST /api/observations/{id}/implement`

Submitted observations are stored in backend process memory. See `handoff/BACKEND_STATUS.md` for backend details and `handoff/FRONTEND_INTEGRATION.md` for request/response examples.

## Local development

Prerequisites: Node.js 20+ and npm.

```bash
npm install
npm run dev
```

During local development, Vite proxies relative `/api/...` paths to `http://localhost:8000`. To target another backend, create `.env.local`:

```bash
VITE_API_BASE_URL=http://localhost:8000
```

Start the existing backend separately from `backend/`:

```bash
uvicorn app.main:app --reload
```

## Production build

```bash
npm run build
```

The build produces a static deployment bundle:

```text
dist/
├── index.html
└── assets/
```

Preview it locally with:

```bash
npm run preview
```

## Deploying the frontend to Render

The repository includes `render.yaml` for a Render Static Site. The backend can remain deployed as its existing Render Web Service.

### Blueprint deployment

1. Push the repository to GitHub or GitLab.
2. In Render, select **New → Blueprint** and connect the repository.
3. Render reads `render.yaml` and creates the `synapseos-frontend` static site.
4. Set `VITE_API_BASE_URL` to the backend Render URL, without a trailing slash, for example `https://synapseos-api.onrender.com`.
5. Deploy.

### Manual Static Site deployment

Use these settings if not using the Blueprint:

| Setting | Value |
| --- | --- |
| Service type | Static Site |
| Build command | `npm ci && npm run build` |
| Publish directory | `dist` |
| Environment variable | `VITE_API_BASE_URL=https://<backend-service>.onrender.com` |
| Rewrite rule | `/*` → `/index.html` |

The rewrite rule is required because React Router handles routes in the browser. Without it, directly opening `/observations/new` or `/observations/:id` returns a static-host 404.

## Integration and resilience behavior

- All network calls go through `src/lib/api.ts`.
- Non-2xx backend responses display their `detail` message directly in the UI.
- Connection failures display an actionable service-availability message.
- Loading skeletons are controlled by `finally` blocks and disappear on both success and failure.
- The dashboard always shows the executive story metrics `$51,000`, `340`, `27`, and `1` while the backend is loading or unavailable. These are presentation fallbacks only; lists and analysis results are never mocked in the frontend.
- The backend must allow the deployed frontend origin through CORS. The current backend permits all origins for the MVP.

## Frontend/backend integration audit

### Mismatches found

1. **No frontend existed in the repository.** There was no TanStack Start, Nitro, Cloudflare target, package manifest, routing configuration, styling, API integration, loading state, or frontend mock data to convert or preserve.
2. **No API client existed.** The four backend routes had documentation but no browser consumer.
3. **Dashboard loading would have shown no story metrics.** The requested executive fallback values were absent from any UI.
4. **Backend numeric schema fields serialize as numbers and may appear with decimals.** The frontend normalizes display with locale formatting and rounding where appropriate.
5. **The backend implementation endpoint validates the solution but not the observation ID.** The frontend sends the active observation ID as contracted and surfaces any backend error unchanged.
6. **The backend OpenAPI artifact omits `/health`, while the runtime exposes it.** The frontend does not depend on `/health` for page rendering.

### Integration fixes applied

- Created one typed API client for exactly the four backend routes.
- Matched frontend request keys and response types to backend Pydantic responses.
- Added direct display of backend `detail` errors plus connection-error handling.
- Added deterministic loading completion and retry behavior.
- Added dashboard story metrics during loading and connection failures without mocking backend lists or analysis data.
- Added Render SPA rewrites and environment-based backend URL configuration.
