import { Check, Loader2, AlertCircle, Circle, Workflow, Database, Copy, Lightbulb, Rocket } from "lucide-react";
import type { AgentStatus } from "@/lib/types";

export interface TimelineAgent {
  name: string;
  icon: typeof Workflow;
  pendingDesc: string;
  runningDesc: string;
  completeDesc: string;
}

export const TIMELINE_AGENTS: TimelineAgent[] = [
  {
    name: "Orchestrator Agent",
    icon: Workflow,
    pendingDesc: "Awaiting observation intake",
    runningDesc: "Routing observation to specialist agents…",
    completeDesc: "✓ Routed observation to 4 specialist agents",
  },
  {
    name: "Memory Agent",
    icon: Database,
    pendingDesc: "Standing by",
    runningDesc: "Searching organizational memory…",
    completeDesc: "✓ Found 3 related observations",
  },
  {
    name: "Duplicate Detection Agent",
    icon: Copy,
    pendingDesc: "Standing by",
    runningDesc: "Scanning active projects for overlap…",
    completeDesc: "✓ Detected Project Phoenix",
  },
  {
    name: "Solution Discovery Agent",
    icon: Lightbulb,
    pendingDesc: "Standing by",
    runningDesc: "Searching previous solutions…",
    completeDesc: "✓ Found reusable onboarding solution",
  },
  {
    name: "Action Agent",
    icon: Rocket,
    pendingDesc: "Standing by",
    runningDesc: "Synthesizing implementation plan…",
    completeDesc: "✓ Generated implementation plan",
  },
];

interface AgentTimelineProps {
  /** Number of agents that have fully completed (0..TIMELINE_AGENTS.length). */
  completed: number;
  /** Index currently running. If null, no agent is running. */
  runningIndex: number | null;
  errorIndex?: number | null;
}

export function AgentTimeline({ completed, runningIndex, errorIndex = null }: AgentTimelineProps) {
  return (
    <ol className="relative space-y-3">
      {TIMELINE_AGENTS.map((a, i) => {
        let status: AgentStatus;
        if (errorIndex === i) status = "error";
        else if (i < completed) status = "complete";
        else if (i === runningIndex) status = "running";
        else status = "pending";

        const Icon = a.icon;
        const isLast = i === TIMELINE_AGENTS.length - 1;
        const summary =
          status === "complete" ? a.completeDesc : status === "running" ? a.runningDesc : a.pendingDesc;

        return (
          <li key={a.name} className="relative flex gap-4">
            {!isLast && (
              <span
                aria-hidden
                className={`absolute left-[19px] top-10 bottom-[-12px] w-px transition-colors ${
                  status === "complete" ? "bg-success/60" : "bg-border"
                }`}
              />
            )}
            <div className="relative">
              <div
                className={`size-10 rounded-full grid place-items-center border transition-colors ${
                  status === "complete"
                    ? "bg-success/20 border-success/40 text-success"
                    : status === "running"
                    ? "bg-primary/20 border-primary/50 text-primary animate-pulse-ring"
                    : status === "error"
                    ? "bg-destructive/20 border-destructive/40 text-destructive"
                    : "bg-surface-2 border-border text-muted-foreground"
                }`}
              >
                {status === "complete" ? (
                  <Check className="size-4" />
                ) : status === "running" ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : status === "error" ? (
                  <AlertCircle className="size-4" />
                ) : (
                  <Circle className="size-3" />
                )}
              </div>
            </div>
            <div
              className={`flex-1 rounded-lg border p-3 transition-colors ${
                status === "running"
                  ? "border-primary/40 bg-primary/5"
                  : status === "complete"
                  ? "border-border bg-surface/60"
                  : "border-border bg-surface-2/40"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <Icon className="size-4 text-muted-foreground shrink-0" />
                  <span className="text-sm font-medium truncate">{a.name}</span>
                </div>
                <StatusPill status={status} />
              </div>
              <p
                className={`mt-1.5 text-xs ${
                  status === "complete" ? "text-success" : "text-muted-foreground"
                }`}
              >
                {summary}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function StatusPill({ status }: { status: AgentStatus }) {
  const map: Record<AgentStatus, string> = {
    pending: "bg-surface-2 text-muted-foreground border-border",
    running: "bg-primary/15 text-primary border-primary/30",
    complete: "bg-success/15 text-success border-success/30",
    error: "bg-destructive/15 text-destructive border-destructive/30",
  };
  return (
    <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${map[status]}`}>
      {status}
    </span>
  );
}
