# Observations router — POST only. GET analysis added in Step 2.3.

import asyncio
import json
import logging
from datetime import datetime, timezone
from pathlib import Path
from uuid import UUID, uuid4

from fastapi import APIRouter, HTTPException, status

from app.schemas import (
    Action,
    AgentTrace,
    AnalysisResponse,
    ImplementRequest,
    ImplementResponse,
    ObservationCreate,
    ObservationCreatedResponse,
    PreviousSolution,
    SimilarIssue,
)

router = APIRouter(prefix="", tags=["observations"])
logger = logging.getLogger(__name__)
MOCK_DATA_PATH = Path(__file__).resolve().parents[1] / "mock_data.json"
with MOCK_DATA_PATH.open(encoding="utf-8") as mock_file:
    mock_data = json.load(mock_file)

observations_by_id: dict[str, dict] = {
    observation["id"]: observation.copy() for observation in mock_data["observations"]
}


@router.post(
    "/observations",
    response_model=ObservationCreatedResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_observation(observation: ObservationCreate) -> ObservationCreatedResponse:
    created_at = datetime.now(timezone.utc)
    observation_id = uuid4()
    try:
        observations_by_id[str(observation_id)] = {
            "id": str(observation_id),
            **observation.model_dump(),
            "status": "processing",
            "created_at": created_at.isoformat(),
        }
    except Exception as error:
        logger.warning("In-memory observation persistence unavailable: %s", error)
        observation_id = UUID(mock_data["observations"][0]["id"])
    return ObservationCreatedResponse(id=observation_id, status="processing", created_at=created_at)


async def _run_agent_simulation(_observation_text: str) -> list[AgentTrace]:
    trace = []
    for agent in mock_data["agent_trace"]:
        trace.append(
            AgentTrace(
                agent_name=agent["agent_name"],
                status="complete",
                output_summary=agent["output_summary"],
            )
        )
        await asyncio.sleep(0.1)
    return trace


@router.get("/observations/{id}/analysis", response_model=AnalysisResponse)
async def get_observation_analysis(id: UUID) -> AnalysisResponse:
    observation = observations_by_id.get(str(id))
    if observation is None:
        raise HTTPException(status_code=404, detail="Observation not found")
    # Real AI search would replace mock data here — Azure AI Search hook point
    previous_solutions = [
        PreviousSolution(
            id=item["id"], title=item["title"], description=item["description"],
            owner=item["owner"], reuse_confidence=item["reuse_confidence"],
        )
        for item in mock_data["solutions"]
    ]
    return AnalysisResponse(
        observation_id=str(id),
        similar_issues=[SimilarIssue.model_validate(item) for item in mock_data["similar_issues"]],
        previous_solutions=previous_solutions,
        overall_confidence_score=0.87,
        agent_trace=await _run_agent_simulation(observation["text"]),
    )


@router.post("/observations/{id}/implement", response_model=ImplementResponse)
async def implement_solution(id: UUID, request: ImplementRequest) -> ImplementResponse:
    del id
    solution = next(
        (item for item in mock_data["solutions"] if item["id"] == request.chosen_solution_id),
        None,
    )
    if solution is None:
        raise HTTPException(status_code=404, detail="Solution not found")
    # LLM-generated plan hook point — replace static response with Claude/GPT call for live demo upgrade
    return ImplementResponse(
        implementation_plan=f"Apply {solution['title']} to the current onboarding risk using its proven operating model. Coordinate the rollout across teams and review activation and NPS results after 30 days.",
        actions=[
            Action(step=1, description="Schedule kickoff with CS team", owner="Customer Success", due_days=3),
            Action(step=2, description="Configure Intercom onboarding flows", owner="Product", due_days=7),
            Action(step=3, description="Set NPS survey trigger at day 7", owner="Engineering", due_days=14),
            Action(step=4, description="Review metrics at 30-day mark", owner="Customer Success", due_days=30),
        ],
        stakeholders=["Customer Success", "Product", "Engineering"],
    )
