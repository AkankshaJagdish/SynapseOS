# SynapseOS

SynapseOS turns independent employee observations into organizational awareness. This foundation provides one FastAPI backend, one SQLite database, one shared backend service graph, and a Next.js frontend that consumes the backend API.

## Architecture

Read [`docs/ARCHITECTURE_RULES.md`](docs/ARCHITECTURE_RULES.md) before adding functionality. In particular, extend the existing `MemoryService`, `SignalService`, and `AgentOrchestrator`; do not create parallel implementations.

## Run locally

### Docker Compose (recommended)

```bash
docker compose up
```

- Frontend: <http://localhost:3000>
- API: <http://localhost:8000>
- API docs: <http://localhost:8000/docs>

### Without Docker

```bash
python -m venv .venv
. .venv/bin/activate
pip install -r backend/requirements.txt
DEMO_MODE=true uvicorn app.main:app --app-dir backend --reload
```

In another terminal:

```bash
cd frontend
npm install
npm run dev
```

No Azure credentials are required. `DEMO_MODE` defaults to `true`.

## Configuration

| Variable | Default | Purpose |
| --- | --- | --- |
| `DEMO_MODE` | `true` | Keeps the application usable without cloud credentials. |
| `SYNAPSE_DATABASE_PATH` | `data/synapse.db` | Path to the single SQLite database. |
| `FRONTEND_ORIGIN` | `http://localhost:3000` | Allowed frontend CORS origin. |
| `API_BASE_URL` | `http://localhost:8000` | Server-side frontend API URL. |
| `NEXT_PUBLIC_API_BASE_URL` | `http://localhost:8000` | Browser-visible API URL. |

## System API

- `GET /health` — process health
- `GET /ready` — database readiness
- `GET /version` — version and demo-mode state

## Deployment

- Render backend configuration: [`render.yaml`](render.yaml)
- Vercel frontend configuration: [`vercel.json`](vercel.json)
