const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')

export type Trend = 'rising' | 'stable' | 'resolved'
export type AgentStatus = 'pending' | 'running' | 'complete' | 'error'

export interface ObservationCreate {
  text: string
  submitted_by: string
  department?: string
}
export interface ObservationCreatedResponse { id: string; status: 'processing'; created_at: string }
export interface SimilarIssue { id: string; title: string; department: string; confidence: number; created_at: string }
export interface PreviousSolution { id: string; title: string; description: string; owner: string; reuse_confidence: number }
export interface AgentTrace { agent_name: string; status: AgentStatus; output_summary: string }
export interface AnalysisResponse {
  observation_id: string
  similar_issues: SimilarIssue[]
  previous_solutions: PreviousSolution[]
  overall_confidence_score: number
  agent_trace: AgentTrace[]
}
export interface ActionItem { step: number; description: string; owner: string; due_days: number }
export interface ImplementResponse { implementation_plan: string; actions: ActionItem[]; stakeholders: string[] }
export interface DashboardResponse {
  emerging_issues: Array<{ id: string; title: string; report_count: number; departments: string[]; trend: Trend }>
  duplicate_projects: Array<{ id: string; title: string; duplicate_count: number; estimated_savings_hours: number }>
  savings_opportunities: { total_issues_deflected: number; total_hours_saved: number; total_cost_saved_usd: number }
}

export class ApiError extends Error {
  constructor(message: string, public status: number) { super(message) }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...init?.headers },
    })
  } catch {
    throw new ApiError('Unable to connect to SynapseOS. Check that the backend is available.', 0)
  }
  if (!response.ok) {
    const payload = await response.json().catch(() => null) as { detail?: string } | null
    throw new ApiError(payload?.detail ?? `Request failed with status ${response.status}.`, response.status)
  }
  return response.json() as Promise<T>
}

export const api = {
  getDashboard: () => request<DashboardResponse>('/api/dashboard'),
  createObservation: (payload: ObservationCreate) => request<ObservationCreatedResponse>('/api/observations', { method: 'POST', body: JSON.stringify(payload) }),
  getAnalysis: (id: string) => request<AnalysisResponse>(`/api/observations/${encodeURIComponent(id)}/analysis`),
  implementSolution: (id: string, chosenSolutionId: string) => request<ImplementResponse>(`/api/observations/${encodeURIComponent(id)}/implement`, { method: 'POST', body: JSON.stringify({ chosen_solution_id: chosenSolutionId }) }),
}

export function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'An unexpected error occurred.'
}
