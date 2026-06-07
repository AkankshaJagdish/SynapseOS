import json
from pathlib import Path

from fastapi import APIRouter

from app.schemas import DashboardResponse

router = APIRouter(prefix="", tags=["dashboard"])
MOCK_DATA_PATH = Path(__file__).resolve().parents[1] / "mock_data.json"


@router.get("/dashboard", response_model=DashboardResponse)
async def get_dashboard() -> DashboardResponse:
    try:
        with MOCK_DATA_PATH.open(encoding="utf-8") as mock_file:
            return DashboardResponse.model_validate(json.load(mock_file)["dashboard"])
    except Exception:
        return DashboardResponse.model_validate({
            "emerging_issues": [],
            "duplicate_projects": [],
            "savings_opportunities": {
                "total_issues_deflected": 12,
                "total_hours_saved": 340,
                "total_cost_saved_usd": 51000,
            },
        })
