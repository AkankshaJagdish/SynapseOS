# SynapseOS Architecture Rules

These rules keep the hackathon implementation simple, reliable, and easy to demo. Every new feature must extend the existing implementation rather than create a parallel one.

1. **Single backend** — All server-side functionality lives in the FastAPI application under `backend/`. Do not introduce another backend, gateway, or serverless API.
2. **Single database** — SQLite is the only application database. All persistent data must use the configured `SYNAPSE_DATABASE_PATH`.
3. **Single `MemoryService`** — Organizational memory is owned by the one shared `MemoryService` instance exposed by the backend service container.
4. **Single `SignalService`** — Signal collection and processing is owned by the one shared `SignalService` instance exposed by the backend service container.
5. **Single `AgentOrchestrator`** — Agent coordination is owned by the one shared `AgentOrchestrator` instance exposed by the backend service container.
6. **Frontend consumes APIs only** — The Next.js frontend must access backend capabilities through the shared API client. It must not access the database or recreate backend logic.
7. **No duplicate implementations** — Before adding a model, service, API, database, or agent workflow, extend and reuse the existing implementation.

## Delivery constraints

- Preserve backward compatibility for existing API contracts.
- `DEMO_MODE=true` must work without Azure or other cloud credentials.
- Prefer reliability over sophistication, demo clarity over feature count, and simplicity over enterprise complexity.
- Keep the backend and frontend independently deployable to Render and Vercel while retaining a one-command local Docker Compose workflow.
