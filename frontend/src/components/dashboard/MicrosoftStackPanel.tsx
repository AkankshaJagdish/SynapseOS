import { Cloud, Brain, Bot, Network, Search, Database } from "lucide-react";

const items = [
  { name: "Azure AI Foundry", desc: "Model orchestration & evals", icon: Cloud },
  { name: "Semantic Kernel", desc: "Agent planning & skills", icon: Brain },
  { name: "Azure AI Agent Service", desc: "Hosted multi-agent runtime", icon: Bot },
  { name: "Microsoft Graph", desc: "Org-wide context & identity", icon: Network },
  { name: "Azure AI Search", desc: "Vector + hybrid retrieval", icon: Search },
  { name: "Microsoft Fabric", desc: "Unified data fabric", icon: Database },
];

export function MicrosoftStackPanel() {
  return (
    <section className="rounded-xl border border-border bg-surface/60 backdrop-blur p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold tracking-tight">Architecture Components</h2>
          <p className="text-xs text-muted-foreground">Microsoft AI Stack powering SynapseOS</p>
        </div>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground px-2 py-1 rounded bg-surface-2 border border-border">
          Live
        </span>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {items.map((it) => {
          const Icon = it.icon;
          return (
            <div
              key={it.name}
              className="group rounded-lg border border-border bg-surface-2/60 p-3 hover:border-primary/40 transition"
            >
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-md bg-gradient-to-br from-primary/30 to-accent/20 grid place-items-center border border-border">
                  <Icon className="size-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{it.name}</div>
                  <div className="text-[11px] text-muted-foreground truncate">{it.desc}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
