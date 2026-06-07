const API_BASE_URL = process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

async function request(path) {
  const response = await fetch(`${API_BASE_URL}${path}`, { cache: "no-store" });
  if (!response.ok) throw new Error(`SynapseOS API returned ${response.status}`);
  return response.json();
}

export const api = {
  health: () => request("/health"),
  ready: () => request("/ready"),
  version: () => request("/version"),
};
