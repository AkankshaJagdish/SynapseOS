BEGIN;

-- Stores employee observations submitted for SynapseOS analysis.
CREATE TABLE IF NOT EXISTS observations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    text TEXT NOT NULL,
    submitted_by VARCHAR(255) NOT NULL,
    department VARCHAR(255),
    status VARCHAR(50) DEFAULT 'processing',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stores enterprise projects that may contain reusable organizational knowledge.
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(500) NOT NULL,
    department VARCHAR(255),
    description TEXT,
    owner VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stores reusable solutions discovered from previous projects.
CREATE TABLE IF NOT EXISTS solutions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(500) NOT NULL,
    description TEXT,
    owner VARCHAR(255),
    related_project_id UUID REFERENCES projects(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stores each agent's execution status and summarized analysis output.
CREATE TABLE IF NOT EXISTS agent_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    observation_id UUID REFERENCES observations(id),
    agent_name VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    output_summary TEXT,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_solutions_related_project_id ON solutions (related_project_id);
CREATE INDEX IF NOT EXISTS idx_agent_runs_observation_id ON agent_runs (observation_id);

COMMIT;
