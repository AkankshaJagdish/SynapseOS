# SynapseOS Architecture

## Purpose

SynapseOS prevents organizations from repeatedly solving the same problem. The MVP captures observations, searches organizational memory for related work, discovers reusable solutions, and makes agent orchestration visible in a single analysis result.

## System Overview

```text
User Observation
       ↓
Memory Agent
       ↓
Duplicate Detection Agent
       ↓
Solution Discovery Agent
       ↓
Orchestrator
       ↓
Analysis Result
```

The system begins with a plain-language observation. Specialized agents retrieve relevant organizational knowledge, identify likely duplicate work, and surface existing solutions. The orchestrator coordinates those agents and returns their findings, confidence scores, and trace to the requester.

## Component Responsibilities

| Component | Responsibility |
| --- | --- |
| User Observation | Captures a problem statement with submitter and department context. |
| Memory Agent | Retrieves related incidents, decisions, and prior organizational knowledge. |
| Duplicate Detection Agent | Compares the observation with known issues and projects to identify likely duplication. |
| Solution Discovery Agent | Finds previous solutions that may be reused and estimates reuse confidence. |
| Orchestrator | Coordinates agent execution and combines outputs into a consistent analysis result. |
| Analysis Result | Presents similar issues, previous solutions, confidence, and a visible agent trace. |
| Dashboard | Summarizes emerging issues, duplicate projects, and savings opportunities. |

## API Flow

1. A client submits an observation with `POST /api/observations`.
2. The API accepts the observation and returns its identifier with a `processing` status.
3. The orchestrator invokes the Memory Agent, Duplicate Detection Agent, and Solution Discovery Agent.
4. Each agent contributes findings and a trace entry to the analysis.
5. The client retrieves the completed result with `GET /api/observations/{id}/analysis`.
6. Aggregated discovery signals are exposed through `GET /api/dashboard`.
7. Service availability is checked through `GET /health`.

The OpenAPI contract in `docs/openapi.yaml` is the source of truth for request and response shapes.

## Microsoft Mapping

| Microsoft capability | SynapseOS role |
| --- | --- |
| Teams | User interface (future) |
| Microsoft Graph | Knowledge ingestion (future) |
| Azure AI Search | Similar issue retrieval |
| Azure AI Foundry | Agent hosting |
| Azure AI Agent Service | Multi-agent execution |
| Semantic Kernel | Orchestration |
| Fabric | Dashboard analytics |

## Future Roadmap

1. **MVP contract implementation:** Implement the frozen API contract and demonstrate observation analysis with visible agent traces.
2. **Knowledge retrieval:** Connect Azure AI Search to curated organizational memory sources.
3. **Agent hosting and orchestration:** Host agents in Azure AI Foundry and coordinate multi-agent execution with Azure AI Agent Service and Semantic Kernel.
4. **Knowledge ingestion:** Add permission-aware ingestion from Microsoft Graph.
5. **User access:** Add a Teams-based interface for submitting observations and reviewing results.
6. **Analytics:** Use Fabric to power dashboard analytics for emerging issues, duplicate projects, and savings opportunities.

The roadmap remains focused on organizational memory, duplicate-work detection, existing-solution discovery, and visible agent orchestration. Budget governance, employee ledgers, compliance systems, reporting systems, workflow automation, and a full enterprise operating system are outside the MVP scope.
