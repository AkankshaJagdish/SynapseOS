# SynapseOS MVP — Sequential AI Prompt Playbook
### Version 1.0 | Contract-First | Codex + Lovable

> **Golden Rule:** Never move to the next step until the current step's Human Validation Checklist is fully checked. A frozen demo loses. An ugly-but-working demo wins.

---

## PHASE 1 — CONTRACT FREEZE
> Goal: Generate every static contract file before a single line of logic is written. Judges test the seams between frontend and backend. Contracts eliminate those seams.

---

#### [Codex] — Step 1.1: Generate the OpenAPI Contract (YAML)

**Objective:** Produce the complete, frozen OpenAPI 3.1 YAML file defining every route, request body, and response schema for the entire SynapseOS API.

**Context Header Template to Copy-Paste:**
```
REPO STATE: Empty repository. No files exist yet.
TARGET FILE: /docs/openapi.yaml
FRAMEWORK: FastAPI (Python 3.11)
DEPENDENCY CONSTRAINT: No external packages beyond fastapi, pydantic v2, uvicorn.
```

**The Core Prompt:**
```text
You are a senior API architect. Generate a complete OpenAPI 3.1 YAML specification file saved to /docs/openapi.yaml.

Do NOT generate any Python code. Generate only the YAML contract.

The API must define exactly these four routes:

1. POST /api/observations
   - Request body: { "text": string (required, min 10 chars), "submitted_by": string (required), "department": string (optional) }
   - Response 201: { "id": string (uuid), "status": "processing", "created_at": string (ISO8601) }
   - Response 422: { "detail": string }

2. GET /api/observations/{id}/analysis
   - Path param: id (uuid string)
   - Response 200: { "observation_id": string, "similar_issues": [ { "id": string, "title": string, "department": string, "confidence": number (0.0-1.0), "created_at": string } ], "previous_solutions": [ { "id": string, "title": string, "description": string, "owner": string, "reuse_confidence": number (0.0-1.0) } ], "overall_confidence_score": number (0.0-1.0), "agent_trace": [ { "agent_name": string, "status": "pending"|"running"|"complete"|"error", "output_summary": string } ] }
   - Response 404: { "detail": string }

3. POST /api/observations/{id}/implement
   - Path param: id (uuid string)
   - Request body: { "chosen_solution_id": string }
   - Response 200: { "implementation_plan": string, "actions": [ { "step": number, "description": string, "owner": string, "due_days": number } ], "stakeholders": [ string ] }
   - Response 404: { "detail": string }

4. GET /api/dashboard
   - Response 200: { "emerging_issues": [ { "id": string, "title": string, "report_count": number, "departments": [string], "trend": "rising"|"stable"|"resolved" } ], "duplicate_projects": [ { "id": string, "title": string, "duplicate_count": number, "estimated_savings_hours": number } ], "savings_opportunities": { "total_issues_deflected": number, "total_hours_saved": number, "total_cost_saved_usd": number } }

Rules:
- Use components/schemas to define every object so the frontend team can reference them
- Add a realistic example value under each schema field
- Keep the file under 200 lines
- Do not invent any additional routes
```

**Human Validation Checklist:**
* [ ] Paste the YAML into https://editor.swagger.io and confirm zero validation errors
* [ ] Verify all 4 routes appear in the left panel with correct HTTP verbs

---

#### [Codex] — Step 1.2: Generate Pydantic Schemas from the Contract

**Objective:** Translate the frozen OpenAPI YAML into a single Python file containing all Pydantic v2 models — no logic, no DB calls, only types.

**Context Header Template to Copy-Paste:**
```
REPO STATE: /docs/openapi.yaml exists and is validated.
TARGET FILE: /backend/app/schemas.py
EXISTING FILES: /docs/openapi.yaml (read this first)
FRAMEWORK: FastAPI + Pydantic v2
```

**The Core Prompt:**
```text
You are a senior Python engineer. Read /docs/openapi.yaml and generate /backend/app/schemas.py.

Rules:
- Use Pydantic v2 syntax (model_config, not class Config)
- Do NOT import from sqlalchemy or any DB layer
- Do NOT define any functions or route handlers
- Every schema must map 1:1 to a component defined in openapi.yaml
- Add a Literal type for every enum field (e.g. status: Literal["processing"])
- Add Field(examples=[...]) annotations matching the example values in the YAML
- Keep file under 120 lines
- End the file with __all__ = [...] listing every exported class name

Do not modify any existing file. Create only /backend/app/schemas.py.
```

**Human Validation Checklist:**
* [ ] Run `python -c "from app.schemas import *; print('OK')"` — must print OK with zero errors
* [ ] Confirm `AgentTrace`, `SimilarIssue`, `PreviousSolution`, `DashboardResponse` all appear in `__all__`

---

#### [Codex] — Step 1.3: Generate the Database Schema Migration (SQL)

**Objective:** Create a single raw SQL migration file defining all tables — no ORM, no alembic complexity, just pure SQL the team can paste into Supabase.

**Context Header Template to Copy-Paste:**
```
REPO STATE: /docs/openapi.yaml, /backend/app/schemas.py exist.
TARGET FILE: /backend/migrations/001_initial_schema.sql
DATABASE: PostgreSQL 15 (Supabase)
```

**The Core Prompt:**
```text
You are a database architect. Generate /backend/migrations/001_initial_schema.sql.

Create exactly these tables with no extra columns:

1. observations (id UUID PK DEFAULT gen_random_uuid(), text TEXT NOT NULL, submitted_by VARCHAR(255) NOT NULL, department VARCHAR(255), status VARCHAR(50) DEFAULT 'processing', created_at TIMESTAMPTZ DEFAULT NOW())

2. projects (id UUID PK DEFAULT gen_random_uuid(), title VARCHAR(500) NOT NULL, department VARCHAR(255), description TEXT, owner VARCHAR(255), created_at TIMESTAMPTZ DEFAULT NOW())

3. solutions (id UUID PK DEFAULT gen_random_uuid(), title VARCHAR(500) NOT NULL, description TEXT, owner VARCHAR(255), related_project_id UUID REFERENCES projects(id), created_at TIMESTAMPTZ DEFAULT NOW())

4. agent_runs (id UUID PK DEFAULT gen_random_uuid(), observation_id UUID REFERENCES observations(id), agent_name VARCHAR(255) NOT NULL, status VARCHAR(50) DEFAULT 'pending', output_summary TEXT, started_at TIMESTAMPTZ DEFAULT NOW(), completed_at TIMESTAMPTZ)

Rules:
- Wrap all statements in a transaction (BEGIN / COMMIT)
- Add CREATE INDEX for foreign key columns
- Add a comment above each table explaining its purpose in one sentence
- File must be idempotent: wrap each CREATE TABLE with CREATE TABLE IF NOT EXISTS
- Keep file under 80 lines
- Do not create triggers, functions, or RLS policies
```

**Human Validation Checklist:**
* [ ] Paste the SQL into Supabase SQL Editor and execute — zero errors
* [ ] Confirm all 4 tables appear in the Supabase Table Editor UI

---

#### [Codex] — Step 1.4: Generate Mock Data JSON Seed File

**Objective:** Create a static JSON seed file with realistic demo data that the backend serves when the AI search layer returns no results — guaranteeing the demo always has visible data.

**Context Header Template to Copy-Paste:**
```
REPO STATE: /backend/migrations/001_initial_schema.sql exists.
TARGET FILE: /backend/app/mock_data.json
PURPOSE: Fallback demo data. Must make the demo look compelling even if all AI calls fail.
```

**The Core Prompt:**
```text
You are a product storyteller and data architect. Generate /backend/app/mock_data.json.

The scenario is: a large enterprise (Acme Corp) is suffering from customer onboarding churn.

Generate exactly this structure with realistic, specific, non-generic values:

{
  "observations": [ 3 observations about onboarding churn, support ticket spikes, and NPS drops — each with id, text (2 sentences minimum), submitted_by (realistic name), department, status: "complete", created_at ],
  "projects": [ 2 past projects that attempted to fix onboarding — include realistic titles like "Project Phoenix: Onboarding Redesign Q2 2023" ],
  "solutions": [ 2 solutions: one that worked (high reuse_confidence: 0.91), one that partially worked (reuse_confidence: 0.62) — include specific descriptions mentioning tooling like Intercom, Salesforce, or Jira ],
  "similar_issues": [ built from the observations above, each with confidence score between 0.70 and 0.95 ],
  "agent_trace": [ 5 entries, one per agent: Orchestrator, Memory, DuplicateDetection, SolutionDiscovery, Action — each with status: "complete" and a specific output_summary sentence ],
  "dashboard": { matching the DashboardResponse schema exactly, with total_hours_saved: 340, total_cost_saved_usd: 51000 }
}

Rules:
- Every string must be specific and story-consistent, not placeholder text
- No "lorem ipsum" or "example" strings
- Confidence scores must vary (not all 0.9)
- File must be valid JSON — no comments
- Keep under 150 lines
```

**Human Validation Checklist:**
* [ ] Run `python -c "import json; json.load(open('backend/app/mock_data.json')); print('valid')"` — prints "valid"
* [ ] Read through the dashboard object and confirm `total_cost_saved_usd` is present and non-zero

---

## PHASE 2 — BACKEND CONSTRUCTION
> Goal: Build the FastAPI backend endpoint by endpoint against the frozen contract. Never touch a file that already passes validation.

---

#### [Codex] — Step 2.1: FastAPI Application Skeleton

**Objective:** Create the bare FastAPI `main.py` with CORS, health check, and router mounting — no business logic.

**Context Header Template to Copy-Paste:**
```
REPO STATE: /backend/app/schemas.py, /backend/app/mock_data.json exist.
TARGET FILE: /backend/app/main.py
EXISTING IMPORTS AVAILABLE: schemas.py exports listed in __all__
DEPLOYMENT TARGET: Railway (port from env var PORT, default 8000)
```

**The Core Prompt:**
```text
You are a senior FastAPI engineer. Create /backend/app/main.py.

Requirements:
- Import FastAPI, CORSMiddleware
- Allow all origins (CORS) — this is a hackathon demo
- Mount a router from /backend/app/routers/observations.py (do not create that file yet — just import and mount it with prefix="/api")
- Add GET /health returning {"status": "ok", "version": "1.0.0"}
- Read port from os.environ.get("PORT", 8000)
- Add a lifespan context manager that prints "SynapseOS API starting..." on startup
- Do NOT add any business logic
- Do NOT add authentication middleware
- Keep file under 50 lines
- Include a comment at the top: # DO NOT MODIFY — skeleton only. Add logic in routers/.
```

**Human Validation Checklist:**
* [ ] Run `uvicorn app.main:app --reload` — server starts on port 8000 with no import errors
* [ ] `curl http://localhost:8000/health` returns `{"status":"ok","version":"1.0.0"}`

---

#### [Codex] — Step 2.2: POST /api/observations Endpoint

**Objective:** Implement only the observation creation endpoint — validates input, inserts to DB (or mock), returns 201.

**Context Header Template to Copy-Paste:**
```
REPO STATE: /backend/app/main.py, /backend/app/schemas.py, /backend/app/mock_data.json exist.
TARGET FILE: /backend/app/routers/observations.py (CREATE NEW)
SCHEMAS TO USE: ObservationCreate, ObservationCreatedResponse (from schemas.py)
DB: Supabase. Connection string in env var SUPABASE_URL and SUPABASE_KEY.
FALLBACK: If DB unavailable, return a mock response using data from mock_data.json — never crash.
```

**The Core Prompt:**
```text
You are a senior FastAPI engineer. Create /backend/app/routers/observations.py.

Implement exactly ONE route: POST /observations

Logic:
1. Validate request body against ObservationCreate schema (Pydantic handles this — you don't need manual checks)
2. Attempt to insert into Supabase using the supabase-py client
3. If insert succeeds: return 201 with ObservationCreatedResponse
4. If insert fails (any exception): log the error with Python logging module, then return a mock ObservationCreatedResponse using the first observation id from mock_data.json — set status to "processing"
5. Never return a 500 to the client. Fallback silently.

Rules:
- Use APIRouter(prefix="", tags=["observations"])
- Wrap the DB call in try/except Exception as e
- Import mock_data.json using json.load at module level (not inside the function)
- Do NOT implement any other routes in this file yet
- Keep function body under 30 lines
- Add a module-level comment: # Observations router — POST only. GET analysis added in Step 2.3.
```

**Human Validation Checklist:**
* [ ] `curl -X POST http://localhost:8000/api/observations -H "Content-Type: application/json" -d '{"text":"Customer onboarding is causing churn and support load is increasing","submitted_by":"Jane Smith"}'` — returns 201 with an id field
* [ ] Disconnect Supabase (wrong key) and repeat the curl — still returns 201 (mock fallback)

---

#### [Codex] — Step 2.3: GET /api/observations/{id}/analysis Endpoint

**Objective:** Add the analysis route that triggers agent simulation and returns structured results with agent trace.

**Context Header Template to Copy-Paste:**
```
REPO STATE: /backend/app/routers/observations.py exists with POST /observations.
TARGET FILE: /backend/app/routers/observations.py (APPEND ONLY — do not rewrite the file)
SCHEMAS TO USE: AnalysisResponse, AgentTrace, SimilarIssue, PreviousSolution (from schemas.py)
MOCK DATA: /backend/app/mock_data.json already imported at module level
CONSTRAINT: mock_data.json is already imported — do not re-import it.
```

**The Core Prompt:**
```text
You are a senior FastAPI engineer. APPEND a new route to the EXISTING /backend/app/routers/observations.py file. Do NOT rewrite the file. Only add code after the last line.

Add: GET /observations/{id}/analysis

Logic:
1. Accept id as a UUID path parameter
2. Attempt to query Supabase for the observation by id
3. Run agent simulation: call a private async function _run_agent_simulation(observation_text: str) -> list[AgentTrace] that:
   - Returns a list of 5 AgentTrace objects (one per agent: Orchestrator, Memory, DuplicateDetection, SolutionDiscovery, Action)
   - Sets each agent status to "complete"
   - Uses output_summary strings from mock_data.json["agent_trace"]
   - This function must use asyncio.sleep(0.1) between each agent to simulate processing
4. Build AnalysisResponse using mock similar_issues and previous_solutions from mock_data.json
5. Set overall_confidence_score to 0.87
6. Return 200 with AnalysisResponse
7. If observation id not found in DB AND not in mock_data.json: return 404 with detail "Observation not found"

Rules:
- Do NOT rewrite the POST route already in this file
- Keep the new function body under 40 lines
- The _run_agent_simulation function must be defined ABOVE the route handler
- Add inline comment: # Real AI search would replace mock data here — Azure AI Search hook point
```

**Human Validation Checklist:**
* [ ] `curl http://localhost:8000/api/observations/{id}/analysis` with a valid id — returns JSON with `agent_trace` array of 5 items
* [ ] Confirm each agent in the trace has `status: "complete"` and a non-empty `output_summary`

---

#### [Codex] — Step 2.4: POST /api/observations/{id}/implement Endpoint

**Objective:** Add the implementation plan generation route — the "so what do we do about it" answer judges will click.

**Context Header Template to Copy-Paste:**
```
REPO STATE: /backend/app/routers/observations.py has POST and GET analysis routes.
TARGET FILE: /backend/app/routers/observations.py (APPEND ONLY)
SCHEMAS TO USE: ImplementRequest, ImplementResponse, ActionItem (from schemas.py)
```

**The Core Prompt:**
```text
APPEND to the EXISTING /backend/app/routers/observations.py. Do not touch any existing code.

Add: POST /observations/{id}/implement

Logic:
1. Accept id (UUID path param) and ImplementRequest body ({ "chosen_solution_id": str })
2. Look up the chosen solution in mock_data.json["solutions"] by id
3. If not found: return 404
4. Generate an ImplementResponse with:
   - implementation_plan: a 2-sentence string describing how to apply the solution
   - actions: exactly 4 ActionItem objects with realistic steps (e.g., "Schedule kickoff with CS team", "Configure Intercom onboarding flows", "Set NPS survey trigger at day 7", "Review metrics at 30-day mark") — due_days should be 3, 7, 14, 30
   - stakeholders: ["Customer Success", "Product", "Engineering"]
5. Return 200

Rules:
- Do NOT use any LLM call — build the response from mock data deterministically
- Keep function body under 25 lines
- Add comment: # LLM-generated plan hook point — replace static response with Claude/GPT call for live demo upgrade
```

**Human Validation Checklist:**
* [ ] POST to `/api/observations/{id}/implement` with a valid solution id — returns `actions` array with 4 items
* [ ] Confirm `due_days` values are 3, 7, 14, 30 in order

---

#### [Codex] — Step 2.5: GET /api/dashboard Endpoint

**Objective:** Create the dashboard router returning aggregate metrics — the first screen judges will see.

**Context Header Template to Copy-Paste:**
```
REPO STATE: /backend/app/routers/observations.py is complete.
TARGET FILE: /backend/app/routers/dashboard.py (CREATE NEW)
SCHEMAS TO USE: DashboardResponse (from schemas.py)
Mount this router in main.py after creation — add that instruction explicitly.
```

**The Core Prompt:**
```text
Create /backend/app/routers/dashboard.py.

Implement exactly ONE route: GET /dashboard

Logic:
1. Return DashboardResponse populated from mock_data.json["dashboard"]
2. Wrap in try/except: if mock data parse fails, return hardcoded fallback with total_cost_saved_usd: 51000 and total_issues_deflected: 12
3. No DB call required for MVP

ALSO: After creating this file, provide me the exact 2 lines to add to /backend/app/main.py to import and mount this router. Do not rewrite main.py — provide only the 2 lines to insert and the exact location (after the existing router mount line).

Rules:
- Keep file under 35 lines
- Add APIRouter with tag "dashboard"
```

**Human Validation Checklist:**
* [ ] `curl http://localhost:8000/api/dashboard` returns JSON with `savings_opportunities.total_cost_saved_usd` = 51000
* [ ] `curl http://localhost:8000/docs` — Swagger UI shows all 4 routes with correct schemas

---

#### [Codex] — Step 2.6: requirements.txt + Dockerfile

**Objective:** Lock all dependencies and containerize for Railway deployment.

**Context Header Template to Copy-Paste:**
```
REPO STATE: All backend files exist. /backend/app/ contains main.py, schemas.py, mock_data.json, routers/observations.py, routers/dashboard.py.
TARGET FILES: /backend/requirements.txt and /backend/Dockerfile
```

**The Core Prompt:**
```text
Generate two files:

FILE 1: /backend/requirements.txt
Include only these packages with pinned minor versions:
- fastapi==0.111.*
- uvicorn[standard]==0.29.*
- pydantic==2.7.*
- supabase==2.4.*
- python-dotenv==1.0.*

No other packages. Do not add httpx, requests, or any AI SDKs.

FILE 2: /backend/Dockerfile
- Base image: python:3.11-slim
- WORKDIR /app
- Copy requirements.txt first (layer cache optimization)
- RUN pip install --no-cache-dir -r requirements.txt
- Copy . .
- EXPOSE 8000
- CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

Rules:
- No multi-stage build (keep it simple for hackathon)
- No ENTRYPOINT — use CMD only
- Add a .dockerignore alongside: __pycache__, *.pyc, .env, .git
```

**Human Validation Checklist:**
* [ ] `docker build -t synapseos-backend ./backend` — builds with no errors
* [ ] `docker run -p 8000:8000 synapseos-backend` — `/health` responds correctly

---

## PHASE 3 — FRONTEND CONSTRUCTION (LOVABLE)
> Goal: Build the React/TypeScript UI component by component. Each prompt targets one component. Contract compliance is mandatory — never invent API fields.

---

#### [Lovable] — Step 3.1: Project Scaffold + API Client

**Objective:** Initialize the Lovable project with TypeScript strict mode and generate a single typed API client file that all components will import — eliminating ad-hoc fetch calls.

**Context Header Template to Copy-Paste:**
```
LOVABLE PROJECT STATE: Blank new project. No components exist.
BACKEND URL: Will be injected from VITE_API_URL env variable.
CONTRACT REFERENCE: Paste the full contents of /docs/openapi.yaml here.
```

**The Core Prompt:**
```text
You are a senior TypeScript React engineer. Set up a new Lovable project and create exactly ONE file: src/lib/api.ts

This file is the ONLY place in the entire app that calls fetch(). All components must import from this file.

Create these typed functions using the exact response shapes from the OpenAPI contract (pasted above):

1. async function createObservation(payload: { text: string; submitted_by: string; department?: string }): Promise<ObservationCreatedResponse>

2. async function getAnalysis(id: string): Promise<AnalysisResponse>

3. async function implementSolution(id: string, chosen_solution_id: string): Promise<ImplementResponse>

4. async function getDashboard(): Promise<DashboardResponse>

Rules:
- Export all 4 functions and all response types
- Base URL from: const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api"
- Every function must have a try/catch — on error, throw a new Error with the response status code and a human-readable message
- Use TypeScript interfaces (not type aliases) for all response shapes
- No axios, no react-query, no external HTTP libraries — native fetch only
- Keep the file under 100 lines
- Add JSDoc comment above each function describing what it does in one sentence
- Enable strict mode in tsconfig.json: "strict": true, "noImplicitAny": true
```

**Human Validation Checklist:**
* [ ] `npx tsc --noEmit` in the project root — zero TypeScript errors
* [ ] Open browser console and manually call `import('/src/lib/api.ts').then(m => m.getDashboard()).then(console.log)` — returns mock data object

---

#### [Lovable] — Step 3.2: Global Layout Shell + Navigation

**Objective:** Build the persistent app shell with sidebar navigation — the frame every other component lives inside.

**Context Header Template to Copy-Paste:**
```
LOVABLE PROJECT STATE: src/lib/api.ts exists. No UI components exist yet.
TARGET FILE: src/components/AppShell.tsx
ROUTES NEEDED: /dashboard, /submit, /analysis/:id
```

**The Core Prompt:**
```text
Create src/components/AppShell.tsx — a layout wrapper component.

Visual requirements:
- Dark sidebar (bg: #0F1117) 240px wide, fixed position
- Sidebar contains: SynapseOS logo text (bold, white, 18px), and 3 nav links: "Dashboard" (icon: LayoutDashboard), "Submit Observation" (icon: PlusCircle), "Analysis" (icon: Brain) — use lucide-react icons
- Active nav link has a left border accent (3px, color: #6C63FF) and slightly lighter background
- Main content area takes remaining width, bg: #1A1D27, min-height: 100vh
- Top bar inside main content: 60px tall, bg: #1A1D27, border-bottom: 1px solid #2A2D3A, contains breadcrumb text showing current page name
- Use React Router v6 <Outlet /> for child routes

Strict rules:
- TypeScript only — every prop must have an explicit type
- No inline styles — use Tailwind classes exclusively
- No external component libraries (no shadcn, no MUI) — build from scratch
- Add an ErrorBoundary wrapper around <Outlet /> that shows a styled error card instead of a blank white screen
- Mobile: sidebar collapses to a hamburger menu at <768px breakpoint
- Keep file under 120 lines — extract sub-components into the same file if needed
```

**Human Validation Checklist:**
* [ ] Navigate to /dashboard in browser — sidebar renders with all 3 links
* [ ] Resize browser to 400px wide — sidebar collapses correctly, hamburger appears

---

#### [Lovable] — Step 3.3: Observation Submission Form

**Objective:** Build the observation input form with validation, loading state, and success redirect — the primary demo entry point.

**Context Header Template to Copy-Paste:**
```
LOVABLE PROJECT STATE: src/lib/api.ts and src/components/AppShell.tsx exist.
TARGET FILE: src/pages/SubmitPage.tsx
API FUNCTION TO USE: createObservation() from src/lib/api.ts
ROUTE: /submit
```

**The Core Prompt:**
```text
Create src/pages/SubmitPage.tsx — the observation submission page.

UI Layout:
- Centered card, max-width 640px, dark card bg (#1E2130), rounded-xl, padding 32px
- Title: "Report an Observation" — large, white, bold
- Subtitle: "Describe an issue or pattern you've noticed. SynapseOS will find existing solutions." — muted gray text
- Form fields:
  1. Textarea: "Observation" — min 10 chars validation, placeholder "Customer onboarding is causing increased support tickets and churn...", 5 rows, required
  2. Text input: "Your Name" — required
  3. Text input: "Department" — optional, placeholder "e.g. Customer Success"
- Submit button: full-width, bg: #6C63FF, hover: #5A52E0, text: "Analyze with SynapseOS →"

Interaction states:
- IDLE: Form is editable, button is active
- LOADING: Button shows a spinner (animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4) and text "Analyzing...", all inputs disabled
- ERROR: Red banner above the form showing the error message from the API
- SUCCESS: Navigate to /analysis/{returned_id} using useNavigate()

Strict rules:
- Use React useState for form state — no form library
- Call createObservation() from src/lib/api.ts — do NOT write a fetch call inline
- TypeScript: all state variables must be typed
- Never show a blank screen — ERROR state must always display something
- Keep file under 100 lines
```

**Human Validation Checklist:**
* [ ] Submit form with fewer than 10 characters in the textarea — validation error appears before API is called
* [ ] Submit a valid form — spinner appears, then browser navigates to /analysis/{id}

---

#### [Lovable] — Step 3.4: Agent Execution Visualizer Component

**Objective:** Build the animated agent trace visualizer — the most visually impressive element judges will screenshot.

**Context Header Template to Copy-Paste:**
```
LOVABLE PROJECT STATE: src/lib/api.ts, AppShell, SubmitPage exist.
TARGET FILE: src/components/AgentTrace.tsx
INPUT DATA SHAPE: AgentTrace[] from src/lib/api.ts (fields: agent_name, status, output_summary)
```

**The Core Prompt:**
```text
Create src/components/AgentTrace.tsx — a reusable component that visualizes multi-agent execution.

Props interface:
interface AgentTraceProps {
  agents: AgentTrace[]; // import AgentTrace type from src/lib/api.ts
  isLoading: boolean;
}

Visual design:
- Vertical timeline layout with a connecting line between agents (2px, color: #2A2D3A)
- Each agent node: circle icon (32px) on the left, agent name + output_summary on the right
- Status → visual mapping:
  - "pending": circle bg #2A2D3A, gray dot inside, text muted
  - "running": circle bg #1A3A5C, animated pulse ring (Tailwind animate-ping), text white, badge "Running" in blue
  - "complete": circle bg #1A3A1A, green checkmark (✓), text white, badge "Done" in green
  - "error": circle bg #3A1A1A, red X, text white, badge "Error" in red
- Agent names: styled with specific icons from lucide-react:
  - Orchestrator → Network
  - Memory → Database
  - DuplicateDetection → Copy
  - SolutionDiscovery → Search
  - Action → Zap
- SKELETON STATE (isLoading=true): Show 5 skeleton rows using animate-pulse with bg-gray-700 placeholder rectangles — no empty white space

Strict rules:
- Accept only the typed props above — no any types
- Pure display component — no API calls inside this component
- Keep under 80 lines
- Export as default
```

**Human Validation Checklist:**
* [ ] Render `<AgentTrace agents={[]} isLoading={true} />` — 5 skeleton rows appear, no layout breaks
* [ ] Render with all 5 agents at status "complete" — green checkmarks show on all, connecting line is unbroken

---

#### [Lovable] — Step 3.5: Analysis Results Page

**Objective:** Build the full analysis page that polls for results, shows the agent trace live, and displays similar issues and solution cards.

**Context Header Template to Copy-Paste:**
```
LOVABLE PROJECT STATE: api.ts, AppShell, AgentTrace component all exist and are working.
TARGET FILE: src/pages/AnalysisPage.tsx
ROUTE: /analysis/:id
API FUNCTION: getAnalysis(id) from src/lib/api.ts
COMPONENTS TO IMPORT: AgentTrace from src/components/AgentTrace.tsx
```

**The Core Prompt:**
```text
Create src/pages/AnalysisPage.tsx.

Data fetching:
- Extract id from useParams()
- Call getAnalysis(id) once on mount using useEffect
- Show AgentTrace in LOADING skeleton state while fetch is in progress
- On data received: animate agents from "pending" → "complete" sequentially, 400ms apart, using setInterval + useState index counter
- On error: show a full-width error card with retry button

Layout (3 sections, stacked vertically):

SECTION 1 — Agent Execution (full width)
- Title: "Agent Execution Trace"
- Render <AgentTrace agents={data.agent_trace} isLoading={isLoading} />

SECTION 2 — Similar Issues (left column, 60% width on desktop)
- Title: "Similar Issues Found" + badge showing count
- For each similar_issue: card with title, department badge, confidence bar (0-100% fill, color from green→yellow→red based on value), created_at date
- If no issues: empty state card "No similar issues detected"

SECTION 3 — Existing Solutions (right column, 40% width on desktop)
- Title: "Reusable Solutions"
- For each solution: card with title, owner, reuse_confidence percentage, and "Apply This Solution →" button
- Clicking "Apply This Solution →" calls implementSolution(id, solution.id) and navigates to a success toast — do NOT navigate away from the page

Strict rules:
- TypeScript: all useState hooks must be typed
- Button click handler: show loading spinner on the button while implementSolution() is in flight
- Never crash on undefined data — use optional chaining (?.) throughout
- Skeleton placeholders for all 3 sections while loading
- Keep file under 150 lines — extract SimilarIssueCard and SolutionCard into the same file as unexported sub-components
```

**Human Validation Checklist:**
* [ ] Load /analysis/{valid-id} — skeleton appears first, then agents animate in sequence with 400ms delays
* [ ] Click "Apply This Solution →" — button shows spinner, then success toast appears without page navigation

---

#### [Lovable] — Step 3.6: Manager Dashboard Page

**Objective:** Build the dashboard page with three stat cards and two data tables — the first thing judges see when the demo loads.

**Context Header Template to Copy-Paste:**
```
LOVABLE PROJECT STATE: All previous components exist.
TARGET FILE: src/pages/DashboardPage.tsx
ROUTE: /dashboard (this is the default route — redirect / → /dashboard)
API FUNCTION: getDashboard() from src/lib/api.ts
```

**The Core Prompt:**
```text
Create src/pages/DashboardPage.tsx.

Data: Call getDashboard() on mount. Show skeleton while loading.

Layout:

ROW 1 — KPI Cards (3 cards, equal width):
Card 1: "Issues Deflected" — value: savings_opportunities.total_issues_deflected, icon: ShieldCheck (lucide), accent color: #6C63FF
Card 2: "Hours Saved" — value: savings_opportunities.total_hours_saved, icon: Clock, accent color: #22D3EE
Card 3: "Cost Avoided" — value: "$" + savings_opportunities.total_cost_saved_usd.toLocaleString(), icon: DollarSign, accent color: #4ADE80

Each KPI card: dark bg (#1E2130), rounded-xl, padding 24px, accent color left border (4px), large number (32px bold white), label below in muted gray. SKELETON: same card shape with animate-pulse gray rectangles.

ROW 2 — Emerging Issues Table (full width):
- Title: "Emerging Issues" with a pulsing red dot if any trend === "rising"
- Table columns: Issue | Departments | Reports | Trend
- Trend column: colored badge — "rising" = red, "stable" = yellow, "resolved" = green
- If empty: "No emerging issues detected" row spanning full width

ROW 3 — Duplicate Projects Table (full width):
- Title: "Duplicate Work Detected"
- Table columns: Project | Duplicates Found | Estimated Hours Wasted
- Hours Wasted displayed as bold red text

Strict rules:
- All table data must come from getDashboard() response — no hardcoded values
- Responsive: tables scroll horizontally on mobile (overflow-x-auto)
- TypeScript: DashboardResponse imported from api.ts
- Error state: show a styled error card with "Unable to load dashboard" and a Retry button that re-calls getDashboard()
- Keep file under 130 lines
```

**Human Validation Checklist:**
* [ ] Load /dashboard — 3 KPI cards show correct values from the API ($51,000 cost avoided)
* [ ] Resize to mobile — tables scroll horizontally without breaking layout

---

#### [Lovable] — Step 3.7: Polish Pass — Empty States, Error Boundaries, and Loading Consistency

**Objective:** Final sweep to eliminate all blank white screens and ensure the app looks production-grade under any network condition.

**Context Header Template to Copy-Paste:**
```
LOVABLE PROJECT STATE: All pages and components exist and are functionally complete.
FILES TO AUDIT (read-only during this step): src/pages/DashboardPage.tsx, src/pages/AnalysisPage.tsx, src/pages/SubmitPage.tsx, src/components/AgentTrace.tsx
TARGET FILES FOR MODIFICATION: Only files where issues are found.
RULE: Surgical edits only — do not rewrite any file entirely.
```

**The Core Prompt:**
```text
You are a QA engineer doing a final polish pass. READ each file listed in the context header. Do NOT rewrite any file. Make only surgical insertions to fix the following 5 issues:

1. GLOBAL ERROR BOUNDARY: Verify src/components/AppShell.tsx wraps <Outlet /> in an ErrorBoundary. If missing, add a minimal class-based ErrorBoundary component (30 lines max) at the top of the AppShell file and wrap the Outlet.

2. EMPTY STATE CONSISTENCY: In every .tsx page file, find any JSX section that renders a list (map() call). If there is no explicit empty-state JSX for when the array is empty, add a simple centered card with a muted icon and "No data available" text.

3. LOADING STATE AUDIT: Find any useEffect that fetches data. If the loading spinner/skeleton disappears BEFORE the data has been assigned to state (race condition), fix the ordering: set loading=true before fetch, set loading=false in the finally{} block, not in the try{} block.

4. BUTTON DOUBLE-SUBMIT PREVENTION: Find every <button> that triggers an async function. If it does not have disabled={isLoading} prop, add it. This prevents judges from clicking twice and causing duplicate API calls.

5. CONSOLE.LOG REMOVAL: Search all files for console.log statements. Remove all of them. Replace any debug logging with a no-op comment: // debug removed.

For each fix: show only the before snippet and after snippet — do not reproduce the entire file.
```

**Human Validation Checklist:**
* [ ] Open browser DevTools console — zero console.log output during normal app usage
* [ ] Throttle network to "Slow 3G" in DevTools — every page shows skeleton/spinner, never a blank white screen

---

## APPENDIX A — Environment Variables Reference

| Variable | Where Used | Example Value |
|---|---|---|
| `SUPABASE_URL` | Backend | `https://xxxx.supabase.co` |
| `SUPABASE_KEY` | Backend | `eyJh...` |
| `PORT` | Backend (Railway) | `8000` |
| `VITE_API_URL` | Frontend | `https://synapseos-api.railway.app/api` |

---

## APPENDIX B — Demo Script (60-Second Judge Flow)

> Brief judges use this exact path. Ensure it works end-to-end before any presentation.

1. Open `/dashboard` — point to "$51,000 cost avoided" KPI card **(5 seconds)**
2. Click "Submit Observation" — paste the onboarding churn text, submit **(10 seconds)**
3. Watch agent trace animate: Orchestrator → Memory → DuplicateDetection → SolutionDiscovery → Action **(15 seconds)**
4. Point to "Similar Issues Found" — "Three other teams reported this same issue" **(10 seconds)**
5. Click "Apply This Solution →" on the high-confidence solution **(5 seconds)**
6. Show implementation plan with 4 timestamped actions **(10 seconds)**
7. Return to dashboard — show updated metrics **(5 seconds)**

---

## APPENDIX C — Failure Recovery Playbook

| Failure Mode | Recovery Action |
|---|---|
| Supabase down | Mock data fallback is active — demo continues normally |
| Backend crashes | Restart Railway — Dockerfile guarantees clean boot in <30s |
| API returns 500 | Frontend error boundaries show styled error card — never blank |
| Lovable deploy fails | Run `npm run build && npx serve dist` locally for offline demo |
| Agent trace doesn't animate | Check useInterval cleanup — reload page, animation resets to start |

---

*SynapseOS MVP Prompt Playbook — Ready for Hackathon Execution*
*Total steps: 17 | Estimated build time with AI tools: 6–8 hours*
