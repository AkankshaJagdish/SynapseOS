export type AgentStatus = "pending" | "running" | "complete" | "error";

export interface AgentTrace {
  agent_name: string;
  status: AgentStatus;
  output_summary: string;
}

export interface SimilarIssue {
  id: string;
  title: string;
  department: string;
  confidence: number;
  created_at: string;
}

export interface PreviousSolution {
  id: string;
  title: string;
  description: string;
  owner: string;
  reuse_confidence: number;
}

export interface AnalysisResponse {
  observation_id: string;
  similar_issues: SimilarIssue[];
  previous_solutions: PreviousSolution[];
  overall_confidence_score: number;
  agent_trace: AgentTrace[];
}

export interface ObservationCreated {
  id: string;
  status: "processing";
  created_at: string;
}

export interface ImplementationAction {
  step: number;
  description: string;
  owner: string;
  due_days: number;
}

export interface ImplementationPlan {
  implementation_plan: string;
  actions: ImplementationAction[];
  stakeholders: string[];
}

export interface EmergingIssue {
  id: string;
  title: string;
  report_count: number;
  departments: string[];
  trend: "rising" | "stable" | "resolved";
}

export interface DuplicateProject {
  id: string;
  title: string;
  duplicate_count: number;
  estimated_savings_hours: number;
}

export interface DashboardResponse {
  emerging_issues: EmergingIssue[];
  duplicate_projects: DuplicateProject[];
  savings_opportunities: {
    total_issues_deflected: number;
    total_hours_saved: number;
    total_cost_saved_usd: number;
  };
}
