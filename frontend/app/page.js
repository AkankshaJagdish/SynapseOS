import { api } from "../lib/api";

async function getSystemStatus() {
  try {
    const [health, version] = await Promise.all([api.health(), api.version()]);
    return { online: health.status === "healthy", version };
  } catch {
    return { online: false };
  }
}

export default async function Home() {
  const status = await getSystemStatus();

  return (
    <main style={{ maxWidth: 960, margin: "0 auto", padding: "72px 24px" }}>
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 96 }}>
        <strong style={{ fontSize: 22 }}>SynapseOS</strong>
        <span style={{ padding: "8px 12px", borderRadius: 999, background: status.online ? "#123f35" : "#49252b" }}>
          {status.online ? "● System online" : "● API unavailable"}
        </span>
      </nav>
      <section>
        <p style={{ color: "#67e8f9", fontWeight: 700, letterSpacing: 1 }}>ORGANIZATIONAL AWARENESS</p>
        <h1 style={{ maxWidth: 760, fontSize: "clamp(48px, 8vw, 84px)", lineHeight: 1, margin: "18px 0 28px" }}>
          Turn observations into shared intelligence.
        </h1>
        <p style={{ maxWidth: 620, color: "#a9bdd2", fontSize: 21, lineHeight: 1.6 }}>
          SynapseOS connects the problems employees notice independently so the whole organization can see, learn, and act together.
        </p>
      </section>
      <footer style={{ marginTop: 120, color: "#7f96ad" }}>
        {status.version ? `Foundation v${status.version.version} · Demo mode ${status.version.demo_mode ? "on" : "off"}` : "Start the API to connect this workspace."}
      </footer>
    </main>
  );
}
