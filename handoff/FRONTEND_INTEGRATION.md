# SynapseOS Frontend Integration

Base URL for local development: `http://localhost:8000`.

The MVP backend is mock-only. Submitted observations are retained in process memory until the API restarts, while analysis, solution, and dashboard content comes from `backend/app/mock_data.json`.

## Routes

| Method | Route | Purpose | Success | Errors |
| --- | --- | --- | --- | --- |
| `GET` | `/health` | Check API availability | `200` | None |
| `POST` | `/api/observations` | Submit an observation | `201` | `422` invalid payload |
| `GET` | `/api/observations/{id}/analysis` | Retrieve simulated multi-agent analysis | `200` | `404` unknown observation |
| `POST` | `/api/observations/{id}/implement` | Generate a deterministic plan for a selected solution | `200` | `404` unknown solution; `422` invalid payload |
| `GET` | `/api/dashboard` | Retrieve dashboard metrics | `200` | None; hardcoded fallback is returned if mock data is unavailable |

## Request payloads

### `POST /api/observations`

```json
{
  "text": "Customer onboarding is causing churn and support load is increasing.",
  "submitted_by": "Jane Smith",
  "department": "Customer Success"
}
```

- `text` and `submitted_by` are required.
- `text` must contain at least 10 characters.
- `department` is optional.

### `POST /api/observations/{id}/implement`

```json
{
  "chosen_solution_id": "3af74bd9-906f-44d9-a422-4023f73d30c9"
}
```

Use a solution identifier returned in `previous_solutions` by the analysis route.

## Response payloads

### `GET /health` — `200`

```json
{"status": "ok", "version": "1.0.0"}
```

### `POST /api/observations` — `201`

```json
{
  "id": "9cf7c427-e01a-49dc-bff2-c88d5eb3f143",
  "status": "processing",
  "created_at": "2026-06-07T12:00:00Z"
}
```

Retain the returned `id` to request analysis during the same API process lifetime.

### `GET /api/observations/{id}/analysis` — `200`

```json
{
  "observation_id": "7b6950d4-f518-4a20-8dcf-29e3ca816fd9",
  "similar_issues": [
    {
      "id": "7b6950d4-f518-4a20-8dcf-29e3ca816fd9",
      "title": "Enterprise onboarding stalls at Salesforce administrator approval",
      "department": "Customer Success",
      "confidence": 0.95,
      "created_at": "2026-05-12T14:30:00Z"
    }
  ],
  "previous_solutions": [
    {
      "id": "3af74bd9-906f-44d9-a422-4023f73d30c9",
      "title": "Guided CRM Setup Recovery Playbook",
      "description": "Use Salesforce milestone data to trigger an Intercom walkthrough.",
      "owner": "Priya Raman",
      "reuse_confidence": 0.91
    }
  ],
  "overall_confidence_score": 0.87,
  "agent_trace": [
    {
      "agent_name": "Orchestrator",
      "status": "complete",
      "output_summary": "Classified the observation as a cross-functional onboarding retention risk and coordinated four specialist agents."
    }
  ]
}
```

The actual response includes three similar issues, two previous solutions, and five completed agent-trace entries.

### `POST /api/observations/{id}/implement` — `200`

```json
{
  "implementation_plan": "Apply Guided CRM Setup Recovery Playbook to the current onboarding risk using its proven operating model. Coordinate the rollout across teams and review activation and NPS results after 30 days.",
  "actions": [
    {"step": 1, "description": "Schedule kickoff with CS team", "owner": "Customer Success", "due_days": 3},
    {"step": 2, "description": "Configure Intercom onboarding flows", "owner": "Product", "due_days": 7},
    {"step": 3, "description": "Set NPS survey trigger at day 7", "owner": "Engineering", "due_days": 14},
    {"step": 4, "description": "Review metrics at 30-day mark", "owner": "Customer Success", "due_days": 30}
  ],
  "stakeholders": ["Customer Success", "Product", "Engineering"]
}
```

### `GET /api/dashboard` — `200`

```json
{
  "emerging_issues": [],
  "duplicate_projects": [],
  "savings_opportunities": {
    "total_issues_deflected": 27,
    "total_hours_saved": 340,
    "total_cost_saved_usd": 51000
  }
}
```

The normal mock-backed response includes populated `emerging_issues` and `duplicate_projects` arrays.

### Error response — `404` or `422`

```json
{"detail": "Observation not found"}
```

## Example curl commands

```bash
curl http://localhost:8000/health

curl -X POST http://localhost:8000/api/observations \
  -H "Content-Type: application/json" \
  -d '{"text":"Customer onboarding is causing churn and support load is increasing","submitted_by":"Jane Smith","department":"Customer Success"}'

curl http://localhost:8000/api/observations/7b6950d4-f518-4a20-8dcf-29e3ca816fd9/analysis

curl -X POST http://localhost:8000/api/observations/7b6950d4-f518-4a20-8dcf-29e3ca816fd9/implement \
  -H "Content-Type: application/json" \
  -d '{"chosen_solution_id":"3af74bd9-906f-44d9-a422-4023f73d30c9"}'

curl http://localhost:8000/api/dashboard
```
