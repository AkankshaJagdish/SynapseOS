"""Pydantic v2 models generated from the frozen SynapseOS API contract."""

from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class ErrorResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")
    detail: str = Field(examples=["Observation not found"])


class ObservationCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")
    text: str = Field(min_length=10, examples=["New customers are abandoning onboarding before connecting Salesforce."])
    submitted_by: str = Field(examples=["Maya Chen"])
    department: str | None = Field(default=None, examples=["Customer Success"])


class ObservationCreatedResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")
    id: UUID = Field(examples=["7b6950d4-f518-4a20-8dcf-29e3ca816fd9"])
    status: Literal["processing"] = Field(examples=["processing"])
    created_at: datetime = Field(examples=["2026-06-07T09:15:00Z"])


class SimilarIssue(BaseModel):
    model_config = ConfigDict(extra="forbid")
    id: str = Field(examples=["obs-onboarding-churn"])
    title: str = Field(examples=["Onboarding abandonment after CRM connection step"])
    department: str = Field(examples=["Customer Success"])
    confidence: float = Field(ge=0.0, le=1.0, examples=[0.93])
    created_at: str = Field(examples=["2026-05-12T14:30:00Z"])


class PreviousSolution(BaseModel):
    model_config = ConfigDict(extra="forbid")
    id: str = Field(examples=["sol-guided-setup"])
    title: str = Field(examples=["Guided CRM setup recovery playbook"])
    description: str = Field(examples=["Trigger Intercom guidance when Salesforce setup stalls."])
    owner: str = Field(examples=["Priya Raman"])
    reuse_confidence: float = Field(ge=0.0, le=1.0, examples=[0.91])


class AgentTrace(BaseModel):
    model_config = ConfigDict(extra="forbid")
    agent_name: str = Field(examples=["DuplicateDetection"])
    status: Literal["pending", "running", "complete", "error"] = Field(examples=["complete"])
    output_summary: str = Field(examples=["Matched three onboarding signals across Customer Success and Support."])


class AnalysisResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")
    observation_id: str = Field(examples=["7b6950d4-f518-4a20-8dcf-29e3ca816fd9"])
    similar_issues: list[SimilarIssue]
    previous_solutions: list[PreviousSolution]
    overall_confidence_score: float = Field(ge=0.0, le=1.0, examples=[0.88])
    agent_trace: list[AgentTrace]


class ImplementRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    chosen_solution_id: str = Field(examples=["sol-guided-setup"])


class Action(BaseModel):
    model_config = ConfigDict(extra="forbid")
    step: float = Field(examples=[1])
    description: str = Field(examples=["Configure the stalled-setup Intercom audience."])
    owner: str = Field(examples=["Lifecycle Operations"])
    due_days: float = Field(examples=[5])


class ImplementResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")
    implementation_plan: str = Field(examples=["Relaunch guided setup recovery for stalled enterprise trials."])
    actions: list[Action]
    stakeholders: list[str] = Field(examples=[["Customer Success", "Support Operations", "RevOps"]])


class EmergingIssue(BaseModel):
    model_config = ConfigDict(extra="forbid")
    id: str = Field(examples=["issue-onboarding-churn"])
    title: str = Field(examples=["Enterprise onboarding churn is accelerating"])
    report_count: float = Field(examples=[18])
    departments: list[str] = Field(examples=[["Customer Success", "Support"]])
    trend: Literal["rising", "stable", "resolved"] = Field(examples=["rising"])


class DuplicateProject(BaseModel):
    model_config = ConfigDict(extra="forbid")
    id: str = Field(examples=["dup-guided-onboarding"])
    title: str = Field(examples=["Overlapping guided onboarding initiatives"])
    duplicate_count: float = Field(examples=[3])
    estimated_savings_hours: float = Field(examples=[120])


class SavingsOpportunities(BaseModel):
    model_config = ConfigDict(extra="forbid")
    total_issues_deflected: float = Field(examples=[27])
    total_hours_saved: float = Field(examples=[340])
    total_cost_saved_usd: float = Field(examples=[51000])


class DashboardResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")
    emerging_issues: list[EmergingIssue]
    duplicate_projects: list[DuplicateProject]
    savings_opportunities: SavingsOpportunities


__all__ = ["ErrorResponse", "ObservationCreate", "ObservationCreatedResponse", "SimilarIssue", "PreviousSolution", "AgentTrace", "AnalysisResponse", "ImplementRequest", "Action", "ImplementResponse", "EmergingIssue", "DuplicateProject", "SavingsOpportunities", "DashboardResponse"]
