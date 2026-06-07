import type {
  AnalysisResponse,
  DashboardResponse,
  ImplementationPlan,
  ObservationCreated,
} from "./types";

export const API_BASE =
  (import.meta as any).env?.VITE_API_URL ?? 
  "http://localhost:8000/api"; 

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    let detail = `${res.status} ${res.statusText}`;
    try {
      const body = await res.json();
      if (body?.detail) detail = typeof body.detail === "string" ? body.detail : JSON.stringify(body.detail);
    } catch {}
    throw new Error(detail);
  }
  return res.json() as Promise<T>;
}

export const api = {
  getDashboard: () => request<DashboardResponse>("/dashboard"),
  createObservation: (data: { text: string; submitted_by: string; department?: string }) =>
    request<ObservationCreated>("/observations", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getAnalysis: (id: string) => request<AnalysisResponse>(`/observations/${id}/analysis`),
  implementSolution: (id: string, chosen_solution_id: string) =>
    request<ImplementationPlan>(`/observations/${id}/implement`, {
      method: "POST",
      body: JSON.stringify({ chosen_solution_id }),
    }),
};
