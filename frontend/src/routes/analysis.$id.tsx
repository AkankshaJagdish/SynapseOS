import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, CheckCircle2, Sparkles, Users, Calendar, Zap, Loader2 } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { AgentTimeline, TIMELINE_AGENTS } from "@/components/analysis/AgentTimeline";
import { ConfidenceBar } from "@/components/analysis/ConfidenceBar";
import { ErrorState, EmptyState } from "@/components/common/States";
import { Skeleton } from "@/components/common/Skeleton";
import { api } from "@/lib/api";
import type { ImplementationPlan, PreviousSolution } from "@/lib/types";

export const Route = createFileRoute("/analysis/$id")({
  head: () => ({ meta: [{ title: "Analysis — SynapseOS" }] }),
  component: AnalysisPage,
});

const STEP_MS = 1000;
// Index meanings:
// 0 Orchestrator, 1 Memory, 2 Duplicate Detection, 3 Solution Discovery, 4 Action
const REVEAL = {
  similarIssues: 2, // after Memory completes
  duplicates: 3, // after Duplicate Detection completes
  solutions: 4, // after Solution Discovery completes
  actionReady: 5, // after Action Agent completes
};

function AnalysisPage() {
  const { id } = Route.useParams();
  const [plan, setPlan] = useState<ImplementationPlan | null>(null);
  const [chosenSolutionId, setChosenSolutionId] = useState<string | null>(null);

  // Sequential animation state: # of agents completed (0..5)
  const [completed, setCompleted] = useState(0);
  const total = TIMELINE_AGENTS.length;
  const runningIndex = completed < total ? completed : null;
  const allDone = completed >= total;

  useEffect(() => {
    if (completed >= total) return;
    const t = setTimeout(() => setCompleted((c) => c + 1), STEP_MS);
    return () => clearTimeout(t);
  }, [completed, total]);

  // Fetch real data, but only consume after all agents finish.
  const { data, error, refetch, isLoading } = useQuery({
    queryKey: ["analysis", id],
    queryFn: () => api.getAnalysis(id),
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const showData = allDone;
  const confidencePct = useMemo(
    () => ((data?.overall_confidence_score ?? 0) * 100).toFixed(0),
    [data]
  );

  const implementMutation = useMutation({
    mutationFn: (solutionId: string) => api.implementSolution(id, solutionId),
    onSuccess: (res, solutionId) => {
      setPlan(res);
      setChosenSolutionId(solutionId);
    },
  });

  return (
    <AppShell>
      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition">
              <ArrowLeft className="size-3.5" /> Back to dashboard
            </Link>
            <h1 className="mt-2 text-2xl md:text-3xl font-semibold tracking-tight">Analysis Results</h1>
            <p className="text-xs text-muted-foreground mt-1 font-mono break-all">Observation {id}</p>
          </div>
          <div className="rounded-xl border border-border bg-surface/70 px-4 py-3 min-w-[200px]">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Overall Confidence</div>
            <div className="mt-1 flex items-baseline gap-2">
              {!allDone ? (
                <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin text-primary" />
                  Reasoning…
                </span>
              ) : (
                <>
                  <span className="text-2xl font-semibold tabular-nums">
                    {confidencePct}
                    <span className="text-base text-muted-foreground">%</span>
                  </span>
                  {(data?.overall_confidence_score ?? 0) > 0.75 && (
                    <CheckCircle2 className="size-4 text-success" />
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {error && allDone && <ErrorState message={(error as Error).message} onRetry={() => refetch()} />}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Timeline */}
          <section className="lg:col-span-2 rounded-xl border border-border bg-surface/60 backdrop-blur p-5 lg:sticky lg:top-4 lg:self-start">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold tracking-tight flex items-center gap-2">
                  <Zap className="size-4 text-primary" /> Agent Execution Timeline
                </h2>
                <p className="text-xs text-muted-foreground">
                  {allDone ? "All agents complete" : `Running ${TIMELINE_AGENTS[runningIndex!]?.name}…`}
                </p>
              </div>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground tabular-nums px-2 py-1 rounded bg-surface-2 border border-border">
                {completed}/{total}
              </span>
            </div>
            <AgentTimeline completed={completed} runningIndex={runningIndex} />
          </section>

          {/* Right column */}
          <div className="lg:col-span-3 space-y-6">
            {/* Similar Issues — reveal after Memory Agent */}
            {completed >= REVEAL.similarIssues && (
              <RevealSection title="Similar Issues" subtitle="Found by Memory Agent">
                {isLoading || !showData ? (
                  <div className="space-y-2">
                    <Skeleton className="h-16" />
                    <Skeleton className="h-16" />
                  </div>
                ) : (data?.similar_issues.length ?? 0) === 0 ? (
                  <EmptyState title="No similar issues found" />
                ) : (
                  <ul className="space-y-2">
                    {data!.similar_issues.map((s) => (
                      <li
                        key={s.id}
                        className="rounded-lg border border-border bg-surface-2/60 p-3 flex items-center justify-between gap-4"
                      >
                        <div className="min-w-0">
                          <div className="text-sm font-medium truncate">{s.title}</div>
                          <div className="text-[11px] text-muted-foreground mt-0.5">
                            {s.department} · {new Date(s.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        <ConfidenceBar value={s.confidence} />
                      </li>
                    ))}
                  </ul>
                )}
              </RevealSection>
            )}

            {/* Duplicate detected callout — reveal after Duplicate Detection Agent */}
            {completed >= REVEAL.duplicates && (
              <RevealSection title="Duplicate Work Detected" subtitle="Found by Duplicate Detection Agent">
                <div className="rounded-lg border border-warning/30 bg-warning/10 p-3 flex items-start gap-3">
                  <Sparkles className="size-4 text-warning shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <span className="font-medium">Project Phoenix</span> is solving an overlapping problem.
                    Consider coordinating with their team before launching a new initiative.
                  </div>
                </div>
              </RevealSection>
            )}

            {/* Existing Solutions — reveal after Solution Discovery Agent */}
            {completed >= REVEAL.solutions && (
              <RevealSection title="Existing Solutions" subtitle="Found by Solution Discovery Agent">
                {isLoading || !showData ? (
                  <div className="space-y-2">
                    <Skeleton className="h-24" />
                    <Skeleton className="h-24" />
                  </div>
                ) : (data?.previous_solutions.length ?? 0) === 0 ? (
                  <EmptyState title="No prior solutions found" />
                ) : (
                  <ul className="space-y-3">
                    {data!.previous_solutions.map((sol) => (
                      <SolutionCard
                        key={sol.id}
                        sol={sol}
                        chosen={chosenSolutionId === sol.id}
                        pending={
                          implementMutation.isPending && implementMutation.variables === sol.id
                        }
                        onApply={() => implementMutation.mutate(sol.id)}
                      />
                    ))}
                  </ul>
                )}
                {implementMutation.error && (
                  <div className="mt-3">
                    <ErrorState message={(implementMutation.error as Error).message} />
                  </div>
                )}
              </RevealSection>
            )}

            {/* Implementation Plan — reveal after Action Agent (and once applied) */}
            {completed >= REVEAL.actionReady && !plan && (
              <RevealSection title="Implementation Plan" subtitle="Ready from Action Agent">
                <div className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
                  Choose a solution above to generate the tailored implementation plan.
                </div>
              </RevealSection>
            )}

            {plan && (
              <RevealSection
                title="Implementation Plan"
                subtitle="Generated by Action Agent"
                tone="success"
              >
                <p className="text-sm text-muted-foreground">{plan.implementation_plan}</p>

                <div className="mt-4">
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">
                    Actions
                  </div>
                  <ol className="space-y-2">
                    {plan.actions.map((a) => (
                      <li
                        key={a.step}
                        className="rounded-lg border border-border bg-surface/70 p-3 flex items-start gap-3"
                      >
                        <div className="size-7 rounded-full bg-primary/15 text-primary text-xs font-semibold grid place-items-center border border-primary/30 shrink-0">
                          {a.step}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm">{a.description}</div>
                          <div className="mt-1 flex flex-wrap gap-3 text-[11px] text-muted-foreground">
                            <span className="inline-flex items-center gap-1">
                              <Users className="size-3" /> {a.owner}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <Calendar className="size-3" /> Due in {a.due_days} days
                            </span>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>

                {plan.stakeholders.length > 0 && (
                  <div className="mt-4">
                    <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">
                      Stakeholders
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {plan.stakeholders.map((s) => (
                        <span
                          key={s}
                          className="text-xs px-2 py-1 rounded-full bg-surface-2 border border-border"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </RevealSection>
            )}

            {/* Placeholder while agents are still reasoning */}
            {completed < REVEAL.similarIssues && (
              <div className="rounded-xl border border-dashed border-border p-8 text-center">
                <Loader2 className="size-5 text-primary animate-spin mx-auto" />
                <div className="mt-3 text-sm font-medium">Agents are reasoning…</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Results will appear as each agent completes.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function RevealSection({
  title,
  subtitle,
  tone = "default",
  children,
}: {
  title: string;
  subtitle?: string;
  tone?: "default" | "success";
  children: React.ReactNode;
}) {
  const toneCls =
    tone === "success"
      ? "border-success/30 bg-success/5"
      : "border-border bg-surface/60";
  return (
    <section
      className={`rounded-xl border backdrop-blur p-5 ${toneCls}`}
      style={{ animation: "fade-in 0.4s ease-out both" }}
    >
      <div className="mb-3">
        <h2 className="text-sm font-semibold tracking-tight flex items-center gap-2">
          {tone === "success" && <CheckCircle2 className="size-4 text-success" />}
          {title}
        </h2>
        {subtitle && <p className="text-[11px] text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

function SolutionCard({
  sol,
  chosen,
  pending,
  onApply,
}: {
  sol: PreviousSolution;
  chosen: boolean;
  pending: boolean;
  onApply: () => void;
}) {
  return (
    <li
      className={`rounded-lg border p-4 transition ${
        chosen
          ? "border-success/40 bg-success/10"
          : "border-border bg-surface-2/60 hover:border-primary/40"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Sparkles className="size-3.5 text-primary" />
            <span className="text-sm font-medium">{sol.title}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1.5">{sol.description}</p>
          <div className="mt-3 flex items-center gap-3 flex-wrap">
            <span className="text-[11px] text-muted-foreground">
              Owner: <span className="text-foreground">{sol.owner}</span>
            </span>
            <ConfidenceBar value={sol.reuse_confidence} />
          </div>
        </div>
        <button
          onClick={onApply}
          disabled={pending || chosen}
          className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition ${
            chosen
              ? "bg-success/20 text-success border border-success/40 cursor-default"
              : "bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          }`}
        >
          {chosen ? (
            <>
              <CheckCircle2 className="size-3.5" /> Applied
            </>
          ) : pending ? (
            "Applying…"
          ) : (
            "Apply Solution"
          )}
        </button>
      </div>
    </li>
  );
}

// Local keyframe for the reveal animation
const styleId = "synapse-fade-in-keyframes";
if (typeof document !== "undefined" && !document.getElementById(styleId)) {
  const s = document.createElement("style");
  s.id = styleId;
  s.textContent = `@keyframes fade-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }`;
  document.head.appendChild(s);
}
